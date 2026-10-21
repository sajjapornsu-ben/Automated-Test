// จำนวน Cancelled Jobs (Version) ต้องไม่เกิน Total Jobs (Version) ในทุกช่วงเวลา และเมื่อกรองด้วยแพ็กเกจ
// spec: specs/mediaapproval-dashboard-plan.md (4.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, presetButton, filterByFirstPackage, Preset } from './_helpers';

test.describe('Overview & Status', () => {
  test('Cancelled Jobs never exceed Total Jobs', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const check = async (state: string) => {
      const cancelled = await kpiValue(page, 'Cancelled Jobs (Version)');
      const total = await kpiValue(page, 'Total Jobs (Version)');
      expect(cancelled, `${state}: cancelled ${cancelled} vs total ${total}`).toBeLessThanOrEqual(total);
    };

    await check('Month (default)');

    for (const preset of ['Week', 'Quarter', 'Year'] as Preset[]) {
      await presetButton(page, preset).click();
      await settle(page);
      await check(preset);
    }

    await filterByFirstPackage(page);
    await check('Year + one sale package');
  });
});
