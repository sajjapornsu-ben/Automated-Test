// เปิด dropdown "All Status" แล้วเลือก Assign 
// ต้องเปลี่ยน label และกรองตารางเหมือนคลิกการ์ด
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Filter by status via the "All Status" dropdown', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const statusFilterGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by status' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "All Status" filter control.
    await statusFilterGroup.click();
    // 3. Select "Assign" from the option list.
    await page.getByRole('option', { name: 'Assign', exact: true }).click();

    // The dropdown's visible label changes from "All Status" to "Assign".
    await expect(statusFilterGroup).toHaveText(/Assign/);
    // The table shows only tickets in Assign status.
    await expect(page.getByText('Assign (Head CG)').first()).toBeVisible();
  });
});
