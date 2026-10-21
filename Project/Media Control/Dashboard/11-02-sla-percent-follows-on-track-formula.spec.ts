// เปอร์เซ็นต์ SLA ในการ์ดต้องเท่ากับ (job ทั้งหมด − job ที่เกิน) ÷ job ทั้งหมด × 100 ตามสูตร on-track ทั้ง Feedback และ Progress ทั้งแบบทุกคนและรายบุคคล
// spec: specs/mediaapproval-dashboard-plan.md (11.2) — PB-2112 BR25 (10 job ไม่เกิน 8 เกิน 2 → 80%), AC14
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaCard, selectSlaScope, waitForSlaLoaded } from './_helpers';

test.describe('SLA per Graphic', () => {
  test('SLA % matches its overdue counts', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await waitForSlaLoaded(page);

    const check = async (state: string) => {
      for (const metric of ['Feedback', 'Progress'] as const) {
        const { pct, overdue, total } = await slaCard(page, metric);
        if (total === 0) continue; // no jobs → nothing to compute
        expect(pct, `${state} ${metric}: ${total - overdue}/${total}`).toBe(Math.round(((total - overdue) / total) * 100));
      }
    };

    await check('Everyone (Average)');
    await selectSlaScope(page, 'CG - QA 2');
    await check('CG - QA 2');
  });
});
