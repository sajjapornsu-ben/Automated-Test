// Transaction/Airtime: From หลัง To ต้องขึ้น Invalid date range และ Export ไม่ได้ไฟล์ / ถ้า export ตอบ 500 ต้องขึ้น error modal ไม่มีไฟล์ และตัวค้นหายังอยู่
// test-case: TRX-N01, TRX-N03, AIR-N01, AIR-N03 — spec: PB-2113; แผน: specs/mediaapproval-dashboard-plan.md (21.5)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, pickReportDate, reportPanel } from './_helpers';
import { goToReport, searchReport, API_OF } from './_report-helpers';

for (const tab of ['Transaction', 'Airtime'] as const) {
  test.describe(`Export Report — ${tab} (PB-2113)`, () => {
    test(`${tab} From later than To is rejected, nothing exported`, { tag: ['@negative'] }, async ({ page }) => {
      await loginAs(page, 'headCg');
      await openDashboard(page);
      await goToReport(page, tab);
      await pickReportDate(page, tab, 'To', 2026, 9, 5);
      await pickReportDate(page, tab, 'From', 2026, 9, 15);
      await expect(page.getByText(/Invalid date range/)).toBeVisible();
      let downloaded = false;
      page.on('download', () => { downloaded = true; });
      await page.getByRole('button', { name: `Export ${tab}` }).click();
      await expect(page.getByRole('heading', { name: /Export Failed/ })).toBeVisible();
      expect(downloaded).toBe(false);
    });

    test(`${tab} export returns 500 → error modal, no file, search kept`, { tag: ['@negative'] }, async ({ page }) => {
      await loginAs(page, 'headCg');
      await openDashboard(page);
      await goToReport(page, tab);
      await searchReport(page, tab, 'Test');
      await page.route(`**/api/mediaTickets/reports/${API_OF[tab]}*export=1*`, (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'boom' }) }));
      let downloaded = false;
      page.on('download', () => { downloaded = true; });
      await page.getByRole('button', { name: `Export ${tab}` }).click();
      await expect(page.getByRole('heading', { name: /Something Went Wrong|Export Failed/ })).toBeVisible();
      expect(downloaded).toBe(false);
      await page.getByRole('button', { name: /OK|Close/ }).first().click();
      await expect(reportPanel(page, tab).getByRole('textbox', { name: 'Search report' })).toHaveValue('Test');
    });
  });
}
