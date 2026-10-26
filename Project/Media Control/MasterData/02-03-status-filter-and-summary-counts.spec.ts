// ตัวกรองสถานะของทุกหมวดแบบตาราง (18 หมวด): Active/Inactive ต้องแสดงเฉพาะแถวสถานะนั้น, Reset คืนค่าเดิม และตัวเลข TOTAL = ACTIVE + INACTIVE (ถ้าหน้านั้นมีสรุป)
// spec: specs/master-data-plan.md (3 — Filter) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openCategory, byslug, TABLE_SLUGS, tableRows, footerTotal, pickStatus, statusCells } from './_helpers';

for (const slug of TABLE_SLUGS) {
  test.describe(`Master Data — ${slug} status filter`, () => {
    test(`MD-FLT-01 ${slug}: Active / Inactive filter and Reset`, { tag: ['@happy'] }, async ({ page }) => {
      test.setTimeout(120000);
      const cat = byslug(slug);
      await loginSuperAdmin(page);
      await openCategory(page, cat);
      await expect(tableRows(page).first()).toBeVisible({ timeout: 20000 });
      const total = await footerTotal(page);

      // summary tiles (TOTAL / ACTIVE / INACTIVE) when the page has them
      const main = (await page.locator('main').first().innerText()).replace(/\s+/g, ' ');
      const tiles = main.match(/TOTAL (\d+) ACTIVE (\d+) INACTIVE (\d+)/);
      if (tiles) expect(Number(tiles[2]) + Number(tiles[3]), 'ACTIVE + INACTIVE = TOTAL').toBe(Number(tiles[1]));

      await pickStatus(page, 'Active');
      for (const t of await statusCells(page).allInnerTexts()) expect(t.trim(), 'Active filter').toBe('Active');

      await pickStatus(page, 'Inactive');
      for (const t of await statusCells(page).allInnerTexts()) expect(t.trim(), 'Inactive filter').toBe('Inactive');

      await page.getByRole('button', { name: 'Reset' }).click();
      await expect.poll(() => footerTotal(page)).toBe(total);
    });
  });
}
