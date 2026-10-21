// หลังเลือกวันเริ่มต้นแล้ว ในปฏิทินวันสิ้นสุดวันที่ก่อนวันเริ่มต้นต้องถูก disable (เลือกไม่ได้) ส่วนวันเริ่มต้นเองยังเลือกได้
// spec: specs/mediaapproval-dashboard-plan.md (2.8)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, dateButtons, settle } from './_helpers';

test.describe('Date Range Filter', () => {
  test('End date before start date is blocked', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    // Start = the 5th of the month.
    await dateButtons(page).nth(0).click();
    await page.getByRole('button', { name: '5', exact: true }).click();
    await settle(page);

    // Open the END calendar: days 1-4 are before the start and must be disabled.
    await dateButtons(page).nth(1).click();
    for (const day of ['1', '2', '3', '4']) {
      await expect(page.getByRole('button', { name: day, exact: true })).toBeDisabled();
    }
    await expect(page.getByRole('button', { name: '5', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: '6', exact: true })).toBeEnabled();
  });
});
