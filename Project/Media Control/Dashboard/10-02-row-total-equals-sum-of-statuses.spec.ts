// ทุกแถวในตาราง Graphic Workload ต้องมีค่า Total เท่ากับผลรวมของ 9 คอลัมน์สถานะ
// spec: specs/mediaapproval-dashboard-plan.md (10.2) — PB-2112 BR13 (ตัวเลขทั้งหน้าต้องตรงกัน)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, workloadRows } from './_helpers';

test.describe('Graphic Workload', () => {
  test('Row Total equals the sum of its status columns', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const rows = workloadRows(page);
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);

    for (let i = 0; i < n; i++) {
      const cells = (await rows.nth(i).getByRole('gridcell').allTextContents()).map((c) => Number(c.trim()));
      expect(cells).toHaveLength(10); // 9 statuses + Total
      const statuses = cells.slice(0, 9).reduce((s, v) => s + v, 0);
      expect(cells[9], `row ${i}`).toBe(statuses);
    }
  });
});
