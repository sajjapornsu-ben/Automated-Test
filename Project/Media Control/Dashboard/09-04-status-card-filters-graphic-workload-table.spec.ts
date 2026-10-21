// (Head CG) คลิกการ์ดสถานะที่มีจำนวน > 0 แล้วตาราง Graphic Workload ต้องเหลือเฉพาะกราฟิกที่มีค่าในคอลัมน์สถานะนั้น > 0
// spec: specs/mediaapproval-dashboard-plan.md (9.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, statusCard, statusCount, STATUS_NAMES } from './_helpers';

test.describe('Jobs by Status', () => {
  test('Status card filters the Graphic Workload table (Head CG)', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const grid = page.getByRole('grid', { name: 'Graphic Workload Table' });
    const headers = (await grid.getByRole('columnheader').allTextContents()).map((h) => h.trim());
    const dataRows = () => grid.getByRole('rowgroup').last().getByRole('row');
    const rowsBefore = await dataRows().count();

    // Pick the first status that actually has jobs.
    let target: string | undefined;
    for (const name of STATUS_NAMES) {
      if ((await statusCount(page, name)) > 0) {
        target = name;
        break;
      }
    }
    expect(target, 'a status with at least one job').toBeDefined();
    const col = headers.indexOf(target!);
    expect(col, `column for ${target}`).toBeGreaterThan(0);

    await statusCard(page, target!).click();
    await settle(page);

    const rows = dataRows();
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(rowsBefore);
    for (let i = 0; i < n; i++) {
      // Column 0 is the rowheader (graphic); status cells are the gridcells after it.
      const cells = await rows.nth(i).getByRole('gridcell').allTextContents();
      expect(Number(cells[col - 1]), `row ${i} ${target}`).toBeGreaterThan(0);
    }
  });
});
