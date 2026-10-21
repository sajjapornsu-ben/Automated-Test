// [spec PB-2112] CG ต้องเห็น workload ของตัวเองเท่านั้น — หน้าจริง CG 1 เห็นหลายคน (CG - QA, CG - QA 2, Head CG - QA) จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.5) — PB-2112 BR35, SLA per Graphic #4
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, workloadGraphicNames, DISPLAY_NAME } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('CG sees only their own row in Graphic Workload', async ({ page }) => {
    test.fail(true, 'PB-2112 BR35: CG should see only their own workload; CG 1 sees 3 graphics incl. other people (observed 2026-10-21)');

    await loginAs(page, 'cg1');
    await openDashboard(page);
    await settle(page);

    expect(await workloadGraphicNames(page)).toEqual([DISPLAY_NAME.cg1]);
  });
});
