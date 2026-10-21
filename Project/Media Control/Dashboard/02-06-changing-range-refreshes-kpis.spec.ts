// เปลี่ยนช่วงเวลาจาก Month เป็น Year แล้ว Total Tickets ของ Year ต้องไม่น้อยกว่าของ Month และการ์ด 
// KPI ทั้ง 8 ใบต้องยังแสดงเป็นตัวเลข
// spec: specs/mediaapproval-dashboard-plan.md (2.6)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, presetButton, kpiValue, settle, KPI_LABELS } from './_helpers';

test.describe('Date Range Filter', () => {
  test('Changing the range refreshes the KPIs', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const monthTickets = await kpiValue(page, 'Total Tickets');

    await presetButton(page, 'Year').click();
    await settle(page);

    // Year ⊇ Month, so it can never show fewer tickets.
    expect(await kpiValue(page, 'Total Tickets')).toBeGreaterThanOrEqual(monthTickets);

    for (const label of KPI_LABELS) {
      expect(await kpiValue(page, label), label).toBeGreaterThanOrEqual(0);
    }
  });
});
