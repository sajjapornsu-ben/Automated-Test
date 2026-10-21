// แท็บ Airtime ต้องค้นหา (Quote/Company/Product) และกรอง Sale Approve ได้เหมือน Transaction: ค้นหาแล้วแถวลดลงและตรงคำค้น, กรองแล้ว Status ตรง
// spec: specs/mediaapproval-dashboard-plan.md (15.2) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginAs, openDashboard, settle, openReportTab, reportCount, reportColumn, reportPanel,
  pickFirstFilterOptionWithResults, pickReportFilter, setReportPerPage,
} from './_helpers';

const SALE = /Filter by sale approve status$/;

test.describe('Export Report — Airtime tab', () => {
  test('Search and Sale Approve filter', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Airtime');

    const all = await reportCount(page);
    const [company] = await reportColumn(page, 'Airtime', 'Company Name');
    const search = reportPanel(page, 'Airtime').getByRole('textbox', { name: 'Search report' });

    await search.fill(company);
    await page.waitForTimeout(1200);
    await settle(page);
    const searched = await reportCount(page);
    expect(searched).toBeGreaterThan(0);
    expect(searched).toBeLessThanOrEqual(all);
    await setReportPerPage(page, '100');
    for (const c of await reportColumn(page, 'Airtime', 'Company Name')) expect(c.toLowerCase()).toContain(company.toLowerCase());

    await search.fill('');
    await page.waitForTimeout(1200);
    await settle(page);

    const { option } = await pickFirstFilterOptionWithResults(page, 'Airtime', SALE);
    await setReportPerPage(page, '100');
    for (const s of await reportColumn(page, 'Airtime', 'Sale Approve Status')) expect(s).toBe(option);
    await pickReportFilter(page, 'Airtime', SALE, 'All Sale Approve');
  });
});
