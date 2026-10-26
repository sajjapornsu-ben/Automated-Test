// แท็บ Transaction ต้องมี 26 คอลัมน์ตามลำดับ (Transaction Date … Date Landlord Approve) พร้อมข้อความ "one row per Format of each job"
// spec: specs/mediaapproval-dashboard-plan.md (14.1) — PB-2113 BR47 (คอลัมน์ตามสเปคย่อย PB-2114 — ไม่ได้แนบ จึงอ้างอิงตามหน้าจริง)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportHeaders, TRANSACTION_COLUMNS } from './_helpers';

test.describe('Export Report — Transaction tab', () => {
  test('Table has the 26 report columns', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Transaction');

    const headers = await reportHeaders(page, 'Transaction');
    expect(headers).toHaveLength(TRANSACTION_COLUMNS.length); // 27 since the "Media Type (Epicor/SF)" column was added (was 26)
    expect(headers).toEqual(TRANSACTION_COLUMNS);
  });
});
