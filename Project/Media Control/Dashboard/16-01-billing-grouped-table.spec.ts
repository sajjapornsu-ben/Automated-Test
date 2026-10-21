// แท็บ Billing ต้องแสดง "Showing N groups" และตารางมีคอลัมน์ No., สื่อ/Pack, สินค้า, Version, จำนวน Prove จริง/ที่เกิน, Rate / Prove, มูลค่า Prove ที่เกิน
// spec: specs/mediaapproval-dashboard-plan.md (16.1) — PB-2113 BR47 (สเปคย่อย PB-2117 — ไม่ได้แนบ)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportHeaders, reportRows, BILLING_COLUMNS } from './_helpers';

test.describe('Export Report — Billing tab', () => {
  test('Grouped table', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Billing');

    await expect(page.getByText(/Showing \d+ groups/)).toBeVisible();
    expect(await reportHeaders(page, 'Billing')).toEqual(BILLING_COLUMNS);
    expect(await reportCount(page)).toBeGreaterThan(0);
    expect(await reportRows(page, 'Billing').count()).toBeGreaterThan(0);
  });
});
