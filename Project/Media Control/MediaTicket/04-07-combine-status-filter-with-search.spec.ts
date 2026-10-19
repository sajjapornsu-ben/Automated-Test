// กรองสถานะ Assign แล้วค้นหาชื่อลูกค้าซ้อนไปด้วย 
// ผลลัพธ์ต้องเป็น AND ของทั้งสองเงื่อนไข
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Combine a status filter with a search term', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "Assign" status card.
    await page.getByTitle('Filter status: Assign', { exact: true }).click();
    await expect(grid.getByText('Assign (Head CG)').first()).toBeVisible();

    // 3. Type a client name into the search box that also has an Assign-status ticket.
    const firstRowHeader = grid.getByRole('rowheader').first();
    const firstRow = firstRowHeader.locator('xpath=ancestor::tr[1]');
    // gridcell(0)=expand, (1)=Quotation No., (2)=Client.
    const clientName = await firstRow.getByRole('gridcell').nth(2).innerText();

    await page.getByRole('textbox', { name: 'Search ticket, job, client,' }).fill(clientName);
    await page.waitForTimeout(600);

    // The table shows only rows that satisfy both the status filter AND the search term.
    await expect(grid.getByText('Assign (Head CG)').first()).toBeVisible();
    await expect(grid.getByText('Verify (CG)')).toHaveCount(0);
    const rowHeaders = await grid.getByRole('rowheader').all();
    expect(rowHeaders.length).toBeGreaterThan(0);
    for (const rowHeader of rowHeaders) {
      const row = rowHeader.locator('xpath=ancestor::tr[1]');
      await expect(row.getByRole('gridcell').nth(2)).toContainText(clientName);
    }
  });
});
