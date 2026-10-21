// ตัวกรอง Status / Media / Graphic ในแท็บ Billing ต้องใช้ตัวเลือกชุดเดียวกับแท็บ SLA และเมื่อเลือกแล้วจำนวน groups ต้องไม่เกินเดิม
// spec: specs/mediaapproval-dashboard-plan.md (16.2) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportFilterOptions, pickReportFilter } from './_helpers';

test.describe('Export Report — Billing tab', () => {
  test('Filters change the group count', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await openReportTab(page, 'SLA');
    const slaStatus = await reportFilterOptions(page, 'SLA', /Filter by status$/);
    const slaMedia = await reportFilterOptions(page, 'SLA', /Filter by media$/);

    await openReportTab(page, 'Billing');
    expect(await reportFilterOptions(page, 'Billing', /Filter by status$/)).toEqual(slaStatus);
    expect(await reportFilterOptions(page, 'Billing', /Filter by media$/)).toEqual(slaMedia);

    const all = await reportCount(page);
    await pickReportFilter(page, 'Billing', /Filter by graphic$/, 'CG - QA 2');
    expect(await reportCount(page)).toBeLessThanOrEqual(all);

    await pickReportFilter(page, 'Billing', /Filter by graphic$/, 'All Graphics');
    await expect.poll(() => reportCount(page)).toBe(all);
  });
});
