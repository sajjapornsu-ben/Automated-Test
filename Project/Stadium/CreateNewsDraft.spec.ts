import { test, expect } from '@playwright/test';

test('Test Create News and Upload Image', async ({ page }) => {
  // 1. Login
  await page.goto('https://stadiumthuat-cms.planbmedia.co.th/login?callbackUrl=%2Fnews');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('sajjaporn.su@planbmedia.co.th');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  // 2. ไปที่เมนู News
  await page.getByRole('navigation').getByRole('button', { name: 'News' }).click();
  await page.getByRole('link', { name: 'News', exact: true }).click();
  
  // 3. กดสร้าง News
  await expect(page.getByRole('button', { name: 'สร้าง News & Results' })).toBeVisible();
  await page.getByRole('button', { name: 'สร้าง News & Results' }).click();
  
  // 4. กรอกข้อมูลพื้นฐาน
  await expect(page.getByRole('main')).toContainText('Basic Info');
  await page.getByRole('textbox', { name: 'Title*' }).fill('พาดหัวข่าว - ทดสอบโดย Gemini');
  await page.getByRole('textbox', { name: 'Short content (optional)' }).fill('เกริ่นเนื้อหาสั้นๆ สำหรับการทดสอบระบบ');

  // 5. เลือกบุคคล (Author, Editor, Camera, Content)
  await page.getByRole('textbox', { name: 'Author *' }).click();
  await page.getByRole('button', { name: '"เจมส์จินโญ่" ธัมมสาร อ่อนเกิดแก้ว' }).click();
  
  await page.getByRole('textbox', { name: 'Editor' }).click();
  await page.getByRole('button', { name: 'กิติกร' }).click();
  
  await page.getByRole('textbox', { name: 'Camera' }).click();
  await page.getByRole('button', { name: 'ทีมงานเพจนักวิ่งมีหนวด' }).click();
  
  await page.getByRole('textbox', { name: 'Content', exact: true }).click();
  await page.getByRole('button', { name: 'กิตติมา ใจดี' }).click();

  // 6. ส่วนสำคัญ: การอัปโหลดรูปภาพ (Banners)
  await expect(page.getByText('Banners')).toBeVisible();
  
  // ดักรอหน้าต่างเลือกไฟล์ก่อนที่จะคลิก
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('#banner-field').getByRole('button', { name: 'Choose Image', exact: true }).click();
  
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('testaddnew.png'); // *** ต้องมีไฟล์ชื่อนี้อยู่ในโฟลเดอร์โปรเจกต์ ***

  // 7. Crop และ Upload
  await page.getByRole('button', { name: 'Crop & Upload' }).click();
  
  // 8. ใส่เนื้อหาหลัก (Main Content)
  await page.getByLabel('Main content area, start').fill('นี่คือเนื้อหาทดสอบระบบ Automation');

  // 9. ทดสอบ Preview
  await page.getByRole('button', { name: 'Show Preview' }).click();
  await expect(page.getByRole('tab', { name: 'Detail Preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Hide Preview' }).click();

// 10. บันทึกเป็น Draft
  await page.getByRole('button', { name: 'Draft' }).click();

  // --- ส่วนที่เพิ่มใหม่สำหรับเช็ค Popup ---
  // เช็คว่ามีกล่องข้อความ "บันทึกสำเร็จ" ปรากฏขึ้นมา (ใส่ timeout เผื่อเน็ตช้าตอนบันทึก)
  await expect(page.getByText('บันทึกฉบับร่างสำเร็จ')).toBeVisible({ timeout: 10000 });
  
  // 1. บอก Playwright ว่าไม่ต้องไปยุ่งกับ Dialog (Alert)
  // ถ้ามีเด้งมา ให้ปล่อยค้างไว้ ไม่ต้องกด Accept หรือ Dismiss
  page.on('dialog', async dialog => {
    console.log('Popup เด้งแล้ว: ' + dialog.message());
    // ไม่สั่ง dialog.dismiss() หรือ dialog.accept() มันจะค้างอยู่แบบนั้น
  });

  // 2. แสดง Alert
  await page.evaluate(() => alert('Execute Done! ✅'));
});