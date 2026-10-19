// กดปุ่ม "Remove this Job" แล้ว Job card ต้องหายไป และกลับสู่สถานะ "No Jobs yet"
// spec: specs/create-ticket-plan.md (3.4, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('Job Management', () => {
  test('Removing a Job removes its card', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Remove Job Client', product: 'QA Remove Job Product' });

    // 1. Add a Job.
    await page.getByRole('button', { name: 'Add Job' }).click();
    await expect(page.getByText('1 version', { exact: true })).toBeVisible();

    // 2. Click the "Remove this Job" control on the job card.
    await page.getByRole('button', { name: 'Remove this Job' }).click();

    // The job card disappears; "Ticket details" reverts to the "No Jobs yet" empty state.
    await expect(page.getByText('1 version', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Click "Add Job" to add a Job')).toBeVisible();
  });
});
