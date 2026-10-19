import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Recording...
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();
  await expect(page.locator('tbody')).toContainText('Homjeaw.su');

// 1. ระบุชื่อ Username ที่เราค้นหาเจอในตาราง (Homjeaw.su)
    const username = 'Homjeaw.su'; 
// 2. สั่งให้หาบรรทัด (tr) ที่มีชื่อนี้อยู่ แล้วค่อยหาปุ่มสีเขียว "ในบรรทัดนั้น"
  await page.locator('tr')
    .filter({ hasText: 'Homjeaw.su' }) // ระบุชื่อ User ที่ต้องการแก้
    .getByTitle('แก้ไข') 
    .click();
    await page.getByRole('textbox', { name: 'username', exact: true }).click();
    await page.getByRole('textbox', { name: 'username', exact: true }).fill('Homjeaw.su-edit');
    await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).click();
    await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).fill('Homjeaw-edit');
    await page.getByRole('textbox', { name: 'นามสกุล' }).click();
    await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Cowcat-edit');
    await page.getByRole('button', { name: 'บันทึก' }).click();
    await page.getByRole('button', { name: 'ตกลง' }).click();
    await expect(page.locator('tbody')).toContainText('Homjeaw.su-edit');
    await expect(page.locator('tbody')).toContainText('Homjeaw-edit Cowcat-edit');
    
  // 1. แสดง Alert บอกตัวเองว่าจบแล้ว (ทางเลือก)
   page.on('dialog', async dialog => {
    console.log('Popup เด้งแล้ว: ' + dialog.message());
  // ไม่สั่ง dialog.dismiss() หรือ dialog.accept() มันจะค้างอยู่แบบนั้น
  });

  // 2. แสดง Alert
  await page.evaluate(() => alert('Execute Done! ✅'));

  // 2. สั่ง Pause: บรรทัดนี้จะหยุดเวลา และปิดระบบ Timeout 
  // มันจะเปิดหน้าต่างเล็กๆ ชื่อ Playwright Inspector ขึ้นมาด้วย
  await page.pause(); 
});