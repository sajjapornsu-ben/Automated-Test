// เมื่อคลิกกรองแพ็กเกจ ตัวเลขใน legend ของ Job Type ต้องไม่เกินค่าตอนไม่กรอง (ทุกประเภท)
// spec: specs/mediaapproval-dashboard-plan.md (8.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, jobTypeData, packageRows, packageButtonByName } from './_helpers';

test.describe('Job Type Distribution (CG)', () => {
  test('Chart follows the sale-package filter', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const before = await jobTypeData(page);
    const [target] = await packageRows(page);

    await packageButtonByName(page, target.name).click();
    await settle(page);

    const after = await jobTypeData(page);
    expect(after.legend.map((l) => l.name)).toEqual(before.legend.map((l) => l.name));
    after.legend.forEach((l, i) => expect(l.count, l.name).toBeLessThanOrEqual(before.legend[i].count));
    // A single package is a subset of everything, so the bars still match the legend.
    expect(after.bars).toEqual(after.legend.map((l) => l.count));
  });
});
