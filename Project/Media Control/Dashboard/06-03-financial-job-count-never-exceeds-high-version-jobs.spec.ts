// จำนวน jobs ในการ์ด Extra Version Surcharge ต้องไม่เกิน High-Version Jobs (Quota ≥ 3 Version ดังนั้นเกิน Quota ⇒ มีมากกว่า 3 Version เสมอ)
// spec: specs/mediaapproval-dashboard-plan.md (6.3) — PB-2112 BR2 (>3 Version = High-Version Job), BR5 (Quota = 3 × Pack × ceil(Month)), BR8 (หักงานที่ได้รับการยกเว้น)
// seed: seed.spec.ts
//
// หมายเหตุ: ก่อนหน้านี้เทสนี้ assert ว่า "เท่ากัน" ซึ่ง spec ไม่ได้รับรอง (job ที่ถูกยกเว้น Landlord / Media Management
// อยู่ใน Alerts แต่ไม่อยู่ใน Financial) จึงเปลี่ยนเป็น ≤ ที่ถูกต้องตาม spec

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, alertCard, surchargeCard, presetButton, filterByFirstPackage } from './_helpers';

test.describe('Financial Impact', () => {
  test('Financial job count never exceeds High-Version Jobs', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const check = async (state: string) => {
      const alertJobs = await alertCard(page, 'High-Version Jobs');
      const versionCharge = await surchargeCard(page, 'Extra Version Surcharge');
      expect(versionCharge.count, `${state}: charged jobs ${versionCharge.count} vs High-Version Jobs ${alertJobs.count}`).toBeLessThanOrEqual(alertJobs.count);
    };

    await check('Month (default)');

    await presetButton(page, 'Year').click();
    await settle(page);
    await check('Year');

    await filterByFirstPackage(page);
    await check('Year + one sale package');
  });
});
