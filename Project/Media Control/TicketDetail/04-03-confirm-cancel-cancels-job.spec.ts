// เลือก Cancel Reason แล้วกด "Confirm Cancel" จริง ต้องยกเลิก Job นั้นสำเร็จ และสถานะ Job ต้องเปลี่ยนเป็น Cancelled
// spec: specs/ticket-detail-plan.md (4.3)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้สร้างตั๋วทดสอบใหม่ (ผ่าน Create Ticket) แล้ว Cancel Job จริงบน UAT
// (ได้รับอนุมัติจากผู้ใช้แล้ว) เทสนี้ถูก skip by default — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import { login, createTicketAndOpenDetail, addJobOnDetail, pickCancelReason } from './_helpers';

test.describe('Cancel Job', () => {
  test('Confirming with a reason actually cancels the Job', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Mutates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');
    test.setTimeout(180000); // creates a ticket, adds a Job and more: 25-30 s is close to the 30 s default

    // 1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already).
    await login(page);
    const clientName = `QA Test Client ${Date.now()}`;
    await createTicketAndOpenDetail(page, clientName, 'QA CancelJob Product');
    await addJobOnDetail(page);
    await expect(page.getByRole('heading', { name: 'Job Added' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('2 jobs', { exact: true })).toBeVisible();

    // 2. Click the 2nd Job's "Cancel" button, select a Cancel Reason, click "Confirm Cancel".
    const jobCancelBtn = page.getByRole('button', { name: 'Cancel', exact: true }).last();
    await jobCancelBtn.scrollIntoViewIfNeeded();
    await jobCancelBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Cancel Job' });
    await expect(dialog).toBeVisible();
    await pickCancelReason(dialog, page, 'Wrong job created');
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
