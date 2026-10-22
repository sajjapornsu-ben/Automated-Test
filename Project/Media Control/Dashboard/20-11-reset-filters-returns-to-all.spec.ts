// หลังกรอง Status/Media/วันที่ แล้วเคลียร์กลับเป็น All และล้างวันที่ จำนวนแถวต้องกลับมาเท่าตอนไม่กรอง
// test-case: SLA-H06 — แผน: specs/mediaapproval-dashboard-plan.md (20.11)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, pickReportFilter, pickReportDate, reportPanel } from './_helpers';
import { goToReport, fetchAll } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H06 clearing every filter restores the full list', { tag: ['@happy'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');
    const { rows } = await fetchAll(page, 'sla');
    await expect.poll(() => reportCount(page)).toBe(rows.length);

    await pickReportFilter(page, 'SLA', /Filter by status$/, 'Final Approve');
    await pickReportDate(page, 'SLA', 'From', 2026, 9, 19);
    await expect.poll(() => reportCount(page)).toBeLessThan(rows.length);

    await pickReportFilter(page, 'SLA', /Filter by status$/, 'All Status');
    await reportPanel(page, 'SLA').getByRole('button', { name: 'Clear date', exact: true }).first().click();
    await expect.poll(() => reportCount(page)).toBe(rows.length);
  });
});
