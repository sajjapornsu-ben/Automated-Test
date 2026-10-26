// job ที่ยังไม่ถูก assign ต้องแสดง "-" ทั้ง Graphic, Feedback SLA และ Progress SLA; job ที่ยังไม่ถูก Accept ต้องไม่มีค่า Progress SLA ("-")
// test-case: SLA-U01, SLA-U08, SLA-H13 — spec: PB-2112 2.2 ข้อ 2-3; PB-2116 BR
// หมายเหตุ: หน้าจริงใช้ "-" (hyphen) ส่วน spec PB-2116 เขียน "–" (en dash) — เทสนี้ยึดตามหน้าจริง
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, SLA_COLUMNS } from './_helpers';
import { fetchAll, goToReport, readTableAllPages } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-U01/U08/H13 unassigned and not-yet-accepted jobs show "-"', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    const ui = new Map<string, string[]>();
    for (const r of await readTableAllPages(page, 'SLA')) ui.set(r[0], r);
    const { rows } = await fetchAll(page, 'sla');

    const missing: string[] = [];
    const unassigned = rows.filter((j) => !j.assignedAt);
    const notAccepted = rows.filter((j) => j.assignedAt && !j.acceptedAt);
    expect(unassigned.length, 'data has unassigned jobs').toBeGreaterThan(0);

    for (const j of unassigned) {
      const r = ui.get(j.jobCode);
      if (!r) { missing.push(j.jobCode); continue; } // data correctness (API vs table) is checked separately
      expect([r[SLA_COLUMNS.indexOf('Graphic')], r[SLA_COLUMNS.indexOf('Feedback SLA')], r[SLA_COLUMNS.indexOf('Progress SLA')]], `${j.jobCode} Graphic/Feedback/Progress`).toEqual(['-', '-', '-']);
    }
    for (const j of notAccepted) {
      if (!ui.get(j.jobCode)) { missing.push(j.jobCode); continue; }
      expect(ui.get(j.jobCode)![SLA_COLUMNS.indexOf('Progress SLA')], `${j.jobCode} (${j.status}) Progress before Accept`).toBe('-');
    }
    if (missing.length) test.info().annotations.push({ type: 'issue', description: `${missing.length} job(s) from the report API are not in the table: ${missing.slice(0, 5).join(', ')}` });
  });
});
