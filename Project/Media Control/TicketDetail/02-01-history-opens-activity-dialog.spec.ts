// กดปุ่ม "History" แล้วต้องเปิด dialog "Activity History" ที่มี log กิจกรรมอย่างน้อย 1 รายการ
// spec: specs/ticket-detail-plan.md (2.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('View History', () => {
  test('History opens the Activity History dialog', async ({ page }) => {
    await login(page);

    // 1. Open the fixture ticket's detail page.
    await openTicketDetail(page, FIXTURE_TICKET_NO);

    // 2. Click "History".
    await page.getByRole('button', { name: 'History' }).click();

    // A dialog titled "Activity History" appears with at least one activity entry.
    const dialog = page.getByRole('dialog', { name: 'Activity History' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('สร้าง Ticket');
  });
});
