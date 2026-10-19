import { test, expect, chromium } from '@playwright/test';
import * as allure from "allure-js-commons"; 
import path from 'path';

test('TC-155 ตรวจสอบหน้า Dashboard Mockup AI', async () => {
  // ระบุเจ้าของเคสใน Allure Report
  await allure.owner("Ben");

  // ✅ ดึง Session จากโฟลเดอร์เดิม
  const userDataDir = path.join(process.cwd(), 'user_data_google');
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 500, 
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await context.newPage();

  // ฟังก์ชันถ่ายรูป
  const takeStep = async (name: string) => {
    const screenshot = await page.screenshot();
    await allure.attachment(name, screenshot, { contentType: "image/png" });
    console.log(`📸 บันทึก Step: ${name}`);
  };

  try {
    // 1. เข้าหน้าเว็บ
    await page.goto('https://mockupai-uat.planbmedia.co.th/');
    
    // รอจนกว่าหน้า Dashboard จะปรากฏ
    await page.waitForSelector('#section-left', { timeout: 20000 });
    await takeStep('01_Home_Page_Logged_In');
    console.log("✅ รันสำเร็จ! ไม่ต้องใส่ OTP ซ้ำ");

    // 2. ตรวจสอบข้อความ
    console.log("เริ่มตรวจสอบระบบ...");
    const sectionLeft = page.locator('#section-left');
    await expect(sectionLeft).toContainText('Categories & Media Gallery');
    await takeStep('02_Check_Dashboard_Content');

    // 🛑 บราวเซอร์จะเปิดค้างไว้ที่นี่ เพราะไม่มีสั่ง close และไม่มี finally

  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด: ", error);
    const errorShot = await page.screenshot();
    await allure.attachment("ERROR_SCREENSHOT", errorShot, { contentType: "image/png" });
    throw error;
  }
});