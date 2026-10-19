// คลิกการ์ด "Assign" แล้วตารางกรองเหลือเฉพาะสถานะ Assign
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Status Overview Quick Filters', () => {
  test('Filter by clicking a status card', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // 1. Navigate to Media Ticket. (done above)
    // 2. Note the ticket count shown on the "Assign" status card.
    // 3. Click the "Assign" status card.
    await page.getByTitle('Filter status: Assign', { exact: true }).click();

    // Every visible job status badge in the table reads "Assign (Head CG)".
    await expect(page.getByText('Assign (Head CG)').first()).toBeVisible();
    const statusBadges = page.getByRole('grid', { name: 'Media Ticket List Table' }).getByText(/^(Assign \(Head CG\)|Assign)$/);
    const otherStatuses = await page
      .getByRole('grid', { name: 'Media Ticket List Table' })
      .getByText(/^(Verify \(CG\)|Review \(Sale\)|Revise|Done|Cancelled)/)
      .count();
    expect(await statusBadges.count()).toBeGreaterThan(0);
    expect(otherStatuses).toBe(0);
  });
});
