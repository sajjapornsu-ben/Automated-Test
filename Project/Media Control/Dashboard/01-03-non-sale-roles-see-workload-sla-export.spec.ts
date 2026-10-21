// ล็อกอินด้วย Head CG / CG 1 / CG 2 / Media Management แล้วเปิด Dashboard ต้องเห็นครบ 9 ส่วน รวม Graphic Workload, SLA per Graphic, Export Report
// spec: specs/mediaapproval-dashboard-plan.md (1.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, NON_SALE_ROLES } from './_helpers';

const ALL_SECTIONS = [
  'Overview & Status',
  'Alerts & Exceptions',
  'Financial Impact',
  'Tickets & Jobs by Sale Package',
  'Job Type Distribution (CG)',
  'Jobs by Status',
  'Graphic Workload',
  'SLA per Graphic',
  'Export Report',
];

test.describe('Access, Layout & Role Visibility', () => {
  for (const role of NON_SALE_ROLES) {
    test(`${role} also sees Workload, SLA and Export Report`, async ({ page }) => {
      await loginAs(page, role);
      await openDashboard(page);

      for (const name of ALL_SECTIONS) {
        await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
      }
    });
  }
});
