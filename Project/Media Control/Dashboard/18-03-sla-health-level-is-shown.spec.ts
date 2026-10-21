// [spec PB-2112] การ์ด SLA ต้องแสดงระดับสุขภาพ ดี (≥90%) / เฝ้าระวัง (80–89%) / เสี่ยง (<80%) — หน้าจริงไม่มี label นี้ จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.3) — PB-2112 BR26, AC14
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaCard } from './_helpers';

const level = (pct: number) => (pct >= 90 ? 'ดี' : pct >= 80 ? 'เฝ้าระวัง' : 'เสี่ยง');

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('SLA cards show the health level for their on-track %', async ({ page }) => {
    test.fail(true, 'PB-2112 BR26: cards should show ดี / เฝ้าระวัง / เสี่ยง; the cards show only "%" and "N overdue of M" (observed 2026-10-21)');

    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    for (const metric of ['Feedback', 'Progress'] as const) {
      const { pct, card } = await slaCard(page, metric);
      await expect(card).toContainText(level(pct), { timeout: 3000 });
    }
  });
});
