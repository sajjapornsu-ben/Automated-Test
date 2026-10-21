// คลิก 2 แพ็กเกจพร้อมกันได้ ทั้งคู่ต้องเป็น pressed และปุ่มต้องเป็น "Clear (2)"
// spec: specs/mediaapproval-dashboard-plan.md (7.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, packageRows, packageButtonByName } from './_helpers';

test.describe('Tickets & Jobs by Sale Package', () => {
  test('Multiple packages can be selected', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const rows = await packageRows(page);
    expect(rows.length).toBeGreaterThanOrEqual(2);

    await packageButtonByName(page, rows[0].name).click();
    await settle(page);
    await packageButtonByName(page, rows[1].name).click();
    await settle(page);

    await expect(packageButtonByName(page, rows[0].name)).toHaveAttribute('aria-pressed', 'true');
    await expect(packageButtonByName(page, rows[1].name)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Clear (2)' })).toBeVisible();
  });
});
