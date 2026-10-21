// กด "Clear (N)" ในการ์ดแพ็กเกจ ต้องไม่มีแพ็กเกจที่ pressed ปุ่ม Clear (N) หาย และตัวเลข KPI กลับเท่าตอนไม่กรอง
// spec: specs/mediaapproval-dashboard-plan.md (7.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, packageRows, packageButtonByName, packageButtons, salePackageButton } from './_helpers';

test.describe('Tickets & Jobs by Sale Package', () => {
  test('"Clear (N)" resets the selection', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const unfilteredTickets = await kpiValue(page, 'Total Tickets');
    const rows = await packageRows(page);

    await packageButtonByName(page, rows[0].name).click();
    await settle(page);
    await packageButtonByName(page, rows[1].name).click();
    await settle(page);
    await expect(page.getByRole('button', { name: 'Clear (2)' })).toBeVisible();

    await page.getByRole('button', { name: 'Clear (2)' }).click();
    await settle(page);

    await expect(page.getByRole('button', { name: /^Clear \(\d+\)$/ })).toHaveCount(0);
    for (let i = 0; i < (await packageButtons(page).count()); i++) {
      await expect(packageButtons(page).nth(i)).not.toHaveAttribute('aria-pressed', 'true');
    }
    await expect(salePackageButton(page)).toContainText('All Sale Packages (in my scope)');
    await expect.poll(() => kpiValue(page, 'Total Tickets')).toBe(unfilteredTickets);
  });
});
