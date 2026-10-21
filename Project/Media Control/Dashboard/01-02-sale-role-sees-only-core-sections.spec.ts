// ล็อกอินด้วย role Sale แล้วเปิด Dashboard ต้องเห็นแค่ 6 ส่วนหลัก และต้องไม่เห็น Graphic Workload / SLA per Graphic / Export Report
// spec: specs/mediaapproval-dashboard-plan.md (1.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard } from './_helpers';

test.describe('Access, Layout & Role Visibility', () => {
  test('Sale role sees only the 6 core sections', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);

    for (const name of [
      'Overview & Status',
      'Alerts & Exceptions',
      'Financial Impact',
      'Tickets & Jobs by Sale Package',
      'Job Type Distribution (CG)',
      'Jobs by Status',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    for (const name of ['Graphic Workload', 'SLA per Graphic', 'Export Report']) {
      await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
    }
  });
});
