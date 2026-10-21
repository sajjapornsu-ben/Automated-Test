// (CG) SLA per Graphic ต้องไม่มี dropdown เลือกบุคคล และแสดงข้อมูลของตัวเองเท่านั้น (ชื่อตัวเองเป็น scope)
// spec: specs/mediaapproval-dashboard-plan.md (11.6) — PB-2112 BR33, BR35, AC21
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaSection, slaCard, DISPLAY_NAME } from './_helpers';

test.describe('SLA per Graphic', () => {
  for (const role of ['cg1'] as const) {
    test(`${role} sees own SLA without a person selector`, async ({ page }) => {
      await loginAs(page, role);
      await openDashboard(page);
      await settle(page);

      const sla = slaSection(page);
      await expect(sla.getByRole('group')).toHaveCount(0);
      await expect(sla).toContainText(DISPLAY_NAME[role]!);

      const feedback = await slaCard(page, 'Feedback');
      expect(feedback.total).toBeGreaterThan(0);
    });
  }
});
