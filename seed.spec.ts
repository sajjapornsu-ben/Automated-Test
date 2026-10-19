import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    const email = process.env.MEDIA_CONTROL_EMAIL;
    const password = process.env.MEDIA_CONTROL_PASSWORD;
    if (!email || !password) {
      throw new Error('Missing MEDIA_CONTROL_EMAIL or MEDIA_CONTROL_PASSWORD in .env');
    }

    await page.goto('https://uat-mediacontrol.planbmedia.co.th/login');
    await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
  });
});
