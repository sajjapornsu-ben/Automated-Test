// แท็บ Airtime ต้องมี 27 คอลัมน์เหมือน Transaction แต่ "หนึ่งแถวต่อ job" จึงมีจำนวนแถวไม่เกินของ Transaction (หนึ่งแถวต่อ Format)
// spec: specs/mediaapproval-dashboard-plan.md (15.1) — PB-2113 BR47 (สเปคย่อย PB-2115 — ไม่ได้แนบ)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportHeaders, TRANSACTION_COLUMNS } from './_helpers';

test.describe('Export Report — Airtime tab', () => {
  test('One row per job with the same 27 columns', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await openReportTab(page, 'Transaction');
    const perFormat = await reportCount(page);

    await openReportTab(page, 'Airtime');
    const perJob = await reportCount(page);

    expect(await reportHeaders(page, 'Airtime')).toEqual(TRANSACTION_COLUMNS);
    expect(perJob).toBeGreaterThan(0);
    expect(perJob).toBeLessThanOrEqual(perFormat);
  });
});
