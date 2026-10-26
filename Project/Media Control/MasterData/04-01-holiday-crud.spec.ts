// Holiday: สร้างวันหยุด "QA Test ..." (ปี 2029 เพื่อไม่กระทบ SLA ปัจจุบัน) ต้องขึ้นในลิสต์/ค้นหาเจอ, แก้ชื่อ, สลับมุมมอง List/Calendar, ลบ (Cancel ไม่ลบ / Delete ลบ), และ Save ว่างต้องถูกบล็อก
// spec: specs/master-data-plan.md (3 — Holiday) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบข้อมูลจริงบน UAT (เฉพาะรายการ "QA Test ...") — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect, Page } from '@playwright/test';
import { loginSuperAdmin, openCategory, byslug, drawer, uniqueName, confirmDeleteTitle, confirmDeleteButton, dismissSavedModal, rowActionUntil, QA_PREFIX } from './_helpers';

const cat = byslug('holiday');
const item = (page: Page, text: string) => page.locator('main').locator('div').filter({ hasText: text }).filter({ has: page.getByRole('button', { name: 'Edit' }) }).last();

async function showYear2029(page: Page) {
  const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: /year/i }) }).first();
  await group.click();
  await page.getByRole('listbox').first().getByRole('option', { name: '2029', exact: true }).click();
  await page.waitForTimeout(1000);
}

async function removeQaHolidays(page: Page) {
  await openCategory(page, cat);
  await showYear2029(page);
  await page.getByPlaceholder(cat.search).fill(QA_PREFIX);
  await page.waitForTimeout(1200);
  for (let i = 0; i < 10; i++) {
    const del = page.locator('main').getByRole('button', { name: 'Delete' }).first();
    if ((await del.count()) === 0) break;
    try {
      await del.click({ force: true });
      await confirmDeleteButton(page).click({ timeout: 5000 });
      await dismissSavedModal(page);
      await page.waitForTimeout(1000);
    } catch {
      break;
    }
  }
}

test.describe('Master Data — Holiday', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes real UAT records — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MD-HOL-01 validation, create, search, edit, view switch, delete', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginSuperAdmin(page);
    try {
      await removeQaHolidays(page).catch(() => undefined);
      await openCategory(page, cat);

      // required name: empty Save is blocked
      await page.getByRole('button', { name: cat.create, exact: true }).click();
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toContainText(/required/i);
      await expect(drawer(page)).toBeVisible();
      await drawer(page).getByRole('button', { name: 'Cancel' }).click();
      await expect(drawer(page)).toBeHidden();

      // create a Company holiday on 28 Dec 2029
      const name = uniqueName('Hol');
      await page.getByRole('button', { name: cat.create, exact: true }).click();
      const d = drawer(page);
      await d.getByPlaceholder('e.g. Songkran, Company holiday').fill(name);
      await d.getByText('Company holidays', { exact: true }).click();
      const selects = d.locator('select');
      await selects.nth(0).selectOption('28');
      await selects.nth(1).selectOption('11'); // December (0-based value)
      await selects.nth(2).selectOption('2029');
      await d.getByRole('button', { name: 'Save' }).click();
      await expect(d).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);

      await showYear2029(page);
      await page.getByPlaceholder(cat.search).fill(name);
      await page.waitForTimeout(1200);
      await expect(page.getByText(name).first()).toBeVisible();
      await expect(page.locator('main')).toContainText(/Company/);
      await expect(page.locator('main')).toContainText(/28/);

      // edit: rename
      const renamed = name + ' R';
      await rowActionUntil(page.locator('main').getByRole('button', { name: 'Edit' }).first().locator('xpath=ancestor::*[self::div][3]'), 'Edit', drawer(page));
      await drawer(page).getByPlaceholder('e.g. Songkran, Company holiday').fill(renamed);
      await drawer(page).getByRole('button', { name: 'Save' }).click();
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await dismissSavedModal(page);
      await page.getByPlaceholder(cat.search).fill(renamed);
      await page.waitForTimeout(1200);
      await expect(page.getByText(renamed).first()).toBeVisible();

      // Calendar view then back to List
      await page.getByRole('button', { name: 'Calendar' }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.getByRole('button', { name: 'Calendar' })).toBeVisible();
      await page.getByRole('button', { name: 'List' }).click({ force: true });
      await page.waitForTimeout(1000);
      await expect(page.getByText(renamed).first()).toBeVisible();

      // delete: Cancel keeps it, Delete removes it
      await page.locator('main').getByRole('button', { name: 'Delete' }).first().click({ force: true });
      await expect(confirmDeleteTitle(page)).toBeVisible();
      await page.getByRole('button', { name: 'Cancel', exact: true }).last().click();
      await expect(page.getByText(renamed).first()).toBeVisible();
      await page.locator('main').getByRole('button', { name: 'Delete' }).first().click({ force: true });
      await confirmDeleteButton(page).click();
      await dismissSavedModal(page);
      // the deleted holiday is gone after the list is reloaded (a toast with its name may still be on screen right after deleting)
      await openCategory(page, cat);
      await showYear2029(page);
      await page.getByPlaceholder(cat.search).fill(renamed);
      await page.waitForTimeout(1500);
      await expect(page.locator('main').getByText(renamed)).toHaveCount(0);
    } finally {
      await removeQaHolidays(page).catch(() => undefined);
    }
  });
});
