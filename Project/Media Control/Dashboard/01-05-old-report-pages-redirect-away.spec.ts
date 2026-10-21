// เข้า URL ของเมนู REPORT เดิม (KPI Dashboard, Export Airtime, Monthly Report, Audit Log) ตรงๆ ต้องถูก redirect ออกไปหน้า /dashboard
// spec: specs/mediaapproval-dashboard-plan.md (1.5)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';

const OLD_REPORT_PATHS = ['/report/kpiDashboard', '/report/exportAirtime', '/report/monthlyReport', '/report/auditLog'];

test.describe('Access, Layout & Role Visibility', () => {
  for (const path of OLD_REPORT_PATHS) {
    test(`Old REPORT page ${path} is no longer reachable`, async ({ page }) => {
      await loginAs(page, 'sale');

      await page.goto(`https://uat-mediacontrol.planbmedia.co.th${path}`);

      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page).not.toHaveURL(/\/report\//);
    });
  }
});
