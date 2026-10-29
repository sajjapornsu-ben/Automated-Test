// กรอง From/To ในรายงาน SLA ต้องรวมทั้งวันเริ่มและวันสิ้นสุด (inclusive) ตาม Created Date — From=To วันเดียวต้องได้งานของวันนั้นทั้งวัน
// test-case: SLA-H07, SLA-E03 — spec: PB-2116; แผน: specs/mediaapproval-dashboard-plan.md (20.6)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, reportColumn, setReportPerPage, pickReportDate } from './_helpers';
import { goToReport, fetchAll, countBy, bangkokDate, dateKey } from './_report-helpers';

const parts = (ddmmyyyy: string) => ddmmyyyy.split('/').map(Number) as [number, number, number];

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H07/E03 From/To are inclusive and From = To returns that whole day', { tag: ['@happy', '@edge'] }, async ({ page }) => {
    test.setTimeout(120000); // four date-picker selections + two table reads: > 30 s when the run is slow
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    const { rows } = await fetchAll(page, 'sla');
    const perDay = countBy(rows, (r) => bangkokDate(r.createdAt));
    const days = [...perDay.keys()].sort((a, b) => dateKey(b) - dateKey(a));
    expect(days.length, 'jobs created on at least two different days').toBeGreaterThanOrEqual(2);
    const [newest, older] = [days[0], days[1]];

    // 1) one single day (From = To)
    const [d1, m1, y1] = parts(older);
    await pickReportDate(page, 'SLA', 'From', y1, m1 - 1, d1);
    await pickReportDate(page, 'SLA', 'To', y1, m1 - 1, d1);
    await expect.poll(() => reportCount(page)).toBe(perDay.get(older));
    await setReportPerPage(page, '100');
    for (const c of await reportColumn(page, 'SLA', 'Created Date')) expect(c.startsWith(older), `${c} is on ${older}`).toBe(true);

    // 2) a range covering two days: both end days are included
    const [d2, m2, y2] = parts(newest);
    await pickReportDate(page, 'SLA', 'To', y2, m2 - 1, d2);
    const inRange = rows.filter((r) => dateKey(bangkokDate(r.createdAt)) >= dateKey(older) && dateKey(bangkokDate(r.createdAt)) <= dateKey(newest)).length;
    await expect.poll(() => reportCount(page)).toBe(inRange);
    expect(inRange).toBeGreaterThanOrEqual(perDay.get(older)! + perDay.get(newest)!);
  });
});
