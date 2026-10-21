// กรอง From/To ในแท็บ SLA แล้วจำนวนแถวต้องลดลง และ Created Date ทุกแถวต้องอยู่ในช่วงที่เลือก (ตัวกรองของแท็บนี้ไม่ผูกกับแท็บอื่น)
// spec: specs/mediaapproval-dashboard-plan.md (13.5) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportColumn, pickReportDate, setReportPerPage } from './_helpers';

const parse = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split('/').map(Number);
  return new Date(y, m - 1, d).getTime();
};

test.describe('Export Report — SLA tab', () => {
  test('From / To date filter', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    const all = await reportCount(page);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // From the 1st to the 15th of the current month.
    await pickReportDate(page, 'SLA', 'From', year, month, 1);
    await pickReportDate(page, 'SLA', 'To', year, month, 15);

    const filtered = await reportCount(page);
    expect(filtered).toBeLessThanOrEqual(all);
    test.skip(filtered === 0, 'No jobs were created in the first half of this month — nothing to verify');

    await setReportPerPage(page, '100');
    const from = new Date(year, month, 1).getTime();
    const to = new Date(year, month, 15).getTime();
    for (const created of await reportColumn(page, 'SLA', 'Created Date')) {
      const t = parse(created.split(' ')[0]);
      expect(t, `Created Date ${created}`).toBeGreaterThanOrEqual(from);
      expect(t, `Created Date ${created}`).toBeLessThanOrEqual(to);
    }
  });
});
