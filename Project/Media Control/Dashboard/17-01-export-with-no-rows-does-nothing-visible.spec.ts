// กด Export ตอนไม่มีข้อมูล (0 records) ต้องไม่มี error: ปุ่มยังกดได้ แต่ไม่มี dialog "Export Successful" และไม่มีหน้าต่าง error
// spec: specs/mediaapproval-dashboard-plan.md (17.1) — PB-2112 BR14 (ไม่มีข้อมูล → ไม่แสดง error)
// seed: seed.spec.ts
//
// หมายเหตุ (สังเกตจากของจริง): ปุ่มไม่ถูก disable และกดแล้วไม่มีอะไรเกิดขึ้นเลย (ไม่มีทั้ง dialog และข้อความแจ้งว่าไม่มีข้อมูลให้ export)
// เป็นข้อสังเกตด้าน UX ไม่ใช่ข้อผิดพลาดตาม spec — ถ้าทีมเปลี่ยนเป็น disable/แจ้งเตือน ให้ปรับเทสนี้

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportPanel } from './_helpers';

test.describe('Export Report — edge cases', () => {
  test('Export with no rows does nothing visible and raises no error', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Transaction');

    await reportPanel(page, 'Transaction').getByRole('textbox', { name: 'Search report' }).fill('zzzz-no-such-record-zzzz');
    await expect.poll(() => reportCount(page)).toBe(0);

    let downloaded = false;
    page.on('download', () => (downloaded = true));
    await expect(page.getByRole('button', { name: 'Export Transaction' })).toBeEnabled();
    await page.getByRole('button', { name: 'Export Transaction' }).click();
    await page.waitForTimeout(2500);

    expect(downloaded, 'no file is produced for an empty result').toBe(false);
    await expect(page.getByRole('heading', { name: 'Export Successful' })).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
