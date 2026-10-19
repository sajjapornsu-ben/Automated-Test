import { test, expect } from '@playwright/test';

// ตรวจสอบการสร้างผู้ใช้งาน Eage Case กรณีระบุ User Name ซ้ำกับที่มีในระบบ

test('test', async ({ page }) => {
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();

  // ตรวจสอบ User Name ที่มีในระบบ
  await page.getByRole('textbox', { name: 'ค้นหา Username / ชื่อ / อีเมล' }).click();
  await page.getByRole('textbox', { name: 'ค้นหา Username / ชื่อ / อีเมล' }).fill('Homjeaw');
  await expect(page.locator('tbody')).toContainText('Homjeaw.su');
  await page.getByRole('button', { name: 'เพิ่มผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'username', exact: true }).click();
  await page.getByRole('textbox', { name: 'username', exact: true }).fill('Homjeaw.su');
  await page.getByRole('textbox', { name: 'email@company.co.th' }).click();
  await page.getByRole('textbox', { name: 'email@company.co.th' }).fill('HH@gmail.com');
  await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).click();
  await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).fill('a');
  await page.getByRole('textbox', { name: 'นามสกุล' }).click();
  await page.getByRole('textbox', { name: 'นามสกุล' }).fill('a');
  await page.getByRole('combobox').nth(2).selectOption('4');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('11111111a');
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // ตรวจสอบการแสดงแจ้งเตือน Error
  await expect(page.getByText('เกิดข้อผิดพลาดUsername')).toBeVisible();
  await expect(page.locator('body')).toContainText('เกิดข้อผิดพลาด');
  await expect(page.locator('body')).toContainText('Username already exists');
  await page.getByRole('button', { name: 'ปิด', exact: true }).click();

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