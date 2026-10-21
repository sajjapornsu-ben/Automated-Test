// กดชิป "Filter: …" ต้องล้างตัวกรองสถานะ และการกดการ์ดสถานะเดิมซ้ำอีกครั้งก็ต้องปิดตัวกรองเช่นกัน
// spec: specs/mediaapproval-dashboard-plan.md (9.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, statusCard, filterChip } from './_helpers';

test.describe('Jobs by Status', () => {
  test('Clicking the filter chip or the card again clears it', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const card = statusCard(page, 'Review (Sale)');

    // Chip click clears.
    await card.click();
    await expect(filterChip(page)).toBeVisible();
    await filterChip(page).click();
    await expect(filterChip(page)).toHaveCount(0);
    await expect(card).toHaveAttribute('aria-pressed', 'false');

    // Clicking the same card twice toggles it back off.
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await expect(filterChip(page)).toHaveCount(0);
  });
});
