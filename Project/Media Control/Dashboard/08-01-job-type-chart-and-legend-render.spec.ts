// กราฟ Job Type Distribution ต้องมี 5 ประเภท (Animate, Final File, AE/PR, Mockup, Other) ค่าบนแท่งกราฟต้องตรงกับตัวเลขใน legend
// spec: specs/mediaapproval-dashboard-plan.md (8.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, jobTypeData, sectionCard } from './_helpers';

test.describe('Job Type Distribution (CG)', () => {
  test('Chart and legend render with the 5 job types', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(sectionCard(page, 'Job Type Distribution (CG)')).toContainText('Number of jobs done by CG, broken down by type');

    const { bars, legend } = await jobTypeData(page);
    expect(legend.map((l) => l.name)).toEqual([
      'Animate',
      'Final File',
      'AE/PR Project',
      'Mockup (Sales Pitch)',
      'Other',
    ]);
    for (const l of legend) expect(l.count, l.name).toBeGreaterThanOrEqual(0);
    expect(bars).toEqual(legend.map((l) => l.count));
  });
});
