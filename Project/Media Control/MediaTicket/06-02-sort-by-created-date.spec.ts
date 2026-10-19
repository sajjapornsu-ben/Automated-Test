// คลิกหัวคอลัมน์ "Created Date" ลำดับแถวต้องเปลี่ยน และคลิกซ้ำต้องสลับกลับ
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Sorting', () => {
  test('Sort by Created Date', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstTicketNo = () => grid.getByRole('rowheader').first().innerText();

    // 1. Navigate to Media Ticket. (done above)
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const before = await firstTicketNo();

    // 2. Click the "Created Date" column header.
    await grid.getByRole('columnheader', { name: 'Created Date' }).click();
    await page.waitForTimeout(400);
    const afterFirstClick = await firstTicketNo();

    // The row order changes based on ticket creation date.
    expect(afterFirstClick).not.toBe(before);

    // Clicking again toggles direction.
    await grid.getByRole('columnheader', { name: 'Created Date' }).click();
    await page.waitForTimeout(400);
    const afterSecondClick = await firstTicketNo();
    expect(afterSecondClick).toBe(before);
  });
});
