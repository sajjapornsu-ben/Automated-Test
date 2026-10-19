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
  await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
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
