// เลือกตัวกรอง Head CG แล้ว label ต้องเปลี่ยนตาม 
// และตารางต้องอัปเดต (มีผลลัพธ์ หรือขึ้น empty state)
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Filter by Head CG', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const headCgGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by Head CG' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "All Head CG" filter control.
    await headCgGroup.click();
    // 3. Select a specific Head CG option from the list.
    await page.getByRole('option', { name: 'Head CG - QA', exact: true }).click();

    // The dropdown label updates to the selected Head CG.
    await expect(headCgGroup).toHaveText(/Head CG - QA/);
    // The table updates without erroring: either shows rows or the empty state.
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.or(page.getByText('No tickets found').first())).toBeVisible();
  });
});
