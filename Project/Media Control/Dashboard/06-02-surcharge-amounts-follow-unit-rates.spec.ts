// ยอด Extra Prove Surcharge ต้อง = จำนวน rounds × ฿7,000 และ Extra Version Surcharge ต้องเป็นทวีคูณของ ฿20,000 (อย่างน้อย 1 Version ต่อ job ที่นับ)
// spec: specs/mediaapproval-dashboard-plan.md (6.2) — PB-2112 BR3-5: 7,000 THB ต่อรอบ / 20,000 THB ต่อ Version ที่เกิน Quota
// seed: seed.spec.ts
//
// หมายเหตุ: การ์ด Extra Version นับเป็น "N jobs" แต่คิดเงินต่อ "Version" ที่เกิน Quota ดังนั้น 1 job อาจเกินหลาย Version
// จึงใช้ ยอด = k × 20,000 โดย k >= จำนวน jobs (ไม่ใช่ jobs × 20,000 ตรงๆ)

import { test, expect } from '@playwright/test';
import {
  loginAs, openDashboard, settle, surchargeCard, presetButton, filterByFirstPackage,
  SURCHARGE_PER_EXTRA_VERSION_JOB, SURCHARGE_PER_EXTRA_PROVE_ROUND,
} from './_helpers';

test.describe('Financial Impact', () => {
  test('Surcharge amounts follow the per-unit rates', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const check = async (state: string) => {
      const version = await surchargeCard(page, 'Extra Version Surcharge');
      const prove = await surchargeCard(page, 'Extra Prove Surcharge');

      expect(version.amount % SURCHARGE_PER_EXTRA_VERSION_JOB, `${state}: version amount is a multiple of 20,000`).toBe(0);
      expect(version.amount, `${state}: >= 1 extra version per counted job`).toBeGreaterThanOrEqual(version.count * SURCHARGE_PER_EXTRA_VERSION_JOB);
      if (version.count === 0) expect(version.amount, `${state}: no jobs → no charge`).toBe(0);

      expect(prove.amount, `${state}: prove ${prove.count} rounds`).toBe(prove.count * SURCHARGE_PER_EXTRA_PROVE_ROUND);
    };

    await check('Month (default)');

    await presetButton(page, 'Year').click();
    await settle(page);
    await check('Year');

    await filterByFirstPackage(page);
    await check('Year + one sale package');
  });
});
