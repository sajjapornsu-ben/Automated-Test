// กด Export Airtime แล้วต้องได้ Airtime_Report_DDMMYYYY_HHmm.xlsx ชีต "Airtime Report" 27 หัวคอลัมน์ จำนวนแถวตรงกับ "Showing N records"
// spec: specs/mediaapproval-dashboard-plan.md (15.3) — PB-2113 BR45
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, exportReport, sheetRows, TRANSACTION_COLUMNS } from './_helpers';

test.describe('Export Report — Airtime tab', () => {
  test('Export Airtime downloads a matching file', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Airtime');

    const shown = await reportCount(page);
    const { filename, wb, dialogText } = await exportReport(page, 'Airtime');

    expect(filename).toMatch(/^Airtime_Report_\d{8}_\d{4}\.xlsx$/);
    expect(wb.SheetNames).toEqual(['Airtime Report']);
    const rows = sheetRows(wb, 'Airtime Report');
    expect(rows[0]).toEqual(TRANSACTION_COLUMNS);
    expect(rows.length - 1).toBe(shown);
    expect(dialogText).toBe(`Exported ${shown} records to Excel`);
  });
});
