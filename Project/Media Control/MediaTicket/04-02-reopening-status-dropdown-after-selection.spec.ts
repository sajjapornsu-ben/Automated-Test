// เปิด dropdown สถานะซ้ำได้เรื่อยๆ 
// แม้ label จะเปลี่ยนไปตามค่าที่เลือกไว้ก่อนหน้า
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Re-opening the status dropdown after a selection', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const statusFilterGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by status' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Open the "All Status" dropdown and select "Assign".
    await statusFilterGroup.click();
    await page.getByRole('option', { name: 'Assign', exact: true }).click();
    await expect(statusFilterGroup).toHaveText(/Assign/);
    await expect(page.getByText('Assign (Head CG)').first()).toBeVisible();

    // 3. Open the status dropdown again (now showing "Assign" instead of "All Status")
    //    and select "Verify".
    await statusFilterGroup.click();
    await page.getByRole('option', { name: 'Verify', exact: true }).click();

    // The filter updates to show only Verify-status tickets.
    await expect(statusFilterGroup).toHaveText(/Verify/);
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByText('Verify (CG)').first()).toBeVisible();
    await expect(grid.getByText('Assign (Head CG)')).toHaveCount(0);
  });
});
