// Super Admin: จำนวนในการ์ด Jobs by Status (Year) ของ Dashboard ต้องเท่ากับ Status Overview ของหน้า Media Ticket / Assign Ticket / Media Management ทุกสถานะ และ Cancelled ตรงกับ Cancelled Jobs
// test-case: XC-ADM-01 — เทียบ Dashboard ↔ หน้า list (Created Date, แยกสถานะ); แผน: specs/mediaapproval-dashboard-plan.md (30.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { dashboardYear, openList, overview, STATUS_PAIRS, LIST_NAME, ListKey } from './_cross-helpers';

for (const key of ['mediaTicket', 'assignTicket', 'mediaManagement'] as ListKey[]) {
  test.describe(`Cross-check Admin — Dashboard vs ${LIST_NAME[key]}`, () => {
    test(`XC-ADM-01 status counts equal the ${LIST_NAME[key]} overview`, { tag: ['@regression'] }, async ({ page }) => {
      await loginAs(page, 'superAdmin');
      const dash = await dashboardYear(page);
      await openList(page, key);
      const list = await overview(page);

      for (const p of STATUS_PAIRS) {
        expect(list.cards[p.list], `${LIST_NAME[key]} "${p.list}" vs Dashboard "${p.dash}"`).toBe(dash.statuses[p.dash]);
      }
      expect(list.cards['cancelled'], 'Cancelled').toBe(dash.cancelledJobs);
    });
  });
}
