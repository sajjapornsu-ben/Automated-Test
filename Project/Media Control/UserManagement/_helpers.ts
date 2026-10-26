// ตัวช่วยสำหรับทดสอบ Setting > User Management (Super Admin)
import { Page, Locator, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';

export const PAGE_URL = 'https://uat-mediacontrol.planbmedia.co.th/settings/userManagement';
export const SEARCH_PLACEHOLDER = 'Search by name, email, phone...';
export const loginSuperAdmin = (page: Page) => loginAs(page, 'superAdmin');

export async function openUserManagement(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: 'User Management', exact: true }).first()).toBeVisible({ timeout: 30000 });
  await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

export const rows = (page: Page) => page.locator('tbody tr');
export const rowByText = (page: Page, text: string) => rows(page).filter({ hasText: text });
export const searchBox = (page: Page) => page.getByPlaceholder(SEARCH_PLACEHOLDER);

export async function searchUsers(page: Page, term: string) {
  await searchBox(page).fill(term);
  await page.waitForTimeout(1200); // list reloads after a debounce
}

/** Summary tiles: Total Users / Active / Inactive / Head CG. */
export async function tiles(page: Page): Promise<{ total: number; active: number; inactive: number; headCg: number }> {
  const t = (await page.locator('main').first().innerText()).replace(/\s+/g, ' ');
  const n = (label: string) => Number(t.match(new RegExp(String.raw`${label} (\d+)`))![1]);
  return { total: n('Total Users'), active: n('Active'), inactive: n('Inactive'), headCg: n('Head CG') };
}

/** "Showing 1 to 5 of 72 items" → 72 (0 when the table is empty). */
export async function footerTotal(page: Page): Promise<number> {
  const label = page.getByText(/Showing \d+ to \d+ of \d+ items/).first();
  await label.waitFor({ timeout: 6000 }).catch(() => undefined);
  if ((await label.count()) === 0) return 0;
  return Number((await label.innerText()).match(/of (\d+) items/)![1]);
}

/** Picks an option of one of the filter dropdowns ("Filter by status" / "Filter by department" / "Filter by User Group"). */
export async function pickFilter(page: Page, which: 'status' | 'department' | 'User Group', option: string) {
  const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: new RegExp(`Filter by ${which}$`, 'i') }) }).first();
  await group.click();
  await page.getByRole('listbox').first().getByRole('option', { name: option, exact: true }).first().click();
  await page.waitForTimeout(1200);
}

export async function filterOptions(page: Page, which: 'status' | 'department' | 'User Group'): Promise<string[]> {
  const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: new RegExp(`Filter by ${which}$`, 'i') }) }).first();
  await group.click();
  const options = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((s) => s.trim());
  await page.keyboard.press('Escape');
  return options;
}

export const resetFilters = async (page: Page) => {
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(1200);
};

export const drawer = (page: Page) => page.getByRole('dialog').first();

/** Cell text of a given column (0-based, ACTIONS is 0) for every visible row. */
export const columnTexts = async (page: Page, index: number) =>
  (await rows(page).evaluateAll((trs, i) => trs.map((tr) => ((tr.querySelectorAll('td')[i] as HTMLElement | undefined)?.innerText ?? '').replace(/\s+/g, ' ').trim()), index)) as string[];

// ---------- throwaway "QA Test" users (the only users the CRUD tests may touch) ----------
import type { Browser } from '@playwright/test';

export const QA_FIRST = 'QA Test';
export const QA_EMAIL_PREFIX = 'qa.test.';
export const QA_PASSWORD = () => process.env.QA_USER_PASSWORD!;
export const QA_NEW_PASSWORD = () => process.env.QA_USER_NEW_PASSWORD!;

export type QaUser = { first: string; last: string; email: string; fullName: string };
export const newQaUser = (): QaUser => {
  const t = Date.now().toString().slice(-8);
  return { first: QA_FIRST, last: `User ${t}`, email: `${QA_EMAIL_PREFIX}${t}@example.com`, fullName: `${QA_FIRST} User ${t}` };
};

/** The one row of a QA user (asserts there is exactly one, so an action can never land on another user). */
export async function qaRow(page: Page, email: string): Promise<Locator> {
  await searchUsers(page, email);
  const row = rows(page).filter({ hasText: email });
  await expect(row, `exactly one row for ${email}`).toHaveCount(1);
  expect(email.startsWith(QA_EMAIL_PREFIX), 'only QA users are touched').toBe(true);
  return row;
}

export async function dismissOk(page: Page) {
  await page.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 4000 }).catch(() => undefined);
}

/** Creates a QA user (user group "QA", Email Notification off) through the Create User drawer. */
export async function createQaUser(page: Page, u: QaUser, opts: { phone?: string } = {}) {
  await page.getByRole('button', { name: 'Create User', exact: true }).click();
  const d = drawer(page);
  await d.getByPlaceholder('First name').fill(u.first);
  await d.getByPlaceholder('Last name').fill(u.last);
  await d.getByPlaceholder('name@planbmedia.co.th').fill(u.email);
  await d.getByPlaceholder('099-999-9999').fill(opts.phone ?? '0999999999');
  await d.locator('select').nth(1).selectOption({ label: 'QA' });
  await d.getByPlaceholder('••••••••').first().fill(QA_PASSWORD());
  await d.getByPlaceholder('••••••••').nth(1).fill(QA_PASSWORD());
  // Email Notification is on by default; turn it off so the throwaway account never triggers mail
  await d.getByRole('switch', { name: 'Email Notification' }).evaluate((e) => (e as HTMLElement).click());
  await d.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(`${u.fullName} has been added successfully`)).toBeVisible({ timeout: 15000 });
  await dismissOk(page);
  await expect(d).toBeHidden({ timeout: 10000 });
}

export async function openEdit(page: Page, email: string) {
  const row = await qaRow(page, email);
  await row.getByRole('button', { name: 'Edit' }).click({ force: true });
  await expect(drawer(page)).toContainText(/Edit User/, { timeout: 10000 });
  return drawer(page);
}

export async function deleteQaUser(page: Page, email: string) {
  const row = await qaRow(page, email);
  await row.getByRole('button', { name: 'Delete' }).click({ force: true });
  await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
  await page.getByRole('button', { name: 'Delete Permanently' }).click();
  await dismissOk(page);
}

/** Removes every leftover "qa.test.*@example.com" user. */
export async function purgeQaUsers(page: Page) {
  await openUserManagement(page);
  for (let i = 0; i < 10; i++) {
    await searchUsers(page, QA_EMAIL_PREFIX);
    const row = rows(page).filter({ hasText: /qa\.test\.\d+@example\.com/ }).first();
    if ((await row.count()) === 0) break;
    const text = await row.innerText();
    const email = text.match(/qa\.test\.\d+@example\.com/)![0];
    try {
      await deleteQaUser(page, email);
    } catch {
      break;
    }
    await page.waitForTimeout(800);
  }
}

/** Tries to sign in as `email` in a fresh browser context; returns whether it worked and the message of the failure dialog. */
export async function tryLogin(browser: Browser, email: string, password: string): Promise<{ ok: boolean; message: string; url: string }> {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  try {
    await p.goto('https://uat-mediacontrol.planbmedia.co.th/login');
    await p.getByRole('textbox', { name: 'อีเมล' }).fill(email);
    await p.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
    await p.getByRole('button', { name: 'Sign In', exact: true }).click();
    await Promise.race([p.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 15000 }), p.getByRole('button', { name: 'OK', exact: true }).waitFor({ timeout: 15000 })]).catch(() => undefined);
    const url = new URL(p.url()).pathname;
    if (!url.startsWith('/login')) return { ok: true, message: '', url };
    const text = (await p.locator('body').innerText()).replace(/\s+/g, ' ');
    return { ok: false, message: text.match(/Failed (.*?) OK/)?.[1] ?? text.slice(-120), url };
  } finally {
    await ctx.close();
  }
}
