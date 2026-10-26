// ตัวช่วยสำหรับทดสอบ Setting > User Group Management (Super Admin)
import { Page, Locator, Browser, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';

export const PAGE_URL = 'https://uat-mediacontrol.planbmedia.co.th/settings/userGroupManagement';
export const SEARCH_PLACEHOLDER = 'Search — group name, description...';
export const QA_GROUP_PREFIX = 'QA Test Group';
export const loginSuperAdmin = (page: Page) => loginAs(page, 'superAdmin');

export async function openUserGroups(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: 'User Group Management', exact: true }).first()).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/Showing \d+ of \d+ groups/)).toBeVisible({ timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

/** A group card: the rounded container that holds the name and the Edit / Delete buttons. */
export const card = (page: Page, name: string): Locator =>
  page.locator('div.rounded-xl').filter({ has: page.getByText(name, { exact: true }) }).filter({ has: page.getByRole('button', { name: 'Edit' }) }).last();

export const cards = (page: Page) => page.locator('div.rounded-xl').filter({ has: page.getByText('Click to view members') }).filter({ has: page.getByRole('button', { name: 'Edit' }) });

export const searchBox = (page: Page) => page.getByPlaceholder(SEARCH_PLACEHOLDER);
export async function searchGroups(page: Page, term: string) {
  await searchBox(page).fill(term);
  await page.waitForTimeout(900);
}

export async function tiles(page: Page): Promise<{ groups: number; active: number; inactive: number; users: number }> {
  const t = (await page.locator('main').first().innerText()).replace(/\s+/g, ' ');
  const n = (label: string) => Number(t.match(new RegExp(String.raw`${label} (\d+)`))![1]);
  return { groups: n('TOTAL USER GROUPS'), active: n('ACTIVE'), inactive: n('INACTIVE'), users: n('TOTAL USERS') };
}

/** "Showing 10 of 10 groups" → 10 */
export async function showingCount(page: Page): Promise<number> {
  return Number((await page.getByText(/Showing \d+ of \d+ groups/).innerText()).match(/Showing (\d+) of/)![1]);
}

/** Member count printed on a card ("21 users"). */
export async function memberCount(c: Locator): Promise<number> {
  return Number((await c.innerText()).match(/(\d+) users?/)![1]);
}

export const drawer = (page: Page) => page.getByRole('dialog').first();
export const uniqueGroupName = () => `${QA_GROUP_PREFIX} ${Date.now().toString().slice(-8)}`;

export type Access = Record<string, string[]>; // system → menus to tick (empty list = system on, no menu)

/** Fills the name / description / status / access of the open Add or Edit drawer. `access` replaces the current access. */
export async function fillGroup(page: Page, g: { name?: string; description?: string; active?: boolean; access?: Access }) {
  const d = drawer(page);
  if (g.name !== undefined) await d.getByPlaceholder('เช่น Sales — Lead').fill(g.name);
  if (g.description !== undefined) await d.getByPlaceholder(/เช่น หัวหน้าทีมขาย/).fill(g.description);
  if (g.active !== undefined) await d.getByText(g.active ? 'Active' : 'Inactive', { exact: true }).first().click();
  if (g.access) {
    for (const [system, menus] of Object.entries(g.access)) {
      // the system block = the smallest container of the system name that holds exactly one switch (its submenu list is inside it)
      const label = d.getByText(system, { exact: true }).first();
      const block = label.locator('xpath=ancestor::div[count(.//*[@role="switch"])=1]').last();
      const sw = block.getByRole('switch').first();
      if ((await sw.getAttribute('aria-checked')) !== 'true') await sw.evaluate((e) => (e as HTMLElement).click());
      if (menus.length === 0) continue;
      // the submenu items are buttons inside the drawer (names are unique across the systems that are used in the tests)
      for (const m of menus) await d.getByRole('button', { name: m, exact: true }).click({ force: true });
    }
  }
}

export async function saveGroup(page: Page, button: 'Save Group' | 'Save Changes' = 'Save Group') {
  const d = drawer(page);
  await d.getByRole('button', { name: new RegExp(`^(${button}|Save Group|Save Changes|Save)$`) }).click();
}

export async function dismissOk(page: Page) {
  await page.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 4000 }).catch(() => undefined);
}

/** Deletes a QA group card through its Delete button and the confirmation dialog. */
export async function deleteGroup(page: Page, name: string) {
  expect(name.startsWith(QA_GROUP_PREFIX), 'only QA groups are deleted').toBe(true);
  await searchGroups(page, name);
  const c = card(page, name);
  await expect(c).toHaveCount(1);
  await c.getByRole('button', { name: 'Delete' }).click({ force: true });
  await expect(page.getByText(/cannot be undone|Are you sure/i).first()).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: /^(Delete|Delete Permanently|Confirm Delete)$/ }).last().click();
  await dismissOk(page);
}

export async function purgeQaGroups(page: Page) {
  await openUserGroups(page);
  for (let i = 0; i < 10; i++) {
    await searchGroups(page, QA_GROUP_PREFIX);
    const names = await page.locator('div.rounded-xl').filter({ has: page.getByRole('button', { name: 'Edit' }) }).getByText(new RegExp(`^${QA_GROUP_PREFIX} \\d+`)).allInnerTexts();
    if (names.length === 0) break;
    try {
      await deleteGroup(page, names[0].trim());
    } catch {
      break;
    }
    await page.waitForTimeout(800);
  }
}

export type Session = { ok: boolean; menu: string[]; open: (path: string) => Promise<string>; close: () => Promise<void> };

/** Signs in as a throwaway user in its own browser context and reads the sidebar (system + submenu labels, in order). */
export async function signInAs(browser: Browser, email: string, password: string): Promise<Session> {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://uat-mediacontrol.planbmedia.co.th/login');
  await p.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  await p.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  await p.getByRole('button', { name: 'Sign In', exact: true }).click();
  await Promise.race([p.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 15000 }), p.getByRole('button', { name: 'OK', exact: true }).waitFor({ timeout: 15000 })]).catch(() => undefined);
  const ok = !new URL(p.url()).pathname.startsWith('/login');
  const readMenu = async () => {
    await p.waitForTimeout(1500);
    const text = await p.locator('aside').first().innerText({ timeout: 5000 }).catch(() => ''); // a user without any menu has no sidebar at all
    // drop the brand line and the footer with the user name / e-mail
    return text.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !/MEDIA CONTROL SYSTEM/.test(s) && !s.includes('@') && !/^QT$/.test(s) && !/^QA Test User/.test(s));
  };
  return {
    ok,
    menu: ok ? await readMenu() : [],
    open: async (path: string) => {
      await p.goto('https://uat-mediacontrol.planbmedia.co.th' + path);
      await p.waitForTimeout(2500);
      return new URL(p.url()).pathname;
    },
    close: () => ctx.close(),
  };
}
