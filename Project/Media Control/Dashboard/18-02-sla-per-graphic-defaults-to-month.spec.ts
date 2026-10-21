// [spec PB-2112] SLA per Graphic ต้องเปิดมาที่ช่วง Month เป็นค่าเริ่มต้น — หน้าจริงเปิดเป็น Year จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.2) — PB-2112 BR28, AC17, 2.3 ข้อ 1
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaActivePeriod } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('SLA per Graphic defaults to Month', async ({ page }) => {
    test.fail(true, 'PB-2112 BR28/AC17: default must be Month; the page opens on Year (observed 2026-10-21)');

    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await expect(slaActivePeriod(page)).toHaveText('Month', { timeout: 3000 });
  });
});
