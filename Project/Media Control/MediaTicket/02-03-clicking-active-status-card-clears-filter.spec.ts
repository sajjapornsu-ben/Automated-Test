// คลิกการ์ดที่ active อยู่ซ้ำ ต้องเคลียร์ filter กลับเป็นค่าเริ่มต้น
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Status Overview Quick Filters', () => {
  test('Clicking the active status card again clears the filter', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });

    // 1. Navigate to Media Ticket. (done above)
    // Wait for the table to finish its initial load before taking the baseline row count.
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const defaultRowCount = await grid.getByRole('row').count();

    // 2. Click the "Verify" status card (it becomes the active filter).
    await page.getByTitle('Filter status: Verify', { exact: true }).click();
    await expect(grid.getByText('Verify (CG)').first()).toBeVisible();

    // 3. Click the "Verify" status card again.
    await page.getByTitle('Filter status: Verify', { exact: true }).click();

    // The filter is cleared and the table returns to the default unfiltered view.
    await expect(grid.getByRole('row')).toHaveCount(defaultRowCount);
  });
});
