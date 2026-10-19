import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://stadiumthuat-cms.planbmedia.co.th/login?callbackUrl=%2F');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('sajjaporn.su@planbmedia.co.th');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // 1. รอให้หน้าโหลดจนนิ่งจริงๆ โดยการเช็กหัวข้อหลัก
  await expect(page.getByRole('heading', { name: "Welcome back, Sajjaporn 'Ben" })).toBeVisible({ timeout: 15000 });

  await expect(page.getByRole('button', { name: 'Export Meta Data' })).toBeVisible();
  
  const download1Promise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Meta Data' }).click();
  const download1 = await download1Promise;
  
  // 2. ใช้คำสั่ง .first() เพื่อป้องกันกรณีคำซ้ำ และใช้ Regex /.../ เพื่อความยืดหยุ่น
  await expect(page.getByRole('heading', { name: /Export Meta Data สำเร็จ/ }).first()).toBeVisible();
  
  await expect(page.locator('div').filter({ hasText: /News/ }).nth(2)).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /Articles/ }).nth(2)).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /Videos/ }).nth(2)).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /Athletes/ }).nth(2)).toBeVisible();

  // จุดที่เคยพัง: แก้ให้หา "ตัวแรก" ที่เจอ และรอ 10 วิ
  await expect(page.getByText('Schedule').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Get Updates').first()).toBeVisible();
  await expect(page.getByText('Total Content Views').first()).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Recent Activities' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  await page.getByRole('button', { name: 'Refresh' }).click();
  
  await expect(page.getByRole('heading', { name: 'Trending Content' })).toBeVisible();
  await page.getByRole('button', { name: 'Articles' }).click();
  await expect(page.getByText('Article').nth(4)).toBeVisible();
  
  await page.getByRole('main').getByRole('button', { name: 'News' }).click();
  await expect(page.getByText('News').nth(4)).toBeVisible();
  
  await page.getByRole('button', { name: 'Videos' }).click();
  await expect(page.getByText('Video').nth(4)).toBeVisible();
  
  await page.getByRole('main').getByRole('button', { name: 'The Games' }).click();
  await expect(page.getByRole('main')).toContainText('The Games');
  
  // ปุ่ม Schedule ด้านล่าง
  await page.getByRole('button', { name: 'Schedule' }).click();
  await expect(page.getByRole('main')).toContainText('Schedule');
  
  await expect(page.getByRole('heading', { name: 'Available Features' })).toBeVisible();
  // 1. บอก Playwright ว่าไม่ต้องไปยุ่งกับ Dialog (Alert)
  // ถ้ามีเด้งมา ให้ปล่อยค้างไว้ ไม่ต้องกด Accept หรือ Dismiss
  page.on('dialog', async dialog => {
    console.log('Popup เด้งแล้ว: ' + dialog.message());
    // ไม่สั่ง dialog.dismiss() หรือ dialog.accept() มันจะค้างอยู่แบบนั้น
  });

  // 2. แสดง Alert
  await page.evaluate(() => alert('Execute Done! ✅'));
});