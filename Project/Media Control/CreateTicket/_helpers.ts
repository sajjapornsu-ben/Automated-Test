import { Page } from '@playwright/test';

export async function login(page: Page) {
  const email = process.env.MEDIA_CONTROL_EMAIL;
  const password = process.env.MEDIA_CONTROL_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing MEDIA_CONTROL_EMAIL or MEDIA_CONTROL_PASSWORD in .env');
  }
  await page.goto('https://uat-mediacontrol.planbmedia.co.th/login');
  await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
}

// Account that has the Media Management role, needed for AC12/AC13 (Landlord/Plan B/Other).
export async function loginAsMediaManagement(page: Page) {
  const email = process.env.MEDIA_MANAGEMENT_EMAIL;
  const password = process.env.MEDIA_MANAGEMENT_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing MEDIA_MANAGEMENT_EMAIL or MEDIA_MANAGEMENT_PASSWORD in .env');
  }
  await page.goto('https://uat-mediacontrol.planbmedia.co.th/login');
  await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
}

export async function openCreateTicket(page: Page) {
  await page.getByRole('button', { name: 'MEDIA APPROVAL' }).click();
  await page.getByRole('link', { name: 'Media Ticket' }).click();
  await page.getByRole('link', { name: 'Create Ticket' }).click();
}

export async function switchToManualMode(page: Page) {
  await page.getByRole('button', { name: 'No Quotation Number' }).click();
}

// Opens a "DD/MM/YYYY"-style date button's calendar popover and clicks the given day
// in the currently displayed month.
export async function pickDate(page: Page, dateButton: import('@playwright/test').Locator, day: number) {
  // A plain click without first scrolling the button fully into view can hang indefinitely
  // on buttons further down the page (e.g. Job/Version Period), so always scroll first.
  await dateButton.scrollIntoViewIfNeeded();
  await dateButton.click();
  await page.getByRole('button', { name: String(day), exact: true }).click();
}

// Fills Client, Product, a ~1 month Contract Start-End, and the Media
// Category -> Group -> Type cascade (DIGITAL -> Digital -> Plan B TV). Assumes Manual mode is
// already switched on.
export async function fillTicketHeader(page: Page, opts: { client: string; product: string }) {
  await page.getByRole('textbox', { name: 'Enter client name...' }).fill(opts.client);
  await page.getByRole('textbox', { name: 'Enter product name...' }).fill(opts.product);

  const contractDateBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
  await pickDate(page, contractDateBtns.nth(0), 1);
  await pickDate(page, contractDateBtns.nth(0), 28);

  await page.getByRole('button', { name: 'Select media category' }).click();
  await page.getByRole('button', { name: 'DIGITAL', exact: true }).click();
  await closeOpenPopover(page);

  const mediaGroupBtn = page.locator('text=Media Group').first().locator('xpath=following::button[1]');
  await mediaGroupBtn.click();
  await page.getByRole('button', { name: 'Digital', exact: true }).click();
  await closeOpenPopover(page);

  const mediaTypeBtn = page.locator('text=Media Type').first().locator('xpath=following::button[1]');
  await mediaTypeBtn.click();
  await page.getByRole('button', { name: 'Plan B TV', exact: true }).click();
  await closeOpenPopover(page);
}

// These multiselect popovers don't close on Escape, and closing them by clicking a fixed
// landmark further down the page (e.g. a heading) is unreliable: a popover opened from a field
// further down the form can expand far enough to cover that landmark and block the click. The
// page title, at the very top of the form, is above every popover's expansion area.
export async function closeOpenPopover(page: Page) {
  await page.getByRole('heading', { name: 'Create Ticket', level: 1 }).click();
}
