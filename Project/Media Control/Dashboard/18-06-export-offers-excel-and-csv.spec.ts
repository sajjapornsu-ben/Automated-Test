// [spec PB-2112/2113] กด Export แล้วต้องเลือก Excel หรือ CSV ได้ — หน้าจริงกดแล้วดาวน์โหลด Excel ทันที ไม่มีตัวเลือก CSV จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.6) — PB-2112 Report #1, BR45, AC28
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Export offers both Excel and CSV', async ({ page }) => {
    test.fail(true, 'PB-2112 Report #1/BR45: export must be available as Excel and CSV; the Export button downloads .xlsx directly with no CSV option (observed 2026-10-21)');

    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await page.getByRole('button', { name: 'Export SLA' }).click();

    await expect(page.getByText(/csv/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/excel|xlsx/i).first()).toBeVisible({ timeout: 3000 });
  });
});
