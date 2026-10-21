// เลือกช่วงวันที่ในอดีตที่ไม่มีข้อมูล (ม.ค. 2018) ทุก KPI/Alerts/Financial ต้องเป็น 0, การ์ดแพ็กเกจแสดง empty state และต้องไม่มี error
// spec: specs/mediaapproval-dashboard-plan.md (2.9) — PB-2112 BR9, BR14, AC7, AC31
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginAs, openDashboard, settle, pickCalendarDate, kpiValue, alertCard, surchargeCard,
  sectionCard, packageButtons, KPI_LABELS, PACKAGES_HEADING,
} from './_helpers';

test.describe('Date Range Filter', () => {
  test('A range with no data shows zeros and an empty state, not an error', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await pickCalendarDate(page, 0, 2018, 0, 1);
    await pickCalendarDate(page, 1, 2018, 0, 31);

    // Every KPI card recomputes for the new range (BR9) — none keeps a stale month value.
    for (const label of KPI_LABELS) {
      await expect.poll(() => kpiValue(page, label), { message: label }).toBe(0);
    }
    expect((await alertCard(page, 'High-Version Jobs')).count).toBe(0);
    expect((await alertCard(page, 'High-Prove Versions')).count).toBe(0);
    const version = await surchargeCard(page, 'Extra Version Surcharge');
    const prove = await surchargeCard(page, 'Extra Prove Surcharge');
    expect([version.amount, version.count, prove.amount, prove.count]).toEqual([0, 0, 0, 0]);

    // Empty state instead of a package list, and no error dialog/text.
    await expect(sectionCard(page, PACKAGES_HEADING)).toContainText('No jobs found in the selected range');
    await expect(packageButtons(page)).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await page.locator('main').innerText()).not.toMatch(/something went wrong|error/i);
  });
});
