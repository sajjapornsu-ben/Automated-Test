// ตั้งตัวกรองไว้ในแท็บ SLA แล้วสลับไปแท็บ Billing และกลับมา ค่าตัวกรองและจำนวน record ต้องไม่ถูก reset (และ Billing ใช้ตัวกรองชุดเดียวกัน)
// test-case: CMN-H03 — spec: PB-2117 BR4; แผน: specs/mediaapproval-dashboard-plan.md (19.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, pickFirstFilterOptionWithResults, reportFilter } from './_helpers';

test.describe('Export Report — common (CMN)', () => {
  test('CMN-H03 filters persist when switching report tabs', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const sent: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('/reports/billing')) sent.push(new URL(r.url()).search);
    });
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    const { option, count } = await pickFirstFilterOptionWithResults(page, 'SLA', /Filter by status$/);

    await openReportTab(page, 'Billing');
    // Billing was queried with the status chosen on the SLA tab (shared filter state).
    await expect.poll(() => sent.some((s) => s.includes(`status=${encodeURIComponent(option)}`))).toBe(true);

    await openReportTab(page, 'SLA');
    await expect(reportFilter(page, 'SLA', /Filter by status$/)).toContainText(option);
    await expect.poll(() => reportCount(page)).toBe(count);
  });
});
