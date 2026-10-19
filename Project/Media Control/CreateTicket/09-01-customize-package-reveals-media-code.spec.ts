// เลือก Package ประเภท "Customize" แล้วต้องมีช่อง Media Code (required) โผล่มาเพิ่ม ซึ่ง Package ปกติไม่มี
// spec: specs/create-ticket-plan.md (9.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover } from './_helpers';

test.describe('Customize Package', () => {
  test('Selecting a Customize package reveals a required Media Code field', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Customize Client', product: 'QA Customize Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();

    // A non-customize package does not show a Media Code field.
    await expect(page.getByText('Media Code', { exact: false })).toHaveCount(0);

    // 1. Open the Package selector, choose a "Customize ..." package.
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'Customize BKK (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    // A "Media Code *" selector appears.
    await expect(page.getByText('Media Code', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select Media Code' })).toBeVisible();
  });
});
