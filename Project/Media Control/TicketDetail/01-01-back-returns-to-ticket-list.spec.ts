// กดปุ่ม "Back" ในหน้า Ticket Detail แล้วต้องกลับไปหน้าลิสต์ Media Ticket
// spec: specs/ticket-detail-plan.md (1.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('Back', () => {
  test('Back returns to the Media Ticket list', async ({ page }) => {
    await login(page);

    // 1. Open the fixture ticket's detail page.
    await openTicketDetail(page, FIXTURE_TICKET_NO);
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();

    // 2. Click "Back".
    await page.getByRole('button', { name: 'Back' }).click();

    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);
  });
});
