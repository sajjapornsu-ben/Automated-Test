// ตัวช่วยสำหรับทดสอบ Setting > Email Template (Super Admin)
import { Page, Locator, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';

export const PAGE_URL = 'https://uat-mediacontrol.planbmedia.co.th/settings/emailTemplate';
export const SEARCH_PLACEHOLDER = 'Search subject, sender or description...';
export const QA_PREFIX = 'QA Test';
export const loginSuperAdmin = (page: Page) => loginAs(page, 'superAdmin');

export async function openEmailTemplates(page: Page) {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: 'Email Template', exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText(/^\d+ templates?$/)).toBeVisible({ timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

/** "12 templates" → 12 */
export async function templateCount(page: Page): Promise<number> {
  return Number((await page.getByText(/^\d+ templates?$/).innerText()).match(/\d+/)![0]);
}

export const dataRows = (page: Page) => page.getByRole('grid', { name: 'Email templates' }).getByRole('row').filter({ has: page.getByRole('gridcell') });

/** The row whose Subject cell is exactly `subject`. */
export const rowBySubject = (page: Page, subject: string): Locator =>
  dataRows(page).filter({ has: page.getByRole('gridcell', { name: subject, exact: true }) });

export async function searchTemplates(page: Page, term: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(term);
  await page.waitForTimeout(900);
}

/** Group / Status filter: `which` is the label of the closed filter ("All Groups" / "All Status"). */
export async function pickFilter(page: Page, which: 'Group' | 'Status', option: string) {
  await page.getByRole('button', { name: new RegExp(`Filter ${which}$`) }).evaluate((e) => (e as HTMLElement).click());
  await page.getByRole('option', { name: option, exact: true }).first().evaluate((e) => (e as HTMLElement).click());
  await page.waitForTimeout(700);
}

export const drawer = (page: Page) => page.getByRole('dialog').first();

/** react-aria buttons inside the drawer can sit outside the viewport: click through the DOM. */
export const domClick = (l: Locator) => l.evaluate((e) => (e as HTMLElement).click());

export type Tpl = { group?: string; type?: string; description?: string; sender?: string; subject?: string; body?: string; active?: boolean };

/** Fills the open Create / Edit drawer. Only the given fields are touched. */
export async function fillTemplate(page: Page, t: Tpl) {
  const d = drawer(page);
  if (t.active !== undefined) {
    const sw = d.getByRole('switch', { name: 'Toggle status' });
    if ((await sw.isChecked()) !== t.active) await domClick(sw);
  }
  if (t.group) {
    await domClick(d.getByRole('button', { name: /Template Group$/ }));
    await domClick(page.getByRole('option', { name: t.group, exact: true }).first());
    await page.waitForTimeout(600);
  }
  if (t.type) {
    await domClick(d.getByRole('button', { name: /Template Type$/ }));
    await domClick(page.getByRole('option', { name: t.type, exact: true }).first());
    await page.waitForTimeout(400);
  }
  if (t.description !== undefined) await d.getByRole('textbox', { name: 'Description' }).fill(t.description);
  if (t.sender !== undefined) await d.getByRole('textbox', { name: 'Sender Name *' }).fill(t.sender);
  if (t.subject !== undefined) await d.getByRole('textbox', { name: 'Subject *' }).fill(t.subject);
  if (t.body !== undefined) {
    const editor = d.getByRole('textbox', { name: /Rich Text Editor/ });
    await editor.click({ force: true });
    await page.keyboard.press('Control+A');
    await page.keyboard.type(t.body);
  }
}

export const saveButton = (page: Page) => drawer(page).getByRole('button', { name: /^Save/ });

/** The result / error modals are not role "dialog": read their text and press OK. Returns the text that was shown. */
export async function dismissModal(page: Page, timeout = 8000): Promise<string> {
  const ok = page.getByRole('button', { name: 'OK', exact: true }).last();
  if (!(await ok.waitFor({ state: 'visible', timeout }).then(() => true, () => false))) return '';
  const text = (await page.locator('body').innerText()).split('\n').map((l) => l.trim()).filter(Boolean);
  const at = text.lastIndexOf('OK');
  const shown = text.slice(Math.max(0, at - 3), at).join(' | ');
  await domClick(ok);
  await page.waitForTimeout(500);
  return shown;
}

export const uniqueSubject = () => `${QA_PREFIX} Subject ${Date.now().toString().slice(-8)}`;

/** Deletes one row through the confirmation; returns the confirmation text. */
export async function deleteRow(page: Page, row: Locator): Promise<string> {
  await domClick(row.getByRole('button', { name: 'Delete' }));
  await expect(page.getByText('Delete Email Template?').last()).toBeVisible();
  const asked = (await page.getByText(/^Delete template /).last().innerText()).trim();
  await domClick(page.getByRole('button', { name: 'Delete', exact: true }).last());
  await dismissModal(page);
  return asked;
}

/** Removes every QA Test template (and their "(Copy)" duplicates) left by a failed run. Real templates are never touched. */
export async function purgeQaTemplates(page: Page) {
  await openEmailTemplates(page);
  await searchTemplates(page, QA_PREFIX);
  for (let i = 0; i < 20; i++) {
    const row = dataRows(page).filter({ has: page.getByRole('gridcell', { name: new RegExp(`^${QA_PREFIX}`) }) }).first();
    if (!(await row.isVisible({ timeout: 1500 }).catch(() => false))) break;
    await deleteRow(page, row);
    await page.waitForTimeout(500);
  }
  await searchTemplates(page, '');
}
