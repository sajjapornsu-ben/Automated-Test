// กดปุ่ม preset (Today / Week / Quarter / Year) แล้วช่วงวันที่ต้องถูกต้อง, 
// preset นั้นต้อง active และ KPI ต้องยังแสดงตัวเลข
// spec: specs/mediaapproval-dashboard-plan.md (2.2, 2.3, 2.4, 2.5)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, presetButton, activePreset, dateRange, expectedRange, kpiValue, settle, Preset } from './_helpers';

const PRESETS_TO_CHECK: Preset[] = ['Today', 'Week', 'Quarter', 'Year'];

test.describe('Date Range Filter', () => {
  for (const preset of PRESETS_TO_CHECK) {
    test(`${preset} preset sets the expected range`, async ({ page }) => {
      await loginAs(page, 'sale');
      await openDashboard(page);

      await presetButton(page, preset).click();
      await settle(page);

      expect(await dateRange(page)).toEqual(expectedRange(preset));
      expect(await activePreset(page)).toBe(preset);
      expect(await kpiValue(page, 'Total Tickets')).toBeGreaterThanOrEqual(0);
    });
  }
});
