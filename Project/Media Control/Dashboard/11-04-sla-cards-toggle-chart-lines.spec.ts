// คลิกการ์ด Feedback/Progress SLA แล้วเส้นของเมตริกนั้นต้องถูกสลับ (ซ่อน/แสดง) บนกราฟ และคลิกซ้ำต้องกลับมาครบ 2 เส้น
// spec: specs/mediaapproval-dashboard-plan.md (11.4) — hint ในหน้า: "Click a card to filter the line in the chart"
// seed: seed.spec.ts
//
// หมายเหตุ (พฤติกรรมจริงที่สังเกตได้): การ์ดทั้งสองใบ active พร้อมกันตอนเริ่มต้น และการคลิกการ์ด = ซ่อนเส้นของการ์ดนั้น
// ขณะที่ PB-2112 หัวข้อ 2.3 ข้อ 5 ระบุว่า "แสดงเส้นของเมตริกที่เลือก" — ความต่างนี้ตรวจใน 18-07 (expected fail)

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaCard, slaChartStrokes, waitForSlaLoaded, FEEDBACK_STROKE, PROGRESS_STROKE } from './_helpers';

test.describe('SLA per Graphic', () => {
  test('Clicking an SLA card toggles its chart line', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await waitForSlaLoaded(page);

    await expect.poll(() => slaChartStrokes(page)).toEqual(expect.arrayContaining([FEEDBACK_STROKE, PROGRESS_STROKE]));

    const feedback = (await slaCard(page, 'Feedback')).card;
    await feedback.click();
    await expect(feedback).not.toHaveClass(/is-active/);
    await expect.poll(() => slaChartStrokes(page)).not.toContain(FEEDBACK_STROKE);
    expect(await slaChartStrokes(page)).toContain(PROGRESS_STROKE);

    await feedback.click();
    await expect(feedback).toHaveClass(/is-active/);
    await expect.poll(() => slaChartStrokes(page)).toEqual(expect.arrayContaining([FEEDBACK_STROKE, PROGRESS_STROKE]));
  });
});
