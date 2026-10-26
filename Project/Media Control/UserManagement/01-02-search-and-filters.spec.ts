// ค้นหา (ชื่อ/อีเมล/เบอร์โทร ไม่สนตัวพิมพ์ แยกคำ) 
// ไม่พบต้องขึ้นสถานะว่าง ตัวกรองสถานะ/แผนก/User Group ทำงาน 
// กรองหลายตัวพร้อมกันได้ และ Reset คืนค่าเดิม
// spec: specs/user-management-plan.md (2) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openUserManagement, searchUsers, rows, footerTotal, tiles, pickFilter, resetFilters, columnTexts,
} from './_helpers';

const NAME = 1, DEPARTMENT = 2, GROUP = 4, EMAIL = 5, PHONE = 6, STATUS = 7;

test.describe('User Management — search', () => {
  test('UM-SRCH-01 search by name, email and phone; no match; clear', { tag: ['@happy', '@edge'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const total = await footerTotal(page);

    // take a real user from the first row. The search splits the text into words (e-mail at "@" / "."), so other users
    // that share a word (e.g. "com") can appear too — the user itself must always be among the results.
    const [name, email, phone] = [(await columnTexts(page, NAME))[0], (await columnTexts(page, EMAIL))[0], (await columnTexts(page, PHONE))[0]];
    const nameTerm = name.replace(/^\S{1,3}\s/, '').split(' ')[0]; // drop the avatar initials, keep the first word
    const terms: [string, string][] = [['name', nameTerm], ['email', email]];
    if (phone && /\d/.test(phone)) terms.push(['phone', phone]);
    for (const [label, term] of terms) {
      await searchUsers(page, term);
      await expect(rows(page).first(), label).toBeVisible();
      expect(await columnTexts(page, EMAIL), `${label} search finds the user`).toContain(email);
    }

    // case-insensitive
    await searchUsers(page, email.toUpperCase());
    expect(await columnTexts(page, EMAIL), 'upper-case e-mail').toContain(email);

    // no match (avoid digit strings: "98765" would match a phone number)
    await searchUsers(page, 'zzz-no-such-user');
    await expect(rows(page)).toHaveCount(0);
    await expect(page.getByText(/No users? found/i).first()).toBeVisible();

    // clear
    await searchUsers(page, '');
    await expect.poll(() => footerTotal(page)).toBe(total);
  });
});

test.describe('User Management — filters', () => {
  test('UM-FLT-01 status filter and tile counts agree', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const t = await tiles(page);

    await pickFilter(page, 'status', 'Active');
    expect(await footerTotal(page)).toBe(t.active);
    for (const s of await columnTexts(page, STATUS)) expect(s).toBe('Active');

    await pickFilter(page, 'status', 'Inactive');
    expect(await footerTotal(page)).toBe(t.inactive);
    for (const s of await columnTexts(page, STATUS)) expect(s).toBe('Inactive');

    await resetFilters(page);
    await expect.poll(() => footerTotal(page)).toBe(t.total);
  });

  test('UM-FLT-02 user group filter; the Head CG tile = Head CG + Head CG & Media Management groups', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const t = await tiles(page);

    await pickFilter(page, 'User Group', 'Head CG');
    const headCg = await footerTotal(page);
    for (const g of await columnTexts(page, GROUP)) expect(g).toBe('Head CG');

    await resetFilters(page);
    await pickFilter(page, 'User Group', 'Head CG & Media Management');
    const both = await footerTotal(page);
    for (const g of await columnTexts(page, GROUP)) expect(g).toBe('Head CG & Media Management');
    // the tile counts users with the Head CG role, which covers both groups
    expect(headCg + both, 'Head CG tile').toBe(t.headCg);

    await resetFilters(page);
    await pickFilter(page, 'User Group', 'Team CG');
    await expect(rows(page).first()).toBeVisible();
    for (const g of await columnTexts(page, GROUP)) expect(g).toBe('Team CG');
  });

  test('UM-FLT-03 department filter, combined filters and Reset', { tag: ['@happy', '@edge'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const total = await footerTotal(page);

    await pickFilter(page, 'department', 'Graphic & Production');
    await expect(rows(page).first()).toBeVisible();
    const onlyDept = await footerTotal(page);
    expect(onlyDept).toBeLessThan(total);
    for (const d of await columnTexts(page, DEPARTMENT)) expect(d).toContain('Graphic & Production');

    // combine with status: never more than the single filter
    await pickFilter(page, 'status', 'Active');
    expect(await footerTotal(page)).toBeLessThanOrEqual(onlyDept);
    for (const d of await columnTexts(page, DEPARTMENT)) expect(d).toContain('Graphic & Production');
    for (const s of await columnTexts(page, STATUS)) expect(s).toBe('Active');

    // search on top of the filters
    await searchUsers(page, 'zzz-no-such-user');
    await expect(rows(page)).toHaveCount(0);

    await resetFilters(page);
    await searchUsers(page, '');
    await expect.poll(() => footerTotal(page)).toBe(total);
  });
});
