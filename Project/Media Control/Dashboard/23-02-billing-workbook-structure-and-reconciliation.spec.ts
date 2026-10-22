// ไฟล์ Billing ต้องมี 2 ชีต (สรุป / รายละเอียด Prove) แถวสรุปตรงกับตารางทุกแถว No. ต่อเนื่อง Grand Total = ผลรวมและตรงกับ API มี header ตัวหนา/ freeze และข้อความใน dialog ตรงกับจำนวนแถวจริง
// test-case: BIL-H02..H06, BIL-U10 — spec: PB-2117; แผน: specs/mediaapproval-dashboard-plan.md (23.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, BILLING_COLUMNS } from './_helpers';
import { goToReport, readTableAllPages, exportToFile, readWorkbook, sheetMatrix, API } from './_report-helpers';

test.describe('Export Report — Billing (PB-2117)', () => {
  test('BIL-H02..H06 workbook matches the table and the API', { tag: ['@happy', '@regression'] }, async ({ page }, testInfo) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await goToReport(page, 'Billing');
    const table = await readTableAllPages(page, 'Billing');
    const api = (await (await page.request.get(`${API}/billing?export=1`)).json()).data;

    const { file, filename, dialogText } = await exportToFile(page, 'Billing', testInfo);
    expect(filename).toMatch(/^ค่าใช้จ่าย Prove เกิน \d{2} [A-Z][a-z]{2} \d{2}\.xlsx$/);
    const wb = await readWorkbook(file);
    expect(wb.worksheets.map((w) => w.name)).toEqual(['สรุป', 'รายละเอียด Prove']);

    const summary = sheetMatrix(wb.worksheets[0]);
    expect(summary[0]).toEqual(BILLING_COLUMNS);
    const body = summary.slice(1, -1);
    const totalRow = summary[summary.length - 1];
    expect(body.length).toBe(table.length);
    body.forEach((r, i) => {
      expect(r[0], 'No. is continuous').toBe(String(i + 1));
      // numeric columns are numbers in the file (7000) but formatted text in the table (7,000.00), so compare their values
      const norm = (r: string[]) => r.map((c, k) => (k >= 4 ? String(Number(c.replace(/[^0-9.]/g, ''))) : c.trim()));
      expect(norm(r), `row ${i + 1}`).toEqual(norm(table[i]));
    });
    expect(totalRow[6]).toBe('Grand Total');
    expect(Number(totalRow[7])).toBe(api.grandTotal);
    expect(body.reduce((s, r) => s + Number(r[7]), 0)).toBe(api.grandTotal);

    const detail = sheetMatrix(wb.worksheets[1]);
    expect(detail.length - 1).toBe(api.detailsTotal);
    expect(dialogText).toBe(`Exported ${table.length} groups to Excel (sheet สรุป) · ${detail.length - 1} Prove rows in sheet รายละเอียด Prove`);

    // formatting: bold header on both sheets, header row frozen, first sheet active
    for (const ws of wb.worksheets) expect(ws.getRow(1).getCell(1).font?.bold, `${ws.name} header bold`).toBe(true);
    expect(wb.worksheets[0].views[0]?.state, 'summary header frozen').toBe('frozen');
    expect(wb.views?.[0]?.activeTab ?? 0, 'opens on the summary sheet').toBe(0);
  });
});
