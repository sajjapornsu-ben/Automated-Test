// Transaction แตก 1 แถวต่อ 1 Format ของแต่ละ job ส่วน Airtime ต้องมี 1 แถวต่อ job และรวมทุก Format ไว้ในช่องเดียว (ชุด Format ต้องตรงกัน)
// test-case: TRX-H01, AIR-H01, AIR-H02 — spec: PB-2113; แผน: specs/mediaapproval-dashboard-plan.md (21.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard } from './_helpers';
import { fetchAll } from './_report-helpers';

test.describe('Export Report — Transaction & Airtime (PB-2113)', () => {
  test('TRX-H01/AIR-H01/AIR-H02 one row per format vs one row per job', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    const trx = (await fetchAll(page, 'transaction')).rows;
    const air = (await fetchAll(page, 'airtime')).rows;

    expect(new Set(air.map((r) => r.jobCode)).size, 'Airtime has exactly one row per job').toBe(air.length);
    expect(trx.length, 'multi-format jobs are split, so Transaction has more rows').toBeGreaterThan(air.length);

    const byJob = new Map<string, string[]>();
    for (const r of trx) byJob.set(r.jobCode, [...(byJob.get(r.jobCode) ?? []), String(r.formats ?? '')]);
    expect([...byJob.keys()].sort()).toEqual(air.map((r) => r.jobCode).sort());

    const norm = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean).sort();
    for (const a of air) {
      const joined = norm(String(a.formats ?? '').split(','));
      expect(norm(byJob.get(a.jobCode)!), `formats of ${a.jobCode}`).toEqual(joined);
    }
  });
});
