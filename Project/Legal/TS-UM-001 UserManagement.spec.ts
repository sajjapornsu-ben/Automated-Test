import { test, expect } from '@playwright/test';
import * as allure from "allure-js-commons";

// เปลี่ยนชื่อเทสให้ชัดเจน เลข ID ใส่ไว้ในชื่อได้เลยครับ
test('ตรวจสอบการแสดง Tab Menu และ Filter ข้อมูล', async ({ page }) => {
  
  // 1. ตั้งค่า Allure
  await allure.owner("Ben");
  await allure.tags("Legal", "UserManagement");
  await allure.severity("critical");

  // 📸 ฟังก์ชันถ่ายรูปเก็บเข้า Report
  const takeStep = async (name: string) => {
    const screenshot = await page.screenshot();
    await allure.attachment(name, screenshot, { contentType: "image/png" });
  };

  try {
    // 2. Login
    await page.goto('https://uat-legal.planbmedia.co.th/login?next=%2Fdashboard');
    await page.getByRole('textbox', { name: 'อีเมล หรือชื่อผู้ใช้' }).fill('benben');
    await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
    await page.waitForTimeout(1000);
    await takeStep('01_Login_Success');

    // 3. เข้าหน้า User Management
    await page.getByRole('link', { name: 'ผู้ใช้งาน' }).click();
    await expect(page.getByRole('link', { name: 'User Management' })).toBeVisible();
    await takeStep('02_User_Management_Page');
    
    // 4. ตรวจสอบ Menu Tab
    await page.getByRole('main').getByRole('link', { name: 'สิทธิ์การใช้งาน' }).click();
    await takeStep('03_หน้าสิทธิ์การใช้งาน');
    await page.waitForTimeout(500);
    await page.getByRole('main').getByRole('link', { name: 'กลุ่ม (Group)' }).click();
    await takeStep('04_หน้ากลุ่ม (Group)');
    await page.waitForTimeout(500);
    await page.getByRole('main').getByRole('link', { name: 'Department' }).click();
    await takeStep('05_หน้าDepartment');
    await page.waitForTimeout(500);
    await page.getByRole('main').getByRole('link', { name: 'Approval' }).click();
    await takeStep('06_หน้าApproval');
    await page.waitForTimeout(500);
    await page.getByRole('main').getByRole('link', { name: 'ผู้ใช้งาน' }).click();
    await takeStep('07_ผู้ใช้งาน');

    // 5. ตรวจสอบ Filter
    await page.getByRole('combobox').first().selectOption('3');
    await expect(page.locator('tbody')).toContainText('information technology');
    await takeStep('04_Filter_Department_Success');

    // 6. ตรวจสอบ Search
    await page.getByRole('textbox', { name: 'ค้นหา Username / ชื่อ / อีเมล' }).fill('raveewan.ka');
    await page.waitForTimeout(500);
    await expect(page.getByText('raveewan.ka', { exact: true })).toBeVisible();
    await expect(page.locator('tbody')).toContainText('raveewan.ka');
    await takeStep('05_Search_Result_Check');
  
    console.log("✅ เทสรันเสร็จสิ้น และบันทึกผลเข้า Allure แล้ว");

  } catch (error) {
    // ถ่ายรูปหลักฐานตอนพัง
    const errorShot = await page.screenshot();
    await allure.attachment("❌_FAILED_ERROR", errorShot, { contentType: "image/png" });
    throw error;
  }
});