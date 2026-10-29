// Assign Ticket — Super Admin: ข้อมูลของแต่ละ Job ในหน้า Assign Ticket ต้องตรงกับหน้า Transaction 
// (Export Report) — Client / Product / Sale Package / Media Type / Media Type (Epicor/SF) / Sales Person / Quotation 
// และทุก Job ในหน้า Assign ต้องมีใน Transaction
// spec: specs/assign-ticket-plan.md (1.2) — Super Admin; เทียบกับ GET /api/mediaTickets/reports/transaction?export=1
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard } from '../Dashboard/_helpers';
import { goToReport, fetchAll } from '../Dashboard/_report-helpers';
import { openAssignList, readAllRows } from './_helpers';

test.describe('Assign Ticket — Super Admin data equals the Transaction report', () => {
  test('AT-SA-05 every job in Assign Ticket matches its Transaction row', { tag: ['@regression', '@happy'] }, async ({ page }) => {
    test.setTimeout(480000);
    await loginAs(page, 'superAdmin');
    await openDashboard(page);
    await goToReport(page, 'Transaction');
    const trx = (await fetchAll(page, 'transaction')).rows;
    const byJob = new Map<string, any>();
    for (const r of trx) if (!byJob.has(r.jobCode)) byJob.set(r.jobCode, r);

    await openAssignList(page);
    const list = await readAllRows(page);
    expect(list.length, 'jobs read from Assign Ticket').toBeGreaterThan(0);

    const missing: string[] = [];
    const diffs: string[] = [];
    // not compared: Period (the list shows the Job period; the Transaction report has only the contract and on-air dates)
    for (const r of list) {
      const t = byJob.get(r.job);
      if (!t) {
        missing.push(`${r.job} (${r.status})`);
        continue;
      }
      const expected: Record<string, string> = {
        client: String(t.company ?? '').trim(),
        product: String(t.clientProduct ?? '').trim(),
        salePackage: t.salePackageName ?? '',
        quotation: t.quotationNo ?? '—',
        sales: t.sales ?? '',
        mediaType: t.mediaType ?? '',
        epicor: t.mediaTypeEpicor ?? '',
      };
      const actual: Record<string, string> = {
        client: r.client,
        product: r.product,
        salePackage: r.salePackage,
        quotation: r.quotation,
        sales: r.sales,
        mediaType: r.mediaLine.split('→').pop()!.trim(),
        epicor: r.epicor,
      };
      for (const k of Object.keys(expected)) if (expected[k] !== actual[k]) diffs.push(`${r.job} ${k}: Assign Ticket "${actual[k]}" ≠ Transaction "${expected[k]}"`);
    }
    expect.soft(missing, `Assign Ticket jobs with no Transaction row (${missing.length})`).toEqual([]);
    expect.soft(diffs.slice(0, 60), `field differences (${diffs.length})`).toEqual([]);
  });
});
