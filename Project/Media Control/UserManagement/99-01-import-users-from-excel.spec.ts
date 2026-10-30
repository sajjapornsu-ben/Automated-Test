// นำเข้า User จาก reports/User_Create.xlsx ผ่านฟอร์ม Create User (รันเมื่อตั้ง IMPORT_USERS=1 เท่านั้น); ค่าที่ไม่มีในระบบจะถูกข้าม (ไม่สร้าง/ไม่ใส่ค่าอื่นแทน) และสรุปไว้ใน reports/User_Create_Result.json
import { test, expect, Locator } from '@playwright/test';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { loginSuperAdmin, openUserManagement, searchUsers, rows, drawer, dismissOk } from './_helpers';

const FILE = path.join(__dirname, '..', '..', '..', 'reports', 'User_Create.xlsx');
const RESULT = path.join(__dirname, '..', '..', '..', 'reports', 'User_Create_Result.json');
const PASSWORD = '12345678';

const text = (v: unknown): string => {
  const x = v as { richText?: { text: string }[]; text?: string } | null | undefined;
  if (x && typeof x === 'object') return x.richText ? x.richText.map((t) => t.text).join('') : String(x.text ?? '');
  return v == null ? '' : String(v);
};
const list = (v: unknown) => text(v).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

type Result = { no: string; name: string; email: string; status: 'created' | 'exists' | 'failed'; note: string; ticked: Record<string, string[]>; skipped: Record<string, string[]> };

// คอลัมน์ในตาราง Media access: 0 Media Group, 1 Media Category, 2 Media Type, 3 Panel Package
const COLS = ['Media Group', 'Media Category', 'Media Type', 'Panel Package'];

test.describe('User Management — import users from Excel', () => {
  test.skip(!process.env.IMPORT_USERS, 'set IMPORT_USERS=1 to import users from reports/User_Create.xlsx');

  test('IMPORT-01 create every user in User_Create.xlsx', async ({ page }) => {
    test.setTimeout(900000);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE);
    const ws = wb.worksheets[0];
    const data: { no: string; name: string; email: string; dept: string; userGroup: string; role: string; groups: string[]; cats: string[]; types: string[]; pkgs: string[] }[] = [];
    ws.eachRow((r, i) => {
      if (i === 1 || !text(r.getCell(3).value).trim()) return;
      data.push({
        no: text(r.getCell(1).value), name: text(r.getCell(2).value).trim(), email: text(r.getCell(3).value).trim(),
        dept: text(r.getCell(4).value).trim(), userGroup: text(r.getCell(5).value).trim(), role: text(r.getCell(6).value).trim(),
        groups: list(r.getCell(8).value), cats: list(r.getCell(9).value), types: list(r.getCell(10).value), pkgs: list(r.getCell(11).value),
      });
    });
    const results: Result[] = [];
    const save = () => fs.writeFileSync(RESULT, JSON.stringify(results, null, 2), 'utf8');

    await loginSuperAdmin(page);
    for (const u of data) {
      const [first, ...rest] = u.name.split(/\s+/);
      const res: Result = { no: u.no, name: u.name, email: u.email, status: 'failed', note: '', ticked: {}, skipped: {} };
      results.push(res);
      const tick = (col: string, v: string) => (res.ticked[col] ??= []).push(v);
      const skip = (col: string, v: string) => (res.skipped[col] ??= []).push(v);
      try {
        await openUserManagement(page);
        await searchUsers(page, u.email);
        if ((await rows(page).filter({ hasText: u.email }).count()) > 0) { res.status = 'exists'; res.note = 'มี Email นี้ในระบบแล้ว ไม่สร้างซ้ำ'; continue; }

        await page.getByRole('button', { name: 'Create User', exact: true }).click();
        const d = drawer(page);
        await d.getByPlaceholder('First name').fill(first);
        await d.getByPlaceholder('Last name').fill(rest.join(' '));
        await d.getByPlaceholder('name@planbmedia.co.th').fill(u.email);
        if (u.dept) await d.locator('select').nth(0).selectOption({ label: u.dept });
        await d.locator('select').nth(1).selectOption({ label: u.userGroup });
        await d.locator('select').nth(2).selectOption({ label: u.role });

        // ชื่อ item ใน column ที่ระบุ (แยก column ด้วยตำแหน่ง x ของหัวตาราง เพราะชื่ออาจซ้ำข้าม column เช่น "BTS Cityline Digital")
        const itemName = async (col: number, name: string): Promise<Locator | null> => {
          const heads: number[] = [];
          for (const h of COLS) heads.push((await d.getByText(h, { exact: true }).first().boundingBox())?.x ?? 0);
          const matches = d.getByText(name, { exact: true });
          for (let i = 0; i < (await matches.count()); i++) {
            const el = matches.nth(i);
            const b = await el.boundingBox();
            if (!b) continue;
            const lo = heads[col] - 4, hi = col < 3 ? heads[col + 1] - 4 : Infinity;
            if (b.x >= lo && b.x < hi) return el;
          }
          return null;
        };
        // แถวของ item = ancestor นอกสุดที่มี checkbox เพียงตัวเดียว (ถ้าใช้ ancestor แรกที่มี checkbox อาจได้ทั้งตารางแล้วติ๊กตัวแรกคือ Airport)
        const tickItem = async (el: Locator) => {
          const box = el.locator('xpath=ancestor::*[count(.//input[@type="checkbox"])=1][last()]').getByRole('checkbox');
          expect(await box.count(), 'one checkbox in the item row').toBe(1);
          await box.check({ force: true });
        };
        const browse = async (el: Locator) => { await el.click({ force: true }); await page.waitForTimeout(600); };

        const foundCat = new Set<string>(), foundType = new Set<string>(), foundPkg = new Set<string>();
        for (const g of u.groups) {
          const gEl = await itemName(0, g);
          if (!gEl) { skip('Media Group (ไม่มีในระบบ)', g); continue; }
          await tickItem(gEl); tick('Media Group', g);
          await browse(gEl);
          for (const c of u.cats) {
            if (foundCat.has(c)) continue;
            const cEl = await itemName(1, c);
            if (!cEl) continue; // อาจอยู่ใต้ Media Group อื่น
            await tickItem(cEl); await browse(cEl);
            foundCat.add(c); tick('Media Category', `${c} (ใต้ ${g})`);
            for (const t of u.types) {
              const tEl = await itemName(2, t);
              if (!tEl) continue;
              foundType.add(t); tick('Media Type (คลิกดูเท่านั้น ไม่มี checkbox)', `${t} (ใต้ ${c})`);
              await browse(tEl); // Media Type ไม่มี checkbox ติ๊กไม่ได้ ต้องคลิกชื่อเพื่อดู Panel Package ใต้มัน
              for (const p of u.pkgs) {
                if (foundPkg.has(p)) continue;
                const pEl = await itemName(3, p);
                if (!pEl) continue;
                await tickItem(pEl); foundPkg.add(p); tick('Package', `${p} (ใต้ ${t})`);
              }
            }
          }
        }
        for (const c of u.cats) if (!foundCat.has(c)) skip('Media Category (ไม่มีในระบบ)', c);
        for (const t of u.types) if (!foundType.has(t)) skip('Media Type (ไม่มีในระบบ)', t);
        for (const p of u.pkgs) if (!foundPkg.has(p)) skip('Package (ไม่มีในระบบ)', p);
        res.note = 'footer: ' + (await d.getByText(/Media Group\s*\d+/).last().innerText().catch(() => '')).replace(/\s+/g, ' ');

        await d.getByPlaceholder('••••••••').first().fill(PASSWORD);
        await d.getByPlaceholder('••••••••').nth(1).fill(PASSWORD);
        await d.getByRole('switch', { name: 'Email Notification' }).evaluate((e) => (e as HTMLElement).click()); // ปิดไว้ (เปิดเป็นค่าเริ่มต้น)
        await d.getByRole('button', { name: 'Save' }).click();
        const ok = await page.getByText(/has been added successfully/).waitFor({ timeout: 15000 }).then(() => true, () => false);
        if (ok) {
          res.status = 'created';
          await dismissOk(page);
          await expect(d).toBeHidden({ timeout: 10000 });
          // ตรวจค่าที่บันทึกจริงจากหน้า Edit: Media Group ที่ติ๊กต้องตรงกับที่ตั้งใจ ไม่เกิน/ไม่ขาด
          await searchUsers(page, u.email);
          await rows(page).filter({ hasText: u.email }).first().getByRole('button', { name: 'Edit' }).click({ force: true });
          await expect(d).toContainText(/Edit User/, { timeout: 10000 });
          await page.waitForTimeout(1500);
          const saved = await d.getByRole('checkbox').evaluateAll((els) => els.filter((e) => (e as HTMLInputElement).checked).map((e) => (e.closest('label') as HTMLElement | null)?.innerText.trim() || e.getAttribute('aria-label') || ''));
          res.note += ' | saved checked: ' + saved.join(', ');
          const wanted = new Set(res.ticked['Media Group'] ?? []);
          const extra = ['Airport', 'Classic', 'Digital', 'Digital VGI', 'Retail', 'Transit', 'Transit VGI'].filter((g) => saved.includes(g) && !wanted.has(g));
          if (extra.length) { res.status = 'failed'; res.note += ` | Media Group เกินที่ต้องการ: ${extra.join(', ')}`; }
          await d.getByRole('button', { name: 'Cancel' }).click().catch(() => undefined);
        } else {
          res.note += ' | Save ไม่สำเร็จ: ' + (await d.innerText()).replace(/\s+/g, ' ').slice(-300);
          await d.getByRole('button', { name: 'Cancel' }).click().catch(() => undefined);
        }
      } catch (e) {
        res.note += ' | ' + String((e as Error).message).split('\n')[0];
      } finally {
        save();
      }
    }
    console.log('RESULT>>>' + JSON.stringify(results));
    expect(results.every((r) => r.status !== 'failed'), 'ทุก User ต้องสร้างได้หรือมีอยู่แล้ว').toBe(true);
  });
});
