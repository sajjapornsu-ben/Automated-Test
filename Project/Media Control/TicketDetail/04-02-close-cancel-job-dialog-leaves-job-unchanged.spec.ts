// เปิด dialog "Cancel Job" แล้วกด "Close" โดยไม่ยืนยัน สถานะ Job ต้องไม่เปลี่ยน
// spec: specs/ticket-detail-plan.md (4.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('Cancel Job', () => {
  test('Closing the Cancel Job dialog leaves the Job unchanged', async ({ page }) => {
    await login(page);
    await openTicketDetail(page, FIXTURE_TICKET_NO);

    const jobStatusBefore = page.getByText('Assign', { exact: true }).first();
    await expect(jobStatusBefore).toBeVisible();

    const jobCancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
    await jobCancelBtn.scrollIntoViewIfNeeded();
    await jobCancelBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Cancel Job' });
    await expect(dialog).toBeVisible();

    // 1. Click "Close".
    await dialog.getByRole('button', { name: 'Close', exact: true }).last().click();

    // The dialog closes; the Job's status on the page is unchanged.
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText('Assign', { exact: true }).first()).toBeVisible();
  });
});
