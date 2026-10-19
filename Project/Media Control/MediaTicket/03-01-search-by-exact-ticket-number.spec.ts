// พิมพ์เลขทิกเก็ตเต็มๆ ลงช่องค้นหา ต้องเหลือแค่ทิกเก็ตนั้นทิกเก็ตเดียว
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Search', () => {
  test('Search by exact ticket number returns that ticket', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Note a ticket number visible in the table.
    const ticketNo = await grid.getByRole('rowheader').first().innerText();

    // 3. Type that ticket number into the search box.
    await page.getByRole('textbox', { name: 'Search ticket, job, client,' }).fill(ticketNo);

    // The table updates to show only the row(s) matching that ticket number.
    await expect(grid.getByRole('link', { name: ticketNo, exact: true })).toBeVisible();
    await expect(grid.getByRole('link', { name: /^TK-/ })).toHaveCount(1);
  });
});
