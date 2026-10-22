// ไฟล์ Excel ที่ export ต้องมี 10 คอลัมน์เหมือนตาราง จำนวนแถวเท่ากับทุกหน้ารวมกัน และเนื้อหา/ลำดับแต่ละแถวตรงกับตารางทุกแถว (ไม่ใช่แค่หน้าแรก)
// test-case: SLA-H10, SLA-H11, SLA-E06 — spec: PB-2116; PB-2112 BR45; แผน: specs/mediaapproval-dashboard-plan.md (20.8)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, SLA_COLUMNS } from './_helpers';
import { goToReport, readTableAllPages, exportToFile, readWorkbook, sheetMatrix } from './_report-helpers';

test.describe('Export Report — SLA tab (PB-2116)', () => {
  test('SLA-H10/H11/E06 exported file equals the on-screen table (all pages)', { tag: ['@happy', '@regression'] }, async ({ page }, testInfo) => {
    test.setTimeout(240000);
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'SLA');

    const table = await readTableAllPages(page, 'SLA');
    const { file, filename } = await exportToFile(page, 'SLA', testInfo);
    expect(filename).toMatch(/^SLA_Report_\d{8}_\d{4}\.xlsx$/);

    const wb = await readWorkbook(file);
    expect(wb.worksheets.map((w) => w.name)).toEqual(['SLA Report']);
    const [header, ...data] = sheetMatrix(wb.worksheets[0]);
    expect(header).toEqual(SLA_COLUMNS);
    expect(data.length, 'every page is exported, not only the current one').toBe(table.length);
    expect(data.length).toBeGreaterThan(100);

    // the table collapses surrounding whitespace (e.g. "Client " in the file), so compare trimmed values
    const trim = (r: string[]) => r.map((c) => String(c).trim());
    data.forEach((row, i) => expect(trim(row), `row ${i + 1}`).toEqual(trim(table[i])));
  });
});
