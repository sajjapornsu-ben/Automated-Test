// การ์ด Financial Impact ต้องมี Extra Version Surcharge และ Extra Prove Surcharge เป็นจำนวนเงิน ฿ พร้อมบรรทัด "THB · N jobs/rounds"
// spec: specs/mediaapproval-dashboard-plan.md (6.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, surchargeCard } from './_helpers';

test.describe('Financial Impact', () => {
  test('Both surcharge cards render with THB amounts', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(page.getByRole('heading', { name: 'Financial Impact', exact: true })).toBeVisible();

    const version = await surchargeCard(page, 'Extra Version Surcharge');
    expect(version.subtitle).toBe('Extra Version charge');
    expect(version.amountText).toMatch(/^฿[\d,]+$/);
    expect(version.unitText).toMatch(/^THB · \d+ jobs?$/);

    const prove = await surchargeCard(page, 'Extra Prove Surcharge');
    expect(prove.subtitle).toBe('Extra Prove charge');
    expect(prove.amountText).toMatch(/^฿[\d,]+$/);
    expect(prove.unitText).toMatch(/^THB · \d+ rounds?$/);
  });
});
