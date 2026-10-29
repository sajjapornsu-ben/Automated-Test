// หน้า Master Data ต้องแสดงการ์ดครบ 23 หมวด ("Showing 23 categories") และแต่ละการ์ดเปิดหน้าหมวดที่ถูกต้อง
// spec: specs/master-data-plan.md (1) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, BASE, ALL_CATEGORIES } from './_helpers';

test.describe('Master Data — landing', () => {
  test('MD-LAND-01 shows 23 category cards', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await page.goto(BASE);
    await expect(page.getByText('Showing 23 categories')).toBeVisible({ timeout: 30000 });
    for (const c of ALL_CATEGORIES) {
      await expect(page.locator(`main a[href="/settings/masterData/${c.slug}"]`), c.card).toContainText(c.card);
    }
  });

  test('MD-LAND-02 every card opens its category page', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(300000);
    await loginSuperAdmin(page);
    for (const c of ALL_CATEGORIES) {
      await page.goto(BASE);
      await page.locator(`main a[href="/settings/masterData/${c.slug}"]`).click();
      await expect(page, c.card).toHaveURL(new RegExp(`/settings/masterData/${c.slug}$`));
      await expect(page.getByRole('heading', { name: c.title, exact: true }).first(), c.card).toBeVisible({ timeout: 30000 });
    }
  });
});
