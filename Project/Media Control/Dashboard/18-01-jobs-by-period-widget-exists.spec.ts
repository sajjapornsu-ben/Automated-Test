// [spec PB-2112] Dashboard ต้องมี widget "Jobs by Period" (เลือก Today/Week/Month/Year) — หน้าจริงยังไม่มี จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.1) — PB-2112 Requirements Dashboard #7, 2.1 ข้อ 6
// seed: seed.spec.ts
//
// ถ้าทีมพัฒนาเพิ่ม widget นี้แล้ว เทสจะ "unexpectedly pass" ให้ลบบรรทัด test.fail ออก

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Jobs by Period widget exists', async ({ page }) => {
    test.fail(true, 'PB-2112 requires a "Jobs by Period" widget (Today/Week/Month/Year); the page has none for any role (observed 2026-10-21)');

    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(page.getByRole('heading', { name: 'Jobs by Period', exact: true })).toBeVisible({ timeout: 3000 });
  });
});
