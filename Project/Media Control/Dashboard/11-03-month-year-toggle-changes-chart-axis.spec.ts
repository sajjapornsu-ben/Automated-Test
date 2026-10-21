// สลับ Month/Year ใน SLA per Graphic แล้ว chip ที่ active ต้องเปลี่ยน และแกน X ของกราฟต้องเปลี่ยน (Month = วันที่ในเดือน, Year = ชื่อเดือน ม.ค.→ปัจจุบัน)
// spec: specs/mediaapproval-dashboard-plan.md (11.3) — PB-2112 BR29 (Month: 1 ของเดือน→ปัจจุบัน), BR30 (Year: 1 ม.ค.→ปัจจุบัน)
// seed: seed.spec.ts
//
// หมายเหตุ: ค่าเริ่มต้นที่ spec กำหนดคือ Month แต่หน้าจริงเปิดเป็น Year — เช็คแยกใน 18-02 (expected fail)

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaSection, slaActivePeriod, waitForSlaLoaded } from './_helpers';

const axisText = (page: import('@playwright/test').Page) => slaSection(page).locator('svg').last().evaluate((e) => e.textContent || '');

test.describe('SLA per Graphic', () => {
  test('Month / Year toggle changes the chart axis', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await waitForSlaLoaded(page);
    const sla = slaSection(page);

    await sla.getByRole('button', { name: 'Month', exact: true }).click();
    await settle(page);
    await expect(slaActivePeriod(page)).toHaveText('Month');
    const monthAxis = await axisText(page);
    expect(monthAxis).not.toMatch(/Jan|Feb|Mar/);
    expect(monthAxis).toMatch(/16/); // day-of-month ticks (1, 6, 11, 16 ...)

    await sla.getByRole('button', { name: 'Year', exact: true }).click();
    await settle(page);
    await expect(slaActivePeriod(page)).toHaveText('Year');
    const yearAxis = await axisText(page);
    expect(yearAxis).toContain('Jan');
    expect(yearAxis).not.toBe(monthAxis);
  });
});
