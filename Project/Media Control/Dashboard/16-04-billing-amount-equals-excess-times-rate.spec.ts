// ทุกแถวในตาราง Billing: มูลค่า Prove ที่เกิน ต้องเท่ากับ จำนวน Prove ที่เกิน × Rate / Prove และจำนวนที่เกินต้องไม่เกินจำนวน Prove จริง
// spec: specs/mediaapproval-dashboard-plan.md (16.4) — PB-2112 BR4 (คิด 7,000 THB ต่อรอบที่เกิน), BR13
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportColumn, reportCount, setReportPerPage } from './_helpers';

const num = (s: string) => Number(s.replace(/[^\d.]/g, ''));

test.describe('Export Report — Billing tab', () => {
  test('Billing amount equals excess Prove × rate', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Billing');
    await setReportPerPage(page, '100');

    const actual = (await reportColumn(page, 'Billing', 'จำนวน Prove จริง')).map(num);
    const excess = (await reportColumn(page, 'Billing', 'จำนวน Prove ที่เกิน')).map(num);
    const rate = (await reportColumn(page, 'Billing', 'Rate / Prove')).map(num);
    const amount = (await reportColumn(page, 'Billing', 'มูลค่า Prove ที่เกิน')).map(num);

    expect(amount.length).toBe(Math.min(await reportCount(page), 100));
    amount.forEach((a, i) => {
      expect(excess[i], `row ${i}: excess ≤ actual`).toBeLessThanOrEqual(actual[i]);
      expect(a, `row ${i}: ${excess[i]} × ${rate[i]}`).toBe(excess[i] * rate[i]);
    });
  });
});
