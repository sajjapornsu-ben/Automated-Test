// CRUD ของหมวดแบบตารางชื่อ+สถานะ (12 หมวด): ว่างแล้ว Save ต้องถูกบล็อก, สร้างรายการ "QA Test ..." แล้วค้นเจอ จำนวนเพิ่ม 1, แก้ชื่อ, สลับสถานะ, ลบ (Cancel ไม่ลบ / Delete ลบ) แล้วจำนวนกลับเท่าเดิม
// spec: specs/master-data-plan.md (3 — Create / Edit / Status / Delete) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบข้อมูลจริงบน UAT (เฉพาะรายการ "QA Test ...") — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openCategory, searchFor, byslug, SIMPLE_SLUGS, rowByText, rowActionUntil, drawer,
  uniqueName, createSimple, deleteRow, totalTile, purgeQa, tableRows, confirmDeleteTitle, toggleRowActive,
} from './_helpers';

for (const slug of SIMPLE_SLUGS) {
  test.describe(`Master Data — ${slug} CRUD`, () => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes real UAT records — set RUN_UAT_SUBMIT_TESTS=1 to run');

    test(`MD-CRUD-01 ${slug}: validation, create, search, edit, deactivate, delete`, { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
      test.setTimeout(240000);
      const cat = byslug(slug);
      await loginSuperAdmin(page);
      try {
        await openCategory(page, cat);
        const before = await totalTile(page);

        // required-field validation: Save with an empty name is blocked and the drawer stays open
        await page.getByRole('button', { name: cat.create, exact: true }).click();
        await drawer(page).getByRole('button', { name: 'Save' }).click();
        await expect(drawer(page)).toContainText(/is required/i);
        await expect(drawer(page)).toBeVisible();
        await drawer(page).getByRole('button', { name: 'Cancel' }).click();
        await expect(drawer(page)).toBeHidden();

        // create
        const name = uniqueName(slug.slice(0, 6));
        await createSimple(page, cat, name);
        await searchFor(page, cat, name);
        await expect(rowByText(page, name)).toHaveCount(1);
        await expect(rowByText(page, name)).toContainText('Active');
        await searchFor(page, cat, '');
        await expect.poll(() => totalTile(page)).toBe(before + 1);

        // edit (rename)
        const renamed = name + ' R';
        await searchFor(page, cat, name);
        await rowActionUntil(rowByText(page, name).first(), 'Edit', drawer(page));
        await drawer(page).locator('input').first().fill(renamed);
        await drawer(page).getByRole('button', { name: 'Save' }).click();
        await expect(drawer(page)).toBeHidden({ timeout: 15000 });
        await searchFor(page, cat, renamed);
        await expect(rowByText(page, renamed)).toHaveCount(1);

        // row switch: Active → Inactive → Active
        await toggleRowActive(rowByText(page, renamed).first());
        await expect(rowByText(page, renamed)).toContainText('Inactive', { timeout: 15000 });
        await toggleRowActive(rowByText(page, renamed).first());
        await expect(rowByText(page, renamed)).toContainText('Active', { timeout: 15000 });
        await expect(rowByText(page, renamed)).not.toContainText('Inactive');

        // deactivate through the Active switch in the edit drawer
        await rowActionUntil(rowByText(page, renamed).first(), 'Edit', drawer(page));
        await drawer(page).getByRole('switch', { name: 'Active status' }).click({ force: true });
        await drawer(page).getByRole('button', { name: 'Save' }).click();
        await expect(drawer(page)).toBeHidden({ timeout: 15000 });
        await expect(rowByText(page, renamed)).toContainText('Inactive', { timeout: 15000 });

        // delete: Cancel keeps it, Delete removes it
        await rowActionUntil(rowByText(page, renamed).first(), 'Delete', confirmDeleteTitle(page));
        await page.getByRole('button', { name: 'Cancel', exact: true }).last().click();
        await expect(rowByText(page, renamed)).toHaveCount(1);
        await deleteRow(page, rowByText(page, renamed).first());
        await searchFor(page, cat, renamed);
        await expect(tableRows(page)).toHaveCount(0);
        await searchFor(page, cat, '');
        await expect.poll(() => totalTile(page)).toBe(before);
      } finally {
        await purgeQa(page, cat).catch(() => undefined);
      }
    });
  });
}
