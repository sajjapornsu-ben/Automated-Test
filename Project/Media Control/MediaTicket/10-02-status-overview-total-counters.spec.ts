// เช็คว่ามีตัวนับ "N tickets" และ "N jobs" รวมโชว์อยู่ด้านบน Status Overview ตอนเปิดหน้า
// spec: specs/media-ticket-plan.md (10.2, PB-1822 AC1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Requirement Recheck (PB-1822)', () => {
  test('Status Overview shows total Ticket and Job counters', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // 1. Navigate to Media Ticket. (done above)
    const ticketCounter = page.getByText(/^\d+ tickets$/);
    const jobCounter = page.getByText(/^\d+ jobs$/);

    await expect(ticketCounter).toBeVisible();
    await expect(jobCounter).toBeVisible();

    const ticketCount = parseInt((await ticketCounter.innerText()).match(/\d+/)![0], 10);
    const jobCount = parseInt((await jobCounter.innerText()).match(/\d+/)![0], 10);

    expect(ticketCount).toBeGreaterThanOrEqual(0);
    expect(jobCount).toBeGreaterThanOrEqual(0);
  });
});
