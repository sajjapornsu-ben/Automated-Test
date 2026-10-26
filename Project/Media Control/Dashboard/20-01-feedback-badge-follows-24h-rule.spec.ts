// ทุก job ที่ถูก assign แล้ว: Feedback SLA ต้องเป็น On track เมื่อเวลาตั้งแต่ Assign ถึง Accept (หรือถึงตอนนี้ถ้ายังไม่ Accept) ไม่เกิน 24 ชม. มิฉะนั้น Overdue
// test-case: SLA-U02..U05, U15, U16 (ตรวจย้อนกลับจากข้อมูลจริงแทน unit test) — spec: PB-2112 BR15, BR23-24; PB-2116 BR9-10
// หมายเหตุ: ข้ามงานที่ช่วง Assign→Accept คาบเกี่ยววันหยุดใน Holiday Management (นาฬิกา SLA หยุดนับ) — ส่วนวิธีนับวันทำการ/วันหยุด (SLA-U17/U18) ยังไม่ครอบคลุม
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, SLA_COLUMNS } from './_helpers';
import { fetchAll, goToReport, readTableAllPages } from './_report-helpers';

const HOURS = 3600 * 1000;

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-U02..U05 Feedback SLA badge follows the 24-hour rule', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    const ui = new Map<string, string>(); // Job No -> Feedback SLA badge
    for (const r of await readTableAllPages(page, 'SLA')) ui.set(r[0], r[SLA_COLUMNS.indexOf('Feedback SLA')]);

    const { rows } = await fetchAll(page, 'sla');
    const holidays: string[] = (await (await page.request.get('https://uat-mediacontrol.planbmedia.co.th/api/holidays')).json()).data.map((h: any) => h.holiday_date);
    const touchesHoliday = (from: number, to: number) =>
      holidays.some((d) => { const t = new Date(`${d}T00:00:00Z`).getTime(); return t >= from - 24 * HOURS && t <= to + 24 * HOURS; });

    const now = Date.now();
    const wrong: string[] = [];
    let checked = 0;
    for (const j of rows) {
      if (!j.assignedAt) continue;
      const from = new Date(j.assignedAt).getTime();
      const to = j.acceptedAt ? new Date(j.acceptedAt).getTime() : now;
      if (touchesHoliday(from, to)) continue;
      const expected = (to - from) / HOURS <= 24 ? 'On track' : 'Overdue';
      checked++;
      if (ui.get(j.jobCode) !== expected) wrong.push(`${j.jobCode} (${j.status}) ${((to - from) / HOURS).toFixed(1)}h → shows "${ui.get(j.jobCode)}", expected "${expected}"`);
    }
    expect(checked, 'enough assigned jobs to make the check meaningful').toBeGreaterThan(10);
    expect(wrong, wrong.slice(0, 5).join('\n')).toEqual([]);
  });
});
