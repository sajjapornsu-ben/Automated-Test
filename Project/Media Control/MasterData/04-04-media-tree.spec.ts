// Media Management (Media Group → Category → Type → Segment → Sub Segment): ตัวเลขสรุปตรงกับคอลัมน์, ค้นหาข้ามระดับ, แก้ชื่อกลุ่ม QA แล้วคืนค่าเดิม (รหัสแก้ไม่ได้), และ Category ของกลุ่ม QA ต้องแสดงในคอลัมน์เมื่อเลือกกลุ่มแล้วล้างช่องค้นหา
// spec: specs/master-data-plan.md (3 — Media tree) — Super Admin
// seed: seed.spec.ts
//
// หมายเหตุ: หมวดนี้ไม่มีปุ่มลบใน UI จึงไม่สร้างข้อมูลใหม่ในเทส — ใช้กลุ่ม "QA Test Group Alpha" (QAT) และ Category "QA Test Category" (QAC) ที่สร้างไว้แล้ว
// เทสแก้ชื่อกลุ่มแล้วคืนค่า จึงรันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect, Page } from '@playwright/test';
import { loginSuperAdmin, openCategory, drawer, dismissSavedModal } from './_helpers';

const QA_GROUP = 'QA Test Group Alpha';
const QA_CATEGORY = 'QA Test Category';
const searchAll = (page: Page) => page.getByPlaceholder('Search all levels — Group / Category / Type / Segment / Code...');
const mainText = async (page: Page) => (await page.locator('main').innerText()).replace(/\s+/g, ' ');
const tile = async (page: Page, label: string) => Number((await mainText(page)).match(new RegExp(`${label} (\\d+)`))![1]);
const columnCount = async (page: Page, header: string) => Number((await mainText(page)).match(new RegExp(`${header} (\\d+) Add`))![1]);

test.describe('Master Data — Media tree', () => {
  test('MD-MEDIA-01 summary tiles match the columns and search works across levels', { tag: ['@happy'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await openCategory(page, 'media');
    expect(await columnCount(page, 'Media Group')).toBe(await tile(page, 'MEDIA GROUPS'));

    await searchAll(page).fill(QA_GROUP);
    await expect(page.locator('main').getByText(QA_GROUP, { exact: true }).first()).toBeVisible();
    await searchAll(page).fill('zzz-no-such-media');
    await expect(page.getByText(/No (Group|Media Group)/i).first()).toBeVisible();
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect.poll(async () => columnCount(page, 'Media Group')).toBe(await tile(page, 'MEDIA GROUPS'));
  });

  test('MD-MEDIA-02 edit group: code is read-only, rename and restore', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Edits a real UAT record — set RUN_UAT_SUBMIT_TESTS=1 to run');
    test.setTimeout(120000);
    await loginSuperAdmin(page);
    await openCategory(page, 'media');
    const renamed = `${QA_GROUP} R`;
    const rename = async (from: string, to: string) => {
      await searchAll(page).fill(from);
      await page.waitForTimeout(1200);
      await page.getByRole('button', { name: `Edit ${from}` }).click({ force: true });
      await expect(drawer(page)).toBeVisible();
      await expect(drawer(page).getByPlaceholder('e.g. DIG', { exact: true })).toBeDisabled();
      await drawer(page).getByPlaceholder('e.g. Digital', { exact: true }).fill(to);
      await drawer(page).getByRole('button', { name: 'Save Changes' }).click();
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);
    };
    try {
      await rename(QA_GROUP, renamed);
      await searchAll(page).fill(renamed);
      await page.waitForTimeout(1200);
      await expect(page.locator('main').getByText(renamed, { exact: true }).first()).toBeVisible();
    } finally {
      await rename(renamed, QA_GROUP).catch(() => undefined);
    }
  });

  test('MD-MEDIA-03 a category of a group is listed in the Media Category column', { tag: ['@regression'] }, async ({ page }) => {
    // Select the group through the search box, then clear the search: the search text also filters the other columns,
    // so a search for the group name hides categories whose own name does not match.
    await loginSuperAdmin(page);
    await openCategory(page, 'media');
    await searchAll(page).fill(QA_GROUP);
    await page.waitForTimeout(1200);
    await page.locator('main').getByText(QA_GROUP, { exact: true }).first().click({ force: true });
    await searchAll(page).fill('');
    await expect(page.locator('main').getByText(QA_CATEGORY, { exact: true }).first()).toBeVisible({ timeout: 8000 });
    await expect.poll(async () => columnCount(page, 'Media Category')).toBeGreaterThanOrEqual(1);
  });
});
