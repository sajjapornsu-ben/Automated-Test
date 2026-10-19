// เลือกตัวกรอง Media Group แล้วทุกแถวที่เหลือต้องอยู่ใน Media Group นั้น (คอลัมน์นี้โชว์ในตารางจริง)
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Dropdown Filters', () => {
  test('Filter by Media Group', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // The button's full accessible name is "All Media Groups Filter by media" (label text +
    // aria-label). Anchor the regex to the end so it doesn't also match the Media Type
    // button, whose accessible name ends with "...Filter by media type".
    const mediaGroupFilter = page.getByRole('group').filter({ has: page.getByRole('button', { name: /Filter by media$/ }) });
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "All Media Groups" filter control.
    await mediaGroupFilter.click();
    // 3. Select a specific media group option from the list.
    await page.getByRole('option', { name: 'Airport', exact: true }).click();
    await expect(mediaGroupFilter).toHaveText(/Airport/);

    const noResults = page.getByText('No tickets found').first();
    if (await noResults.isVisible().catch(() => false)) {
      test.skip(true, 'No tickets currently belong to the "Airport" media group on UAT.');
    }

    // The table shows only tickets whose Media Group column matches the selection.
    // gridcell(0)=expand, (1)=Quotation No., (2)=Client, (3)=Media Group.
    const rowHeaders = await grid.getByRole('rowheader').all();
    expect(rowHeaders.length).toBeGreaterThan(0);
    for (const rowHeader of rowHeaders) {
      const row = rowHeader.locator('xpath=ancestor::tr[1]');
      await expect(row.getByRole('gridcell').nth(3)).toContainText('Airport');
    }
  });
});
