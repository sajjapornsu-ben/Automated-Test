import { Page, Locator, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';

/**
 * Create Ticket page (UX changed 28 Oct 2026): three numbered sections - 1 "Ticket source" (a pair of toggle buttons:
 * "Pull from Salesforce" / "No Quotation Number"), 2 "Ticket information" (header incl. Media Group > Category > Media Type (Epicor/SF)),
 * 3 "Jobs" - plus a "Ticket summary" panel with Submit ticket / Save as draft.
 *
 * Media Type (Epicor/SF) has options only for a few Media Group / Category pairs on UAT. The only one that leads to a Sale Package is the
 * QA data below - change it here if the master data changes.
 */
export const MEDIA = { group: 'Retail', category: 'DIGITAL', type: 'QATEST' } as const;
export const PACKAGE = '7-Eleven Plus (QATEST)';

/** Signs in as the Sale account (cached session) - the Sale user is the one who creates tickets. */
export async function login(page: Page) {
  await loginAs(page, 'sale');
}

// Account that has the Media Management role, needed for AC12/AC13 (Landlord/Plan B/Other).
export async function loginAsMediaManagement(page: Page) {
  await loginAs(page, 'mediaManagement');
}

export async function openCreateTicket(page: Page) {
  await page.getByRole('button', { name: 'MEDIA APPROVAL' }).click();
  await page.getByRole('link', { name: 'Media Ticket' }).click();
  await page.getByRole('link', { name: 'Create Ticket' }).click();
  await expect(page.getByRole('heading', { name: 'Create Ticket', level: 1 })).toBeVisible();
}

export const sourceSection = (page: Page) => page.getByRole('region', { name: 'Ticket source' });
export const infoSection = (page: Page) => page.getByRole('region', { name: 'Ticket information' });
export const jobsSection = (page: Page) => page.getByRole('region', { name: 'Jobs' });
export const summary = (page: Page) => page.getByRole('complementary', { name: 'Ticket summary' });

/** The two toggle buttons of the "Ticket source" section (their names also contain the helper line under the title). */
export const pullFromSalesforceButton = (page: Page) => sourceSection(page).getByRole('button', { name: /^Pull from Salesforce/ });
export const noQuotationButton = (page: Page) => sourceSection(page).getByRole('button', { name: /^No Quotation Number/ });

export async function switchToManualMode(page: Page) {
  await noQuotationButton(page).click();
  await expect(noQuotationButton(page)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Manual entry mode — fill in the ticket information below')).toBeVisible();
}

// Opens a "DD/MM/YYYY"-style date button's calendar popover and clicks the given day
// in the currently displayed month.
export async function pickDate(page: Page, dateButton: Locator, day: number) {
  // A plain click without first scrolling the button fully into view can hang indefinitely
  // on buttons further down the page (e.g. Job/Version Period), so always scroll first.
  await dateButton.scrollIntoViewIfNeeded();
  await dateButton.click();
  await page.getByRole('button', { name: String(day), exact: true }).click();
}

/** The multi-select popover of one header field: `div` with the same aria-label as its opener button (it lists the options as buttons). */
export const popover = (page: Page, label: string) => page.locator(`div[aria-label="${label}"]`).first();

/** Picks one option in a multi-select field of the header (opens it, ticks the option, closes the popover). */
export async function pickMulti(page: Page, opener: string, option: string) {
  await page.getByRole('button', { name: opener }).click({ force: true });
  await popover(page, opener).getByRole('button', { name: option, exact: true }).click();
  await closeOpenPopover(page);
}

// Fills Client, Product, a ~1 month Contract Start-End, and the Media Group -> Category -> Media Type (Epicor/SF)
// cascade (MEDIA above). Assumes Manual mode is already switched on.
export async function fillTicketHeader(page: Page, opts: { client: string; product: string; media?: { group: string; category: string; type: string } }) {
  const media = opts.media ?? MEDIA;
  await page.getByRole('textbox', { name: 'Enter client name...' }).fill(opts.client);
  await page.getByRole('textbox', { name: 'Enter product name...' }).fill(opts.product);

  const contractDateBtns = infoSection(page).getByRole('button', { name: 'DD/MM/YYYY' });
  await pickDate(page, contractDateBtns.nth(0), 1);
  await pickDate(page, contractDateBtns.nth(0), 28);

  await pickMulti(page, 'Select media group', media.group);
  await pickMulti(page, 'Select media category', media.category);
  await pickMulti(page, 'Select media type (Epicor/SF)', media.type);
}

/** Adds a Job and picks the QA Sale Package in it (Media Type must already be chosen - the package list depends on it). */
export async function addJobWithPackage(page: Page, pkg: string = PACKAGE) {
  await page.getByRole('button', { name: 'Add Job' }).click();
  await page.getByRole('button', { name: 'Select Sale Package' }).click();
  await popover(page, 'Select Sale Package').getByRole('button', { name: pkg, exact: true }).click();
  await closeOpenPopover(page);
}

// These multiselect popovers don't close on Escape, and closing them by clicking a fixed
// landmark further down the page (e.g. a heading) is unreliable: a popover opened from a field
// further down the form can expand far enough to cover that landmark and block the click. The
// page title, at the very top of the form, is above every popover's expansion area.
export async function closeOpenPopover(page: Page) {
  await page.getByRole('heading', { name: 'Create Ticket', level: 1 }).click();
}
