// วงจรผู้ใช้ทดสอบ "QA Test": สร้าง (ขึ้นในรายการ ตัวเลขสรุป +1) 
// อีเมลซ้ำถูกปฏิเสธ แก้ข้อมูล ล็อกอินด้วยบัญชีใหม่ได้จริง เปลี่ยนรหัสผ่าน (รหัสเก่าใช้ไม่ได้/ใหม่ใช้ได้) 
// ปิดสถานะ (ล็อกอินไม่ได้ ขึ้นข้อความระงับ) เปิดสถานะ (ล็อกอินได้อีก) และ
// ลบ (Cancel ไม่ลบ / Delete Permanently ลบ ล็อกอินไม่ได้อีก)
// spec: specs/user-management-plan.md (4–6) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบผู้ใช้จริงบน UAT (เฉพาะ qa.test.<เลข>@example.com ปิด Email Notification) และไม่แตะผู้ใช้เดิม — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openUserManagement, newQaUser, createQaUser, openEdit, deleteQaUser, purgeQaUsers, qaRow, tiles, drawer,
  dismissOk, tryLogin, QA_PASSWORD, QA_NEW_PASSWORD, searchUsers, footerTotal, rows,
} from './_helpers';

const WRONG = 'Invalid username or password';
const SUSPENDED = 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อ Admin';

test.describe('User Management — QA user lifecycle', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes a real UAT account — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('UM-CRUD-01 create, duplicate e-mail, edit, delete', { tag: ['@happy', '@negative', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    const u = newQaUser();
    try {
      await openUserManagement(page);
      const before = await tiles(page);

      // create
      await createQaUser(page, u, { phone: '0912345678' });
      await searchUsers(page, u.email);
      const row = await qaRow(page, u.email);
      await expect(row).toContainText(u.fullName);
      await expect(row).toContainText('QA'); // user group
      await expect(row).toContainText('Active');
      await expect(row).toContainText('091-234-5678'); // phone is formatted
      await searchUsers(page, '');
      const afterCreate = await tiles(page);
      expect(afterCreate.total).toBe(before.total + 1);
      expect(afterCreate.active).toBe(before.active + 1);

      // the same e-mail again is rejected and the drawer stays open
      await page.getByRole('button', { name: 'Create User', exact: true }).click();
      const d = drawer(page);
      await d.getByPlaceholder('First name').fill('QA Test');
      await d.getByPlaceholder('Last name').fill('Duplicate');
      await d.getByPlaceholder('name@planbmedia.co.th').fill(u.email);
      await d.locator('select').nth(1).selectOption({ label: 'QA' });
      await d.getByPlaceholder('••••••••').first().fill(QA_PASSWORD());
      await d.getByPlaceholder('••••••••').nth(1).fill(QA_PASSWORD());
      await d.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText(/Email already registered/i)).toBeVisible({ timeout: 15000 });
      await dismissOk(page);
      await expect(d).toBeVisible();
      await d.getByRole('button', { name: 'Cancel' }).click();
      await expect(d).toBeHidden();

      // edit: new nickname and phone
      const e = await openEdit(page, u.email);
      await e.getByPlaceholder('Nickname').fill('qa-nick');
      await e.getByPlaceholder('099-999-9999').fill('0987000111');
      await e.getByRole('button', { name: 'Save Changes' }).click();
      await expect(e).toBeHidden({ timeout: 15000 });
      await dismissOk(page);
      await expect(await qaRow(page, u.email)).toContainText('098-700-0111');

      // delete: Cancel keeps it, Delete Permanently removes it
      await (await qaRow(page, u.email)).getByRole('button', { name: 'Delete' }).click({ force: true });
      await expect(page.getByText(/Are you sure you want to delete/)).toContainText(u.last); // the dialog names the user (with nickname)
      await page.getByRole('button', { name: 'Cancel' }).last().click();
      await expect(await qaRow(page, u.email)).toBeVisible();
      await deleteQaUser(page, u.email);
      await searchUsers(page, u.email);
      await expect(rows(page).filter({ hasText: u.email })).toHaveCount(0);
      await searchUsers(page, '');
      const afterDelete = await tiles(page);
      expect(afterDelete.total).toBe(before.total);
      expect(await footerTotal(page)).toBe(before.total);

      // a deleted account can no longer sign in
      expect((await tryLogin(browser, u.email, QA_PASSWORD())).message).toContain(WRONG);
    } finally {
      await purgeQaUsers(page).catch(() => undefined);
    }
  });

  test('UM-AUTH-01 the new account can sign in; wrong password fails; change password', { tag: ['@happy', '@negative', '@security'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    const u = newQaUser();
    try {
      await openUserManagement(page);
      await createQaUser(page, u);

      // sign in with the account that was just created
      const ok = await tryLogin(browser, u.email, QA_PASSWORD());
      expect(ok.ok, `login as ${u.email}`).toBe(true);
      // wrong password
      const bad = await tryLogin(browser, u.email, 'wrong-password-1');
      expect(bad.ok).toBe(false);
      expect(bad.message).toContain(WRONG);

      // change password: short / mismatching values are blocked
      const e = await openEdit(page, u.email);
      await e.getByText('CHANGE PASSWORD', { exact: true }).click({ force: true });
      const pw = e.locator('input[placeholder="••••••••"]');
      await pw.nth(0).fill('short');
      await pw.nth(1).fill('other');
      await e.getByRole('button', { name: 'Save Changes' }).click();
      await expect(e).toContainText('Password ต้องมีอย่างน้อย 8 ตัวอักษร');
      await expect(e).toContainText('Password ไม่ตรงกัน');
      await expect(e).toBeVisible();

      // valid new password
      await pw.nth(0).fill(QA_NEW_PASSWORD());
      await pw.nth(1).fill(QA_NEW_PASSWORD());
      await e.getByRole('button', { name: 'Save Changes' }).click();
      await expect(e).toBeHidden({ timeout: 15000 });
      await dismissOk(page);

      expect((await tryLogin(browser, u.email, QA_PASSWORD())).message, 'old password no longer works').toContain(WRONG);
      expect((await tryLogin(browser, u.email, QA_NEW_PASSWORD())).ok, 'new password works').toBe(true);
    } finally {
      await purgeQaUsers(page).catch(() => undefined);
    }
  });

  test('UM-AUTH-02 an inactive user cannot sign in until reactivated', { tag: ['@happy', '@negative', '@security'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    const u = newQaUser();
    try {
      await openUserManagement(page);
      await createQaUser(page, u);
      await searchUsers(page, '');
      const before = await tiles(page);
      expect((await tryLogin(browser, u.email, QA_PASSWORD())).ok).toBe(true);

      const toggleStatus = async () => {
        const e = await openEdit(page, u.email);
        await e.getByRole('switch', { name: 'Status' }).evaluate((el) => (el as HTMLElement).click());
        await e.getByRole('button', { name: 'Save Changes' }).click();
        await expect(e).toBeHidden({ timeout: 15000 });
        await dismissOk(page);
      };

      // deactivate
      await toggleStatus();
      await expect(await qaRow(page, u.email)).toContainText('Inactive');
      await searchUsers(page, '');
      const inactive = await tiles(page);
      expect(inactive.inactive).toBe(before.inactive + 1);
      expect(inactive.active).toBe(before.active - 1);
      expect(inactive.total).toBe(before.total);
      const blocked = await tryLogin(browser, u.email, QA_PASSWORD());
      expect(blocked.ok).toBe(false);
      expect(blocked.message).toContain(SUSPENDED);

      // reactivate
      await toggleStatus();
      await expect(await qaRow(page, u.email)).toContainText('Active');
      expect((await tryLogin(browser, u.email, QA_PASSWORD())).ok, 'works again after reactivation').toBe(true);
    } finally {
      await purgeQaUsers(page).catch(() => undefined);
    }
  });
});
