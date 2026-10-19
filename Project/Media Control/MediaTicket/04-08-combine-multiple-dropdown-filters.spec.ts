// เลือก Status = Assign และ Head CG = Head CG - QA พร้อมกัน 
// ตารางต้องอัปเดตตามทั้งสองเงื่อนไข
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Combine multiple dropdown filters', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const statusFilterGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by status' }) });
    const headCgGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by Head CG' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Select a specific option in the "All Status" dropdown.
    await statusFilterGroup.click();
    await page.getByRole('option', { name: 'Assign', exact: true }).click();
    await expect(statusFilterGroup).toHaveText(/Assign/);

    // 3. Select a specific option in the "All Head CG" dropdown.
    await headCgGroup.click();
    await page.getByRole('option', { name: 'Head CG - QA', exact: true }).click();
    await expect(headCgGroup).toHaveText(/Head CG - QA/);

    // The table only shows tickets/jobs matching both selected filters simultaneously.
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.or(page.getByText('No tickets found').first())).toBeVisible();
    await expect(grid.getByText('Verify (CG)')).toHaveCount(0);
  });
});
