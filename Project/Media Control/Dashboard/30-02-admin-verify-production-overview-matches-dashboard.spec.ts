// Super Admin: หน้า Verify & Production รวม Assign เข้ากับ Verify (การ์ด Verify = Assign + Verify ของ Dashboard) ส่วนสถานะอื่นและ Cancelled ต้องเท่ากับ Dashboard
// test-case: XC-ADM-02 — เทียบ Dashboard ↔ Verify & Production; แผน: specs/mediaapproval-dashboard-plan.md (30.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { dashboardYear, openList, overview, STATUS_PAIRS } from './_cross-helpers';

test.describe('Cross-check Admin — Dashboard vs Verify & Production', () => {
  test('XC-ADM-02 overview equals the Dashboard (Verify = Assign + Verify)', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'superAdmin');
    const dash = await dashboardYear(page);
    await openList(page, 'productionReview');
    const list = await overview(page);

    expect(list.cards['verify'], 'Verify = Assign (Head CG) + Verify (CG)').toBe(dash.statuses['Assign (Head CG)'] + dash.statuses['Verify (CG)']);
    for (const p of STATUS_PAIRS.filter((x) => x.list !== 'assign' && x.list !== 'verify')) {
      expect(list.cards[p.list], `"${p.list}" vs Dashboard "${p.dash}"`).toBe(dash.statuses[p.dash]);
    }
    expect(list.cards['cancelled'], 'Cancelled').toBe(dash.cancelledJobs);
  });
});
