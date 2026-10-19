// เลือกตัวกรอง Media Type แล้ว label ต้องเปลี่ยนตาม และตารางต้องอัปเดต (มีผลลัพธ์ หรือขึ้น empty state)
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Filter by Media Type', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const mediaTypeGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by media type' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "All Media Types" filter control.
    await mediaTypeGroup.click();
    // 3. Select a specific media type option from the list.
    await page.getByRole('option', { name: 'Office LCD', exact: true }).click();

    await expect(mediaTypeGroup).toHaveText(/Office LCD/);
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.or(page.getByText('No tickets found').first())).toBeVisible();
  });
});
