// กราฟ SLA แสดงเส้น Feedback และ Progress เป็นค่าเริ่มต้น คลิกการ์ดไหนเส้นของการ์ดนั้นจะถูกซ่อน (toggle) และอีกเส้นยังอยู่ — ทีมยืนยันว่าเป็นพฤติกรรมที่ถูกต้อง
// spec: specs/mediaapproval-dashboard-plan.md (18.7) — PB-2112 2.3 ข้อ 5
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaCard, slaChartStrokes, FEEDBACK_STROKE, PROGRESS_STROKE } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('SLA lines are shown by default and a card click hides its own line', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await expect.poll(() => slaChartStrokes(page)).toEqual(expect.arrayContaining([FEEDBACK_STROKE, PROGRESS_STROKE]));

    await (await slaCard(page, 'Feedback')).card.click();
    await expect.poll(() => slaChartStrokes(page)).not.toContain(FEEDBACK_STROKE);
    expect(await slaChartStrokes(page)).toContain(PROGRESS_STROKE);
  });
});
