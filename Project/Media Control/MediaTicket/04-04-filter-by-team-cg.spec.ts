// เลือกตัวกรอง Team CG แล้ว label ต้องเปลี่ยนตาม 
// และตารางต้องอัปเดต (มีผลลัพธ์ หรือขึ้น empty state)
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Filter by Team CG', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const teamCgGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by Team CG' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "All Team CG" filter control.
    await teamCgGroup.click();
    // 3. Select a specific Team CG option from the list.
    await page.getByRole('option', { name: 'CG - QA 2', exact: true }).click();

    // The dropdown label updates to the selected Team CG.
    await expect(teamCgGroup).toHaveText(/CG - QA 2/);
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.or(page.getByText('No tickets found').first())).toBeVisible();
  });
});
