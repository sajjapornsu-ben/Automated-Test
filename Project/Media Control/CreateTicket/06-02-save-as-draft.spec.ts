// กรอกแค่ Ticket Header แล้วกด "Save as draft" ต้องบันทึกเป็น Draft (ไม่ส่งเข้า Assign) และพากลับไปหน้าลิสต์
// spec: specs/create-ticket-plan.md (6.2, PB-1861)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้ save ticket จริงบน UAT (ได้รับอนุมัติจากผู้ใช้แล้ว)
// เทสนี้ถูก skip by default (สร้าง record จริงบน UAT) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('Submit & Save as Draft', () => {
  test('Save as Draft keeps the ticket editable and unsent', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');

    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const clientName = `QA Test Client ${Date.now()}`;

    // 1. Fill the Ticket Header only (no Job yet).
    await fillTicketHeader(page, { client: clientName, product: 'QA Draft Product' });

    // 2. Click "Save as draft".
    await page.getByRole('button', { name: 'Save as draft' }).click();

    // The ticket is saved with Draft status and is not sent for Assign.
    await expect(page.getByRole('heading', { name: 'Draft saved successfully' })).toBeVisible();
    await expect(page.getByText('The Ticket has been saved as a Draft')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // Redirects back to the Media Ticket list, where the new draft ticket is visible.
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);
    await expect(page.getByText(clientName).first()).toBeVisible();
  });
});
