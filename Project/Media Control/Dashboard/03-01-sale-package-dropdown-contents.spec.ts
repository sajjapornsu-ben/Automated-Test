// เปิด dropdown Sale Package ต้องมีช่องค้นหา "Select All" checkbox ต่อแพ็กเกจ ปุ่ม Clear และข้อความ "N items" ที่ตรงกับจำนวนแพ็กเกจ
// spec: specs/mediaapproval-dashboard-plan.md (3.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, salePackageButton, openSalePackagePopover, packageOptionNames } from './_helpers';

test.describe('Sale Package Filter', () => {
  test('Dropdown contents', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(salePackageButton(page)).toContainText('All Sale Packages (in my scope)');
    await openSalePackagePopover(page);

    await expect(page.getByPlaceholder(/Search/)).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Select All' })).toBeVisible();
    await expect(page.getByText('Clear', { exact: true }).first()).toBeVisible();

    const names = await packageOptionNames(page);
    expect(names.length).toBeGreaterThan(0);
    await expect(page.getByText(`${names.length} items`, { exact: true })).toBeVisible();
  });
});
