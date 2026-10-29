// ทุกหน้าหมวด (23 หมวด) ต้องเปิดได้ แสดงหัวข้อ ปุ่มสร้าง และช่องค้นหาตามที่ออกแบบไว้
// spec: specs/master-data-plan.md (3 — Read) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openCategory, ALL_CATEGORIES } from './_helpers';

test.describe('Master Data — category pages', () => {
  test('MD-READ-01 each of the 23 pages shows heading, Create button and search box', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(400000);
    await loginSuperAdmin(page);
    for (const c of ALL_CATEGORIES) {
      await openCategory(page, c);
      await expect(page.getByRole('button', { name: c.create, exact: true }), `${c.card}: create button`).toBeVisible();
      await expect(page.getByPlaceholder(c.search).first(), `${c.card}: search box`).toBeVisible();
    }
  });
});
