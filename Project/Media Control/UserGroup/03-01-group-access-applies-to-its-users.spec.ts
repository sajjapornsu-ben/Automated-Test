// สร้างกลุ่ม QA + ผู้ใช้ QA ในกลุ่มนั้น แล้วตรวจว่าสิทธิ์ของกลุ่มมีผลจริงกับผู้ใช้: เมนู sidebar ตรงกับสิทธิ์, เข้าหน้าที่ไม่ได้รับสิทธิ์ไม่ได้, แก้สิทธิ์กลุ่มแล้วเมนูเปลี่ยน, ปิดกลุ่ม (Inactive), ลบกลุ่มที่ยังมีสมาชิกไม่ได้ และย้ายสมาชิกออกแล้วลบได้
// spec: specs/user-group-plan.md (5) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบกลุ่มและผู้ใช้จริงบน UAT (เฉพาะ "QA Test Group ..." และ qa.test.<เลข>@example.com) ไม่แตะของเดิม — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openUserGroups, card, tiles, searchGroups, drawer, uniqueGroupName, fillGroup, saveGroup, dismissOk, deleteGroup,
  purgeQaGroups, signInAs, memberCount,
} from './_helpers';
import {
  openUserManagement, newQaUser, createQaUser, openEdit, purgeQaUsers, qaRow, QA_PASSWORD, searchUsers,
} from '../UserManagement/_helpers';

test.describe('User Group Management — group access applies to its users', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes real UAT groups and users — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('UG-ASSIGN-01 menus follow the group access; members; inactive group; delete rules', { tag: ['@happy', '@negative', '@security', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(480000);
    await loginSuperAdmin(page);
    const group = uniqueGroupName();
    const u = newQaUser();
    try {
      await purgeQaUsers(page).catch(() => undefined);
      await purgeQaGroups(page).catch(() => undefined);

      // 1) group with MEDIA APPROVAL > Dashboard and SETTING > UI Kit
      await openUserGroups(page);
      const before = await tiles(page);
      await page.getByRole('button', { name: 'Add User Group', exact: true }).click();
      await fillGroup(page, { name: group, access: { 'MEDIA APPROVAL': ['Dashboard'], SETTING: ['UI Kit'] } });
      await saveGroup(page);
      await dismissOk(page); // the "saved" modal can sit above the drawer
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });

      // 2) a user in that group (a role other than QA needs a role and one media group/category)
      await openUserManagement(page);
      await createQaUser(page, u, { group, role: 'Sale', mediaAccess: true });
      await expect(await qaRow(page, u.email)).toContainText(group);

      // 3) the group card, the Total Users tile and the members dialog
      await openUserGroups(page);
      await searchGroups(page, group);
      await expect(card(page, group)).toContainText(/1\s*user(?!s)/);
      await searchGroups(page, '');
      expect((await tiles(page)).users).toBe(before.users + 1);
      await searchGroups(page, group);
      await card(page, group).getByText('Click to view members').click({ force: true });
      await expect(drawer(page)).toContainText(u.email);
      await expect(drawer(page)).toContainText(/1\s*users? in this group/);
      await page.keyboard.press('Escape');

      // 4) what the user really gets
      let s = await signInAs(browser, u.email, QA_PASSWORD());
      try {
        expect(s.ok, 'the new user can sign in').toBe(true);
        expect(s.menu).toEqual(['MEDIA APPROVAL', 'Dashboard', 'SETTING', 'UI Kit']);
        expect(await s.open('/mediaApproval/dashboard'), 'granted page opens').toBe('/mediaApproval/dashboard');
        expect(await s.open('/mediaApproval/mediaTicket'), 'menu not granted → sent away').toBe('/dashboard');
        expect(await s.open('/settings/userManagement'), 'menu not granted → sent away').toBe('/dashboard');
      } finally {
        await s.close();
      }

      // 5) change the group access: + Media Ticket, SETTING off
      await openUserGroups(page);
      await searchGroups(page, group);
      await card(page, group).getByRole('button', { name: 'Edit' }).click({ force: true });
      await fillGroup(page, { access: { 'MEDIA APPROVAL': ['Media Ticket'] } });
      const setting = drawer(page).getByText('SETTING', { exact: true }).first().locator('xpath=ancestor::div[count(.//*[@role="switch"])=1]').last().getByRole('switch').first();
      await setting.evaluate((e) => (e as HTMLElement).click());
      await saveGroup(page, 'Save Changes');
      await dismissOk(page); // the "saved" modal can sit above the drawer
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      s = await signInAs(browser, u.email, QA_PASSWORD());
      try {
        expect(s.menu).toEqual(['MEDIA APPROVAL', 'Dashboard', 'Media Ticket']);
        expect(await s.open('/mediaApproval/mediaTicket')).toBe('/mediaApproval/mediaTicket');
        expect(await s.open('/settings/userGroupManagement')).toBe('/dashboard');
      } finally {
        await s.close();
      }

      // 6) an inactive group: its users lose access (observed: nothing in the sidebar); active again → back
      const setActive = async (active: boolean, confirm = true) => {
        await openUserGroups(page);
        await searchGroups(page, group);
        await card(page, group).getByRole('button', { name: 'Edit' }).click({ force: true });
        await fillGroup(page, { active });
        await saveGroup(page, 'Save Changes');
        if (!active) {
          // deactivating a group with members asks for confirmation ("will remove all 1 members ... from the system")
          await expect(page.getByText(/Confirm change status to Inactive/)).toBeVisible();
          await expect(page.getByText(/remove all\s*1\s*members/)).toBeVisible();
          await page.getByRole('button', { name: confirm ? 'Confirm' : 'Cancel', exact: true }).last().click();
          if (!confirm) {
            await drawer(page).getByRole('button', { name: 'Cancel' }).click();
            await expect(drawer(page)).toBeHidden();
            return;
          }
        }
        await dismissOk(page); // the "saved" modal can sit above the drawer
        await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      };
      await setActive(false, false); // Cancel on the confirmation keeps the group active
      await searchGroups(page, group);
      await expect(card(page, group)).toContainText('Active');
      await expect(card(page, group)).not.toContainText('Inactive');
      await setActive(false);
      await searchGroups(page, group);
      await expect(card(page, group)).toContainText('Inactive');
      s = await signInAs(browser, u.email, QA_PASSWORD());
      try {
        expect(s.menu, 'inactive group → no menus').toEqual([]);
      } finally {
        await s.close();
      }
      await setActive(true);
      s = await signInAs(browser, u.email, QA_PASSWORD());
      try {
        expect(s.menu).toEqual(['MEDIA APPROVAL', 'Dashboard', 'Media Ticket']);
      } finally {
        await s.close();
      }

      // 7) a group that still has a member cannot be deleted
      await openUserGroups(page);
      await searchGroups(page, group);
      await card(page, group).getByRole('button', { name: 'Delete' }).click({ force: true });
      await expect(page.getByText(/Cannot delete group/)).toBeVisible();
      await expect(page.getByText(/still has 1 user/)).toBeVisible();
      await expect(page.getByText(u.email).last()).toBeVisible();
      await dismissOk(page);
      await searchGroups(page, group);
      await expect(card(page, group)).toHaveCount(1);

      // 8) move the user out (to the QA group) → the group shows 0 users and can be deleted
      await openUserManagement(page);
      const e = await openEdit(page, u.email);
      await e.locator('select').nth(1).selectOption({ label: 'QA' });
      await e.getByRole('button', { name: 'Save Changes' }).click();
      await expect(e).toBeHidden({ timeout: 15000 });
      await dismissOk(page);
      await openUserGroups(page);
      await searchGroups(page, group);
      expect(await memberCount(card(page, group))).toBe(0);
      await deleteGroup(page, group);
      await searchGroups(page, group);
      await expect(card(page, group)).toHaveCount(0);
      await searchGroups(page, '');
      expect((await tiles(page)).groups).toBe(before.groups);
    } finally {
      await purgeQaUsers(page).catch(() => undefined);
      await purgeQaGroups(page).catch(() => undefined);
    }
  });
});
