// ตัวช่วยสำหรับทดสอบหน้า Verify & Production (Media Approval > Verify & Production): role CG (cg1 / cg2) และ Super Admin (ดูอย่างเดียว)
import { Page, Locator, expect } from '@playwright/test';
import { openList, footerTotal } from '../Dashboard/_cross-helpers';

export const BASE = 'https://uat-mediacontrol.planbmedia.co.th/mediaApproval/productionReview';
export const SEARCH_PLACEHOLDER = 'Search ticket, product, client...';
export { footerTotal };

export const openVpList = async (page: Page) => {
  await openList(page, 'productionReview');
  await page.waitForLoadState('networkidle').catch(() => undefined);
};

export const grid = (page: Page) => page.getByRole('grid', { name: 'Verify and Production Tickets' });
export const dataRows = (page: Page) => grid(page).getByRole('row').filter({ has: page.getByRole('gridcell') });

const lines = (t: string) => t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

export type VpRow = {
  job: string;
  ticket: string;
  href: string;
  ver: string;
  prove: string;
  product: string;
  mediaGroup: string; // "Retail"
  mediaType: string; // "7-Eleven"
  salePackage: string;
  period: string;
  sales: string;
  assignedBy: string; // "Head CG - QA"
  status: string;
  approve: string; // "CU Approved LL Approved"
};

/** Builds a VpRow from the texts of a row: `head` = lines of the Job · Ticket cell, `cells` = lines of each gridcell (0 = Ver ... 10 = Approve). */
function parseRow(head: string[], cells: string[][], href: string): VpRow {
  const media = cells[3] ?? []; // ["Retail", "→", "7-Eleven", "7-Eleven Plus"] or ["Retail → 7-Eleven", "7-Eleven Plus"]
  const arrow = media.indexOf('→');
  const [group, type] = arrow >= 0 ? [media[arrow - 1], media[arrow + 1]] : (media[0] ?? '').split('→').map((s) => s.trim());
  const salePackage = arrow >= 0 ? media[arrow + 2] : media[1];
  return {
    job: head[0],
    ticket: head[1] ?? '',
    href,
    ver: cells[0]?.[0] ?? '',
    prove: cells[1]?.[0] ?? '',
    product: cells[2]?.[0] ?? '',
    mediaGroup: group ?? '',
    mediaType: type ?? '',
    salePackage: salePackage ?? '',
    period: cells[4]?.[0] ?? '',
    sales: cells[5]?.[0] ?? '',
    assignedBy: cells[6]?.[0] ?? '',
    status: (cells[9] ?? []).join(' '),
    approve: (cells[10] ?? []).join(' '),
  };
}

export async function readRow(row: Locator): Promise<VpRow> {
  const head = lines(await row.getByRole('rowheader').innerText());
  const cells: string[][] = [];
  const grid = row.getByRole('gridcell');
  for (let i = 0; i < 11; i++) cells.push(lines(await grid.nth(i).innerText()));
  return parseRow(head, cells, (await row.getByRole('link').first().getAttribute('href')) ?? '');
}

/** Every row of the current page in ONE call (reading ~100 rows cell by cell is slower than the 30 s test timeout). */
async function readPageRows(page: Page): Promise<VpRow[]> {
  const raw = await dataRows(page).evaluateAll((trs) =>
    trs.map((tr) => {
      const L = (el: Element | null | undefined) => ((el as HTMLElement | null)?.innerText ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      return {
        head: L(tr.querySelector('[role=rowheader]')),
        cells: Array.from(tr.querySelectorAll('[role=gridcell]')).map((c) => L(c)),
        href: tr.querySelector('a')?.getAttribute('href') ?? '',
      };
    })
  );
  return raw.map((r) => parseRow(r.head, r.cells, r.href));
}

/** Reads every row of the list (all pages, 100 per page). */
export async function readAllRows(page: Page): Promise<VpRow[]> {
  await page.getByRole('combobox').last().selectOption('100').catch(() => undefined);
  await page.waitForTimeout(1500);
  const total = await footerTotal(page);
  const out: VpRow[] = [];
  const seen = new Set<string>();
  for (let p = 0; p < 30 && seen.size < total; p++) {
    for (const r of await readPageRows(page)) {
      if (!seen.has(r.job)) {
        seen.add(r.job);
        out.push(r);
      }
    }
    if (seen.size >= total) break;
    await page.getByRole('button', { name: 'Next' }).click().catch(() => undefined);
    await page.waitForTimeout(1500);
  }
  return out;
}

export async function searchList(page: Page, term: string) {
  await page.getByPlaceholder(SEARCH_PLACEHOLDER).fill(term);
  await page.waitForTimeout(1000);
}

/** The filter dropdowns: label = the text after "Filter by" in the button name. */
export type FilterKind = 'status' | 'Head CG' | 'media' | 'media type';
const filterGroup = (page: Page, kind: FilterKind) => page.getByRole('group').filter({ has: page.getByRole('button', { name: new RegExp(`Filter by ${kind}$`) }) });

export async function filterOptions(page: Page, kind: FilterKind): Promise<string[]> {
  await filterGroup(page, kind).click();
  const opts = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((t) => t.trim()).filter((t) => t && !/^All /.test(t));
  await page.keyboard.press('Escape');
  return opts;
}

export async function pickFilter(page: Page, kind: FilterKind, option: string) {
  await filterGroup(page, kind).click();
  await page.getByRole('listbox').first().getByRole('option', { name: option, exact: true }).first().click();
  await expect(filterGroup(page, kind)).toContainText(option);
  await page.waitForTimeout(1000);
}

export const resetFilters = async (page: Page) => {
  await page.getByRole('button', { name: 'Reset' }).click();
  await page.waitForTimeout(1000);
};

export const domClick = (l: Locator) => l.evaluate((e) => (e as HTMLElement).click());

/** The first row in the given status; its detail link. null when the user has no such job right now. */
export async function firstJobWithStatus(page: Page, status: string): Promise<VpRow | null> {
  const rows = await readAllRows(page);
  return rows.find((r) => r.status === status) ?? null;
}

export async function openJob(page: Page, row: VpRow) {
  await page.goto(`https://uat-mediacontrol.planbmedia.co.th${row.href}`);
  await expect(page.getByRole('region', { name: 'Job Information' })).toContainText(row.job, { timeout: 60000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

/** Buttons that do work on a job detail page (everything a CG presses to move the job on). */
export const ACTION_BUTTONS = /^(Accept|Feedback|Submit Prove|Submit Re-Edit Prove|Submit Feedback Prove|Submit Skip Prove)$/;

/** Text of one column (cell index, 0 = Ver … 9 = Status) for every row on the page, read in a single call (fast). */
export const columnTexts = (page: Page, cell: number) =>
  dataRows(page).evaluateAll((trs, i) => trs.map((tr) => ((tr.querySelectorAll('[role=gridcell]')[i] as HTMLElement | undefined)?.innerText ?? '').replace(/\s+/g, ' ').trim()), cell);
