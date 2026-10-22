// Billing: From หลัง To ต้องขึ้น Invalid date range และ Export ไม่ได้ไฟล์ / export ตอบ 500 ต้องขึ้น error modal ไม่มีไฟล์ และตัวกรองเดิมยังอยู่
// test-case: BIL-N01, BIL-N03 — spec: PB-2117; แผน: specs/mediaapproval-dashboard-plan.md (23.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, pickReportDate, reportFilterOptions, pickReportFilter, reportFilter } from './_helpers';
import { goToReport } from './_report-helpers';

test.describe('Export Report — Billing (PB-2117)', () => {
  test('BIL-N01 From later than To is rejected, nothing exported', { tag: ['@negative'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'Billing');
    await pickReportDate(page, 'Billing', 'To', 2026, 9, 5);
    await pickReportDate(page, 'Billing', 'From', 2026, 9, 15);
    await expect(page.getByText(/Invalid date range/)).toBeVisible();
    let downloaded = false;
    page.on('download', () => { downloaded = true; });
    await page.getByRole('button', { name: 'Export Billing' }).click();
    await expect(page.getByRole('heading', { name: /Export Failed/ })).toBeVisible();
    expect(downloaded).toBe(false);
  });

  test('BIL-N03 export returns 500 → error modal, no file, filter kept', { tag: ['@negative'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'Billing');
    const media = (await reportFilterOptions(page, 'Billing', /Filter by media$/)).find((o) => !/^All /.test(o))!;
    await pickReportFilter(page, 'Billing', /Filter by media$/, media);

    await page.route('**/api/mediaTickets/reports/billing*export=1*', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'boom' }) }));
    let downloaded = false;
    page.on('download', () => { downloaded = true; });
    await page.getByRole('button', { name: 'Export Billing' }).click();
    await expect(page.getByRole('heading', { name: /Something Went Wrong|Export Failed/ })).toBeVisible();
    expect(downloaded).toBe(false);
    await page.getByRole('button', { name: /OK|Close/ }).first().click();
    await expect(reportFilter(page, 'Billing', /Filter by media$/)).toContainText(media);
  });
});
