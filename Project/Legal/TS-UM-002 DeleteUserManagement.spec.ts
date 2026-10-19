import { test, expect } from '@playwright/test';
import { reportToTestiny } from './testiny-helper'; // 1. ดึงฟังก์ชันส่งผลมาใช้

// ตรวจสอบเคส Delete User และตรวจสอบผลหลังการ Delete
test('TC-98 ตรวจสอบการลบ User', async ({ page }) => {
  // Link TC => https://app.testiny.io/LG/testcases/tcf/1/tc/98/edit
  
  // 1. เข้าสู่ระบบ (Admin)
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

  // 2. ไปที่หน้าจัดการผู้ใช้งาน
  await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();
  await expect(page.getByRole('main')).toContainText('User Management');

  // 3. ค้นหา User ที่ต้องการจะลบ
  const usernameToDelete = 'test015';
  await page.getByRole('textbox', { name: 'ค้นหา Username / ชื่อ / อีเมล' }).fill(test015);
  
  // รอให้ตารางแสดงผลลัพธ์ที่ค้นหา
  await expect(page.locator('tbody')).toContainText(test015);

  // 4. กรองหาบรรทัดของ Username นั้นแล้วกดปุ่มลบ (สีแดง)
  await page.locator('tr')
    .filter({ hasText: test015 })
    .locator('button.bg-rose-500') 
    .click();

  // 5. ยืนยันการลบใน Modal Popup
  await expect(page.getByRole('main')).toContainText('ยืนยันการลบผู้ใช้งาน');
  await page.getByRole('button', { name: 'ลบผู้ใช้งาน' }).click();
  
  // ตรวจสอบว่ามี Alert "ลบผู้ใช้งานสำเร็จ"
  await expect(page.locator('body')).toContainText('ลบผู้ใช้งานสำเร็จ');
  await page.waitForTimeout(1000); 
  // 6. ออกจากระบบ (เพื่อไปลอง Login ด้วย User ที่เพิ่งลบ)
  await page.getByRole('link', { name: 'ออกจากระบบ' }).click();

  // 7. ตรวจสอบ: ลอง Login ด้วย User ที่ถูกลบไปแล้ว
  await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
  await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill(usernameToDelete);
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

  // 8. ต้องเจอข้อความแจ้งเตือนว่าเข้าไม่ได้
  await expect(page.locator('body')).toContainText('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

  console.log('✅ Test Completed! User was deleted and cannot login.');
});

// --- ส่วนส่งผลไป Testiny อัตโนมัติ ---
test.afterEach(async 
({}, testInfo) => {
  // เลข ID จาก Testiny ของเคสนี้คือ 98
  const testCaseId = 98; 
  
  // ตรวจสอบผลลัพธ์ (Passed หรือ Failed)
  const status = testInfo.status === 'passed' ? 'PASSED' : 'FAILED';
  
  // ส่งผลไปอัปเดตที่ Testiny
  await reportToTestiny(testCaseId, status);
});