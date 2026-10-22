import { Page, TestInfo, expect } from '@playwright/test';
import * as ExcelJS from 'exceljs';
import { ReportTab, openReportTab, reportCount, setReportPerPage, reportPanel, reportHeaders, reportRows, settle } from './_helpers';

// Helpers for the Export Report test-case suite (PB-2114 / 2115 / 2116 / 2117).
// The report data comes from GET /api/mediaTickets/reports/{type}; "?export=1" returns every row (capped by maxExportRows).

export const API = 'https://uat-mediacontrol.planbmedia.co.th/api/mediaTickets/reports';
export type ReportType = 'sla' | 'transaction' | 'airtime' | 'billing';
export const TAB_OF: Record<ReportType, ReportTab> = { sla: 'SLA', transaction: 'Transaction', airtime: 'Airtime', billing: 'Billing' };
export const API_OF: Record<ReportTab, ReportType> = { SLA: 'sla', Transaction: 'transaction', Airtime: 'airtime', Billing: 'billing' };

type Params = Record<string, string | number | undefined>;

function qs(params: Params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') p.set(k, String(v));
  return p.toString();
}

/** Every row of a report for the logged-in user (uses the export endpoint), with optional API filters. */
export async function fetchAll(page: Page, type: ReportType, params: Params = {}) {
  const res = await page.request.get(`${API}/${type}?${qs({ ...params, export: 1 })}`);
  expect(res.status(), `${type} export API`).toBe(200);
  return (await res.json()).data as { total: number; rows: any[]; maxExportRows: number };
}

/** One page of a report, plus the raw HTTP status (for permission tests). */
export async function fetchPage(page: Page, type: ReportType, params: Params = {}) {
  const res = await page.request.get(`${API}/${type}?${qs({ page: 1, pageSize: 20, ...params })}`);
  return { status: res.status(), body: res.ok() ? (await res.json()).data : null };
}

export async function reportOptions(page: Page) {
  const res = await page.request.get(`${API}/options`);
  expect(res.status()).toBe(200);
  return (await res.json()).data as { media: { id: number; name: string }[]; graphics: { id: number; name: string }[]; statuses: string[] };
}

// The app shows dates in Thailand time (UTC+7) as DD/MM/YYYY.
export function bangkokDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get('day')}/${get('month')}/${get('year')}`;
}
/** DD/MM/YYYY → a sortable number (YYYYMMDD). */
export const dateKey = (ddmmyyyy: string) => {
  const [d, m, y] = ddmmyyyy.split('/').map(Number);
  return y * 10000 + m * 100 + d;
};
export const isoDay = (y: number, monthIndex: number, d: number) => `${y}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Opens the Export Report card on the given tab for the logged-in user (assumes loginAs + openDashboard already done). */
export async function goToReport(page: Page, tab: ReportTab) {
  await settle(page);
  await openReportTab(page, tab);
}

/** Reads every row of the on-screen table (all pages) as arrays of trimmed cell text. */
export async function readTableAllPages(page: Page, tab: ReportTab): Promise<string[][]> {
  const total = await reportCount(page);
  if (total === 0) return [];
  await setReportPerPage(page, '100');
  const out: string[][] = [];
  for (let p = 0; ; p++) {
    const rows = await reportRows(page, tab).evaluateAll((trs) =>
      trs.map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => (td as HTMLElement).innerText.replace(/\s+/g, ' ').trim()))
    );
    out.push(...rows);
    if (out.length >= total) break;
    await page.getByRole('button', { name: 'Next' }).click();
    // wait for the next page of rows to replace the current one
    await expect.poll(async () => (await reportRows(page, tab).count()) > 0).toBe(true);
    await page.waitForTimeout(400);
    await settle(page);
    if (p > 400) throw new Error('pagination did not terminate');
  }
  return out;
}

/** Clicks Export, saves the download into the test output folder and dismisses the success dialog. */
export async function exportToFile(page: Page, tab: ReportTab, testInfo: TestInfo) {
  // A click that lands during a re-render can be lost under load, so allow one retry with a bounded wait.
  const clickExport = () => Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.getByRole('button', { name: `Export ${tab}` }).click()]);
  const [download] = await clickExport().catch(() => clickExport());
  const file = testInfo.outputPath(download.suggestedFilename().replace(/[^\w.\-ก-๙]/g, '_') || 'export.xlsx');
  await download.saveAs(file);
  await expect(page.getByRole('heading', { name: 'Export Successful' })).toBeVisible();
  const body = await page.getByRole('heading', { name: 'Export Successful' }).locator('xpath=..').innerText();
  const dialogText = (body.split(/\r?\n/).find((l) => l.startsWith('Exported ')) ?? '').trim();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('heading', { name: 'Export Successful' })).toHaveCount(0);
  return { file, filename: download.suggestedFilename(), dialogText };
}

export async function readWorkbook(file: string) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  return wb;
}

/** A worksheet as a matrix of display strings (row 0 = header). Cell values are stringified; empty → ''. */
export function sheetMatrix(ws: ExcelJS.Worksheet): string[][] {
  const out: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const vals: string[] = [];
    for (let c = 1; c <= ws.columnCount; c++) {
      const v = row.getCell(c).value as any;
      vals.push(v === null || v === undefined ? '' : typeof v === 'object' && 'text' in v ? String(v.text) : String(v));
    }
    out.push(vals);
  });
  return out;
}

export const colIndex = (headers: string[], name: string) => {
  const i = headers.indexOf(name);
  if (i === -1) throw new Error(`No "${name}" column in [${headers.join(' | ')}]`);
  return i;
};

/** Search-box helper for the Transaction/Airtime tabs (the list reloads after a short debounce). */
export async function searchReport(page: Page, tab: ReportTab, term: string) {
  await reportPanel(page, tab).getByRole('textbox', { name: 'Search report' }).fill(term);
  await page.waitForTimeout(1200);
  await settle(page);
}

/** Counts API rows by a key. */
export const countBy = <T>(rows: T[], key: (r: T) => string) => {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + 1));
  return m;
};

export { reportHeaders };
