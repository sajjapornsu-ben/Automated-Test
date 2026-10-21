// กด "Select All" ต้องติ๊กครบทุกแพ็กเกจ (ตัวเลข KPI เท่าไม่กรอง) แล้วกด "Clear" 
// ต้องเอาติ๊กออกทั้งหมดและแถบกลับเป็น All Sale Packages
// spec: specs/mediaapproval-dashboard-plan.md (3.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, salePackageButton, openSalePackagePopover, closePopover, packageOptionNames } from './_helpers';

test.describe('Sale Package Filter', () => {
  test('Select All / Clear', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const unfilteredTickets = await kpiValue(page, 'Total Tickets');
    await openSalePackagePopover(page);
    const names = await packageOptionNames(page);

    // Select All ticks every package.
    await page.getByRole('checkbox', { name: 'Select All' }).check({ force: true });
    await settle(page);
    for (const n of names) await expect(page.getByRole('checkbox', { name: n, exact: true })).toBeChecked();

    // Every package selected = the same scope as no filter.
    await closePopover(page);
    await expect(salePackageButton(page)).toContainText(String(names.length));
    await expect.poll(() => kpiValue(page, 'Total Tickets')).toBe(unfilteredTickets);

    // Clear unticks all and resets the bar.
    await openSalePackagePopover(page);
    await page.getByText('Clear', { exact: true }).first().click();
    await settle(page);
    for (const n of names) await expect(page.getByRole('checkbox', { name: n, exact: true })).not.toBeChecked();
    await expect(salePackageButton(page)).toContainText('All Sale Packages (in my scope)');
  });
});
