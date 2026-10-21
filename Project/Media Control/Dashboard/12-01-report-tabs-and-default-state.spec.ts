// (Head CG) ส่วน Export Report ต้องมี 4 แท็บ (SLA / Transaction / Airtime / Billing) โดย SLA ถูกเลือกเป็นค่าเริ่มต้น และปุ่มเป็น "Export SLA"
// spec: specs/mediaapproval-dashboard-plan.md (12.1) — PB-2113 Report #1-2, BR39; PB-2112 2.4 ข้อ 1
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, reportTablist, REPORT_TABS } from './_helpers';

test.describe('Export Report — common', () => {
  test('Tabs and default state', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await expect(page.getByRole('heading', { name: 'Export Report', exact: true })).toBeVisible();
    await expect(reportTablist(page).getByRole('tab')).toHaveText(REPORT_TABS);
    await expect(reportTablist(page).getByRole('tab', { name: 'SLA' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('button', { name: 'Export SLA' })).toBeVisible();
  });
});
