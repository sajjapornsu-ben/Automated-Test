// "per page" ต้องมีตัวเลือก Auto/10/25/50/100; เลือก 10 แล้วต้องแสดง 10 แถว "Showing 1 to 10 of N", Prev ถูก disable ที่หน้าแรก และ Next ไปหน้า 11-20
// spec: specs/mediaapproval-dashboard-plan.md (12.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, reportCount, reportRows, setReportPerPage } from './_helpers';

test.describe('Export Report — common', () => {
  test('Per-page options and pagination', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const perPage = page.getByRole('combobox').last();
    expect(await perPage.locator('option').allTextContents()).toEqual(['Auto', '10', '25', '50', '100']);

    const total = await reportCount(page);
    expect(total).toBeGreaterThan(20);

    await setReportPerPage(page, '10');
    await expect(reportRows(page, 'SLA')).toHaveCount(10);
    await expect(page.getByText(`Showing 1 to 10 of ${total} records`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prev' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(`Showing 11 to 20 of ${total} records`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prev' })).toBeEnabled();
  });
});
