import { test, expect } from '@playwright/test';

// ตรวจสอบการสร้างผู้ใช้งาน Eage Case กรณีไม่ระบุข้อมูลสำคัญและกดบันทึก

test('test', async ({ page }) => {
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();
  await page.getByRole('button', { name: 'เพิ่มผู้ใช้งาน' }).click();
  await expect(page.getByRole('textbox', { name: 'username', exact: true })).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'email@company.co.th' })).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'ชื่อ', exact: true })).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'นามสกุล' })).toBeEmpty();
  await expect(page.getByRole('combobox').nth(2)).toHaveValue('0');
  await expect(page.getByRole('textbox', { name: '••••••••' })).toBeEmpty();
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await expect(page.getByRole('main')).toContainText('กรุณากรอก Username');
  await expect(page.getByRole('main')).toContainText('กรุณากรอก Email');
  await expect(page.getByRole('main')).toContainText('กรุณากรอกชื่อ');
  await expect(page.getByRole('main')).toContainText('กรุณากรอกนามสกุล');
  await expect(page.getByRole('main')).toContainText('กรุณาเลือก Role');
  await expect(page.getByRole('main')).toContainText('กรุณากรอกรหัสผ่าน');
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