// หน้า User Management ต้องแสดงหัวข้อ ปุ่ม Export/Create 
// ช่องค้นหา ตัวกรอง 3 ตัว ตารางหัวคอลัมน์ครบ 
// และตัวเลขสรุป Total = Active + Inactive = จำนวนท้ายตาราง
// spec: specs/user-management-plan.md (1) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openUserManagement, tiles, footerTotal, filterOptions, rows } from './_helpers';

test.describe('User Management — structure', () => {
  test('UM-READ-01 heading, actions, filters and table headers', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);

    await expect(page.getByRole('button', { name: 'Export Excel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create User', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Search by name, email, phone...')).toBeVisible();
    for (const f of ['status', 'department', 'User Group']) {
      await expect(page.getByRole('button', { name: new RegExp(`Filter by ${f}$`, 'i') }), f).toBeAttached();
    }
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    const headers = (await page.locator('thead th').allInnerTexts()).map((h) => h.trim());
    expect(headers).toEqual(['ACTIONS', 'NAME', 'DEPARTMENT', 'MEDIA GROUP', 'USER GROUP', 'EMAIL', 'PHONE', 'STATUS', 'UPDATED DATE']);
    // every row has Edit and Delete
    expect(await rows(page).count()).toBeGreaterThan(0);
    await expect(rows(page).first().getByRole('button', { name: 'Edit' })).toBeAttached();
    await expect(rows(page).first().getByRole('button', { name: 'Delete' })).toBeAttached();
  });

  test('UM-READ-02 Total = Active + Inactive = rows in the footer', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const t = await tiles(page);
    expect(t.active + t.inactive, 'Active + Inactive').toBe(t.total);
    expect(await footerTotal(page), 'footer total').toBe(t.total);
  });

  test('UM-READ-03 filter dropdowns offer the expected options', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    expect(await filterOptions(page, 'status')).toEqual(['All Status', 'Active', 'Inactive']);
    const groups = await filterOptions(page, 'User Group');
    expect(groups[0]).toBe('All User Groups');
    for (const g of ['Team CG', 'Head CG', 'Media Management', 'Sale', 'Super Admin']) expect(groups, g).toContain(g);
    const depts = await filterOptions(page, 'department');
    expect(depts[0]).toBe('All Departments');
    expect(depts.length).toBeGreaterThan(1);
  });
});
