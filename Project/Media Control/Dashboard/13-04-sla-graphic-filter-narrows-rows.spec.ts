// ตัวกรอง Graphic ในแท็บ SLA เมื่อเลือกคนหนึ่งแล้ว ทุกแถวต้องมีชื่อคนนั้นในคอลัมน์ Graphic (1 job มีได้หลายกราฟิก)
// spec: specs/mediaapproval-dashboard-plan.md (13.4) — PB-2113 BR47, PB-2112 BR36 (HCG ดูรายบุคคลได้)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportColumn, pickReportFilter, setReportPerPage } from './_helpers';

test.describe('Export Report — SLA tab', () => {
  test('Graphic filter narrows rows', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    const all = await reportCount(page);
    await pickReportFilter(page, 'SLA', /Filter by graphic$/, 'CG - QA 2');

    const filtered = await reportCount(page);
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(all);

    await setReportPerPage(page, '100');
    for (const g of await reportColumn(page, 'SLA', 'Graphic')) expect(g).toContain('CG - QA 2');
  });
});
