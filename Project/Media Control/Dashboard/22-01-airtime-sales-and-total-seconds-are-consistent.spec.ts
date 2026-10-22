// Airtime/Transaction: ช่อง Sales ของแต่ละ job ต้องตรงกันทั้งสองรายงาน และ Total (Sec) = Durations (เป็นวินาที) × Number Spot/Loop (คลาดเคลื่อนได้จากการปัดเศษวินาทีต่อ spot)
// test-case: AIR-H04, TRX-H04, TRX-E06 — spec: PB-2113; แผน: specs/mediaapproval-dashboard-plan.md (22.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard } from './_helpers';
import { fetchAll } from './_report-helpers';

const seconds = (hhmmss: string) => {
  const [h, m, s] = String(hhmmss).split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

test.describe('Export Report — Transaction & Airtime (PB-2113)', () => {
  test('AIR-H04/TRX-H04 Sales matches between the two reports and Total (Sec) = Durations × spots', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    const trx = (await fetchAll(page, 'transaction')).rows;
    const air = (await fetchAll(page, 'airtime')).rows;

    const salesOfJob = new Map(trx.map((r) => [r.jobCode, r.sales]));
    for (const a of air) expect(a.sales, `Sales of ${a.jobCode}`).toBe(salesOfJob.get(a.jobCode));

    for (const r of [...trx, ...air]) {
      if (!r.durations || r.totalSec == null || r.numberSpot == null) continue;
      expect(Math.abs(r.totalSec - seconds(r.durations) * r.numberSpot), `${r.jobCode} ${r.durations} × ${r.numberSpot}`).toBeLessThanOrEqual(Math.ceil(r.numberSpot / 2) + 1);
    }
  });
});
