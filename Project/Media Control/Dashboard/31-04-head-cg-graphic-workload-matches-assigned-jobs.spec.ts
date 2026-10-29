// Head CG: Graphic Workload นับงานต่อ "คนที่รับงาน" (งานที่มี CG 2 คนนับทั้ง 2 แถว งานที่ไม่มี CG นับที่ Unassigned) ผลรวมแต่ละสถานะจึงต้องเท่ากับ Σ max(1, จำนวน CG) ของงานในสถานะนั้น (จาก Export SLA)
// test-case: XC-HCG-05 — เทียบ Dashboard Graphic Workload ↔ ข้อมูลงานจริง; แผน: specs/mediaapproval-dashboard-plan.md (31.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, workloadRows, STATUS_NAMES, settle } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear } from './_cross-helpers';

// SLA report status → Dashboard status name
const base = (s: string) => (/^revise/i.test(s) ? s.toLowerCase() : s.toLowerCase().split(' (')[0]);

test.describe('Cross-check Head CG — Graphic Workload', () => {
  test('XC-HCG-05 workload column totals = jobs per status counted once per assigned graphic', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    const dash = await dashboardYear(page);
    await settle(page);

    const rows = workloadRows(page);
    await expect.poll(() => rows.count()).toBeGreaterThan(0);
    const sums = new Array(9).fill(0);
    for (let i = 0; i < (await rows.count()); i++) {
      const cells = (await rows.nth(i).getByRole('gridcell').allTextContents()).map((c) => Number(c.trim()));
      cells.slice(0, 9).forEach((v, k) => (sums[k] += v));
    }
    const actual = Object.fromEntries(STATUS_NAMES.map((n, k) => [n, sums[k]]));

    const sla = (await fetchAll(page, 'sla')).rows;
    const graphicKey = Object.keys(sla[0]).find((k) => /graphic/i.test(k))!;
    const expected: Record<string, number> = Object.fromEntries(STATUS_NAMES.map((n) => [n, 0]));
    const jobs: Record<string, number> = Object.fromEntries(STATUS_NAMES.map((n) => [n, 0]));
    for (const r of sla) {
      const name = STATUS_NAMES.find((n) => base(n) === base(String(r.status)));
      if (!name) continue; // Draft / Cancelled are not workload columns
      const g = String(r[graphicKey] ?? '').split(',').map((s) => s.trim()).filter((s) => s && s !== '-');
      expected[name] += Math.max(1, g.length);
      jobs[name] += 1;
    }
    expect(actual, 'workload column sums vs jobs counted once per assigned graphic').toEqual(expected);
    // The status cards count jobs once; the workload counts a job once per assigned graphic (multi-assignee BTS jobs count for every CG), so
    // each workload column is >= its card, and the card itself equals the number of jobs in that status.
    for (const n of STATUS_NAMES) {
      expect(dash.statuses[n], `${n} card = jobs in that status`).toBe(jobs[n]);
      expect(actual[n], `${n} workload column >= card`).toBeGreaterThanOrEqual(dash.statuses[n]);
    }
  });
});
