// ตัวช่วยสำหรับเทส E2E (หลาย role ในเทสเดียว เริ่มตั้งแต่สร้าง ticket)
import { Browser, Page, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { login as loginSale, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage, pickDate } from '../CreateTicket/_helpers';
import { openVpList, searchList as searchVp, dataRows as vpRows, readRow as readVpRow, openJob } from '../VerifyProduction/_helpers';
import { openAssignList, searchList as searchAssign, dataRows as assignRows, readRow as readAssignRow, openRowDialog, dialog, assignButton, domClick, readDesigners } from '../AssignTicket/_helpers';

export const BASE = 'https://uat-mediacontrol.planbmedia.co.th';
export const ok = (page: Page) => page.getByRole('button', { name: 'OK', exact: true });

/** Opens a new browser context signed in as `role` (each actor of an E2E flow has its own session). */
export async function as(browser: Browser, role: Parameters<typeof loginAs>[1]) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, role);
  return { ctx, page };
}

/**
 * The media of the multi-assignee scenarios (BTS): Media Group "Digital VGI" > Category DIGITAL > Media Type (Epicor/SF) "QATEST-BTS"
 * (mapped to the Media Type "BTS On Station" of Digital VGI), Sale Package "BTS MAX 2.0 Half B".
 */
export const BTS = { epicor: 'QATEST-BTS', mediaType: 'BTS On Station', group: 'Digital VGI', category: 'DIGITAL' } as const;

/**
 * Makes sure Settings > Master Data > Media Type (Epicor/Salesforce) has an Active "QATEST-BTS" record mapped to
 * "BTS On Station · Digital VGI" (created through the UI as Super Admin when it is missing). Returns true when it had to create it.
 */
export async function ensureBtsMapping(browser: Browser): Promise<boolean> {
  const { ctx, page } = await as(browser, 'superAdmin');
  try {
    await page.goto(`${BASE}/settings/masterData/mediaTypeEpicorSf`);
    await expect(page.getByRole('button', { name: /^Add Media Type/ })).toBeVisible({ timeout: 30000 });
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.getByPlaceholder('Search Media Type (Epicor/SF)...').fill(BTS.epicor);
    await page.waitForTimeout(1000);
    const row = page.getByRole('row').filter({ hasText: BTS.epicor }).filter({ hasText: BTS.mediaType });
    if (await row.count()) {
      await expect(row.first()).toContainText('Active');
      return false;
    }
    await page.getByRole('button', { name: /^Add Media Type/ }).click({ force: true });
    const d = page.getByRole('dialog').first();
    await d.getByRole('textbox', { name: 'Media Type (Epicor/Salesforce) Name' }).fill(BTS.epicor);
    await d.getByRole('button', { name: /^Select Media Type/ }).evaluate((e) => (e as HTMLElement).click());
    await page.getByRole('option', { name: new RegExp(`^${BTS.mediaType} ${BTS.group}$`) }).first().evaluate((e) => (e as HTMLElement).click());
    await expect(d.getByRole('switch', { name: 'Active status' })).toBeChecked();
    await d.getByRole('button', { name: 'Save', exact: true }).evaluate((e) => (e as HTMLElement).click());
    await ok(page).click({ timeout: 15000 }).catch(() => undefined);
    await expect(d).toBeHidden({ timeout: 15000 });
    return true;
  } finally {
    await ctx.close();
  }
}

// ---------- shared steps of the multi-assignee scenarios ----------

export const BTS_PACKAGE = 'BTS MAX 2.0 Half B (QATEST-BTS)';

/** Sale creates and submits a ticket with the BTS media (Digital VGI > DIGITAL > QATEST-BTS, package BTS MAX 2.0 Half B). Returns the ticket and job numbers. */
export async function createBtsTicket(browser: Browser, client: string, creator: 'sale' | 'mediaManagement' = 'sale'): Promise<{ ticket: string; job: string }> {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await (creator === 'sale' ? loginSale(page) : loginAs(page, 'mediaManagement'));
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client, product: 'QA Multi Product', media: { group: BTS.group, category: BTS.category, type: BTS.epicor } });
    await addJobWithPackage(page, BTS_PACKAGE);
    const period = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, period.nth(0), 1);
    await pickDate(page, period.nth(0), 21);
    await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
    await page.getByRole('textbox', { name: 'Seconds' }).fill('15');
    const links = page.getByRole('textbox', { name: 'Paste 1 Link...' });
    await links.nth(0).fill('https://example.com/material.jpg');
    await links.nth(1).fill('https://example.com/brief.pdf');
    await page.getByRole('button', { name: 'Submit ticket' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
    await ok(page).click();
  } finally {
    await ctx.close();
  }
  // the job numbers are read from the Head CG list (status Assign)
  const { ctx: hc, page: hp } = await as(browser, 'headCg');
  try {
    await openAssignList(hp);
    await searchAssign(hp, client);
    const row = assignRows(hp).filter({ hasText: client }).first();
    await expect(row).toBeVisible({ timeout: 30000 });
    const r = await readAssignRow(row);
    return { ticket: r.ticket, job: r.job };
  } finally {
    await hc.close();
  }
}

export { openAssignList, searchAssign, assignRows, readAssignRow, openRowDialog, dialog, assignButton, domClick, readDesigners };

/** Head CG assigns the job of `client` to the given designers (names exactly as in the dialog; several = "Multiple selection"). */
export async function assignToCgs(browser: Browser, client: string, people: string[]) {
  const { ctx, page } = await as(browser, 'headCg');
  try {
    await openAssignList(page);
    await searchAssign(page, client);
    const row = assignRows(page).filter({ hasText: client }).first();
    await expect(row).toBeVisible({ timeout: 30000 });
    await openRowDialog(page, row, 'Assign');
    const designers = await readDesigners(page);
    const buttons = dialog(page).getByRole('button').filter({ hasText: /active/ });
    for (const who of people) {
      const i = designers.findIndex((d) => d.name === who);
      expect(i, `designer "${who}" is offered`).toBeGreaterThanOrEqual(0);
      await domClick(buttons.nth(i));
    }
    await domClick(assignButton(page));
    await ok(page).click({ timeout: 15000 }).catch(() => undefined);
    await expect(dialog(page)).toBeHidden({ timeout: 15000 });
  } finally {
    await ctx.close();
  }
}

/** Opens the Verify & Production detail of `ticket` for an already signed-in CG page. */
export async function openCgJob(page: Page, ticket: string) {
  await openVpList(page);
  await searchVp(page, ticket);
  await expect(vpRows(page)).toHaveCount(1);
  const r = await readVpRow(vpRows(page).first());
  await openJob(page, r);
  return r;
}
