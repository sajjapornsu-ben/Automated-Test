// กด Export SLA แล้วต้องได้ไฟล์ SLA_Report_DDMMYYYY_HHmm.xlsx ชีต "SLA Report" 
// ที่หัวคอลัมน์ครบ จำนวนแถวตรงกับ "Showing N records" และมี dialog "Export Successful"
// spec: specs/mediaapproval-dashboard-plan.md (13.6) — PB-2113 BR45 (ไฟล์ตรงกับ preview), PB-2112 2.4 ข้อ 4
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, exportReport, sheetRows, SLA_COLUMNS } from './_helpers';

test.describe('Export Report — SLA tab', () => {
  test('Export SLA downloads a matching Excel file', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    const shown = await reportCount(page);
    const { filename, wb, dialogText } = await exportReport(page, 'SLA');

    expect(filename).toMatch(/^SLA_Report_\d{8}_\d{4}\.xlsx$/);
    expect(wb.SheetNames).toEqual(['SLA Report']);
    const rows = sheetRows(wb, 'SLA Report');
    expect(rows[0]).toEqual(SLA_COLUMNS);
    expect(rows.length - 1).toBe(shown);
    expect(dialogText).toBe(`Exported ${shown} records to Excel`);
  });
});
