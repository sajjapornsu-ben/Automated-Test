// เมื่อกาง job แล้ว คอลัมน์ Approve ต้องแยกสถานะอนุมัติของ CU (ลูกค้า) และ LL (ทีม LL) ออกจากกัน
// spec: specs/media-ticket-plan.md (10.5, PB-1822 AC13)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Requirement Recheck (PB-1822)', () => {
  test('Expanded job row shows CU and LL approval statuses separately', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstRow = grid.getByRole('rowheader').first().locator('xpath=ancestor::tr[1]');

    // 1. Navigate to Media Ticket. (done above)
    // 2. Expand a ticket row with at least one job.
    await firstRow.getByRole('button').first().click();

    // The job's Approve column shows two distinct labeled values, "CU" and "LL".
    const cuLabel = page.getByText('CU', { exact: true });
    const llLabel = page.getByText('LL', { exact: true });
    await expect(cuLabel).toBeVisible();
    await expect(llLabel).toBeVisible();

    // Each carries its own approval status badge next to it (not a single shared status).
    const cuStatus = cuLabel.locator('xpath=following-sibling::span[1]');
    const llStatus = llLabel.locator('xpath=following-sibling::span[1]');
    await expect(cuStatus).toBeVisible();
    await expect(llStatus).toBeVisible();
  });
});
