// กด Export Transaction แล้วต้องได้ Transaction_Report_DDMMYYYY_HHmm.xlsx ชีต "Transaction Report" 27 หัวคอลัมน์ จำนวนแถวตรงกับ "Showing N records"
// spec: specs/mediaapproval-dashboard-plan.md (14.5) — PB-2113 BR45
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, exportReport, sheetRows, TRANSACTION_COLUMNS } from './_helpers';

test.describe('Export Report — Transaction tab', () => {
  test('Export Transaction downloads a matching file', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Transaction');

    const shown = await reportCount(page);
    const { filename, wb, dialogText } = await exportReport(page, 'Transaction');

    expect(filename).toMatch(/^Transaction_Report_\d{8}_\d{4}\.xlsx$/);
    expect(wb.SheetNames).toEqual(['Transaction Report']);
    const rows = sheetRows(wb, 'Transaction Report');
    expect(rows[0]).toEqual(TRANSACTION_COLUMNS);
    expect(rows.length - 1).toBe(shown);
    expect(dialogText).toBe(`Exported ${shown} records to Excel`);
  });
});
