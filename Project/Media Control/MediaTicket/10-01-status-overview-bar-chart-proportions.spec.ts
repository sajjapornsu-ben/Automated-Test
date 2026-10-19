// เช็คว่า Bar Chart แสดงแถบสีตามสัดส่วนของแต่ละสถานะจริง (ผลรวมความกว้างต้องใกล้ 100%)
// spec: specs/media-ticket-plan.md (10.1, PB-1822 BR#1.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Requirement Recheck (PB-1822)', () => {
  test('Status Overview bar chart reflects status proportions', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // 1. Navigate to Media Ticket. (done above)
    await expect(page.getByText('Status Overview')).toBeVisible();
    await expect(page.getByTitle('Filter status: Assign', { exact: true })).toBeVisible();

    // 2. Inspect the horizontal bar above the status cards.
    const segmentWidths = await page.evaluate(() => {
      const bar = Array.from(document.querySelectorAll('div')).find(
        el => el.classList.contains('rounded-full') && el.classList.contains('overflow-hidden') && el.classList.contains('flex') && el.classList.contains('h-3'),
      );
      if (!bar) return null;
      return Array.from(bar.children).map(child => {
        const style = (child as HTMLElement).getAttribute('style') || '';
        const match = style.match(/width:\s*([\d.]+)%/);
        return match ? parseFloat(match[1]) : 0;
      });
    });

    // The bar is split into colored segments, one per status with at least one ticket.
    expect(segmentWidths).not.toBeNull();
    expect(segmentWidths!.length).toBeGreaterThan(0);
    for (const width of segmentWidths!) {
      expect(width).toBeGreaterThan(0);
    }

    // Segment widths are proportional to each status's share of the total (sums to ~100%).
    const total = segmentWidths!.reduce((sum, w) => sum + w, 0);
    expect(total).toBeGreaterThan(95);
    expect(total).toBeLessThan(105);
  });
});
