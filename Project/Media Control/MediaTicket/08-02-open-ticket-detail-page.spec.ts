// คลิกลิงก์เลขทิกเก็ต ต้องพาไปหน้ารายละเอียดของทิกเก็ตนั้น
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Ticket & Job Details', () => {
  test("Open a ticket's detail page", async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstRowHeader = grid.getByRole('rowheader').first();
    await expect(firstRowHeader).toBeVisible();
    const ticketNo = await firstRowHeader.innerText();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click a ticket number link in the table.
    await grid.getByRole('link', { name: ticketNo, exact: true }).click();

    // The browser navigates to the ticket's detail page.
    await expect(page).toHaveURL(new RegExp(`/mediaApproval/mediaTicket/${ticketNo}$`));
  });
});
