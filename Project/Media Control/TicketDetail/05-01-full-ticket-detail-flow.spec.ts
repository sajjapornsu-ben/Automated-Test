// สร้างตั๋วใหม่แบบสดๆ แล้วไล่เทสครบทั้ง 4 พฤติกรรมในหน้า Ticket Detail (View History, Add Job, Cancel Job, Back) จบในไฟล์เดียว
// spec: specs/ticket-detail-plan.md (5.1)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้สร้างตั๋วทดสอบใหม่ (ผ่าน Create Ticket) แล้ว Save Job / Cancel Job จริงบน UAT
// (ได้รับอนุมัติจากผู้ใช้แล้ว) — เป็น flow แบบ end-to-end แยกต่างหาก ไม่ได้แทนที่ไฟล์ 01-04 เดิม
// ที่แยกทดสอบทีละพฤติกรรมด้วย fixture ticket เทสนี้ถูก skip by default — รันด้วย
// RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import { login, createTicketAndOpenDetail, addJobOnDetail, pickCancelReason } from './_helpers';

test.describe('Full flow (fresh ticket)', () => {
  test('End-to-end Ticket Detail flow on a freshly created ticket', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates and mutates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');
    test.setTimeout(180000); // creates a ticket, adds a Job and more: 25-30 s is close to the 30 s default

    // 1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job).
    await login(page);
    const clientName = `QA Test Client ${Date.now()}`;
    await createTicketAndOpenDetail(page, clientName, 'QA Ticket Detail Flow Product');

    await page.getByRole('button', { name: 'History' }).click();
    const historyDialog = page.getByRole('dialog', { name: 'Activity History' });
    await expect(historyDialog).toBeVisible();
    await expect(historyDialog).toContainText('สร้าง Ticket');
    await historyDialog.getByRole('button').first().click();
    await expect(historyDialog).toHaveCount(0);

    // 3. Add Job: open the inline form and discard it via "Remove Job" first.
    await expect(page.getByText('1 job', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Add Job' }).click();
    await expect(page.getByRole('button', { name: 'Save Job' })).toBeVisible();
    await page.getByRole('button', { name: 'Remove Job' }).click();
    await expect(page.getByRole('button', { name: 'Save Job' })).toHaveCount(0);
    await expect(page.getByText('1 job', { exact: true })).toBeVisible();

    // Now open it again for real and save it (Duration/Period auto-prefill from the existing Job).
    await addJobOnDetail(page);
    await expect(page.getByRole('heading', { name: 'Job Added' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByText('2 jobs', { exact: true })).toBeVisible();

    // 4. Cancel Job: open the 2nd Job's dialog and close it without confirming first.
    const jobCancelBtn = page.getByRole('button', { name: 'Cancel', exact: true }).last();
    await jobCancelBtn.scrollIntoViewIfNeeded();
    await jobCancelBtn.click();
    const cancelDialog = page.getByRole('dialog', { name: 'Cancel Job' });
    await expect(cancelDialog).toBeVisible();
    await cancelDialog.getByRole('button', { name: 'Close', exact: true }).last().click();
    await expect(cancelDialog).toHaveCount(0);
    await expect(page.getByText('Assign', { exact: true }).first()).toBeVisible();

    // Reopen it for real and confirm the cancellation.
    await jobCancelBtn.scrollIntoViewIfNeeded();
    await jobCancelBtn.click();
    await expect(cancelDialog).toBeVisible();
    await pickCancelReason(cancelDialog, page, 'Wrong job created');
    await cancelDialog.getByRole('button', { name: 'Confirm Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Job Cancelled' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // The cancelled Job shows "Cancelled"; the other Job stays "Assign"; the ticket page itself
    // is unaffected (not replaced by the "This ticket has been cancelled" placeholder).
    await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
    await expect(page.getByText('Assign', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('This ticket has been cancelled')).toHaveCount(0);

    // 5. Back returns to the Media Ticket list.
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);
  });
});
