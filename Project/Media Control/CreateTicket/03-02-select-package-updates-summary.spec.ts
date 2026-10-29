// เลือก Package ให้ Job แล้ว panel "Ticket summary" ด้านล่างต้องอัปเดตชื่อ Package ตาม
// spec: specs/create-ticket-plan.md (3.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, popover, summary, PACKAGE } from './_helpers';

test.describe('Job Management', () => {
  test('Selecting a Package updates the Ticket summary', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Package Client', product: 'QA Package Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();

    await expect(summary(page).getByText('(unset sale package)')).toBeVisible();

    // 2. Select a Sale Package from the dropdown (the list depends on the Media Type chosen in the header).
    await page.getByRole('button', { name: 'Select Sale Package' }).click();
    await popover(page, 'Select Sale Package').getByRole('button', { name: PACKAGE, exact: true }).click();
    await closeOpenPopover(page);

    // The Package selector shows the chosen package.
    await expect(page.getByRole('button', { name: 'Select Sale Package' })).toHaveText(PACKAGE);

    // The Ticket summary "Versions" section references the package instead of "(unset sale package)".
    await expect(summary(page).getByText('(unset sale package)')).toHaveCount(0);
    await expect(summary(page)).toContainText(PACKAGE.split(' (')[0]);
  });
});
