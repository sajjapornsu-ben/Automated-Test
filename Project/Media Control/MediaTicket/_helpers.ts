import { Page } from '@playwright/test';

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
}

export async function openMediaTicket(page: Page) {
  await page.getByRole('button', { name: 'MEDIA APPROVAL' }).click();
  await page.getByRole('link', { name: 'Media Ticket' }).click();
}
