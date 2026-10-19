// เลือก Package ให้ Job แล้ว panel "Ticket summary" ด้านล่างต้องอัปเดตชื่อ Package ตาม
// spec: specs/create-ticket-plan.md (3.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover } from './_helpers';

test.describe('Job Management', () => {
  test('Selecting a Package updates the Ticket summary', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Package Client', product: 'QA Package Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();

    await expect(page.getByText('(unset package)', { exact: true })).toBeVisible();

    // 2. Select a Package from the dropdown.
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    // The Package selector shows the chosen package.
    await expect(page.getByRole('button', { name: 'Select Package' })).toHaveText('PlanBTV_80Red (Plan B TV)');

    // The Ticket summary "Versions" section references the package instead of "(unset package)".
    await expect(page.getByText('(unset package)', { exact: true })).toHaveCount(0);
    await expect(page.getByText('PlanBTV_80Red', { exact: true })).toBeVisible();
  });
});
