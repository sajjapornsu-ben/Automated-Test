// [spec PB-2112] คลิกการ์ด Feedback/Progress SLA แล้วกราฟต้องแสดงเส้นของเมตริกที่เลือก — หน้าจริงคลิกแล้วเส้นของการ์ดนั้น "หาย" จึงตั้งเป็น expected fail
// spec: specs/mediaapproval-dashboard-plan.md (18.7) — PB-2112 2.3 ข้อ 5
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaCard, slaChartStrokes, FEEDBACK_STROKE, PROGRESS_STROKE } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Clicking an SLA card shows that metric\'s line', async ({ page }) => {
    test.fail(true, 'PB-2112 2.3 #5: clicking Feedback should show the Feedback line; the page instead hides the Feedback line and keeps Progress (observed 2026-10-21)');

    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    await (await slaCard(page, 'Feedback')).card.click();

    const strokes = await slaChartStrokes(page);
    expect(strokes).toContain(FEEDBACK_STROKE);
    expect(strokes).not.toContain(PROGRESS_STROKE);
  });
});
