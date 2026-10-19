// กด "Add Job" ในหน้า Ticket Detail แล้วต้องมีฟอร์ม "New Job" โผล่มาแบบ inline พร้อมช่องกรอกครบ และปุ่ม Add Job ต้องถูก disable ระหว่างเปิดฟอร์ม
// spec: specs/ticket-detail-plan.md (3.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('Add Job', () => {
  test('Add Job opens an inline new-job form', async ({ page }) => {
    await login(page);
    await openTicketDetail(page, FIXTURE_TICKET_NO);

    // 1. Click "Add Job".
    await page.getByRole('button', { name: 'Add Job' }).click();

    // An inline "New Job" form appears with its fields.
    await expect(page.getByText('New Job', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove Job' })).toBeVisible();
    await expect(page.getByText('Package', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Minutes' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Seconds' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'DD/MM/YYYY' })).toHaveCount(2);
    await expect(page.getByRole('textbox', { name: 'Pack Quantity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Versions' })).toBeVisible();
    await expect(page.getByText('Version 1', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Job' })).toBeVisible();

    // The page's "Add Job" button becomes disabled while the form is open.
    await expect(page.getByRole('button', { name: 'Add Job' })).toBeDisabled();
  });
});
