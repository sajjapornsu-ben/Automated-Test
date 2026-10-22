// "Showing N records" ต้องเท่ากับจำนวนแถวจริงเมื่อรวมทุกหน้า และเท่ากับจำนวนที่ API ส่งมา (ทั้งแบบไม่กรองและแบบกรอง Status)
// test-case: SLA-H03 — แผน: specs/mediaapproval-dashboard-plan.md (20.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, pickFirstFilterOptionWithResults } from './_helpers';
import { fetchAll, goToReport, readTableAllPages } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H03 "Showing N records" equals the rows on every page', { tag: ['@happy'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    const all = await reportCount(page);
    expect((await readTableAllPages(page, 'SLA')).length).toBe(all);
    expect((await fetchAll(page, 'sla')).total).toBe(all);

    const { option, count } = await pickFirstFilterOptionWithResults(page, 'SLA', /Filter by status$/);
    expect((await readTableAllPages(page, 'SLA')).length, `status ${option}`).toBe(count);
    expect((await fetchAll(page, 'sla', { status: option })).total).toBe(count);
  });
});
