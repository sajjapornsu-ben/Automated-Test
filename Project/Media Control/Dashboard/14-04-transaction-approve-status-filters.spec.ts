// ตัวกรอง Sale Approve / Landlord Approve ต้องมีตัวเลือก All / Approved / Pending / Rejected และเมื่อเลือกแล้วคอลัมน์ Status ของแถวต้องตรงกับที่เลือก
// spec: specs/mediaapproval-dashboard-plan.md (14.4) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginAs, openDashboard, settle, openReportTab, reportFilterOptions, pickFirstFilterOptionWithResults,
  reportColumn, setReportPerPage, pickReportFilter,
} from './_helpers';

const SALE = /Filter by sale approve status$/;
const LANDLORD = /Filter by landlord approve status$/;

test.describe('Export Report — Transaction tab', () => {
  test('Sale Approve / Landlord Approve filters', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Transaction');

    expect(await reportFilterOptions(page, 'Transaction', SALE)).toEqual(['All Sale Approve', 'Approved', 'Pending', 'Rejected']);
    expect(await reportFilterOptions(page, 'Transaction', LANDLORD)).toEqual(['All Landlord Approve', 'Approved', 'Pending', 'Rejected']);

    const sale = await pickFirstFilterOptionWithResults(page, 'Transaction', SALE);
    await setReportPerPage(page, '100');
    for (const s of await reportColumn(page, 'Transaction', 'Sale Approve Status')) expect(s).toBe(sale.option);

    await pickReportFilter(page, 'Transaction', SALE, 'All Sale Approve');
    const landlord = await pickFirstFilterOptionWithResults(page, 'Transaction', LANDLORD);
    await setReportPerPage(page, '100');
    for (const s of await reportColumn(page, 'Transaction', 'Landlord Approve Status')) expect(s).toBe(landlord.option);
  });
});
