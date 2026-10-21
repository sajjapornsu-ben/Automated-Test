// พิมพ์ค้นหาในช่อง Search ของ Sale Package ต้องเหลือเฉพาะแพ็กเกจที่ตรง และถ้าไม่ตรงเลยต้องขึ้น "No matching options"
// spec: specs/mediaapproval-dashboard-plan.md (3.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openSalePackagePopover, packageOptionNames } from './_helpers';

test.describe('Sale Package Filter', () => {
  test('Search narrows the package list', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);
    await openSalePackagePopover(page);

    const all = await packageOptionNames(page);
    const target = all[0];
    const term = target.slice(0, 4);
    const search = page.getByPlaceholder(/Search/);

    await search.fill(term);
    const narrowed = await packageOptionNames(page);
    expect(narrowed.length).toBeGreaterThan(0);
    expect(narrowed.length).toBeLessThanOrEqual(all.length);
    for (const n of narrowed) expect(n.toLowerCase()).toContain(term.toLowerCase());
    await expect(page.getByText(`${narrowed.length} items`, { exact: true })).toBeVisible();

    await search.fill('zzzz-no-such-package');
    await expect(page.getByText('No matching options')).toBeVisible();
    expect(await packageOptionNames(page)).toHaveLength(0);
  });
});
