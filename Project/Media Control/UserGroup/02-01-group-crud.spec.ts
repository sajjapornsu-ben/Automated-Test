// CRUD กลุ่มผู้ใช้ทดสอบ "QA Test Group ...": ชื่อว่างถูกบล็อก, สร้างพร้อมสิทธิ์ระบบ/เมนู (การ์ดแสดง SYSTEM ACCESS และตัวเลขสรุปเพิ่ม), แก้ชื่อ/คำอธิบาย/สิทธิ์, ปิดสถานะ (Inactive) และลบ (Cancel ไม่ลบ / ยืนยันลบ)
// spec: specs/user-group-plan.md (4) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบกลุ่มจริงบน UAT (เฉพาะ "QA Test Group ...") ไม่แตะกลุ่มเดิม — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openUserGroups, card, cards, tiles, showingCount, searchGroups, drawer, uniqueGroupName, fillGroup, saveGroup,
  dismissOk, deleteGroup, purgeQaGroups,
} from './_helpers';

test.describe('User Group Management — QA group CRUD', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes a real UAT group — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('UG-CRUD-01 validation, create with access, edit, deactivate, delete', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    const name = uniqueGroupName();
    try {
      await purgeQaGroups(page).catch(() => undefined);
      await openUserGroups(page);
      const before = await tiles(page);

      // a name is required
      await page.getByRole('button', { name: 'Add User Group', exact: true }).click();
      await saveGroup(page);
      await expect(drawer(page)).toContainText(/กรุณา|required/i);
      await expect(drawer(page)).toBeVisible();
      await drawer(page).getByRole('button', { name: 'Cancel' }).click();
      await expect(drawer(page)).toBeHidden();

      // create with MEDIA APPROVAL > Dashboard and SETTING > UI Kit
      await page.getByRole('button', { name: 'Add User Group', exact: true }).click();
      await fillGroup(page, { name, description: 'QA Test group — created by Playwright', access: { 'MEDIA APPROVAL': ['Dashboard'], SETTING: ['UI Kit'] } });
      await expect(drawer(page)).toContainText(/เลือกแล้ว\s*2\s*ระบบ\s*·\s*2\s*เมนู/);
      await saveGroup(page);
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissOk(page);

      await searchGroups(page, name);
      const c = card(page, name);
      await expect(c).toHaveCount(1);
      await expect(c).toContainText('Active');
      await expect(c).toContainText('0 users');
      await expect(c).toContainText(/system access\s*2/i);
      await expect(c).toContainText(/MEDIA APPROVAL\s*1\/5/);
      await expect(c).toContainText(/SETTING\s*1\/6/);
      await searchGroups(page, '');
      const after = await tiles(page);
      expect(after.groups).toBe(before.groups + 1);
      expect(after.active).toBe(before.active + 1);

      // edit: rename + description + one more menu
      const renamed = `${name} R`;
      await searchGroups(page, name);
      await card(page, name).getByRole('button', { name: 'Edit' }).click({ force: true });
      await expect(drawer(page)).toContainText(/Edit/);
      await fillGroup(page, { name: renamed, description: 'edited', access: { 'MEDIA APPROVAL': ['Media Ticket'] } });
      await saveGroup(page, 'Save Changes');
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissOk(page);
      await searchGroups(page, renamed);
      await expect(card(page, renamed)).toContainText(/MEDIA APPROVAL\s*2\/5/);
      await expect(card(page, renamed)).toContainText('edited');

      // deactivate
      await card(page, renamed).getByRole('button', { name: 'Edit' }).click({ force: true });
      await fillGroup(page, { active: false });
      await saveGroup(page, 'Save Changes');
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissOk(page);
      await searchGroups(page, renamed);
      await expect(card(page, renamed)).toContainText('Inactive');
      await searchGroups(page, '');
      const inactive = await tiles(page);
      expect(inactive.inactive).toBe(before.inactive + 1);
      expect(inactive.active).toBe(before.active);

      // delete: Cancel keeps it, confirm removes it
      await searchGroups(page, renamed);
      await card(page, renamed).getByRole('button', { name: 'Delete' }).click({ force: true });
      await expect(page.getByText(/cannot be undone|Are you sure/i).first()).toBeVisible();
      await page.getByRole('button', { name: 'Cancel', exact: true }).last().click();
      await expect(card(page, renamed)).toHaveCount(1);
      await deleteGroup(page, renamed);
      await searchGroups(page, renamed);
      await expect(cards(page)).toHaveCount(0);
      await searchGroups(page, '');
      const end = await tiles(page);
      expect(end.groups).toBe(before.groups);
      expect(await showingCount(page)).toBe(before.groups);
    } finally {
      await purgeQaGroups(page).catch(() => undefined);
    }
  });
});
