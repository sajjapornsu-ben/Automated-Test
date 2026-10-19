import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://stadiumthuat-cms.planbmedia.co.th/login');
  await page.getByRole('textbox', { name: 'you@example.com' }).click();
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('sajjaporn.su@planbmedia.co.th');
  await page.getByRole('textbox', { name: 'you@example.com' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('link', { name: 'System Monitor' }).click();
  await expect(page).toHaveURL(/.*monitor/);
  await page.getByRole('link', { name: 'Content Report' }).click();
  await expect(page).toHaveURL(/.*report/);
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/.*home/);
  await page.getByRole('button', { name: 'News' }).click();
  await page.getByRole('link', { name: 'News' }).click();
  await page.getByRole('link', { name: 'Schedule' }).click();
  await expect(page).toHaveURL(/.*news\/schedule/);
  await page.getByRole('link', { name: 'Thai Team' }).click();
  await expect(page).toHaveURL(/.*thai-team/);
  await page.getByRole('link', { name: 'Articles' }).click();
  await expect(page).toHaveURL(/.*articles/);
  await page.getByRole('link', { name: 'Videos' }).click();
  await expect(page).toHaveURL(/.*videos/);
  await page.getByRole('button', { name: 'The Games' }).click();
  await page.getByRole('link', { name: 'Games Management' }).click();
  await expect(page).toHaveURL(/.*thegames/);
  await page.getByRole('link', { name: 'Games Content' }).click();
  await expect(page).toHaveURL(/.*thegames-content/);
  await page.getByRole('link', { name: 'Get Updates' }).click();
  await expect(page).toHaveURL(/.*getupdate/);
  await page.getByRole('link', { name: 'Email Logs' }).click();
  await expect(page).toHaveURL(/.*email-logs/);
  await page.getByRole('link', { name: 'Audit Log' }).click();
  await expect(page).toHaveURL(/.*audit-log/);
  await page.getByRole('link', { name: 'LINE Today' }).click();
  await expect(page).toHaveURL(/.*linetoday/);
  await page.getByRole('link', { name: 'Popup Banner' }).click()
  await expect(page).toHaveURL(/.*popup-banner/);;
  await page.getByRole('link', { name: 'Staff Management' }).click();
  await expect(page).toHaveURL(/.*staff/);
  await page.getByRole('link', { name: 'Role Management' }).click();
  await expect(page).toHaveURL(/.*roles/);
  // 1. บอก Playwright ว่าไม่ต้องไปยุ่งกับ Dialog (Alert)
  // ถ้ามีเด้งมา ให้ปล่อยค้างไว้ ไม่ต้องกด Accept หรือ Dismiss
  page.on('dialog', async dialog => {
    console.log('Popup เด้งแล้ว: ' + dialog.message());
    // ไม่สั่ง dialog.dismiss() หรือ dialog.accept() มันจะค้างอยู่แบบนั้น
  });

  // 2. แสดง Alert
  await page.evaluate(() => alert('Execute Done! ✅'));
});