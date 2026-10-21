// ผลรวมในกราฟ Job Type ต้องไม่เกิน Total Jobs (Version) เพราะนับเฉพาะงานที่ CG กด Accept แล้ว (งานที่ยังไม่ Accept ไม่ถูกนับ)
// spec: specs/mediaapproval-dashboard-plan.md (8.3) — PB-2112 BR12, BR13
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, jobTypeData, kpiValue, packageRows, packageButtonByName } from './_helpers';

test.describe('Job Type Distribution (CG)', () => {
  test('Job Type total never exceeds Total Jobs', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const check = async (state: string) => {
      const sum = (await jobTypeData(page)).legend.reduce((s, l) => s + l.count, 0);
      const total = await kpiValue(page, 'Total Jobs (Version)');
      expect(sum, `${state}: job types ${sum} vs Total Jobs ${total}`).toBeLessThanOrEqual(total);
    };

    await check('unfiltered');

    const [target] = await packageRows(page);
    await packageButtonByName(page, target.name).click();
    await settle(page);
    await check(`filtered to ${target.name}`);
  });
});
