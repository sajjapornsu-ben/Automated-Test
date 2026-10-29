// กดปุ่ม "Cancel" ของ Job ใดๆ แล้วต้องเปิด dialog "Cancel Job" ที่ระบุ Job No นั้นๆ ชัดเจน พร้อมข้อความว่ากระทบแค่ Job นี้
// spec: specs/ticket-detail-plan.md (4.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('Cancel Job', () => {
  test('Cancel opens the "Cancel Job" dialog for that specific Job', async ({ page }) => {
    await login(page);
    await openTicketDetail(page, FIXTURE_TICKET_NO);

    // 1. Click the Job's "Cancel" button.
    const jobCancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
    await jobCancelBtn.scrollIntoViewIfNeeded();
    await jobCancelBtn.click();

    // A "Cancel Job" dialog appears, naming the specific Job No.
    const dialog = page.getByRole('dialog', { name: 'Cancel Job' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(`${FIXTURE_TICKET_NO.replace('TK-', 'JOB-')}-01`);
    await expect(dialog).toContainText('This cancels only this Job. The Ticket and other Jobs keep their current status.');
    await expect(dialog.getByText('Cancel Reason')).toBeVisible();
    await expect(dialog.getByText('— Select Reason —')).toBeVisible(); // a select (react-aria), not a native combobox
    await expect(dialog.getByRole('button', { name: /Cancel Reason$/ })).toHaveCount(1);
    await expect(dialog.getByRole('textbox', { name: 'Remark' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Confirm Cancel' })).toBeVisible();
  });
});
