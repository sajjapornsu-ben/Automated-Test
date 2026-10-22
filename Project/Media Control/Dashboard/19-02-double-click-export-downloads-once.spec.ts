// ดับเบิลคลิกปุ่ม Export เร็วๆ ต้องเกิดการดาวน์โหลดแค่ 1 ไฟล์ และมี dialog "Export Successful" แค่ 1 อัน
// test-case: CMN-E01 — แผน: specs/mediaapproval-dashboard-plan.md (19.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab } from './_helpers';

test.describe('Export Report — common (CMN)', () => {
  test('CMN-E01 double-clicking Export downloads only one file', { tag: ['@edge'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    let downloads = 0;
    page.on('download', () => downloads++);

    // A real double click at the button's position (Playwright's dblclick() would wait on the modal that appears after the first click).
    const box = (await page.getByRole('button', { name: 'Export SLA' }).boundingBox())!;
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);

    await expect(page.getByRole('heading', { name: 'Export Successful' })).toHaveCount(1);
    await page.waitForTimeout(3000); // allow a (buggy) second download to arrive
    expect(downloads).toBe(1);
  });
});
