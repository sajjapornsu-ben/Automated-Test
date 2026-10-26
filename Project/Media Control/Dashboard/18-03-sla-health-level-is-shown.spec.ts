// การ์ด SLA (Feedback / Progress) ต้องแสดงเปอร์เซ็นต์ on-track และจำนวน overdue — ทีมยืนยันแล้วว่าไม่ต้องมี label ระดับ ดี / เฝ้าระวัง / เสี่ยง
// spec: specs/mediaapproval-dashboard-plan.md (18.3) — PB-2112 BR26, AC14
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaCard } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('SLA cards show the on-track % and the overdue count', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    for (const metric of ['Feedback', 'Progress'] as const) {
      const { card } = await slaCard(page, metric);
      await expect(card, metric).toContainText(/\d+(\.\d+)?%/);
      await expect(card, metric).toContainText(/\d+ overdue of \d+/);
    }
  });
});
