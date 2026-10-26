// User Group Management (อ่านอย่างเดียว): โครงหน้า/ตัวเลขสรุป, ค้นหา, ตัวกรองสถานะและชิประบบ, หน้าต่างสมาชิก และจำนวนสมาชิก (เฉพาะผู้ใช้ Active) ของแต่ละกลุ่มต้องตรงกับหน้า User Management
// spec: specs/user-group-plan.md (1–3) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openUserGroups, cards, card, tiles, showingCount, searchGroups, memberCount, drawer } from './_helpers';
import { openUserManagement, pickFilter, footerTotal } from '../UserManagement/_helpers';

test.describe('User Group Management — read only', () => {
  test('UG-READ-01 structure and summary tiles', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserGroups(page);
    await expect(page.getByRole('button', { name: 'Add User Group', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Search — group name, description...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    const t = await tiles(page);
    expect(t.active + t.inactive, 'Active + Inactive').toBe(t.groups);
    expect(await showingCount(page), 'cards shown').toBe(t.groups);
    expect(await cards(page).count(), 'card elements').toBe(t.groups);

    // every card has Edit and Delete and a member count
    for (let i = 0; i < t.groups; i++) {
      const c = cards(page).nth(i);
      await expect(c.getByRole('button', { name: 'Edit' })).toBeAttached();
      await expect(c.getByRole('button', { name: 'Delete' })).toBeAttached();
      await expect(c).toContainText(/\d+ users?/);
    }
    // the Total Users tile adds up the member counts of the cards
    let sum = 0;
    for (let i = 0; i < t.groups; i++) sum += await memberCount(cards(page).nth(i));
    expect(sum, 'Total Users = Σ members of the groups').toBe(t.users);
  });

  test('UG-SRCH-01 search by group name and description; no match; clear', { tag: ['@happy', '@edge'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserGroups(page);
    const total = await showingCount(page);

    await searchGroups(page, 'Head CG');
    await expect(card(page, 'Head CG')).toBeVisible();
    expect(await showingCount(page)).toBeLessThan(total);

    await searchGroups(page, 'head cg & media'); // case-insensitive
    await expect(card(page, 'Head CG & Media Management')).toBeVisible();

    await searchGroups(page, 'for test'); // description of the QA group
    await expect(card(page, 'QA')).toBeVisible();

    await searchGroups(page, 'zzz-no-such-group');
    await expect(cards(page)).toHaveCount(0);

    await searchGroups(page, '');
    await expect.poll(() => showingCount(page)).toBe(total);
  });

  test('UG-FLT-01 system chips and the status filter narrow the cards; Reset restores', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserGroups(page);
    const total = await showingCount(page);

    // chips: "SETTING · 2" → exactly 2 groups that have SETTING access
    for (const [chip, n] of [['SETTING', 2], ['MEDIA APPROVAL', 8], ['HOME', 1]] as const) {
      await page.getByRole('button', { name: new RegExp(`^${chip} · ${n}$`) }).click();
      await expect.poll(() => showingCount(page), chip).toBe(n);
      for (let i = 0; i < n; i++) await expect(cards(page).nth(i), chip).toContainText(chip);
    }
    await page.getByRole('button', { name: /^All · \d+$/ }).click();
    await expect.poll(() => showingCount(page)).toBe(total);

    // status filter
    const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: /status/i }) }).first();
    await group.click();
    await page.getByRole('listbox').first().getByRole('option', { name: 'Inactive', exact: true }).click();
    await page.waitForTimeout(800);
    expect(await showingCount(page)).toBe((await tiles(page)).inactive);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect.poll(() => showingCount(page)).toBe(total);
  });

  test('UG-MEM-01 members dialog lists exactly the users of the card', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserGroups(page);
    const c = card(page, 'Head CG & Media Management');
    const n = await memberCount(c);
    await c.getByText('Click to view members').click({ force: true });
    const d = drawer(page);
    await expect(d).toContainText('Head CG & Media Management');
    await expect(d).toContainText(new RegExp(String.raw`${n}\s*users? in this group`));
    expect((await d.innerText()).match(/@/g)?.length, 'one e-mail per member').toBe(n);
    await expect(d).toContainText(/managed on the User Management page/);
  });

  test('UG-X-01 member count of each group equals the ACTIVE users in User Management', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    await openUserGroups(page);
    const counts: Record<string, number> = {};
    for (let i = 0; i < (await cards(page).count()); i++) {
      const c = cards(page).nth(i);
      const name = (await c.locator('span.font-semibold').first().innerText()).trim();
      counts[name] = await memberCount(c);
    }
    expect(Object.keys(counts).length).toBeGreaterThan(5);

    await openUserManagement(page);
    for (const [name, n] of Object.entries(counts)) {
      await pickFilter(page, 'User Group', name);
      await pickFilter(page, 'status', 'Active'); // the cards count active members only (an inactive user is not counted)
      expect(await footerTotal(page), `User Management shows ${n} active users for "${name}"`).toBe(n);
    }
  });
});
