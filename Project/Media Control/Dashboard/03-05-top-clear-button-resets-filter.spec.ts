// หลังเลือก 1 แพ็กเกจ กดปุ่ม "Clear" ที่แถบด้านบนต้อง reset กลับเป็น All Sale Packages และตัวเลข KPI กลับเท่าตอนไม่กรอง
// spec: specs/mediaapproval-dashboard-plan.md (3.5)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, salePackageButton, openSalePackagePopover, closePopover, packageOptionNames } from './_helpers';

test.describe('Sale Package Filter', () => {
  test('The top "Clear" button resets the filter', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const unfilteredTickets = await kpiValue(page, 'Total Tickets');
    const unfilteredJobs = await kpiValue(page, 'Total Jobs (Version)');

    await openSalePackagePopover(page);
    const [first] = await packageOptionNames(page);
    await page.getByRole('checkbox', { name: first, exact: true }).check({ force: true });
    await settle(page);
    await closePopover(page);
    await expect(salePackageButton(page)).toContainText(`Sale Package: ${first}`);

    // The bar's own "Clear" button (exact name — the card's one reads "Clear (1)").
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await settle(page);

    await expect(salePackageButton(page)).toContainText('All Sale Packages (in my scope)');
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toHaveCount(0);
    await expect.poll(() => kpiValue(page, 'Total Tickets')).toBe(unfilteredTickets);
    await expect.poll(() => kpiValue(page, 'Total Jobs (Version)')).toBe(unfilteredJobs);
  });
});
