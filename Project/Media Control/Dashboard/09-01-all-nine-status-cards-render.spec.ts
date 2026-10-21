// การ์ด Jobs by Status ต้องครบ 9 สถานะ (Assign ถึง Done) แต่ละใบมีจำนวน ≥ 0
// spec: specs/mediaapproval-dashboard-plan.md (9.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, statusCount, statusCard, STATUS_NAMES } from './_helpers';

test.describe('Jobs by Status', () => {
  test('All 9 status cards render', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    expect(STATUS_NAMES).toHaveLength(9);
    for (const name of STATUS_NAMES) {
      await expect(statusCard(page, name), name).toBeVisible();
      expect(await statusCount(page, name), name).toBeGreaterThanOrEqual(0);
    }
  });
});
