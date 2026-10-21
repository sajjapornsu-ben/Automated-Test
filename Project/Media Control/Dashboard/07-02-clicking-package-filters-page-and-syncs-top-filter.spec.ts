// คลิกแพ็กเกจในการ์ด แล้วปุ่มต้องเป็น pressed มี "Clear (1)" แถบ Sale Package ด้านบนต้อง sync และ Total Tickets/Jobs ต้องเท่ากับตัวเลขของแถวนั้น
// spec: specs/mediaapproval-dashboard-plan.md (7.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, packageRows, packageButtonByName, salePackageButton } from './_helpers';

test.describe('Tickets & Jobs by Sale Package', () => {
  test('Clicking a package filters the page and syncs the top filter', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const [target] = await packageRows(page);
    await packageButtonByName(page, target.name).click();
    await settle(page);

    await expect(packageButtonByName(page, target.name)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Clear (1)' })).toBeVisible();
    await expect(salePackageButton(page)).toContainText(`Sale Package: ${target.name}`);

    // The row's own "X tickets · Y jobs" is what the KPIs show once filtered to it.
    // KPIs refresh asynchronously, so poll instead of reading once.
    await expect.poll(() => kpiValue(page, 'Total Tickets')).toBe(target.tickets);
    await expect.poll(() => kpiValue(page, 'Total Jobs (Version)')).toBe(target.jobs);
  });
});
