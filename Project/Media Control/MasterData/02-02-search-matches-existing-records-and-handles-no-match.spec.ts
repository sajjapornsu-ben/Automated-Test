// ช่องค้นหาของทุกหมวดแบบตาราง (18 หมวด): ค้นด้วยข้อความจากแถวแรกต้องเหลือเฉพาะแถวที่ตรง, ไม่ตรงต้องขึ้นสถานะว่าง และล้างช่องค้นหาแล้วจำนวนต้องกลับมาเท่าเดิม
// spec: specs/master-data-plan.md (3 — Search) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openCategory, searchFor, byslug, TABLE_SLUGS, tableRows, footerTotal, sampleSearchTerm } from './_helpers';

for (const slug of TABLE_SLUGS) {
  test.describe(`Master Data — ${slug} search`, () => {
    test(`MD-SRCH-01 ${slug}: search finds the record, no match shows empty state, clearing restores`, { tag: ['@happy', '@edge'] }, async ({ page }) => {
      test.setTimeout(120000);
      const cat = byslug(slug);
      await loginSuperAdmin(page);
      await openCategory(page, cat);
      await expect(tableRows(page).first()).toBeVisible({ timeout: 20000 });
      const total = await footerTotal(page);
      const term = await sampleSearchTerm(page, slug);
      expect(term, 'a searchable value in the first row').toBeTruthy();

      await searchFor(page, cat, term);
      await expect(tableRows(page).first()).toBeVisible();
      // Resolution shows "192 × 288" for the search term "192x288", so compare with × normalised
      const norm = (s: string) => s.toLowerCase().replace(/\s*×\s*/g, 'x').replace(/\s+/g, ' ');
      for (const t of await tableRows(page).allInnerTexts()) expect(norm(t)).toContain(norm(term));
      expect(await footerTotal(page)).toBeLessThanOrEqual(total);

      await searchFor(page, cat, term.toUpperCase());
      await expect(tableRows(page).first(), 'case-insensitive').toBeVisible();

      await searchFor(page, cat, 'zzz-no-such-record-98765');
      await expect(page.getByText(/No .* found/i).first()).toBeVisible();
      await expect(tableRows(page)).toHaveCount(0);

      await searchFor(page, cat, '');
      await expect.poll(() => footerTotal(page)).toBe(total);
    });
  });
}
