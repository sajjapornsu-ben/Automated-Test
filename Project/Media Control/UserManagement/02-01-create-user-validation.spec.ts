// ฟอร์ม Create User: กด Save ว่างต้องขึ้นข้อความให้กรอกทุกช่องที่จำเป็น, 
// อีเมลผิดรูปแบบ, รหัสผ่านสั้นกว่า 8 ตัว และรหัสผ่านไม่ตรงกันต้องถูกบล็อก (ไม่สร้างผู้ใช้จริง)
// spec: specs/user-management-plan.md (4) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openUserManagement, drawer, footerTotal } from './_helpers';

test.describe('User Management — Create User validation', () => {
  test('UM-VAL-01 required fields, e-mail format and password rules block Save', { tag: ['@negative', '@edge'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const total = await footerTotal(page);

    await page.getByRole('button', { name: 'Create User', exact: true }).click();
    const d = drawer(page);

    // empty form
    await d.getByRole('button', { name: 'Save' }).click();
    for (const msg of ['First name is required', 'Last name is required', 'Email is required', 'User Group is required', 'Password is required', 'Confirm Password is required']) {
      await expect(d, msg).toContainText(msg);
    }
    await expect(d).toBeVisible();

    // bad e-mail, short password, mismatching confirmation
    await d.getByPlaceholder('First name').fill('QA Test');
    await d.getByPlaceholder('Last name').fill('Validation');
    await d.getByPlaceholder('name@planbmedia.co.th').fill('not-an-email');
    await d.getByPlaceholder('••••••••').first().fill('short');
    await d.getByPlaceholder('••••••••').nth(1).fill('different');
    await d.getByRole('button', { name: 'Save' }).click();
    await expect(d).toContainText('Please enter a valid email address');
    await expect(d).toContainText('Password must be at least 8 characters');
    await expect(d).toContainText('Password does not match');
    await expect(d).toBeVisible();

    // cancel: nothing was created
    await d.getByRole('button', { name: 'Cancel' }).click();
    await expect(d).toBeHidden();
    expect(await footerTotal(page)).toBe(total);
  });
});
