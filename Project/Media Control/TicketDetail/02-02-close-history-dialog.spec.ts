// เปิด dialog "Activity History" แล้วกดปิด ต้องหายไปและหน้า Ticket Detail ไม่ได้รับผลกระทบ
// spec: specs/ticket-detail-plan.md (2.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('View History', () => {
  test('Closing the Activity History dialog', async ({ page }) => {
    await login(page);
    await openTicketDetail(page, FIXTURE_TICKET_NO);

    await page.getByRole('button', { name: 'History' }).click();
    const dialog = page.getByRole('dialog', { name: 'Activity History' });
    await expect(dialog).toBeVisible();

    // 1. Click the dialog's close button (the icon-only button, first inside the dialog).
    await dialog.getByRole('button').first().click();

    // The dialog is no longer visible; the ticket detail page underneath is unaffected.
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
