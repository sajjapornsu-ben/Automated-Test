// คลิกการ์ดสถานะ (เช่น Review (Sale)) การ์ดต้องเป็น pressed และต้องมีชิป "Filter: <สถานะ>" โผล่ขึ้นมา
// spec: specs/mediaapproval-dashboard-plan.md (9.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, statusCard, filterChip } from './_helpers';

test.describe('Jobs by Status', () => {
  test('Clicking a status card selects it', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(filterChip(page)).toHaveCount(0);
    await expect(statusCard(page, 'Review (Sale)')).toHaveAttribute('aria-pressed', 'false');

    await statusCard(page, 'Review (Sale)').click();

    await expect(statusCard(page, 'Review (Sale)')).toHaveAttribute('aria-pressed', 'true');
    await expect(filterChip(page)).toHaveText('Filter: Review (Sale)');
  });
});
