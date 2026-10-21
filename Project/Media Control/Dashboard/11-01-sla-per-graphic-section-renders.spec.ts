// (Head CG) SLA per Graphic ต้องมี dropdown เลือกบุคคล "Everyone (Average)", ตัวเลือก Month/Year เท่านั้น (ไม่มีรายวัน), การ์ด Feedback/Progress SLA และกราฟ trend
// spec: specs/mediaapproval-dashboard-plan.md (11.1) — PB-2112 SLA per Graphic #1-3, BR28, BR31, BR36
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaSection, slaCard, slaScopeText, waitForSlaLoaded } from './_helpers';

test.describe('SLA per Graphic', () => {
  test('Section renders (Head CG)', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await waitForSlaLoaded(page);

    const sla = slaSection(page);
    expect(await slaScopeText(page)).toBe('Everyone (Average)');
    await expect(sla.getByRole('group').first()).toContainText('Everyone (Average)');

    // Only Month and Year — no daily option (BR28).
    await expect(sla.locator('.sla-period-chip')).toHaveText(['Month', 'Year']);

    await expect(sla).toContainText('Click a card to filter the line in the chart');
    for (const metric of ['Feedback', 'Progress'] as const) {
      const card = await slaCard(page, metric);
      expect(card.pct).toBeGreaterThanOrEqual(0);
      expect(card.pct).toBeLessThanOrEqual(100);
      expect(card.total).toBeGreaterThanOrEqual(card.overdue);
    }
    await expect(sla.locator('svg').last()).toBeVisible();
  });
});
