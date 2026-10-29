import { Page, expect } from '@playwright/test';

// A leftover QA ticket from the Create Ticket suite (1 Job, Manual entry), reused as a stable
// fixture for read-only Ticket Detail scenarios so they don't need to create new UAT records.
// If this ticket is ever removed, create a similar throwaway ticket and update this constant.
export const FIXTURE_TICKET_NO = 'TK-26090085';

export async function login(page: Page) {
  const email = process.env.MEDIA_CONTROL_EMAIL;
  const password = process.env.MEDIA_CONTROL_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing MEDIA_CONTROL_EMAIL or MEDIA_CONTROL_PASSWORD in .env');
  }
  await page.goto('https://uat-mediacontrol.planbmedia.co.th/login');
  await page.getByRole('textbox', { name: /^(อีเมล|Email)/ }).fill(email);
  await page.getByRole('textbox', { name: /^(รหัสผ่าน|Password)/ }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // Navigating immediately after this can race the app's own post-login redirect; callers that
  // do a page.goto right after login() should wait for this first.
  await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
}

export async function openMediaTicket(page: Page) {
  await page.getByRole('button', { name: 'MEDIA APPROVAL' }).click();
  await page.getByRole('link', { name: 'Media Ticket' }).click();
}

// Finds a ticket by searching the Media Ticket list, then opens its detail page.
export async function openTicketByClientName(page: Page, clientName: string) {
  await page.getByRole('textbox', { name: /Search ticket/ }).fill(clientName);
  await page.waitForTimeout(600);
  const row = page.getByRole('row').filter({ hasText: clientName });
  await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
}

export async function openTicketDetail(page: Page, ticketNo: string) {
  await page.goto(`https://uat-mediacontrol.planbmedia.co.th/mediaApproval/mediaTicket/${ticketNo}`);
}

// ---------- shared steps (new Create Ticket form and new inline "New Job" form, 28 Oct 2026) ----------
import { openCreateTicket as openCreate, switchToManualMode as manualMode, fillTicketHeader as fillHeader, addJobWithPackage, pickDate, PACKAGE } from '../CreateTicket/_helpers';
import type { Locator } from '@playwright/test';

/** react-aria triggers (selects, Cancel Reason ...) can have no clickable box: click through the DOM. */
export const domClick = (l: Locator) => l.evaluate((e) => (e as HTMLElement).click());

/** Creates and submits a one-Job QA ticket through the Create Ticket page (as the signed-in Sale) and opens its detail page. */
export async function createTicketAndOpenDetail(page: Page, client: string, product: string) {
  await openCreate(page);
  await manualMode(page);
  await fillHeader(page, { client, product });
  await addJobWithPackage(page);
  const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
  await pickDate(page, periodBtns.nth(0), 1);
  await pickDate(page, periodBtns.nth(0), 21);
  await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
  await page.getByRole('textbox', { name: 'Seconds' }).fill('15');
  const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
  await linkBoxes.nth(0).fill('https://example.com/material.jpg');
  await linkBoxes.nth(1).fill('https://example.com/brief.pdf');
  await page.getByRole('button', { name: 'Submit ticket' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('textbox', { name: /Search ticket/ }).fill(client);
  await page.waitForTimeout(600);
  const row = page.getByRole('row').filter({ hasText: client });
  await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
  await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/TK-\d+$/);
}

/** Fills the inline "New Job" form of the ticket detail page (package of the ticket's media, duration, period, links) and presses Save Job. */
export async function addJobOnDetail(page: Page, pkg: string = PACKAGE) {
  await page.getByRole('button', { name: 'Add Job' }).click();
  await domClick(page.getByRole('button', { name: /Sale Package$/ }));
  await page.getByRole('option', { name: pkg, exact: true }).click();
  // Duration / Period may be pre-filled from the ticket's existing Job; fill them only when they are empty
  const minutes = page.getByRole('textbox', { name: 'Minutes' });
  const seconds = page.getByRole('textbox', { name: 'Seconds' });
  if (!(await minutes.inputValue()) && !(await seconds.inputValue())) {
    await minutes.fill('0');
    await seconds.fill('15');
  }
  const dates = page.getByRole('button', { name: 'DD/MM/YYYY' });
  if ((await dates.count()) >= 2) {
    await pickDate(page, dates.nth(0), 1);
    await pickDate(page, dates.nth(0), 21);
  }
  await page.getByRole('textbox', { name: 'Material link' }).fill('https://example.com/material2.jpg');
  await page.getByRole('textbox', { name: 'Brief link' }).fill('https://example.com/brief2.pdf');
  await page.getByRole('button', { name: 'Save Job' }).click();
}

/** Picks a Cancel Reason in the open "Cancel Job" dialog (a react-aria select, not a native <select>). */
export async function pickCancelReason(dialog: Locator, page: Page, reason: string) {
  await domClick(dialog.getByRole('button', { name: /Cancel Reason$/ }));
  await page.getByRole('option', { name: reason, exact: true }).click();
}
