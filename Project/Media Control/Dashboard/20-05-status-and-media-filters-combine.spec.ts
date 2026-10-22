// กรอง Status แล้วกรอง Media ต่อ ต้องได้เฉพาะแถวที่ตรงทั้งสองเงื่อนไข (AND) และจำนวนไม่เกินตอนกรองเงื่อนไขเดียว
// test-case: SLA-H05 — แผน: specs/mediaapproval-dashboard-plan.md (20.5)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, reportColumn, setReportPerPage, pickReportFilter, reportFilterOptions } from './_helpers';
import { goToReport, fetchAll } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H05 Status + Media filters are applied together (AND)', { tag: ['@happy'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    // Pick a (status, media) pair that really exists in the data, so the combined result is non-empty.
    const { rows } = await fetchAll(page, 'sla');
    const pair = rows.find((r) => r.status === 'Final Approve') ?? rows.find((r) => r.status !== 'Draft')!;
    const wantStatus = pair.status as string;
    const wantMedia = pair.media as string;
    const expected = rows.filter((r) => r.status === wantStatus && r.media === wantMedia).length;

    const statusOnly = rows.filter((r) => r.status === wantStatus).length;
    await pickReportFilter(page, 'SLA', /Filter by status$/, wantStatus);
    await expect.poll(() => reportCount(page)).toBe(statusOnly);

    expect(await reportFilterOptions(page, 'SLA', /Filter by media$/)).toContain(wantMedia);
    await pickReportFilter(page, 'SLA', /Filter by media$/, wantMedia);
    await expect.poll(() => reportCount(page)).toBe(expected);
    expect(expected).toBeLessThanOrEqual(statusOnly);

    await setReportPerPage(page, '100');
    for (const s of await reportColumn(page, 'SLA', 'Status')) expect(s).toBe(wantStatus);
    for (const m of await reportColumn(page, 'SLA', 'Media')) expect(m).toBe(wantMedia);
  });
});
