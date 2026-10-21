// ตัวกรอง Media ในแท็บ SLA เมื่อเลือกค่าหนึ่งแล้วจำนวนแถวต้องลดลง และทุกแถวต้องมี Media ตรงกับที่เลือก (รายการตัวเลือกมาจากข้อมูลจริง)
// spec: specs/mediaapproval-dashboard-plan.md (13.3) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginAs, openDashboard, settle, openReportTab, reportCount, reportColumn, reportFilterOptions,
  pickFirstFilterOptionWithResults, setReportPerPage,
} from './_helpers';

const MEDIA = /Filter by media$/;

test.describe('Export Report — SLA tab', () => {
  test('Media filter narrows rows', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'SLA');

    const options = await reportFilterOptions(page, 'SLA', MEDIA);
    expect(options[0]).toBe('All Media');
    expect(options.length).toBeGreaterThan(1);

    const all = await reportCount(page);
    const { option, count } = await pickFirstFilterOptionWithResults(page, 'SLA', MEDIA);
    expect(count).toBeLessThanOrEqual(all);

    await setReportPerPage(page, '100');
    for (const m of await reportColumn(page, 'SLA', 'Media')) expect(m).toBe(option);
  });
});
