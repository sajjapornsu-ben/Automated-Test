// การ์ด KPI ใน Overview & Status ต้องครบ 8 ใบ แต่ละใบมีตัวเลขจำนวนเต็ม ≥ 0 และข้อความกำกับ (caption) ที่ถูกต้อง
// spec: specs/mediaapproval-dashboard-plan.md (4.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiCard, KPI_LABELS, KPI_CAPTIONS } from './_helpers';

test.describe('Overview & Status', () => {
  test('All 8 KPI cards render', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(page.getByRole('heading', { name: 'Overview & Status', exact: true })).toBeVisible();

    for (const label of KPI_LABELS) {
      const card = await kpiCard(page, label);
      expect(Number.isInteger(card.value), `${label} value`).toBe(true);
      expect(card.value, `${label} value`).toBeGreaterThanOrEqual(0);
      expect(card.caption, `${label} caption`).toBe(KPI_CAPTIONS[label]);
    }
  });
});
