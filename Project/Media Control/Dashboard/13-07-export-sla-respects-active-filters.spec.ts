// กรอง Status แล้ว Export SLA ไฟล์ต้องมีเฉพาะแถวที่กรอง (จำนวนตรงกับ preview และทุกแถวมี Status ตามที่เลือก)
// spec: specs/mediaapproval-dashboard-plan.md (13.7) — PB-2113 BR45 (ไฟล์ตรงกับ preview ที่กรองไว้), BR46
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, exportReport, sheetRows, pickFirstFilterOptionWithResults } from './_helpers';

test.describe('Export Report — SLA tab', () => {
  test('Export respects the active filters', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    const { option, count } = await pickFirstFilterOptionWithResults(page, 'SLA', /Filter by status$/);
    const { wb } = await exportReport(page, 'SLA');

    const rows = sheetRows(wb, 'SLA Report');
    const statusCol = rows[0].indexOf('Status');
    expect(rows.length - 1).toBe(count);
    for (const r of rows.slice(1)) expect(r[statusCol]).toBe(option);
  });
});
