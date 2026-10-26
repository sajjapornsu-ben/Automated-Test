// [DEFECT ที่สังเกตบน UAT] จังหวัดที่เพิ่งสร้าง (ยังไม่มีอำเภอ) ต้องถูกส่งกลับจาก API รายการจังหวัด — ตอนนี้ไม่ถูกส่ง จึงหายไปหลัง reload หน้า และเข้าไปเพิ่มอำเภอ/ลบไม่ได้
// spec: specs/master-data-plan.md (3 — Province) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้างจังหวัด "QA Test ..." แล้วลบทิ้งในเซสชันเดียวกัน (ไม่ reload) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น
// คาดว่า fail จนกว่าจะแก้ — ตรวจผ่าน GET /api/provinces (สิ่งเดียวกับที่หน้าใช้ตอนโหลด) โดยไม่ reload หน้า

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, openCategory, byslug, drawer, confirmDeleteButton, confirmDeleteTitle, dismissSavedModal } from './_helpers';

const cat = byslug('province');

test.describe('Master Data — Province list API', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT record — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MD-PROV-03 a newly created province is returned by GET /api/provinces', { tag: ['@regression'] }, async ({ page }) => {
    test.setTimeout(120000);
    await loginSuperAdmin(page);
    const name = `QA Test จว ${Date.now().toString().slice(-6)}`;
    let created = false;
    try {
      await openCategory(page, cat);
      await page.getByRole('button', { name: 'Add Province', exact: true }).click();
      await drawer(page).getByPlaceholder('e.g. เชียงใหม่').fill(name);
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);
      created = true;

      const res = await page.request.get('https://uat-mediacontrol.planbmedia.co.th/api/provinces');
      expect(res.status()).toBe(200);
      const rows: { province_name_th: string }[] = (await res.json()).data.rows;
      expect(rows.some((r) => r.province_name_th === name), 'new province is in the list the page loads after a reload').toBe(true);
    } finally {
      if (created) {
        // delete it through the UI of the same session (it is still on screen)
        await page.getByPlaceholder(/Search all levels/).fill('QA Test').catch(() => undefined);
        await page.locator('main').getByText(name, { exact: true }).first().click({ force: true, timeout: 5000 }).catch(() => undefined);
        await page.locator('main').getByRole('button', { name: 'Delete' }).last().click({ force: true, timeout: 5000 }).catch(() => undefined);
        await expect(confirmDeleteTitle(page)).toBeVisible({ timeout: 5000 }).catch(() => undefined);
        await confirmDeleteButton(page).click({ timeout: 5000 }).catch(() => undefined);
        await dismissSavedModal(page);
      }
    }
  });
});
