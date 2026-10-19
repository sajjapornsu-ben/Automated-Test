// เมื่อเลือกทั้ง Package และ Job Period แล้ว ป้าย Quota ต้องเปลี่ยนจาก "—" เป็น "Version X/Y"
// spec: specs/create-ticket-plan.md (3.3, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';

test.describe('Job Management', () => {
  test('Job Quota badge appears once Package and Period are both set', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Quota Client', product: 'QA Quota Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();
    await expect(page.getByText('Quota —', { exact: true })).toBeVisible();

    // 1. Select a Package.
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    // Package alone is not enough yet.
    await expect(page.getByText('Version', { exact: false }).filter({ hasText: '/' })).toHaveCount(0);

    // 2. Set the Job Period (start and end dates about 3 weeks apart).
    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 21);

    // The Quota badge changes from "—" to a "Version X/Y" indicator.
    await expect(page.getByText(/Version \d+\/\d+/)).toBeVisible();
  });
});
