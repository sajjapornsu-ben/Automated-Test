// Head CG: หน้า Verify & Production ("My assigned tickets") ต้องแสดงเฉพาะงานที่ตัวเองเป็น Graphic — จำนวนต้องเท่ากับงานใน Export SLA ที่มีชื่อ Head CG - QA เป็น Graphic (ไม่รวม Draft) และผลรวมการ์ดสถานะเท่ากับจำนวนแถว
// test-case: XC-HCG-04 — เทียบ Verify & Production ↔ ข้อมูลงานของตนเอง; แผน: specs/mediaapproval-dashboard-plan.md (31.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from './_helpers';
import { fetchAll } from './_report-helpers';
import { openList, overview, footerTotal } from './_cross-helpers';

test.describe('Cross-check Head CG — Verify & Production', () => {
  test('XC-HCG-04 lists only the jobs assigned to the logged-in Head CG', { tag: ['@regression', '@security'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    const me = DISPLAY_NAME.headCg!;
    const mine = (await fetchAll(page, 'sla')).rows.filter(
      (r) => r.status !== 'Draft' && String(r.graphic ?? '').split(',').map((s) => s.trim()).includes(me)
    );

    await openList(page, 'productionReview');
    const o = await overview(page);
    expect(await footerTotal(page), 'footer = my jobs').toBe(mine.length);
    expect(o.total, 'sum of cards = my jobs').toBe(mine.length);
  });
});
