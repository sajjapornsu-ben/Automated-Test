// คลิกแถวกราฟิกในตาราง Workload แล้วแถวนั้นต้องถูกไฮไลต์ (focus) และคลิกซ้ำแถวเดิมต้องยกเลิกไฮไลต์ โดยไม่ทำให้จำนวนแถวเปลี่ยน
// spec: specs/mediaapproval-dashboard-plan.md (10.3) — hint ในหน้า: "Click a row to focus"
// seed: seed.spec.ts
//
// หมายเหตุ: ไฮไลต์แสดงด้วย class (bg-[#EFF4FF]) ไม่มี aria state; การคลิกแถวไม่ได้เปลี่ยน widget อื่น (KPI, Jobs by Status)
// ซึ่ง PB-2112 BR6 คาดว่า filter "บุคคล" ควรอัปเดต widget ที่เกี่ยวข้อง — บันทึกเป็นข้อสังเกตในแผน ไม่ได้ assert

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, workloadRows } from './_helpers';

const FOCUSED = /bg-\[#EFF4FF\]/;

test.describe('Graphic Workload', () => {
  test('Clicking a row focuses it', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const rows = workloadRows(page);
    const n = await rows.count();
    expect(n).toBeGreaterThan(1);

    await expect(rows.nth(1)).not.toHaveClass(FOCUSED);
    await rows.nth(1).click();
    await expect(rows.nth(1)).toHaveClass(FOCUSED);
    await expect(rows.nth(0)).not.toHaveClass(FOCUSED);
    expect(await rows.count()).toBe(n);

    await rows.nth(1).click();
    await expect(rows.nth(1)).not.toHaveClass(FOCUSED);
  });
});
