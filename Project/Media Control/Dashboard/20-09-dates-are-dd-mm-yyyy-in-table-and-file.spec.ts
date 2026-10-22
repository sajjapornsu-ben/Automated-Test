// คอลัมน์ Created Date ต้องเป็นรูปแบบ DD/MM/YYYY ทั้งในตารางและในไฟล์ Excel
// test-case: SLA-H14 — แผน: specs/mediaapproval-dashboard-plan.md (20.9)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportColumn, setReportPerPage } from './_helpers';
import { goToReport, exportToFile, readWorkbook, sheetMatrix } from './_report-helpers';

const DDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/;

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H14 Created Date is DD/MM/YYYY in the table and in the file', { tag: ['@happy'] }, async ({ page }, testInfo) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');
    await setReportPerPage(page, '100');

    for (const c of await reportColumn(page, 'SLA', 'Created Date')) expect(c).toMatch(DDMMYYYY);

    const { file } = await exportToFile(page, 'SLA', testInfo);
    const [header, ...data] = sheetMatrix((await readWorkbook(file)).worksheets[0]);
    const col = header.indexOf('Created Date');
    for (const r of data) expect(r[col]).toMatch(DDMMYYYY);
  });
});
