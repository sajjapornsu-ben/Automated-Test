// Verify & Production — CG: "My Workload" = ตัวเลขการ์ดสถานะรวมกัน, Search (Job / Ticket / Client / Product), ตัวกรองทั้งหมด (Status, Head CG, Media Group, Media Type) แต่ละค่าทำให้ตารางเหลือเฉพาะแถวที่ตรง, ใช้หลายตัวกรองร่วมกัน และ Reset คืนค่า
// spec: specs/verify-production-plan.md (2) — CG (cg1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { overview, headerCounts } from '../Dashboard/_cross-helpers';
import { openVpList, dataRows, readRow, readAllRows, searchList, footerTotal, filterOptions, pickFilter, resetFilters, columnTexts, FilterKind } from './_helpers';

test.describe('Verify & Production — CG list search and filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cg1');
    await openVpList(page);
  });

  test('VP-CG-01 My Workload equals the status cards and the table total', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const total = await footerTotal(page);
    const ov = await overview(page);
    expect(total).toBeGreaterThan(0);
    expect(ov.total, 'status cards add up to the table total').toBe(total);
    await expect(page.getByText(`My Workload`)).toBeVisible();
    // The header counts Tickets ("91 tickets · 96 jobs"): a Ticket with several Jobs counts once, while the table and the cards count Jobs.
    const header = await headerCounts(page);
    const rows = await readAllRows(page);
    expect(header.tickets, 'header tickets = distinct tickets in the table').toBe(new Set(rows.map((r) => r.ticket)).size);
    if (header.jobs !== undefined) expect(header.jobs, 'header jobs = table total').toBe(total);
  });

  test('VP-CG-02 search by Job No, Ticket No, Client and Product; no match; clear', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    const total = await footerTotal(page);
    const sample = await readRow(dataRows(page).nth(1));
    for (const term of [sample.job, sample.ticket, sample.product].filter(Boolean)) {
      await searchList(page, term);
      const n = await footerTotal(page);
      expect(n, `"${term}" finds the job`).toBeGreaterThan(0);
      expect(n).toBeLessThanOrEqual(total);
      const texts = await dataRows(page).allInnerTexts();
      expect(texts.some((t) => t.includes(sample.job)), `"${term}" result contains ${sample.job}`).toBe(true);
      for (const t of texts) expect(t.toLowerCase(), `row matches "${term}"`).toContain(term.toLowerCase());
    }
    await searchList(page, 'zzzz-no-such-ticket');
    expect(await footerTotal(page)).toBe(0);
    await expect(dataRows(page)).toHaveCount(0);
    await searchList(page, '');
    expect(await footerTotal(page)).toBe(total);
  });

  // every option of every filter narrows the table to the matching rows (cell index: 3 = Media, 6 = Assigned By, 9 = Status)
  const FILTERS: { kind: FilterKind; cell: number }[] = [
    { kind: 'status', cell: 9 },
    { kind: 'Head CG', cell: 6 },
    { kind: 'media', cell: 3 },
    { kind: 'media type', cell: 3 },
  ];
  for (const f of FILTERS) {
    test(`VP-CG-03 filter by ${f.kind}: each option shows only matching rows`, { tag: ['@happy', '@regression'] }, async ({ page }) => {
      test.setTimeout(900000); // a dozen options, each: pick, read the rows, reset - slow when the run is busy
      const total = await footerTotal(page);
      const options = await filterOptions(page, f.kind);
      expect(options.length, `${f.kind} options`).toBeGreaterThan(0);
      let combined = 0;
      for (const o of options) {
        await pickFilter(page, f.kind, o);
        const n = await footerTotal(page);
        combined += n;
        if (n > 5) await page.getByRole('combobox').last().selectOption('100'); // the pager shows 5 rows by default; none when nothing is left
        await page.waitForTimeout(800);
        const cells = await columnTexts(page, f.cell);
        expect(cells.length, `${f.kind} = ${o}: rows shown (first page)`).toBe(Math.min(n, 100));
        for (const c of cells) expect(c, `${f.kind} = ${o}`).toContain(o);
        await resetFilters(page);
      }
      if (f.kind === 'status' || f.kind === 'media') expect(combined, `every ${f.kind} option together = all rows`).toBe(total);
    });
  }

  test('VP-CG-04 filters combine with each other and with search; Reset restores everything', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    const all = await readAllRows(page);
    const withStatus = all.find((r) => r.status === 'Final Approve') ?? all[0];
    const total = await footerTotal(page);

    await pickFilter(page, 'status', withStatus.status);
    await pickFilter(page, 'media', withStatus.mediaGroup);
    const expected = all.filter((r) => r.status === withStatus.status && r.mediaGroup === withStatus.mediaGroup).length;
    expect(await footerTotal(page), 'status + media group').toBe(expected);

    await searchList(page, withStatus.job);
    expect(await footerTotal(page), 'status + media + job search').toBe(1);

    await resetFilters(page);
    await searchList(page, '');
    expect(await footerTotal(page)).toBe(total);
    await expect(page.getByPlaceholder('Search ticket, product, client...')).toHaveValue('');
  });
});
