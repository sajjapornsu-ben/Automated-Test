// เมื่อการ์ดแพ็กเกจแสดงครบทุกแพ็กเกจ (ไม่ถูกตัดที่ Top N) ผลรวม "Y jobs" ของทุกแถวต้องเท่ากับ KPI Total Jobs (Version)
// spec: specs/mediaapproval-dashboard-plan.md (7.5) — PB-2112 BR13/AC7: ตัวเลขทั้งหน้าต้องตรงกัน ห้ามมีตัวเลขที่ขัดกัน
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, packageRows, openSalePackagePopover, closePopover, packageOptionNames } from './_helpers';

test.describe('Tickets & Jobs by Sale Package', () => {
  test('Package job counts add up to Total Jobs', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const rows = await packageRows(page);
    await openSalePackagePopover(page);
    const inScope = (await packageOptionNames(page)).length;
    await closePopover(page);

    // The sum only has to match when the Top-N card isn't truncating the package list.
    test.skip(rows.length < inScope, `Top-N list shows ${rows.length} of ${inScope} packages, so the sum is not comparable`);

    const sumJobs = rows.reduce((s, r) => s + r.jobs, 0);
    expect(sumJobs).toBe(await kpiValue(page, 'Total Jobs (Version)'));
  });
});
