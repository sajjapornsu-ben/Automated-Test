// พิมพ์คำค้นหาที่ไม่มีจริง ต้องขึ้นข้อความ "No tickets found"
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Search', () => {
  test('Search with no matches shows an empty state', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // 1. Navigate to Media Ticket. (done above)
    // 2. Type an arbitrary string that cannot match any ticket, job, or client.
    await page.getByRole('textbox', { name: 'Search ticket, job, client,' }).fill('ZZZZZ-NO-MATCH-99999');

    await expect(page.getByText('No tickets found').first()).toBeVisible();
    await expect(page.getByText('Try adjusting your filters').first()).toBeVisible();
  });
});
