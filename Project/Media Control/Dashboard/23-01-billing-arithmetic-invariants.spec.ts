// Billing (จาก API): Prove ที่เกิน = max(จริง − โควตา 3, 0), Rate = 7,000, มูลค่า = เกิน × Rate, สรุปมีเฉพาะแถวที่เกิน > 0, Grand Total = ผลรวม และแถวรายละเอียดรวมกัน = Prove จริงทั้งหมด
// test-case: BIL-U01..U09, BIL-H01 — spec: PB-2117; แผน: specs/mediaapproval-dashboard-plan.md (23.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount } from './_helpers';
import { goToReport, API } from './_report-helpers';

test.describe('Export Report — Billing (PB-2117)', () => {
  test('BIL-U01..U09 excess = max(actual − quota, 0), amount = excess × rate, totals add up', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    const res = await page.request.get(`${API}/billing?export=1`);
    expect(res.status()).toBe(200);
    const d = (await res.json()).data;

    expect(d.summary.length, 'summary rows').toBe(d.summaryTotal);
    expect(d.details.length, 'detail rows').toBe(d.detailsTotal);
    let sumAmount = 0;
    let sumActual = 0;
    for (const r of d.summary) {
      expect(r.quota, `quota of ${r.product}`).toBe(3);
      expect(r.rate, `rate of ${r.product}`).toBe(7000);
      expect(r.excessProves, `excess of ${r.product}`).toBe(Math.max(r.actualProves - r.quota, 0));
      expect(r.excessProves, 'only groups with an excess are listed').toBeGreaterThan(0);
      expect(r.excessValue).toBe(r.excessProves * r.rate);
      sumAmount += r.excessValue;
      sumActual += r.actualProves;
    }
    expect(d.grandTotal, 'Grand Total = Σ amounts').toBe(sumAmount);
    expect(d.details.length, 'one detail row per Prove round').toBe(sumActual);

    await goToReport(page, 'Billing');
    await expect.poll(() => reportCount(page)).toBe(d.summary.length);
  });
});
