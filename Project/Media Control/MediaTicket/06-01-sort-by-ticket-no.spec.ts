// คลิกหัวคอลัมน์ "Ticket No" ลำดับแถวต้องเปลี่ยน และคลิกซ้ำต้องสลับกลับ
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Sorting', () => {
  test('Sort by Ticket No', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstTicketNo = () => grid.getByRole('rowheader').first().innerText();

    // 1. Navigate to Media Ticket. (done above)
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const before = await firstTicketNo();

    // 2. Click the "Ticket No" column header.
    await grid.getByRole('columnheader', { name: 'Ticket No' }).click();
    await page.waitForTimeout(400);
    const afterFirstClick = await firstTicketNo();

    // The row order changes.
    expect(afterFirstClick).not.toBe(before);

    // Clicking again toggles the sort direction back.
    await grid.getByRole('columnheader', { name: 'Ticket No' }).click();
    await page.waitForTimeout(400);
    const afterSecondClick = await firstTicketNo();
    expect(afterSecondClick).toBe(before);
  });
});
