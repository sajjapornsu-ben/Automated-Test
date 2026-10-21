// ค้นหาด้วยคำที่ไม่มีในข้อมูลต้องขึ้น "Showing 0 records" และข้อความ "No records found" โดยไม่มี error
// spec: specs/mediaapproval-dashboard-plan.md (14.3) — PB-2112 BR14, AC31 (ไม่มีข้อมูล → empty state ไม่ใช่ error)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportPanel } from './_helpers';

test.describe('Export Report — Transaction tab', () => {
  test('Search with no match shows an empty state', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Transaction');

    await reportPanel(page, 'Transaction').getByRole('textbox', { name: 'Search report' }).fill('zzzz-no-such-record-zzzz');

    await expect.poll(() => reportCount(page)).toBe(0);
    await expect(page.getByText('No records found')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
