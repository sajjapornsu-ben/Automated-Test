// แท็บ SLA ต้องมีคอลัมน์ Job No, Ticket, Client, Product, Media, Graphic, Status, Feedback SLA, Progress SLA, Created Date ครบตามลำดับ
// spec: specs/mediaapproval-dashboard-plan.md (13.1) — PB-2113 BR47 (คอลัมน์ตามสเปคย่อย PB-2116 — ไม่ได้แนบ จึงอ้างอิงตามหน้าจริง)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportHeaders, SLA_COLUMNS } from './_helpers';

test.describe('Export Report — SLA tab', () => {
  test('Table columns', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    expect(await reportHeaders(page, 'SLA')).toEqual(SLA_COLUMNS);
  });
});
