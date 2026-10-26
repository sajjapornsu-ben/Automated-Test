// กด Export SLA ต้องได้ไฟล์ Excel (.xlsx) ทันที — ทีมยืนยันแล้วว่าไม่ต้องมีตัวเลือก CSV
// spec: specs/mediaapproval-dashboard-plan.md (18.6) — PB-2112 Report #1, BR45, AC28
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Export SLA downloads an Excel file', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export SLA' }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  });
});
