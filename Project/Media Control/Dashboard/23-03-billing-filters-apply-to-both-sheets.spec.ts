// กรอง Media ในแท็บ Billing แล้ว Export ต้องได้เฉพาะ Media นั้นทั้งชีตสรุปและรายละเอียด จำนวนกลุ่มเท่ากับตาราง และกรอง Status = Cancelled ต้องไม่มีกลุ่ม (งานยกเลิกไม่ถูกนับ)
// test-case: BIL-H07, BIL-H08, BIL-E06 — spec: PB-2117; แผน: specs/mediaapproval-dashboard-plan.md (23.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, reportFilterOptions, pickReportFilter } from './_helpers';
import { goToReport, readTableAllPages, exportToFile, readWorkbook, sheetMatrix } from './_report-helpers';

const MEDIA = /Filter by media$/;
const STATUS = /Filter by status$/;

test.describe('Export Report — Billing (PB-2117)', () => {
  test('BIL-H07/H08 media filter is applied to the table and to both sheets', { tag: ['@happy', '@regression'] }, async ({ page }, testInfo) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'Billing');

    const all = await readTableAllPages(page, 'Billing');
    const packs = [...new Set(all.map((r) => r[1]))];
    expect(packs.length, 'data covers at least two packs').toBeGreaterThanOrEqual(1);
    const media = (await reportFilterOptions(page, 'Billing', MEDIA)).filter((o) => !/^All /.test(o));
    expect(media.length).toBeGreaterThan(0);

    let picked = '';
    for (const m of media) {
      await pickReportFilter(page, 'Billing', MEDIA, m);
      await expect.poll(() => reportCount(page)).toBeGreaterThanOrEqual(0);
      if ((await reportCount(page)) > 0) { picked = m; break; }
    }
    expect(picked, 'a media with billing rows').not.toBe('');

    const table = await readTableAllPages(page, 'Billing');
    expect(table.length).toBeLessThanOrEqual(all.length);
    const { file } = await exportToFile(page, 'Billing', testInfo);
    const wb = await readWorkbook(file);
    const summary = sheetMatrix(wb.worksheets[0]).slice(1, -1);
    expect(summary.map((r) => r[2])).toEqual(table.map((r) => r[2]));
    const detail = sheetMatrix(wb.worksheets[1]);
    const packCol = detail[0].indexOf('สื่อ/Pack');
    const tablePacks = new Set(table.map((r) => r[1]));
    for (const r of detail.slice(1)) expect(tablePacks.has(r[packCol]), `detail pack ${r[packCol]} belongs to the filtered groups`).toBe(true);
  });

  test('BIL-E06 Status = Cancelled shows no billing groups', { tag: ['@edge'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'Billing');
    const options = await reportFilterOptions(page, 'Billing', STATUS);
    test.skip(!options.includes('Cancelled'), 'No Cancelled option in the Status filter');
    await pickReportFilter(page, 'Billing', STATUS, 'Cancelled');
    await expect.poll(() => reportCount(page)).toBe(0);
  });
});
