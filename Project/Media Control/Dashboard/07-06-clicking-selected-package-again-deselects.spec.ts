// คลิกแพ็กเกจที่เลือกอยู่ซ้ำอีกครั้งต้องยกเลิกการกรอง (ปุ่มไม่ pressed, Clear หาย, KPI กลับเท่าเดิม)
// spec: specs/mediaapproval-dashboard-plan.md (7.6) — PB-2112 BR11: "คลิกซ้ำเพื่อยกเลิกการกรอง"
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, packageRows, packageButtonByName, salePackageButton } from './_helpers';

test.describe('Tickets & Jobs by Sale Package', () => {
  test('Clicking a selected package again deselects it', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const unfilteredTickets = await kpiValue(page, 'Total Tickets');
    const [target] = await packageRows(page);

    await packageButtonByName(page, target.name).click();
    await expect(packageButtonByName(page, target.name)).toHaveAttribute('aria-pressed', 'true');

    await packageButtonByName(page, target.name).click();
    await settle(page);

    await expect(packageButtonByName(page, target.name)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Clear \(\d+\)$/ })).toHaveCount(0);
    await expect(salePackageButton(page)).toContainText('All Sale Packages (in my scope)');
    await expect.poll(() => kpiValue(page, 'Total Tickets')).toBe(unfilteredTickets);
  });
});
