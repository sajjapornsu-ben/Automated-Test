// รายงาน SLA ต้องเรียงตาม Created Date ใหม่ → เก่า ตลอดทุกหน้า
// test-case: SLA-H02 — แผน: specs/mediaapproval-dashboard-plan.md (20.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, SLA_COLUMNS } from './_helpers';
import { goToReport, readTableAllPages, dateKey } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H02 rows are sorted by Created Date, newest first', { tag: ['@happy'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    const created = (await readTableAllPages(page, 'SLA')).map((r) => dateKey(r[SLA_COLUMNS.indexOf('Created Date')].split(' ')[0]));
    expect(created.length).toBeGreaterThan(20);
    for (let i = 1; i < created.length; i++) expect(created[i - 1], `row ${i}`).toBeGreaterThanOrEqual(created[i]);
  });
});
