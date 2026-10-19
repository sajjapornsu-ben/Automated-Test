import { test, expect } from '@playwright/test';

test('Check All Active News Toggles', async ({ page }) => {
  // 1. Login
  await page.goto('https://stadiumthuat-cms.planbmedia.co.th/login?callbackUrl=%2Fnews');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('sajjaporn.su@planbmedia.co.th');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // 2. ไปที่หน้า News
  await page.getByRole('navigation').getByRole('button', { name: 'News' }).click();
  await page.getByRole('link', { name: 'News', exact: true }).click();

  // 3. โฟกัสที่แถบ หรือ ปุ่ม "Active"
  // ใช้ getByRole('tab') หรือ getByText ขึ้นอยู่กับว่าหน้าเว็บดีไซน์มาแบบไหน
  const activeTab = page.getByText('Active', { exact: true });
  await activeTab.click();
  
  // 4. รอให้ข้อมูลโหลด (สังเกตจาก Toggle หรือตารางโผล่มา)
  const allToggles = page.locator('button[role="switch"], input[type="checkbox"]');
  await allToggles.first().waitFor({ state: 'visible', timeout: 10000 });

  // 5. นับจำนวน Toggle ที่ปรากฏในหน้า Active
  const count = await allToggles.count();
  console.log(`พบรายการ Active ทั้งหมด: ${count} รายการ`);

  // 6. วนลูปเช็กว่าสถานะ "Active" ทุกอันต้องเปิดอยู่ (Checked)
  for (let i = 0; i < count; i++) {
    const currentToggle = allToggles.nth(i);
    
    // ไถหน้าจอไปหาตัวที่จะเช็ก (กันพลาดสำหรับรายการที่อยู่ล่างๆ)
    await currentToggle.scrollIntoViewIfNeeded();
    
    // ยืนยันว่าต้องถูก Checked
    await expect(currentToggle).toBeChecked();
  }
  // 1. บอก Playwright ว่าไม่ต้องไปยุ่งกับ Dialog (Alert)
  // ถ้ามีเด้งมา ให้ปล่อยค้างไว้ ไม่ต้องกด Accept หรือ Dismiss
  page.on('dialog', async dialog => {
    console.log('Popup เด้งแล้ว: ' + dialog.message());
    // ไม่สั่ง dialog.dismiss() หรือ dialog.accept() มันจะค้างอยู่แบบนั้น
  });

  // 2. แสดง Alert
  await page.evaluate(() => alert('Execute Done! ✅'));
});