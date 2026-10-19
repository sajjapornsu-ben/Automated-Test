import { test, chromium } from '@playwright/test';
import path from 'path';

test('Login Google และเซฟ Session', async () => {
  // เปิดบราวเซอร์แบบเก็บข้อมูล
  const context = await chromium.launchPersistentContext(path.join(__dirname, 'user_data_google'), {
    headless: false, 
    // ใช้ User-Agent ของ Chrome จริงๆ เพื่อให้ Google ยอมรับ Profile
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    // สำคัญ: ห้ามใส่ AutomationControlled ตัวหลอก Google เพราะมันจะทำให้ Session ไม่เสถียรตอนเซฟครั้งแรก
  });

  const page = await context.newPage();

  // 1. ไปหน้าเว็บ
  await page.goto('https://mockupai-uat.planbmedia.co.th/');

  // 2. กดปุ่ม Login
  await page.getByRole('button', { name: 'Google Sign in with Google' }).click();

  console.log('⚠️ กรุณา Login และใส่ OTP ในหน้าต่างบราวเซอร์ให้เสร็จสิ้น...');
  
  // 3. ใช้คำสั่งนี้เพื่อให้หน้าต่างค้างไว้จนกว่าคุณจะปิด บราวเซอร์ หรือกด Resume (ปุ่ม Play)
  await page.pause(); 

  await context.close();
  console.log('✅ เซฟ Login Session เรียบร้อยแล้ว!');
});