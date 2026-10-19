// พิมพ์ชื่อลูกค้าลงช่องค้นหา ทิกเก็ตที่เหลือทุกแถวต้องเป็นของลูกค้าคนนั้น
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Search', () => {
  test('Search by client name returns matching tickets', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstRowHeader = grid.getByRole('rowheader').first();
    await expect(firstRowHeader).toBeVisible();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Note a client name visible in the table (Client column).
    // Note: gridcell(0) is the row-expand button, so Client (the 2nd data column
    // after Ticket No) is gridcell(2): [0]=expand, [1]=Quotation No., [2]=Client.
    const firstRow = firstRowHeader.locator('xpath=ancestor::tr[1]');
    const clientName = await firstRow.getByRole('gridcell').nth(2).innerText();

    // 3. Type that client name into the search box.
    await page.getByRole('textbox', { name: 'Search ticket, job, client,' }).fill(clientName);
    await expect(grid.getByText(clientName).first()).toBeVisible();
    // Let the debounced filter request settle so the row list stops changing mid-assertion.
    await page.waitForTimeout(600);

    // Every remaining ticket row's Client column matches the search term.
    const rowHeaders = await grid.getByRole('rowheader').all();
    expect(rowHeaders.length).toBeGreaterThan(0);
    for (const rowHeader of rowHeaders) {
      const row = rowHeader.locator('xpath=ancestor::tr[1]');
      await expect(row.getByRole('gridcell').nth(2)).toContainText(clientName);
    }
  });
});
