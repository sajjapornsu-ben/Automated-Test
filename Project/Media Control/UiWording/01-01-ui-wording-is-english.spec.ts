// ตรวจ UI Wording ทุกหน้าจอ: ปุ่ม หัวข้อ ป้ายชื่อ placeholder tooltip และข้อความแจ้งเตือน (validation / modal) ต้องเป็นภาษาอังกฤษ ไม่มีตัวอักษรไทย
// test-case: UI-WORD-01..03 — หน้า Login, ทุกหน้าใน sidebar + Master Data 24 หน้า (Super Admin), และหน้าของแต่ละ role; แผน: specs/ui-wording-plan.md
// seed: seed.spec.ts
//
// เทสนี้ไม่บันทึกข้อมูล: เปิดฟอร์ม Add/Create แล้วกด Save ตอนฟอร์มว่างเพื่อดูข้อความ validation แล้วปิด (ข้อมูลที่ผู้ใช้พิมพ์ เช่น ชื่อลูกค้าในตาราง ไม่นับเป็น wording)

import { test, expect } from '@playwright/test';
import { loginAs, NON_SALE_ROLES, Role } from '../Dashboard/_helpers';
import { BASE, EXTRA_PAGES, Finding, scan, scanInteractions, fmt, waitSettled, sidebarPages, signedIn, record, DEV_ONLY_PAGES, dropListData, isBug } from './_helpers';

test.describe('UI wording — every screen is in English', () => {
  test('UI-WORD-01 Login page: labels, buttons, validation and error messages', { tag: ['@regression', '@ui'] }, async ({ page }) => {
    test.setTimeout(120000);
    const found: Finding[] = [];
    await page.goto(`${BASE}/login`);
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible({ timeout: 30000 });
    await waitSettled(page);
    found.push(...(await scan(page, 'Login')));

    // empty submit → validation messages
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForTimeout(800);
    found.push(...(await scan(page, 'Login › empty Sign In')));
    await page.getByRole('button', { name: 'OK', exact: true }).click(); // "Missing Information" modal

    // wrong password → error modal (a made-up address, no real account is touched)
    const boxes = page.getByRole('textbox');
    await boxes.nth(0).fill('qa.wording@example.com');
    await boxes.nth(1).fill('not-a-real-password');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByText(/Invalid username or password|Failed/i).first()).toBeVisible({ timeout: 15000 }).catch(() => undefined);
    found.push(...(await scan(page, 'Login › wrong password')));
    await page.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 3000 }).catch(() => undefined);
    record('login', found);
    expect(found.filter(isBug), `Thai wording on the Login page:\n${fmt(found.filter(isBug))}`).toEqual([]);
  });

  test('UI-WORD-02 Super Admin: all sidebar pages and all 24 Master Data pages', { tag: ['@regression', '@ui'] }, async ({ page }) => {
    test.setTimeout(900000);
    await loginAs(page, 'superAdmin');
    const pages = [...new Set([...(await sidebarPages(page)), ...EXTRA_PAGES])].filter((p) => !DEV_ONLY_PAGES.includes(p));
    const all: Finding[] = [];
    expect(pages.length, 'pages discovered from the sidebar').toBeGreaterThan(5);
    const byPage: Record<string, Finding[]> = {};
    for (const p of pages) {
      await page.goto(BASE + p);
      await waitSettled(page);
      const base = dropListData(p, await scan(page, p));
      const f = [...base, ...dropListData(p, await scanInteractions(page, p, base))];
      if (f.length) byPage[p] = f;
      all.push(...f);
      expect.soft(f.filter(isBug), `Thai wording on ${p}:\n${fmt(f.filter(isBug))}`).toEqual([]);
    }
    record('superAdmin', all);
    console.log(`UI-WORD-02 scanned ${pages.length} pages, ${Object.keys(byPage).length} with Thai wording`);
  });

  for (const role of ['sale', ...NON_SALE_ROLES] as Role[]) {
    test(`UI-WORD-03 ${role}: pages in this role's sidebar`, { tag: ['@regression', '@ui'] }, async ({ browser }) => {
      test.setTimeout(600000);
      const { ctx, page } = await signedIn(browser, role);
      const all: Finding[] = [];
      try {
        for (const p of (await sidebarPages(page)).filter((x) => !DEV_ONLY_PAGES.includes(x))) {
          await page.goto(BASE + p);
          await waitSettled(page);
          const base = dropListData(p, await scan(page, `${role}: ${p}`));
          const f = [...base, ...dropListData(p, await scanInteractions(page, `${role}: ${p}`, base))];
          all.push(...f);
          expect.soft(f.filter(isBug), `Thai wording on ${p} (${role}):\n${fmt(f.filter(isBug))}`).toEqual([]);
        }
      } finally {
        record(role, all);
        await ctx.close();
      }
    });
  }
});
