// ตัวเลือกช่วงเวลา Today / Week / Month / Quarter / Year ต้องมีครบบน Dashboard (ไม่ต้องมีหัวข้อ "Jobs by Period" — ทีมยืนยันแล้วว่าถูกต้อง)
// spec: specs/mediaapproval-dashboard-plan.md (18.1) — PB-2112 Requirements Dashboard #7, 2.1 ข้อ 6
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, PRESETS, presetButton } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Period tabs Today / Week / Month / Year are available', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    for (const p of PRESETS) await expect(presetButton(page, p), p).toBeVisible();
  });
});
