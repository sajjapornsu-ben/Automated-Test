// กด "Add Job" แล้วต้องได้ Job card ที่มี Version 1 (Draft) มาให้อัตโนมัติ พร้อมช่องกรอกของ Job
// spec: specs/create-ticket-plan.md (3.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('Job Management', () => {
  test('Adding a Job creates a job card with one default Version', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Job Client', product: 'QA Job Product' });

    // 2. Click "Add Job".
    await page.getByRole('button', { name: 'Add Job' }).click();

    // A job card appears with a "1 version" badge, Package selector, Pack quantity (default 1),
    // a Quota indicator, Job Duration inputs and a Job Period date range.
    await expect(page.getByText('1 version', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select Package' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Pack Quantity' })).toHaveValue('1');
    await expect(page.getByText('Quota —', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Minutes' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Seconds' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'DD/MM/YYYY' })).toHaveCount(2);

    // Inside the job card, "Version 1" (status "Draft") is already present.
    await expect(page.getByText('Version 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Draft', { exact: true }).first()).toBeVisible();
  });
});
