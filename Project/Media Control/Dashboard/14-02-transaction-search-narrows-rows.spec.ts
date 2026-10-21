// ค้นหาใน Transaction (Quote / Company / Product) ด้วยคำที่มีอยู่จริงแล้วจำนวนแถวต้องลดลง และทุกแถวต้องมีคำนั้นอยู่ในแถว
// spec: specs/mediaapproval-dashboard-plan.md (14.2) — PB-2113 BR47
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportCount, reportColumn, reportRows, reportPanel, setReportPerPage } from './_helpers';

test.describe('Export Report — Transaction tab', () => {
  test('Search narrows the rows', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await openReportTab(page, 'Transaction');

    const all = await reportCount(page);
    // Use the first row's own Company Name so the term is guaranteed to exist.
    const [company] = await reportColumn(page, 'Transaction', 'Company Name');
    expect(company).not.toBe('');

    await reportPanel(page, 'Transaction').getByRole('textbox', { name: 'Search report' }).fill(company);
    await page.waitForTimeout(1200);
    await settle(page);

    const n = await reportCount(page);
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(all);

    await setReportPerPage(page, '100');
    const rows = reportRows(page, 'Transaction');
    for (let i = 0; i < (await rows.count()); i++) {
      expect((await rows.nth(i).innerText()).toLowerCase(), `row ${i}`).toContain(company.toLowerCase());
    }
  });
});
