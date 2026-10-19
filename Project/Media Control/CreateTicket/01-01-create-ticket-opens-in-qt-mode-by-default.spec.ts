// เปิดหน้า Create Ticket ครั้งแรก ต้องเริ่มที่โหมด QT (No Quotation Number ปิดอยู่) ไม่โชว์ฟอร์ม header
// spec: specs/create-ticket-plan.md (1.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket } from './_helpers';

test.describe('Entry & Mode Switching', () => {
  test('Create Ticket opens in QT mode by default', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);

    // 1. Navigate to Media Ticket, click "Create Ticket".
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/create$/);

    // The "No Quotation Number" switch is visible (its OFF/QT-mode state is verified
    // behaviorally below, since the toggle exposes no accessible checked/state attribute).
    await expect(page.getByRole('button', { name: 'No Quotation Number' })).toBeVisible();

    // Only the QT search box is visible; no Manual-mode banner, no header fields yet.
    await expect(page.getByText('Manual entry mode')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Enter client name...' })).toHaveCount(0);
    await expect(page.getByText('No Jobs yet')).toBeVisible();
  });
});
