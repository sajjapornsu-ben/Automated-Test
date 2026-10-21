// จำนวน record ของ Export Report ต้องไม่เปลี่ยนเมื่อเปลี่ยนช่วงวันที่ด้านบน (Today) หรือกรอง Sale Package เพราะใช้ตัวกรองของตัวเองเท่านั้น
// spec: specs/mediaapproval-dashboard-plan.md (12.3) — คำอธิบายในหน้า: "with the filters applied below"
// seed: seed.spec.ts
//
// หมายเหตุ: PB-2112 BR9/BR13 ระบุว่าทุก widget ต้องคำนวณตามช่วงที่เลือก (ยกเว้น SLA per Graphic) — ส่วน Export Report ไม่ได้ถูกระบุ
// ชัดเจนว่าอยู่ในกลุ่มนี้ จึงบันทึกตามพฤติกรรมจริง (เป็นอิสระ) และเป็นข้อที่ควรยืนยันกับทีม

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, reportCount, presetButton, filterByFirstPackage } from './_helpers';

test.describe('Export Report — common', () => {
  test('Report is independent of the top range and package filter', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    const before = await reportCount(page);
    expect(before).toBeGreaterThan(0);

    // Package first: with an empty range (Today) the package list itself would be empty.
    await filterByFirstPackage(page);
    expect(await reportCount(page)).toBe(before);

    await presetButton(page, 'Today').click();
    await settle(page);
    expect(await reportCount(page)).toBe(before);
  });
});
