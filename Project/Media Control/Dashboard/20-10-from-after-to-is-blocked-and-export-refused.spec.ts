// ตั้ง From หลัง To ต้องมีข้อความ Invalid date range ไม่ยิง request โหลดตารางใหม่ และกด Export ต้องไม่ได้ไฟล์ (ขึ้น Export Failed)
// test-case: SLA-N01, SLA-E04 — spec: PB-2116; แผน: specs/mediaapproval-dashboard-plan.md (20.10)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, pickReportDate } from './_helpers';
import { goToReport } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-N01/E04 From later than To is rejected and nothing is exported', { tag: ['@negative', '@edge'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    await pickReportDate(page, 'SLA', 'To', 2026, 9, 5);
    const reportCalls: string[] = [];
    page.on('request', (r) => { if (r.url().includes('/api/mediaTickets/reports/sla')) reportCalls.push(r.url()); });
    await pickReportDate(page, 'SLA', 'From', 2026, 9, 15);

    await expect(page.getByText(/Invalid date range/)).toBeVisible();
    expect(reportCalls.filter((u) => u.includes('dateFrom=2026-10-15')), 'no report request is sent for the invalid range').toHaveLength(0);

    let downloaded = false;
    page.on('download', () => { downloaded = true; });
    await page.getByRole('button', { name: 'Export SLA' }).click();
    await expect(page.getByRole('heading', { name: /Export Failed/ })).toBeVisible();
    expect(downloaded).toBe(false);
  });
});
