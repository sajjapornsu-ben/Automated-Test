// ค้นหาใน Transaction/Airtime ต้องได้จำนวนเท่ากับ API ค้นหา ผลลัพธ์ต้องมีคำค้น และพิมพ์ตัวพิมพ์ใหญ่/เล็ก หรือมีช่องว่างหน้าท้าย ต้องได้ผลเท่ากัน
// test-case: TRX-H02, TRX-E01, TRX-E02, AIR-H03 — spec: PB-2113; แผน: specs/mediaapproval-dashboard-plan.md (21.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, reportCount, reportColumn, setReportPerPage } from './_helpers';
import { goToReport, fetchAll, searchReport, API_OF } from './_report-helpers';

for (const tab of ['Transaction', 'Airtime'] as const) {
  test.describe(`Export Report — ${tab} (PB-2113)`, () => {
    test(`${tab === 'Transaction' ? 'TRX-H02/E01/E02' : 'AIR-H03'} search by company or client product`, { tag: ['@happy', '@edge'] }, async ({ page }) => {
      await loginAs(page, 'headCg');
      await openDashboard(page);
      await goToReport(page, tab);

      const rows = (await fetchAll(page, API_OF[tab])).rows;
      const term = String(rows.find((r) => r.company && String(r.company).length > 4)!.company).slice(0, 5);
      const expected = (await fetchAll(page, API_OF[tab], { search: term })).rows.length;
      expect(expected).toBeGreaterThan(0);

      await searchReport(page, tab, term);
      await expect.poll(() => reportCount(page)).toBe(expected);
      await setReportPerPage(page, '100');
      const hay = [...(await reportColumn(page, tab, 'Company Name')), ...(await reportColumn(page, tab, 'Client Product'))];
      expect(hay.some((c) => c.toLowerCase().includes(term.toLowerCase()))).toBe(true);

      await searchReport(page, tab, term.toUpperCase());
      await expect.poll(() => reportCount(page), 'upper case').toBe(expected);
      await searchReport(page, tab, term.toLowerCase());
      await expect.poll(() => reportCount(page), 'lower case').toBe(expected);
      await searchReport(page, tab, `  ${term}  `);
      await expect.poll(() => reportCount(page), 'surrounding spaces').toBe(expected);
    });
  });
}
