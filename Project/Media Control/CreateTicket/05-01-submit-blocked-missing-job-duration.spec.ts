// Submit ticket โดยไม่กรอก Job Duration (min/sec) ต้องถูกบล็อกด้วย dialog แจ้งเตือน และตั๋วต้องไม่ถูกสร้าง
// spec: specs/create-ticket-plan.md (5.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';

test.describe('Validation', () => {
  test('Submitting with a missing Job Duration is blocked', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Val Duration Client', product: 'QA Val Duration Product' });

    // 1. Add a Job with a Package selected, but leave Job Duration (min/sec) empty.
    await page.getByRole('button', { name: 'Add Job' }).click();

    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 21);

    const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
    await linkBoxes.nth(0).fill('https://example.com/material.jpg');
    await linkBoxes.nth(1).fill('https://example.com/brief.pdf');

    // 2. Click "Submit ticket".
    await page.getByRole('button', { name: 'Submit ticket' }).click();

    // A "Something Went Wrong" dialog appears with the Duration-specific message.
    await expect(page.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await expect(page.getByText('Please specify the Duration (minutes and seconds) for every Job')).toBeVisible();

    // The Duration inputs are outlined in red.
    const minutesBox = page.getByRole('textbox', { name: 'Minutes' });
    const secondsBox = page.getByRole('textbox', { name: 'Seconds' });
    await expect(minutesBox).toHaveAttribute('aria-invalid', 'true');
    await expect(secondsBox).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('button', { name: 'OK' }).click();

    // The ticket is not created (URL stays on the Create Ticket page).
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/create/);
  });
});
