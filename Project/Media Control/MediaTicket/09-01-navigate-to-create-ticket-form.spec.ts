// คลิก "Create Ticket" ต้องพาไปหน้าฟอร์มสร้างทิกเก็ตใหม่
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Create Ticket', () => {
  test('Navigate to the create-ticket form', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "Create Ticket" link/button.
    await page.getByRole('link', { name: 'Create Ticket' }).click();

    // The browser navigates to the create-ticket form.
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/create$/);
  });
});
