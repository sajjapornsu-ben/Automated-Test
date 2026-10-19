// เคลียร์ช่องค้นหาหลังพิมพ์คำค้น ตารางต้องกลับไปแสดงรายการทั้งหมดเหมือนเดิม
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Search', () => {
  test('Clearing the search restores the full list', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });

    // 1. Navigate to Media Ticket. (done above)
    // Wait for the table to finish its initial load before taking the baseline row count.
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const defaultRowCount = await grid.getByRole('row').count();

    // 2. Type any search term that filters the table down.
    const search = page.getByRole('textbox', { name: 'Search ticket, job, client,' });
    await search.fill('ZZZZZ-NO-MATCH-99999');
    await expect(page.getByText('No tickets found').first()).toBeVisible();

    // 3. Clear the search box completely.
    await search.fill('');

    // The table returns to showing the default unfiltered list.
    await expect(grid.getByRole('row')).toHaveCount(defaultRowCount);
  });
});
