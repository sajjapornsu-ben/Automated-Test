// อักขระ % ในช่องค้นหาต้องถูกมองเป็นตัวอักษรธรรมดา (ข้อมูลไม่มี % จึงต้องไม่พบข้อมูล) — ตอนนี้แอปตีความเป็น wildcard จึงคาดว่า fail
// test-case: TRX-E03 — แผน: specs/mediaapproval-dashboard-plan.md (21.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount } from './_helpers';
import { goToReport, searchReport } from './_report-helpers';

test.describe('Export Report — Transaction (PB-2113)', () => {
  test('TRX-E03 "%" in the search box is a literal character', { tag: ['@edge', '@negative'] }, async ({ page }) => {
    test.fail(true, 'Known gap: the search treats % (and _) as a SQL LIKE wildcard, so "%" matches every row');
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'Transaction');
    await searchReport(page, 'Transaction', '%');
    await expect.poll(() => reportCount(page)).toBe(0);
  });
});
