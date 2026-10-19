// คลิกการ์ด Assign แล้วคลิก Verify ต่อ ต้องเหลือแค่ Verify (แทนที่ ไม่รวมกัน)
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Status Overview Quick Filters', () => {
  test('Switching between status cards replaces the filter (single-select)', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    // 1. Navigate to Media Ticket. (done above)
    // 2. Click the "Assign" status card.
    await page.getByTitle('Filter status: Assign', { exact: true }).click();
    await expect(page.getByText('Assign (Head CG)').first()).toBeVisible();

    // 3. Click the "Verify" status card.
    await page.getByTitle('Filter status: Verify', { exact: true }).click();

    // After step 3, the table shows only Verify-status results — Assign results are gone.
    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByText('Verify (CG)').first()).toBeVisible();
    await expect(grid.getByText('Assign (Head CG)')).toHaveCount(0);
  });
});
