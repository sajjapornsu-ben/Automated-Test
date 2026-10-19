// คลิก Next ในหน้าตาราง ต้องเห็นทิกเก็ตชุดถัดไปและข้อความ pagination อัปเดต
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Pagination', () => {
  test('Navigate to the next page', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const pagination = page.getByRole('navigation', { name: 'Pagination' });

    // 1. Navigate to Media Ticket (ensure there is more than one page of results).
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const nextButton = pagination.getByRole('button', { name: 'Next' });
    test.skip(await nextButton.isDisabled(), 'Fewer than 11 tickets on UAT — only one page of results.');

    const firstTicketBefore = await grid.getByRole('rowheader').first().innerText();
    const paginationTextBefore = await pagination.innerText();

    // 2. Click "Next" in the pagination controls.
    await nextButton.click();
    await page.waitForTimeout(400);

    // The table shows the next set of tickets and the pagination text updates.
    const firstTicketAfter = await grid.getByRole('rowheader').first().innerText();
    expect(firstTicketAfter).not.toBe(firstTicketBefore);
    const paginationTextAfter = await pagination.innerText();
    expect(paginationTextAfter).not.toBe(paginationTextBefore);

    // The "Prev" button becomes enabled.
    await expect(pagination.getByRole('button', { name: 'Prev' })).toBeEnabled();
  });
});
