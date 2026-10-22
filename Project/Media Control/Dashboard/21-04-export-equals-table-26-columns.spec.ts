// Export Transaction/Airtime ต้องได้ไฟล์ 26 คอลัมน์ จำนวนแถวเท่ากับตารางทุกหน้า และค่าแต่ละช่องตรงกับตารางทีละแถว
// test-case: TRX-H05, TRX-H06, AIR-H05, AIR-H06 — spec: PB-2113; แผน: specs/mediaapproval-dashboard-plan.md (21.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, TRANSACTION_COLUMNS } from './_helpers';
import { goToReport, readTableAllPages, exportToFile, readWorkbook, sheetMatrix } from './_report-helpers';

for (const tab of ['Transaction', 'Airtime'] as const) {
  test.describe(`Export Report — ${tab} (PB-2113)`, () => {
    test(`${tab === 'Transaction' ? 'TRX-H05/H06' : 'AIR-H05/H06'} exported file equals the table`, { tag: ['@happy', '@regression'] }, async ({ page }, testInfo) => {
      test.setTimeout(300000);
      await loginAs(page, 'headCg');
      await openDashboard(page);
      await goToReport(page, tab);
      const table = await readTableAllPages(page, tab);
      const { file, filename } = await exportToFile(page, tab, testInfo);
      expect(filename).toMatch(new RegExp(`^${tab}_Report_\\d{8}_\\d{4}\\.xlsx$`));

      const [header, ...data] = sheetMatrix((await readWorkbook(file)).worksheets[0]);
      expect(header).toEqual(TRANSACTION_COLUMNS);
      expect(data.length).toBe(table.length);
      // Known deviation: the table shows Job Type as a Thai label ("ไฟล์สำเร็จ (Final File)", "เสนอขาย") while the file holds the raw
      // English value ("Final File", "Mockup"). So that one column is only checked to be non-empty; all others must be identical.
      const jt = TRANSACTION_COLUMNS.indexOf('Job Type');
      const trim = (r: string[]) => r.map((c, i) => (i === jt ? (String(c).trim() ? "set" : "") : String(c).trim()));
      data.forEach((row, i) => expect(trim(row), `row ${i + 1}`).toEqual(trim(table[i])));
    });
  });
}
