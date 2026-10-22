// ระบุแค่ From (แสดงตั้งแต่ From ถึงปัจจุบัน) หรือแค่ To (แสดงตั้งแต่รายการแรกถึง To) ต้องได้จำนวนตรงกับ Created Date ใน API
// test-case: SLA-H08, SLA-H09 — spec: PB-2116 BR20-21; แผน: specs/mediaapproval-dashboard-plan.md (20.7)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, pickReportDate } from './_helpers';
import { goToReport, fetchAll, bangkokDate, dateKey } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  for (const mode of ['From', 'To'] as const) {
    test(`SLA-H0${mode === 'From' ? 8 : 9} only ${mode} is set`, { tag: ['@happy'] }, async ({ page }) => {
      await loginAs(page, 'headCg');
      await openDashboard(page);
      await goToReport(page, 'SLA');

      const { rows } = await fetchAll(page, 'sla');
      const days = [...new Set(rows.map((r) => bangkokDate(r.createdAt)))].sort((a, b) => dateKey(b) - dateKey(a));
      const pivot = days[Math.min(2, days.length - 1)];
      const [d, m, y] = pivot.split('/').map(Number);

      await pickReportDate(page, 'SLA', mode, y, m - 1, d);
      const key = dateKey(pivot);
      const day = (r: { createdAt: string }) => dateKey(bangkokDate(r.createdAt));
      const expected = rows.filter((r) => (mode === 'From' ? day(r) >= key : day(r) <= key)).length;
      await expect.poll(() => reportCount(page)).toBe(expected);
      expect(expected).toBeLessThan(rows.length);
    });
  }
});
