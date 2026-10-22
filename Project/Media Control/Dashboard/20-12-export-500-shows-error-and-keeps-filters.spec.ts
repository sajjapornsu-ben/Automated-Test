// ถ้า API export ตอบ 500 ต้องขึ้น modal Something Went Wrong ไม่มีไฟล์ และตัวกรอง/ตารางเดิมยังอยู่ ส่วนถ้า request ถูก abort ก็ต้องไม่มีไฟล์
// test-case: SLA-N03, SLA-N04 — spec: PB-2116; แผน: specs/mediaapproval-dashboard-plan.md (20.12)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, pickReportFilter, reportFilter } from './_helpers';
import { goToReport } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  for (const mode of ['500', 'abort'] as const) {
    test(`SLA-N0${mode === '500' ? 3 : 4} export request fails (${mode})`, { tag: ['@negative'] }, async ({ page }) => {
      await loginAs(page, 'headCg');
      await openDashboard(page);
      await goToReport(page, 'SLA');
      await pickReportFilter(page, 'SLA', /Filter by status$/, 'Final Approve');
      await expect.poll(() => reportCount(page)).toBeGreaterThan(0);
      const before = await reportCount(page);

      await page.route('**/api/mediaTickets/reports/sla*export=1*', (route) =>
        mode === '500' ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'boom' }) }) : route.abort('failed'));
      let downloaded = false;
      page.on('download', () => { downloaded = true; });
      await page.getByRole('button', { name: 'Export SLA' }).click();

      await expect(page.getByRole('heading', { name: /Something Went Wrong|Export Failed/ })).toBeVisible();
      expect(downloaded).toBe(false);
      await page.getByRole('button', { name: /OK|Close/ }).first().click();
      await expect(reportFilter(page, 'SLA', /Filter by status$/)).toContainText('Final Approve');
      expect(await reportCount(page)).toBe(before);
    });
  }
});
