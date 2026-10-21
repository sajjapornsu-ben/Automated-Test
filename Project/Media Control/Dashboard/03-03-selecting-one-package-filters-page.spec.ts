// ติ๊กเลือก 1 แพ็กเกจแล้ว แถบด้านบนต้องขึ้น "Sale Package: <ชื่อ>" พร้อมปุ่ม Clear และตัวเลข KPI ต้องไม่เกินของทุกแพ็กเกจรวมกัน
// spec: specs/mediaapproval-dashboard-plan.md (3.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, salePackageButton, openSalePackagePopover, closePopover, packageOptionNames } from './_helpers';

test.describe('Sale Package Filter', () => {
  test('Selecting one package filters the whole page', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const allTickets = await kpiValue(page, 'Total Tickets');
    const allJobs = await kpiValue(page, 'Total Jobs (Version)');

    await openSalePackagePopover(page);
    const [first] = await packageOptionNames(page);
    await page.getByRole('checkbox', { name: first, exact: true }).check({ force: true });
    await settle(page);
    await closePopover(page);

    await expect(salePackageButton(page)).toContainText(`Sale Package: ${first}`);
    await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeVisible();

    // One package is a subset of "all packages in my scope".
    expect(await kpiValue(page, 'Total Tickets')).toBeLessThanOrEqual(allTickets);
    expect(await kpiValue(page, 'Total Jobs (Version)')).toBeLessThanOrEqual(allJobs);
  });
});
