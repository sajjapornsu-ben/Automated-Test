// คลิกปุ่ม expand ที่แถวทิกเก็ต ต้องเห็นแถวรายละเอียด job โผล่มา และคลิกซ้ำต้องยุบกลับ
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Ticket & Job Details', () => {
  test('Expand a ticket row to view its jobs', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();

    const firstRowHeader = grid.getByRole('rowheader').first();
    const firstRow = firstRowHeader.locator('xpath=ancestor::tr[1]');
    const expandButton = firstRow.getByRole('button').first();

    const rowCountBefore = await grid.getByRole('row').count();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the expand icon/button in the first column of a ticket row.
    await expandButton.click();
    await page.waitForTimeout(400);

    // A nested row appears beneath the ticket showing its job(s).
    const rowCountAfterExpand = await grid.getByRole('row').count();
    expect(rowCountAfterExpand).toBeGreaterThan(rowCountBefore);
    await expect(grid.getByText('Job No').first()).toBeVisible();

    // Clicking the expand icon again collapses the job row.
    await expandButton.click();
    await page.waitForTimeout(400);
    const rowCountAfterCollapse = await grid.getByRole('row').count();
    expect(rowCountAfterCollapse).toBe(rowCountBefore);
  });
});
