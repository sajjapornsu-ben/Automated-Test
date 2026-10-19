import { test, expect } from '@playwright/test';

// ตรวจสอบการสร้างผู้ใช้งาน Happy Case

test('test', async ({ page }) => {
  // Recording...
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).press('Tab');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();
  await expect(page.getByRole('main')).toContainText('User Management');
  await page.getByRole('button', { name: 'เพิ่มผู้ใช้งาน' }).click();
  await page.getByRole('textbox', { name: 'username', exact: true }).click();
    // ใส่ชื่อ UserName
  await page.getByRole('textbox', { name: 'username', exact: true }).fill('test022');
  await page.getByRole('textbox', { name: 'email@company.co.th' }).click();
    // ใส่ Email
  await page.getByRole('textbox', { name: 'email@company.co.th' }).fill('test022@cc.com');
  await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).click();
  await page.getByRole('textbox', { name: 'ชื่อ', exact: true }).fill('test022');
  await page.getByRole('textbox', { name: 'นามสกุล' }).click();
  await page.getByRole('textbox', { name: 'นามสกุล' }).fill('test022');
  await page.getByRole('combobox').nth(2).selectOption('1');
  await page.getByRole('combobox').nth(3).selectOption('3');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('11111111');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ตกลง' }).click();
  
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
