// (Head CG) ตาราง Graphic Workload ต้องมีคอลัมน์ Graphic + 9 สถานะ + Total และ badge "N graphics" ต้องเท่ากับจำนวนแถว
// spec: specs/mediaapproval-dashboard-plan.md (10.1) — PB-2112 BR36 (HCG เห็นทั้งทีม)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, workloadGrid, workloadRows, sectionCard, STATUS_NAMES } from './_helpers';

test.describe('Graphic Workload', () => {
  test('Table structure (Head CG)', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const headers = (await workloadGrid(page).getByRole('columnheader').allTextContents()).map((h) => h.trim());
    expect(headers).toEqual(['Graphic', ...STATUS_NAMES, 'Total']);

    const n = await workloadRows(page).count();
    expect(n).toBeGreaterThan(0);
    await expect(sectionCard(page, 'Graphic Workload')).toContainText(`${n} graphic`);
    await expect(sectionCard(page, 'Graphic Workload')).toContainText('Click a row to focus, click a status chip above to filter this table');
  });
});
