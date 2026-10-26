// CRUD ของหมวดที่มีฟิลด์เพิ่ม (Product Owner, System Status, Zone, Road, Bus Model, Department, Sale Package, Resolution): Save ว่างต้องถูกบล็อก, สร้าง "QA Test ..." แล้วค้นเจอ, แก้ชื่อ, ปิดสถานะ, ลบ (Cancel ไม่ลบ / Delete ลบ)
// spec: specs/master-data-plan.md (3 — Create / Edit / Status / Delete, template B) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบข้อมูลจริงบน UAT (เฉพาะรายการ "QA Test ...") — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect, Page, Locator } from '@playwright/test';
import {
  loginSuperAdmin, openCategory, searchFor, byslug, rowByText, rowActionUntil, drawer, uniqueName, deleteRow, purgeQa, confirmDeleteTitle, dismissSavedModal,
} from './_helpers';

type Cfg = {
  slug: string;
  nameInput: (d: Locator) => Locator;
  fill: (d: Locator, name: string) => Promise<void>;
  prep?: (page: Page) => Promise<void>;
};

const CODE = () => `QA${Date.now().toString().slice(-9)}`;

const CONFIGS: Cfg[] = [
  {
    slug: 'productOwner',
    nameInput: (d) => d.getByPlaceholder('e.g. Somchai Wongthong'),
    fill: async (d, name) => { await d.getByPlaceholder('e.g. PO-001').fill(CODE()); await d.getByPlaceholder('e.g. Somchai Wongthong').fill(name); },
  },
  {
    slug: 'status',
    nameInput: (d) => d.getByPlaceholder('e.g. Approved, In Progress'),
    fill: async (d, name) => { await d.getByPlaceholder('e.g. Approved, In Progress').fill(name); await d.locator('select').first().selectOption({ label: 'Product Status' }); },
  },
  {
    slug: 'zone',
    nameInput: (d) => d.getByPlaceholder('e.g. Bangkok - CBD, Asok Montri'),
    fill: async (d, name) => { await d.locator('select').first().selectOption({ index: 1 }); await d.getByPlaceholder('e.g. Bangkok - CBD, Asok Montri').fill(name); },
  },
  {
    slug: 'road',
    nameInput: (d) => d.getByPlaceholder('e.g. ถนนสุขุมวิท'),
    fill: async (d, name) => { await d.getByPlaceholder('e.g. ถนนสุขุมวิท').fill(name); },
  },
  {
    slug: 'busModelLine',
    nameInput: (d) => d.getByPlaceholder('Enter name'),
    fill: async (d, name) => { await d.getByPlaceholder('Enter name').fill(name); },
  },
  {
    slug: 'department',
    nameInput: (d) => d.getByPlaceholder('e.g. Media Operation'),
    fill: async (d, name) => { await d.getByPlaceholder('e.g. Media Operation').fill(name); },
    prep: async (page) => { await page.getByRole('button', { name: 'List' }).click({ force: true }); await page.waitForTimeout(1200); },
  },
  {
    slug: 'salePackage',
    nameInput: (d) => d.getByPlaceholder('e.g. Digital Premium'),
    fill: async (d, name) => {
      await d.getByPlaceholder('e.g. PKG-001').fill(CODE());
      await d.getByPlaceholder('e.g. Digital Premium').fill(name);
      await d.getByRole('button', { name: /^Full Pack/ }).click();
    },
  },
];

for (const cfg of CONFIGS) {
  test.describe(`Master Data — ${cfg.slug} CRUD`, () => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes real UAT records — set RUN_UAT_SUBMIT_TESTS=1 to run');

    test(`MD-CRUD-02 ${cfg.slug}: validation, create, search, edit, deactivate, delete`, { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
      test.setTimeout(240000);
      const cat = byslug(cfg.slug);
      await loginSuperAdmin(page);
      const open = async () => { await openCategory(page, cat); await cfg.prep?.(page); };
      try {
        await purgeQa(page, cat).catch(() => undefined);
        await open();

        // required fields: Save on an empty form is blocked, drawer stays open
        await page.getByRole('button', { name: cat.create, exact: true }).click();
        await drawer(page).getByRole('button', { name: 'Save' }).click();
        await expect(drawer(page)).toContainText(/is required|required/i);
        await expect(drawer(page)).toBeVisible();
        await drawer(page).getByRole('button', { name: 'Cancel' }).click();
        await expect(drawer(page)).toBeHidden();

        // create
        const name = uniqueName(cfg.slug.slice(0, 5));
        await page.getByRole('button', { name: cat.create, exact: true }).click();
        await cfg.fill(drawer(page), name);
        await drawer(page).getByRole('button', { name: 'Save' }).click();
        await expect(drawer(page)).toBeHidden({ timeout: 15000 });
        await dismissSavedModal(page);
        await searchFor(page, cat, name);
        await expect(rowByText(page, name)).toHaveCount(1);

        // edit (rename)
        const renamed = name + ' R';
        await rowActionUntil(rowByText(page, name).first(), 'Edit', drawer(page));
        await cfg.nameInput(drawer(page)).fill(renamed);
        await drawer(page).getByRole('button', { name: 'Save' }).click();
        await expect(drawer(page)).toBeHidden({ timeout: 15000 });
        await dismissSavedModal(page);
        await searchFor(page, cat, renamed);
        await expect(rowByText(page, renamed)).toHaveCount(1);

        // deactivate through the Active switch in the edit drawer
        await rowActionUntil(rowByText(page, renamed).first(), 'Edit', drawer(page));
        if (cfg.slug === 'busModelLine') {
          // the Bus Model drawer saves the Active switch immediately and closes by itself
          await drawer(page).getByRole('switch').first().click();
          await dismissSavedModal(page);
        } else {
          await drawer(page).getByRole('switch').first().evaluate((e) => (e as HTMLElement).click());
          await drawer(page).getByRole('button', { name: 'Save' }).click();
          await expect(drawer(page)).toBeHidden({ timeout: 15000 });
          await dismissSavedModal(page);
        }
        await dismissSavedModal(page);
        await expect(rowByText(page, renamed)).toContainText('Inactive', { timeout: 15000 });

        // delete: Cancel keeps it, Delete removes it
        await rowActionUntil(rowByText(page, renamed).first(), 'Delete', confirmDeleteTitle(page));
        await page.getByRole('button', { name: 'Cancel', exact: true }).last().click();
        await expect(rowByText(page, renamed)).toHaveCount(1);
        await deleteRow(page, rowByText(page, renamed).first());
        await searchFor(page, cat, renamed);
        // the row must be gone. Sale Package keeps showing the deleted row until the page is reloaded
        // (observed on UAT) — record that as an annotation and verify the deletion after a reload.
        if ((await rowByText(page, renamed).count()) > 0 && cfg.slug === 'salePackage') {
          test.info().annotations.push({ type: 'issue', description: 'Sale Package list still shows the deleted record until the page is reloaded' });
          await page.reload();
          await searchFor(page, cat, renamed);
        }
        await expect(rowByText(page, renamed)).toHaveCount(0);
      } finally {
        await purgeQa(page, cat).catch(() => undefined);
      }
    });
  });
}
