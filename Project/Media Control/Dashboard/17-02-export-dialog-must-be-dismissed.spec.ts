// หลัง Export สำเร็จต้องมี modal "Export Successful" บังหน้า (คลิกที่อื่นไม่ได้) และกด OK แล้วต้องปิดและหน้ากลับมาใช้งานได้ (เปลี่ยนแท็บได้)
// spec: specs/mediaapproval-dashboard-plan.md (17.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportTablist } from './_helpers';

test.describe('Export Report — edge cases', () => {
  test('Export Successful dialog blocks the page until dismissed', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export SLA' }).click(),
    ]);
    const heading = page.getByRole('heading', { name: 'Export Successful' });
    await expect(heading).toBeVisible();
    await expect(page.getByText(/^Exported \d+ records to Excel$/)).toBeVisible();

    // The modal overlay intercepts clicks on the page behind it.
    await expect(
      reportTablist(page).getByRole('tab', { name: 'Billing' }).click({ timeout: 1500 })
    ).rejects.toThrow();

    await page.getByRole('button', { name: 'OK' }).click();
    await expect(heading).toHaveCount(0);

    await reportTablist(page).getByRole('tab', { name: 'Billing' }).click();
    await expect(reportTablist(page).getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
  });
});
