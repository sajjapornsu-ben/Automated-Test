// กด Export Billing แล้วต้องได้ไฟล์ "ค่าใช้จ่าย Prove เกิน ..." 2 ชีต (สรุป / รายละเอียด Prove) และข้อความใน dialog ต้องตรงกับจำนวนแถวจริงของทั้งสองชีต
// spec: specs/mediaapproval-dashboard-plan.md (16.3) — PB-2113 BR45; คำอธิบายแท็บ: "exports 2 sheets"
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, exportReport, sheetRows, BILLING_COLUMNS } from './_helpers';

test.describe('Export Report — Billing tab', () => {
  test('Export Billing downloads a 2-sheet file', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Billing');

    const groups = await reportCount(page);
    const { filename, wb, dialogText } = await exportReport(page, 'Billing');

    expect(filename).toMatch(/^ค่าใช้จ่าย Prove เกิน \d{2} [A-Z][a-z]{2} \d{2}\.xlsx$/);
    expect(wb.SheetNames).toEqual(['สรุป', 'รายละเอียด Prove']);

    const summary = sheetRows(wb, 'สรุป');
    const detail = sheetRows(wb, 'รายละเอียด Prove');
    expect(summary[0]).toEqual(BILLING_COLUMNS);
    // One summary row per group, plus (at most) a total row below them.
    expect(summary.length - 1).toBeGreaterThanOrEqual(groups);

    const detailRows = detail.length - 1;
    expect(dialogText).toBe(`Exported ${groups} groups to Excel (sheet สรุป) · ${detailRows} Prove rows in sheet รายละเอียด Prove`);
  });
});
