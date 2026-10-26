// แบ่งหน้า (จำนวนต่อหน้า/หน้าถัดไป/ก่อนหน้า) คอลัมน์ Media Group ("+N" และ "Show all N Media Groups" ต้องตรงกัน) และ Export Excel (ไฟล์ users_<วันที่>.xlsx ชีต Users จำนวนแถว = Total และข้อมูลตรงกับตาราง)
// spec: specs/user-management-plan.md (3) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openUserManagement, rows, footerTotal, tiles, columnTexts, pickFilter } from './_helpers';
import { readWorkbook, sheetMatrix } from '../Dashboard/_report-helpers';

const DEPARTMENT = 2, GROUP = 4, EMAIL = 5, PHONE = 6, STATUS = 7, UPDATED = 8;
const perPage = (page: import('@playwright/test').Page) => page.getByRole('combobox').last();

test.describe('User Management — pagination', () => {
  test('UM-PAG-01 page size, next / previous page, total stays the same', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const total = await footerTotal(page);

    await perPage(page).selectOption('10');
    await expect.poll(() => rows(page).count()).toBe(10);
    expect(await footerTotal(page)).toBe(total);
    const firstPage = await columnTexts(page, EMAIL);

    await page.getByRole('button', { name: 'Next' }).click();
    await expect.poll(async () => (await columnTexts(page, EMAIL))[0]).not.toBe(firstPage[0]);
    const secondPage = await columnTexts(page, EMAIL);
    expect(secondPage.filter((e) => firstPage.includes(e)), 'no user on both pages').toEqual([]);
    await expect(page.getByText(/Showing 11 to 20 of/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Prev' }).click();
    await expect.poll(async () => (await columnTexts(page, EMAIL))[0]).toBe(firstPage[0]);

    await perPage(page).selectOption('100');
    await expect.poll(() => rows(page).count()).toBe(Math.min(100, total));
  });
});

test.describe('User Management — media groups column', () => {
  test('UM-MG-01 "Show all N Media Groups" lists exactly N groups', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openUserManagement(page);
    await perPage(page).selectOption('100');
    await expect.poll(() => rows(page).count()).toBeGreaterThan(10);

    const row = rows(page).filter({ has: page.getByRole('button', { name: /Show all \d+ Media Groups/ }) }).first();
    const n = Number((await row.getByRole('button', { name: /Show all \d+ Media Groups/ }).getAttribute('aria-label'))!.match(/(\d+)/)![1]);
    await row.getByRole('button', { name: /Show all \d+ Media Groups/ }).click({ force: true });
    const heading = page.getByText(new RegExp(`Media Groups \\(${n}\\)`)).first();
    await expect(heading).toBeVisible();
    const names = (await heading.locator('xpath=..').innerText()).split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !/^Media Groups \(\d+\)$/.test(s));
    expect(names.length, `popover lists ${n} groups`).toBe(n);
  });
});

test.describe('User Management — export', () => {
  test('UM-EXP-01 Export Excel has one row per user and matches the table', { tag: ['@happy', '@regression'] }, async ({ page }, testInfo) => {
    test.setTimeout(120000);
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const t = await tiles(page);
    await perPage(page).selectOption('100');
    await expect.poll(() => rows(page).count()).toBe(Math.min(100, t.total));
    const table = new Map<string, string[]>();
    const cols = [await columnTexts(page, DEPARTMENT), await columnTexts(page, GROUP), await columnTexts(page, EMAIL), await columnTexts(page, PHONE), await columnTexts(page, STATUS), await columnTexts(page, UPDATED)];
    cols[2].forEach((email, i) => table.set(email, [cols[0][i], cols[1][i], cols[3][i], cols[4][i], cols[5][i]]));

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export Excel' }).click()]);
    expect(download.suggestedFilename()).toMatch(/^users_\d{4}-\d{2}-\d{2}\.xlsx$/);
    const file = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(file);

    const wb = await readWorkbook(file);
    expect(wb.worksheets.map((w) => w.name)).toEqual(['Users']);
    const [header, ...data] = sheetMatrix(wb.worksheets[0]);
    expect(header).toEqual(['Name', 'Department', 'Media Group', 'User Group', 'Email', 'Phone', 'Status', 'Updated Date']);
    expect(data.length, 'one row per user').toBe(t.total);

    for (const r of data) {
      const mine = table.get(r[4].trim());
      expect(mine, `file user ${r[4]} is in the table`).toBeTruthy();
      const norm = (s: string) => s.trim().replace(/^—$/, ''); // the table shows an empty phone as an em dash
      expect([r[1], r[3], r[5], r[6], r[7]].map(norm), r[4]).toEqual(mine!.map(norm));
    }
  });

  test('UM-EXP-02 Export respects the status filter', { tag: ['@edge'] }, async ({ page }, testInfo) => {
    test.setTimeout(120000);
    await loginSuperAdmin(page);
    await openUserManagement(page);
    const t = await tiles(page);
    await pickFilter(page, 'status', 'Inactive');
    expect(await footerTotal(page)).toBe(t.inactive);

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export Excel' }).click()]);
    const file = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(file);
    const [, ...data] = sheetMatrix((await readWorkbook(file)).worksheets[0]);
    expect(data.length, 'only the filtered users are exported').toBe(t.inactive);
    for (const r of data) expect(r[6]).toBe('Inactive');
  });
});
