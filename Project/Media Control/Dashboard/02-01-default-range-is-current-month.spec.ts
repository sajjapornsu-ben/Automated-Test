// เปิด Dashboard ครั้งแรก preset ที่ active ต้องเป็น "Month" และช่วงวันที่ต้องเป็นวันที่ 1 ถึงวันสุดท้ายของเดือนปัจจุบัน
// spec: specs/mediaapproval-dashboard-plan.md (2.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, activePreset, dateRange, expectedRange } from './_helpers';

test.describe('Date Range Filter', () => {
  test('Default range is the current month', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);

    expect(await activePreset(page)).toBe('Month');
    expect(await dateRange(page)).toEqual(expectedRange('Month'));
  });
});
