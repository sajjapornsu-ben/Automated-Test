import { test, expect } from '@playwright/test';

// ตรวจสอบเคส Inactive User และตรวจสอบผลหลังการ Inactive

test('test', async ({ page }) => {
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).press('Tab');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();
  await expect(page.getByRole('main')).toContainText('User Management');
  await page.getByRole('textbox', { name: 'ค้นหา Username / ชื่อ / อีเมล' }).click();
  await page.getByRole('textbox', { name: 'ค้นหา Username / ชื่อ / อีเมล' }).fill('homjeaw');
  await expect(page.locator('tbody')).toContainText('Homjeaw.su');
// สั่งให้หาปุ่มที่มีคลาส bg-emerald-500 (ปุ่มสีเขียว)
// 1. ระบุชื่อ Username ที่เราค้นหาเจอในตาราง (Homjeaw.su)
    const username = 'Homjeaw.su'; 
// 2. สั่งให้หาบรรทัด (tr) ที่มีชื่อนี้อยู่ แล้วค่อยหาปุ่มสีเขียว "ในบรรทัดนั้น"
  await page.locator('tr')
    .filter({ hasText: username })
    .locator('button.bg-emerald-500')
    .click();
  await expect(page.getByRole('main')).toContainText('ยืนยันการปิดใช้งาน');
  await page.getByRole('button', { name: 'ปิดใช้งาน', exact: true }).click();
  await page.getByText('ปิดใช้งานสำเร็จ').click();
  await page.getByRole('link', { name: 'ออกจากระบบ' }).click();
  await page.goto('https://uat-legal.planbmedia.co.th/master/user');
  await page.waitForTimeout(1000);
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).click();
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('homjeaw.su');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page.locator('div').filter({ hasText: /^บัญชีผู้ใช้งานถูกระงับ กรุณาติดต่อผู้ดูแลระบบ$/ })).toBeVisible();
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