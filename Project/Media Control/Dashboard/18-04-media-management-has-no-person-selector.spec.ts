// [DEFECT] [spec PB-2112] Media Management ต้องเห็นแค่ภาพรวมราย Package ไม่มีตัวเลือกรายบุคคลใน SLA per Graphic — หน้าจริงมี dropdown รายบุคคล จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.4) — PB-2112 BR34, BR37, AC22
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaSection } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Media Management has no per-person selector in SLA per Graphic', async ({ page }) => {

    await loginAs(page, 'mediaManagement');
    await openDashboard(page);
    await settle(page);

    await expect(slaSection(page).getByRole('group')).toHaveCount(0, { timeout: 3000 });
  });
});
