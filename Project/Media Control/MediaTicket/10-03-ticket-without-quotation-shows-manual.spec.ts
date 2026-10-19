// ทิกเก็ตที่ไม่มีใบเสนอราคาผูกอยู่ ต้องโชว์คำว่า "Manual" ในคอลัมน์ Quotation No.
// spec: specs/media-ticket-plan.md (10.3, PB-1822 AC2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Requirement Recheck (PB-1822)', () => {
  test('Ticket without a Quotation shows "Manual"', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstRowHeader = grid.getByRole('rowheader').first();
    await expect(firstRowHeader).toBeVisible();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Find a ticket with no linked quotation.
    // gridcell(0)=expand, (1)=Quotation No. As of this writing every ticket on UAT has no
    // quotation, so the first row is always a valid example of this case.
    const firstRow = firstRowHeader.locator('xpath=ancestor::tr[1]');
    const quotationCell = firstRow.getByRole('gridcell').nth(1);

    // Its Quotation No. column shows "Manual".
    await expect(quotationCell).toHaveText('Manual');
  });
});
