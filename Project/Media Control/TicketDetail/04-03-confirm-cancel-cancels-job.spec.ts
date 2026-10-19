// เลือก Cancel Reason แล้วกด "Confirm Cancel" จริง ต้องยกเลิก Job นั้นสำเร็จ และสถานะ Job ต้องเปลี่ยนเป็น Cancelled
// spec: specs/ticket-detail-plan.md (4.3)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้สร้างตั๋วทดสอบใหม่ (ผ่าน Create Ticket) แล้ว Cancel Job จริงบน UAT
// (ได้รับอนุมัติจากผู้ใช้แล้ว) เทสนี้ถูก skip by default — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import {
  login,
  openCreateTicket,
  switchToManualMode,
  fillTicketHeader,
  closeOpenPopover,
  pickDate,
} from '../CreateTicket/_helpers';

test.describe('Cancel Job', () => {
  test('Confirming with a reason actually cancels the Job', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Mutates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');

    // 1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already).
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const clientName = `QA Test Client ${Date.now()}`;
    await fillTicketHeader(page, { client: clientName, product: 'QA CancelJob Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 21);

    await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
    await page.getByRole('textbox', { name: 'Seconds' }).fill('15');

    const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
    await linkBoxes.nth(0).fill('https://example.com/material.jpg');
    await linkBoxes.nth(1).fill('https://example.com/brief.pdf');

    await page.getByRole('button', { name: 'Submit ticket' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    await page.getByRole('textbox', { name: /Search ticket/ }).fill(clientName);
    await page.waitForTimeout(600);
    const row = page.getByRole('row').filter({ hasText: clientName });
    await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/TK-\d+$/);

    // Add a 2nd Job first — cancelling a ticket's *only* Job cascades to cancel the whole
    // ticket (verified live), which wouldn't exercise the dialog's own claim that "the Ticket
    // and other Jobs keep their current status."
    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('option', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await page.getByRole('textbox', { name: 'Material link' }).fill('https://example.com/material2.jpg');
    await page.getByRole('textbox', { name: 'Brief link' }).fill('https://example.com/brief2.pdf');
    await page.getByRole('button', { name: 'Save Job' }).click();
    await expect(page.getByRole('heading', { name: 'Job Added' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('2 jobs', { exact: true })).toBeVisible();

    // 2. Click the 2nd Job's "Cancel" button, select a Cancel Reason, click "Confirm Cancel".
    const jobCancelBtn = page.getByRole('button', { name: 'Cancel', exact: true }).last();
    await jobCancelBtn.scrollIntoViewIfNeeded();
    await jobCancelBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Cancel Job' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox', { name: 'Cancel Reason' }).selectOption({ label: 'Wrong job created' });
    await dialog.getByRole('button', { name: 'Confirm Cancel' }).click();

    // The dialog closes and a success dialog confirms the Job was cancelled.
    await expect(page.getByRole('heading', { name: 'Job Cancelled' })).toBeVisible();
    await expect(page.getByText('cancelled successfully', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // The cancelled Job's status updates to "Cancelled", while the other Job and the Ticket
    // itself keep their current status (per the dialog's own claim).
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
    await expect(page.getByText('Assign', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('This ticket has been cancelled')).toHaveCount(0);
  });
});
