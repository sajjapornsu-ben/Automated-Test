// เลือกวันเริ่ม/วันสิ้นสุดเองจากปฏิทิน ปุ่มวันที่ต้องแสดงค่าที่เลือก และตัวเลข KPI ต้องไม่เกินช่วงเดือนเต็ม (ช่วงแคบลง)
// spec: specs/mediaapproval-dashboard-plan.md (2.7)
// seed: seed.spec.ts
//
// หมายเหตุ (สังเกตจากของจริง ไม่ assert): หลังเลือกช่วงเองแล้ว preset "Month" ยังถูกไฮไลต์ค้างอยู่

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, dateButtons, dateRange, kpiValue, settle, fmt } from './_helpers';

test.describe('Date Range Filter', () => {
  test('Custom range via the calendars', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const fullMonthTickets = await kpiValue(page, 'Total Tickets');
    const now = new Date();

    // 1. Pick a start date, then an end date.
    await dateButtons(page).nth(0).click();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await dateButtons(page).nth(1).click();
    await page.getByRole('button', { name: '15', exact: true }).click();
    await settle(page);

    expect(await dateRange(page)).toEqual([
      fmt(new Date(now.getFullYear(), now.getMonth(), 5)),
      fmt(new Date(now.getFullYear(), now.getMonth(), 15)),
    ]);
    // A sub-range of the month can never contain more tickets than the whole month.
    expect(await kpiValue(page, 'Total Tickets')).toBeLessThanOrEqual(fullMonthTickets);
  });
});
