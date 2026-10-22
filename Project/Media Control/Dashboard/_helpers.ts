import { Page, expect } from '@playwright/test';
import { loginWithCache } from '../auth-cache';

export type Role = 'sale' | 'mediaManagement' | 'headCg' | 'cg1' | 'cg2' | 'superAdmin';

const ENV_PREFIX: Record<Role, string> = {
  sale: 'MEDIA_CONTROL',
  mediaManagement: 'MEDIA_MANAGEMENT',
  headCg: 'HEAD_CG',
  cg1: 'CG1',
  cg2: 'CG2',
  superAdmin: 'SUPER_ADMIN',
};

export const NON_SALE_ROLES: Role[] = ['mediaManagement', 'headCg', 'cg1', 'cg2'];

export const DASHBOARD_URL = 'https://uat-mediacontrol.planbmedia.co.th/mediaApproval/dashboard';

export async function loginAs(page: Page, role: Role) {
  const prefix = ENV_PREFIX[role];
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    throw new Error(`Missing ${prefix}_EMAIL or ${prefix}_PASSWORD in .env`);
  }
  // Reuses a cached session for this account when possible (see ../auth-cache.ts), else logs in via the form.
  await loginWithCache(page, role, email, password);
}

export async function openDashboardFromSidebar(page: Page) {
  const group = page.getByRole('button', { name: 'MEDIA APPROVAL' });
  await group.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Media Approval Dashboard' })).toBeVisible();
}

export async function openDashboard(page: Page) {
  await page.goto(DASHBOARD_URL);
  await expect(page.getByRole('heading', { name: 'Media Approval Dashboard' })).toBeVisible();
}

// Sidebar links render only after the user's permissions load.
export async function sidebarLinks(page: Page): Promise<string[]> {
  await page.waitForLoadState('networkidle');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link').first()).toBeVisible();
  return nav.getByRole('link').allTextContents();
}

// ---------- date range bar ----------
export const PRESETS = ['Today', 'Week', 'Month', 'Quarter', 'Year'] as const;
export type Preset = (typeof PRESETS)[number];

export const dateButtons = (page: Page) => page.getByRole('button', { name: /^\d\d\/\d\d\/\d{4}$/ });

export async function dateRange(page: Page): Promise<[string, string]> {
  const btns = dateButtons(page);
  return [(await btns.nth(0).innerText()).trim(), (await btns.nth(1).innerText()).trim()];
}

export const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

export function expectedRange(preset: Preset, now = new Date()): [string, string] {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (preset) {
    case 'Today':
      return [fmt(now), fmt(now)];
    case 'Week': {
      const mondayOffset = (now.getDay() + 6) % 7;
      const mon = new Date(y, m, now.getDate() - mondayOffset);
      const sun = new Date(y, m, now.getDate() - mondayOffset + 6);
      return [fmt(mon), fmt(sun)];
    }
    case 'Month':
      return [fmt(new Date(y, m, 1)), fmt(new Date(y, m + 1, 0))];
    case 'Quarter': {
      const qStart = Math.floor(m / 3) * 3;
      return [fmt(new Date(y, qStart, 1)), fmt(new Date(y, qStart + 3, 0))];
    }
    case 'Year':
      return [fmt(new Date(y, 0, 1)), fmt(new Date(y, 11, 31))];
  }
}

export const presetButton = (page: Page, preset: Preset) =>
  page.getByRole('button', { name: preset, exact: true }).first();

// The active preset is shown only through an inline purple text colour (no aria state).
export async function activePreset(page: Page): Promise<Preset | null> {
  return page.evaluate((presets) => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        presets.includes((b.textContent || '').trim()) &&
        (b as HTMLElement).className.includes('h-7') &&
        ((b as HTMLElement).style.color === 'rgb(124, 58, 237)' || (b as HTMLElement).className.includes('7C3AED'))
    );
    return btn ? ((btn.textContent || '').trim() as any) : null;
  }, [...PRESETS]);
}

// ---------- KPI cards ----------
export const KPI_LABELS = [
  'Total Tickets',
  'Total Jobs (Version)',
  'Total Prove',
  'Cancelled Jobs (Version)',
  'Approved by Format',
  'Approved-Ref by Format',
  'Hold by Format',
  'Cancelled by Format',
] as const;

// A KPI card is the label's direct parent: [LABEL, value, caption].
export async function kpiCard(page: Page, label: string): Promise<{ value: number; caption: string }> {
  // The label sits in a header row (label + info icon); value and caption are siblings of that row,
  // so walk up to the first ancestor that holds a number.
  const labelEl = page.getByText(label, { exact: true }).first();
  for (const up of ['xpath=..', 'xpath=../..']) {
    const lines = (await labelEl.locator(up).innerText()).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const idx = lines.findIndex((l) => /^[0-9,]+$/.test(l));
    if (idx !== -1) return { value: Number(lines[idx].replace(/,/g, '')), caption: lines[idx + 1] ?? '' };
  }
  throw new Error(`No numeric value in KPI card "${label}"`);
}

export async function kpiValue(page: Page, label: string): Promise<number> {
  return (await kpiCard(page, label)).value;
}

export const KPI_CAPTIONS: Record<(typeof KPI_LABELS)[number], string> = {
  'Total Tickets': 'In selected range',
  'Total Jobs (Version)': 'In selected range',
  'Total Prove': 'Across all jobs',
  'Cancelled Jobs (Version)': 'Cancelled',
  'Approved by Format': 'Approved',
  'Approved-Ref by Format': 'Approved-Ref',
  'Hold by Format': 'On hold',
  'Cancelled by Format': 'Cancelled',
};

// Alert / financial cards are two levels above their label: [LABEL, subtitle, value, unit].
async function bigCardLines(page: Page, label: string): Promise<string[]> {
  const card = page.getByText(label, { exact: true }).first().locator('xpath=../..');
  return (await card.innerText()).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export async function alertCard(page: Page, label: 'High-Version Jobs' | 'High-Prove Versions') {
  const lines = await bigCardLines(page, label);
  const idx = lines.findIndex((l) => /^[\d,]+$/.test(l));
  if (idx === -1) throw new Error(`No count in alert card "${label}": ${lines.join(' | ')}`);
  return { subtitle: lines[1], count: Number(lines[idx].replace(/,/g, '')), unit: lines[idx + 1] };
}

export async function surchargeCard(page: Page, label: 'Extra Version Surcharge' | 'Extra Prove Surcharge') {
  const lines = await bigCardLines(page, label);
  const amountLine = lines.find((l) => l.startsWith('฿'));
  const unitLine = lines.find((l) => l.startsWith('THB'));
  if (!amountLine || !unitLine) throw new Error(`Unexpected surcharge card "${label}": ${lines.join(' | ')}`);
  const count = Number(unitLine.match(/(\d[\d,]*)\s+(?:jobs?|rounds?)/i)![1].replace(/,/g, ''));
  return {
    subtitle: lines[1],
    amount: Number(amountLine.replace(/[^\d]/g, '')),
    amountText: amountLine,
    unitText: unitLine,
    count,
  };
}

// Waits for the dashboard to settle after a filter change (KPIs are fetched async).
export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
}

// ---------- sale package filter ----------
export const salePackageButton = (page: Page) => page.getByRole('button', { name: /Sale Package/ }).first();

export async function openSalePackagePopover(page: Page) {
  await salePackageButton(page).click();
  await expect(page.getByRole('checkbox', { name: 'Select All' })).toBeVisible();
}

// The popover closes on Escape.
export async function closePopover(page: Page) {
  await page.keyboard.press('Escape');
  await expect(page.getByRole('checkbox', { name: 'Select All' })).toHaveCount(0);
}

// Names of the individual package checkboxes (everything except "Select All").
export async function packageOptionNames(page: Page): Promise<string[]> {
  const names = await page
    .getByRole('checkbox')
    .evaluateAll((els) => els.map((e) => ((e.closest('label') || e.parentElement)!.textContent || '').trim()));
  return names.filter((n) => n && n !== 'Select All');
}

// Picks the first listed package in the Sale Package filter and returns its name.
export async function filterByFirstPackage(page: Page): Promise<string> {
  await openSalePackagePopover(page);
  const [first] = await packageOptionNames(page);
  await page.getByRole('checkbox', { name: first, exact: true }).check({ force: true });
  await settle(page);
  await closePopover(page);
  return first;
}

export const SURCHARGE_PER_EXTRA_VERSION_JOB = 20000;
export const SURCHARGE_PER_EXTRA_PROVE_ROUND = 7000;

// ---------- dashboard cards by section heading ----------
export function sectionCard(page: Page, heading: string) {
  return page
    .getByRole('heading', { name: heading, exact: true })
    .locator('xpath=ancestor::div[(contains(@class,"rounded") or contains(@class,"ma-surface"))][1]');
}

const lines = async (loc: ReturnType<Page['locator']>) =>
  (await loc.innerText()).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

// ---------- Tickets & Jobs by Sale Package ----------
export const PACKAGES_HEADING = 'Tickets & Jobs by Sale Package';

export function packageButtons(page: Page) {
  // Each package row is a button whose text reads "<group> <package> N tickets · M jobs".
  return sectionCard(page, PACKAGES_HEADING).getByRole('button', { name: /\d+ tickets? · \d+ jobs?/ });
}

export async function packageRows(page: Page) {
  const btns = packageButtons(page);
  const out: { group: string; name: string; tickets: number; jobs: number }[] = [];
  for (let i = 0; i < (await btns.count()); i++) {
    const [group, name, counts] = await lines(btns.nth(i));
    const m = counts.match(/(\d+) tickets? · (\d+) jobs?/)!;
    out.push({ group, name, tickets: Number(m[1]), jobs: Number(m[2]) });
  }
  return out;
}

export const packageButtonByName = (page: Page, name: string) =>
  packageButtons(page).filter({ hasText: name }).first();

// ---------- Job Type Distribution ----------
export async function jobTypeData(page: Page) {
  const l = await lines(sectionCard(page, 'Job Type Distribution (CG)'));
  const firstBar = l.indexOf('Animate');
  const legendStart = l.lastIndexOf('Animate');
  // Bar labels read "<value> <short name>" pairs; legend reads "<long name> <count>" pairs.
  const bars: number[] = [];
  for (let i = firstBar - 1; i < legendStart; i += 2) bars.push(Number(l[i]));
  const legend: { name: string; count: number }[] = [];
  for (let i = legendStart; i + 1 < l.length; i += 2) legend.push({ name: l[i], count: Number(l[i + 1]) });
  return { bars, legend };
}

// ---------- Jobs by Status ----------
export const STATUS_NAMES = [
  'Assign (Head CG)',
  'Verify (CG)',
  'Revise (Sale)',
  'On Process (CG)',
  'Review (Sale)',
  'Revise (CG)',
  'Final Approve',
  'Final Render',
  'Done',
] as const;

export const statusCard = (page: Page, name: string) =>
  sectionCard(page, 'Jobs by Status').getByRole('button', {
    name: new RegExp(String.raw`^\d+ ${name.replace(/[()]/g, String.raw`\$&`)}$`),
  });

export async function statusCount(page: Page, name: string): Promise<number> {
  const text = (await statusCard(page, name).innerText()).trim();
  return Number(text.split(/\r?\n/)[0]);
}

export const filterChip = (page: Page) =>
  sectionCard(page, 'Jobs by Status').getByRole('button', { name: /^Filter:/ });

// ---------- calendar (native month/year selects inside the date popover) ----------
// The open calendar popover = nearest ancestor of its month <select> that also holds the "Today" button.
// Scoping to it keeps day buttons apart from table pager buttons named "1", "2", ...
export const calendarDay = (page: Page, day: number) =>
  page
    .locator('select')
    .filter({ has: page.locator('option', { hasText: 'January' }) })
    .first()
    .locator('xpath=ancestor::div[.//button[normalize-space()="Today"]][1]')
    .getByRole('button', { name: String(day), exact: true });

// which: 0 = start button, 1 = end button. monthIndex is 0-based (0 = January).
export async function pickCalendarDate(page: Page, which: 0 | 1, year: number, monthIndex: number, day: number) {
  await dateButtons(page).nth(which).click();
  const selects = page.locator('select');
  await expect(selects).toHaveCount(2);
  await selects.nth(1).selectOption(String(year));
  await selects.nth(0).selectOption(String(monthIndex));
  await calendarDay(page, day).click();
  await settle(page);
}

// ---------- display names of the role accounts (used for "own data only" checks) ----------
export const DISPLAY_NAME: Partial<Record<Role, string>> = {
  cg1: 'CG - QA',
  cg2: 'CG - QA 2',
  headCg: 'Head CG - QA',
};

// ---------- Graphic Workload ----------
export const workloadGrid = (page: Page) => page.getByRole('grid', { name: 'Graphic Workload Table' });
export const workloadRows = (page: Page) => workloadGrid(page).getByRole('rowgroup').last().getByRole('row');

export async function workloadGraphicNames(page: Page): Promise<string[]> {
  const rows = workloadRows(page);
  const names: string[] = [];
  for (let i = 0; i < (await rows.count()); i++) {
    const raw = (await rows.nth(i).getByRole('rowheader').innerText()).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    names.push(raw[raw.length - 1]); // first line is the avatar initials
  }
  return names;
}

// ---------- SLA per Graphic ----------
export const slaSection = (page: Page) => sectionCard(page, 'SLA per Graphic');

export async function slaCard(page: Page, metric: 'Feedback' | 'Progress') {
  const card = slaSection(page).getByRole('button', { name: new RegExp(`^${metric} SLA`) });
  const l = (await card.innerText()).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const pct = Number(l.find((x) => x.endsWith('%'))!.replace('%', ''));
  const m = l.join(' ').match(/(\d+) overdue of (\d+)/)!;
  return { pct, overdue: Number(m[1]), total: Number(m[2]), card };
}

export const slaActivePeriod = (page: Page) => slaSection(page).locator('.sla-period-chip.is-active');

// Stroke colours of the trend-chart lines currently drawn (feedback #0EA5E9, progress #8B5CF6).
export async function slaChartStrokes(page: Page): Promise<string[]> {
  return slaSection(page)
    .locator('svg path[stroke]')
    .evaluateAll((ps) => ps.map((p) => p.getAttribute('stroke') || '').filter((s) => s.startsWith('#')));
}
export const FEEDBACK_STROKE = '#0EA5E9';
export const PROGRESS_STROKE = '#8B5CF6';

export async function selectSlaScope(page: Page, name: string) {
  await slaSection(page).getByRole('group').first().click();
  await page.getByRole('option', { name, exact: true }).click();
  await settle(page);
}

export async function slaScopeText(page: Page): Promise<string> {
  const t = await slaSection(page).innerText();
  return t.match(/Selected Scope:\s*(.+)/)![1].trim();
}

// ---------- Export Report (Head CG) ----------
import * as XLSX from 'xlsx';

export type ReportTab = 'SLA' | 'Transaction' | 'Airtime' | 'Billing';
export const REPORT_TABS: ReportTab[] = ['SLA', 'Transaction', 'Airtime', 'Billing'];

export const reportTablist = (page: Page) => page.getByRole('tablist', { name: 'Report Type' });
export const reportPanel = (page: Page, tab: ReportTab) => page.getByRole('tabpanel', { name: tab });

export async function openReportTab(page: Page, tab: ReportTab) {
  await page.getByRole('heading', { name: 'Export Report', exact: true }).scrollIntoViewIfNeeded();
  await reportTablist(page).getByRole('tab', { name: tab }).click();
  await expect(reportTablist(page).getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
  await settle(page);
  // Billing aggregates Prove rounds server-side and can take a while under load.
  if (tab === 'Billing') await page.getByText(/Showing \d+ groups/).first().waitFor({ timeout: 20000 }).catch(() => undefined);
}

export async function reportCount(page: Page): Promise<number> {
  const label = page.getByText(/Showing \d+ (records|groups)/).first();
  // An empty Billing result renders no "Showing N groups" label at all — but wait a moment first, so a table
  // that is merely still loading isn't mistaken for an empty one.
  await label.waitFor({ timeout: 4000 }).catch(() => undefined);
  if ((await label.count()) === 0) return 0;
  return Number((await label.innerText()).match(/Showing (\d+)/)![1]);
}

// Data rows only: <tbody>. (The Billing table also has a footer rowgroup with its totals.)
export const reportRows = (page: Page, tab: ReportTab) => reportPanel(page, tab).getByRole('table').locator('tbody tr');

export async function reportHeaders(page: Page, tab: ReportTab): Promise<string[]> {
  return (await reportPanel(page, tab).getByRole('table').getByRole('columnheader').allTextContents()).map((h) => h.trim());
}

// Text of every visible cell in the named column (current page of the table only).
export async function reportColumn(page: Page, tab: ReportTab, header: string): Promise<string[]> {
  const idx = (await reportHeaders(page, tab)).indexOf(header);
  if (idx === -1) throw new Error(`No "${header}" column in the ${tab} table`);
  // Let a freshly loaded/filtered table render its first row before reading the column.
  await reportRows(page, tab).first().waitFor({ timeout: 5000 }).catch(() => undefined);
  return reportRows(page, tab).evaluateAll(
    (trs, i) => trs.map((tr) => ((tr.querySelectorAll('td')[i] as HTMLElement | undefined)?.innerText ?? '').replace(/\s+/g, ' ').trim()),
    idx
  );
}

export const reportFilter = (page: Page, tab: ReportTab, label: RegExp) =>
  reportPanel(page, tab).getByRole('group').filter({ has: page.getByRole('button', { name: label }) }).first();

export async function pickReportFilter(page: Page, tab: ReportTab, label: RegExp, option: string) {
  await reportFilter(page, tab, label).click();
  await page.getByRole('listbox').first().getByRole('option', { name: option, exact: true }).first().click();
  await settle(page);
}

export async function reportFilterOptions(page: Page, tab: ReportTab, label: RegExp): Promise<string[]> {
  await reportFilter(page, tab, label).click();
  const opts = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((o) => o.trim());
  await page.keyboard.press('Escape');
  return opts;
}

// Tries each non-"All" option until one returns rows, so tests don't depend on fixed UAT data.
export async function pickFirstFilterOptionWithResults(page: Page, tab: ReportTab, label: RegExp) {
  const [, ...choices] = await reportFilterOptions(page, tab, label);
  for (const option of choices) {
    await pickReportFilter(page, tab, label, option);
    const n = await reportCount(page);
    if (n > 0) return { option, count: n };
  }
  throw new Error(`No ${label} option on the ${tab} tab returned any rows`);
}

export async function setReportPerPage(page: Page, value: 'Auto' | '10' | '25' | '50' | '100') {
  // Without a pager ("Showing 1 to X of T") there is no page-size control to change.
  if ((await page.getByText(/Showing [0-9]+ to [0-9]+ of [0-9]+/).count()) === 0) return;
  await page.getByRole('combobox').last().selectOption(value);
  await settle(page);
  if (value === 'Auto') return;
  // Wait until the pager reflects the new page size ("Showing 1 to X of T ...") so later row reads aren't stale.
  let shown = 0;
  await expect
    .poll(async () => {
      const m = (await page.getByText(/Showing \d+ to \d+ of \d+/).last().innerText()).match(/Showing 1 to (\d+) of (\d+)/);
      shown = m ? Number(m[1]) : 0;
      return m ? shown === Math.min(Number(value), Number(m[2])) : false;
    })
    .toBe(true);
  // The pager text can update before the table body does — wait for the rows themselves too.
  await expect(page.getByRole('tabpanel').locator('tbody tr')).toHaveCount(shown);
}

export async function pickReportDate(page: Page, tab: ReportTab, which: 'From' | 'To', year: number, monthIndex: number, day: number) {
  // An unset picker is named "From DD/MM/YYYY"; once a date is set it becomes "19/10/2026 Clear date" - so go by position (From first, To second).
  await reportPanel(page, tab).getByRole('button', { name: /DD.MM.YYYY|[0-9]{2}.[0-9]{2}.[0-9]{4}/ }).nth(which === 'From' ? 0 : 1).click();
  await page.locator('select').filter({ has: page.locator('option', { hasText: '2018' }) }).last().selectOption(String(year));
  await page.locator('select').filter({ has: page.locator('option', { hasText: 'January' }) }).last().selectOption(String(monthIndex));
  await calendarDay(page, day).click();
  await settle(page);
}

export const sheetRows = (wb: XLSX.WorkBook, sheet: string) =>
  XLSX.utils.sheet_to_json<any[]>(wb.Sheets[sheet], { header: 1 }) as any[][];

// Clicks Export, reads the downloaded workbook, dismisses the "Export Successful" dialog.
export async function exportReport(page: Page, tab: ReportTab) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: `Export ${tab}` }).click(),
  ]);
  const wb = XLSX.readFile((await download.path())!);
  await expect(page.getByRole('heading', { name: 'Export Successful' })).toBeVisible();
  // The success message is the line under the dialog heading ("Exported N records to Excel", ...).
  const dialogBody = await page.getByRole('heading', { name: 'Export Successful' }).locator('xpath=..').innerText();
  const dialogText = (dialogBody.split(/\r?\n/).find((l) => l.startsWith('Exported ')) ?? '').trim();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('heading', { name: 'Export Successful' })).toHaveCount(0);
  return { filename: download.suggestedFilename(), wb, dialogText };
}

export const TRANSACTION_COLUMNS = [
  'Transaction Date', 'Quote No.', 'PB/MEMO', 'Company Name', 'Sale Package', 'Media Type', 'Client Product',
  'File Name', 'Version', 'Version (Nick Name)', 'Durations', 'Number Spot/Loop (Time)', 'Total (Sec)',
  'Start On-Air', 'End On-Air', 'Start Contract Period', 'End Contract Period', 'Sound', 'Sales', 'Job Type',
  'Format, Screens', 'Create App', 'Sale Approve Status', 'Date Sale Approve', 'Landlord Approve Status', 'Date Landlord Approve',
];
export const SLA_COLUMNS = ['Job No', 'Ticket', 'Client', 'Product', 'Media', 'Graphic', 'Status', 'Feedback SLA', 'Progress SLA', 'Created Date'];
export const BILLING_COLUMNS = ['No.', 'สื่อ/Pack', 'สินค้า', 'Version', 'จำนวน Prove จริง', 'จำนวน Prove ที่เกิน', 'Rate / Prove', 'มูลค่า Prove ที่เกิน'];

// SLA per Graphic loads after the rest of the page; wait for its cards and chart lines before interacting.
export async function waitForSlaLoaded(page: Page) {
  await expect(slaSection(page).getByRole('button', { name: /^Feedback SLA/ })).toBeVisible();
  await expect.poll(async () => (await slaChartStrokes(page)).length).toBeGreaterThan(0);
}
