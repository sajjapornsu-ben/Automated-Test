// (CG) Export Report ต้องมีเฉพาะ Job ที่ตัวเองเป็นผู้รับงาน — ทุกแถวใน preview และไฟล์ Excel ที่ export ต้องมีชื่อ CG คนนั้นในคอลัมน์ Graphic และจำนวนแถวตรงกับ preview
// spec: specs/mediaapproval-dashboard-plan.md (18.8) — PB-2112 BR41, BR45, BR46, AC23; PB-2113 CG: เห็นเฉพาะ Job ของตัวเอง
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
import { loginAs, openDashboard, settle, DISPLAY_NAME } from './_helpers';

const GRAPHIC_COL = 5; // Job No, Ticket, Client, Product, Media, Graphic, ...

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('CG export contains only their own jobs', async ({ page }) => {
    const me = DISPLAY_NAME.cg1!;
    await loginAs(page, 'cg1');
    await openDashboard(page);
    await settle(page);

    // Preview: show everything on one page (100 per page), then every Graphic cell must include me.
    await page.getByRole('combobox').last().selectOption('100');
    await settle(page);
    const shown = Number((await page.getByText(/Showing \d+ records/).first().innerText()).match(/\d+/)![0]);
    expect(shown).toBeGreaterThan(0);

    const rows = page.getByRole('table', { name: 'Export Report Table' }).getByRole('rowgroup').last().getByRole('row');
    await expect(rows).toHaveCount(shown);
    for (let i = 0; i < shown; i++) {
      expect(await rows.nth(i).getByRole('cell').nth(GRAPHIC_COL).innerText(), `preview row ${i}`).toContain(me);
    }

    // Exported file: same rows, same ownership.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export SLA' }).click(),
    ]);
    const wb = XLSX.readFile((await download.path())!);
    const data = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[wb.SheetNames[0]]);
    expect(data).toHaveLength(shown);
    for (const r of data) expect(String(r['Graphic'])).toContain(me);

    await page.getByRole('button', { name: 'OK' }).click();
  });
});
