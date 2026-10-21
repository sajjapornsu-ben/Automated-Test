// ตัวกรอง Status ในแท็บ SLA ต้องมีตัวเลือกครบ และเมื่อเลือกค่าหนึ่งจำนวนแถวต้องลดลง โดยทุกแถวมี Status ตรงกับที่เลือก
// spec: specs/mediaapproval-dashboard-plan.md (13.2) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginAs, openDashboard, settle, openReportTab, reportCount, reportColumn, reportFilterOptions,
  pickFirstFilterOptionWithResults, setReportPerPage,
} from './_helpers';

const STATUS = /Filter by status$/;

test.describe('Export Report — SLA tab', () => {
  test('Status filter options and effect', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    expect(await reportFilterOptions(page, 'SLA', STATUS)).toEqual([
      'All Status', 'Assign', 'Cancelled', 'Done', 'Draft', 'Final Approve', 'Final Render',
      'On Process', 'Review', 'Revise (CG)', 'Revise (SALE)', 'Verify',
    ]);

    const all = await reportCount(page);
    const { option, count } = await pickFirstFilterOptionWithResults(page, 'SLA', STATUS);
    expect(count).toBeLessThan(all);

    await setReportPerPage(page, '100');
    const statuses = await reportColumn(page, 'SLA', 'Status');
    expect(statuses).toHaveLength(Math.min(count, 100));
    for (const s of statuses) expect(s).toBe(option);
  });
});
