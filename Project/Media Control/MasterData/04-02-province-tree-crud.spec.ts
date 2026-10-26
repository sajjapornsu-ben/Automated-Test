// Province: สร้าง จังหวัด → อำเภอ → ตำบล (QA Test) ในเซสชันเดียว ตรวจว่าแต่ละระดับแสดงในคอลัมน์และในรายละเอียดที่อยู่ แล้วลบจากล่างขึ้นบน (ตำบล → อำเภอ → จังหวัด) และ Save ว่างต้องถูกบล็อก
// spec: specs/master-data-plan.md (3 — Province) — Super Admin
// seed: seed.spec.ts
//
// สำคัญ: ห้าม reload หน้าระหว่างเทส — จังหวัด/อำเภอที่ยังไม่มีลูกครบจะไม่ถูกส่งกลับจาก /api/provinces หลัง reload (สังเกตจาก UAT) ทำให้เข้าไปลบผ่าน UI ไม่ได้
// เทสนี้สร้าง/แก้/ลบข้อมูลจริงบน UAT (เฉพาะรายการ "QA Test ...") — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect, Page } from '@playwright/test';
import { loginSuperAdmin, openCategory, byslug, drawer, confirmDeleteButton, confirmDeleteTitle, dismissSavedModal } from './_helpers';

const cat = byslug('province');
const addButtons = (page: Page) => page.getByRole('button', { name: 'Add', exact: true });
const card = (page: Page, text: string) => page.locator('main').getByText(text, { exact: true }).first();

/** Deletes the deepest selected item through the Delete button of the detail panel (the last Delete on the page). */
async function deleteSelected(page: Page) {
  await page.locator('main').getByRole('button', { name: 'Delete' }).last().click({ force: true });
  await expect(confirmDeleteTitle(page)).toBeVisible({ timeout: 8000 });
  await confirmDeleteButton(page).click();
  await dismissSavedModal(page);
  await page.waitForTimeout(1200);
}

test.describe('Master Data — Province tree', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes real UAT records — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MD-PROV-01 required name blocks Save', { tag: ['@negative'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openCategory(page, cat);
    await page.getByRole('button', { name: 'Add Province', exact: true }).click();
    await drawer(page).getByRole('button', { name: 'Save' }).click();
    await expect(drawer(page)).toContainText(/required/i);
    await expect(drawer(page)).toBeVisible();
    await drawer(page).getByRole('button', { name: 'Cancel' }).click();
    await expect(drawer(page)).toBeHidden();
  });

  test('MD-PROV-02 province → district → subdistrict: create, show, delete bottom-up', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    const t = Date.now().toString().slice(-6);
    const prov = `QA Test จว ${t}`;
    const dist = `QA Test อ ${t}`;
    const sub = `QA Test ต ${t}`;
    let created = { prov: false, dist: false, sub: false };
    try {
      await openCategory(page, cat);
      const before = Number((await page.locator('main').innerText()).replace(/\s+/g, ' ').match(/PROVINCE (\d+)/)![1]);

      // province
      await page.getByRole('button', { name: 'Add Province', exact: true }).click();
      await drawer(page).getByPlaceholder('e.g. เชียงใหม่').fill(prov);
      await drawer(page).getByPlaceholder('E.g. Chiang Mai').fill(`QA Test Prov ${t}`);
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);
      created.prov = true;
      await expect.poll(async () => Number((await page.locator('main').innerText()).replace(/\s+/g, ' ').match(/PROVINCE (\d+)/)![1])).toBe(before + 1);

      await page.getByPlaceholder(/Search all levels/).fill('QA Test');
      await card(page, prov).click({ force: true });

      // district
      await addButtons(page).nth(1).click({ force: true });
      await drawer(page).getByPlaceholder('e.g. เมืองเชียงใหม่').fill(dist);
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);
      created.dist = true;
      await expect(card(page, dist)).toBeVisible();
      await card(page, dist).click({ force: true });

      // subdistrict (postcode is required, 5 digits)
      await addButtons(page).nth(2).click({ force: true });
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toContainText(/required/i); // empty subdistrict is blocked
      await drawer(page).getByPlaceholder('e.g. ศรีภูมิ').fill(sub);
      await drawer(page).getByPlaceholder('50200').fill('99999');
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);
      created.sub = true;
      await expect(card(page, sub)).toBeVisible();
      await card(page, sub).click({ force: true });

      // the detail panel shows the full address chain
      await expect(page.locator('main')).toContainText(prov);
      await expect(page.locator('main')).toContainText(dist);
      await expect(page.locator('main')).toContainText('99999');

      // delete bottom-up
      await deleteSelected(page);
      created.sub = false;
      await expect(card(page, sub)).toHaveCount(0);
      await card(page, dist).click({ force: true });
      await deleteSelected(page);
      created.dist = false;
      await expect(card(page, dist)).toHaveCount(0);
      await card(page, prov).click({ force: true });
      await deleteSelected(page);
      created.prov = false;
      await expect(card(page, prov)).toHaveCount(0);
      await expect.poll(async () => Number((await page.locator('main').innerText()).replace(/\s+/g, ' ').match(/PROVINCE (\d+)/)![1])).toBe(before);
    } finally {
      // clean-up in the same session (no reload!): remove whatever is still there, deepest first
      for (const [flag, text] of [['sub', sub], ['dist', dist], ['prov', prov]] as const) {
        if (!created[flag]) continue;
        try {
          await card(page, text).click({ force: true, timeout: 5000 });
          await deleteSelected(page);
        } catch { /* nothing more we can do from the UI */ }
      }
    }
  });
});
