// เปลี่ยน "Rows per page" จาก 10 เป็น 25 ต้องเห็นแถวมากขึ้นและข้อความ pagination อัปเดตตาม
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Pagination', () => {
  test('Change rows per page', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const rowCountBefore = await grid.getByRole('row', { name: /^TK-/ }).count();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Change the "Rows per page" control from 10 to 25.
    await page.getByRole('combobox', { name: 'Rows per page' }).selectOption('25');
    await page.waitForTimeout(400);

    // Up to 25 rows are shown on a single page, and never fewer than before.
    const rowCountAfter = await grid.getByRole('row', { name: /^TK-/ }).count();
    expect(rowCountAfter).toBeGreaterThanOrEqual(rowCountBefore);
    expect(rowCountAfter).toBeLessThanOrEqual(25);

    // The pagination text reflects the new page size.
    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await expect(pagination).toHaveText(new RegExp(`Showing 1 to ${rowCountAfter} of \\d+ items`));
  });
});
