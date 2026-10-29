// ตัวช่วยสำหรับทดสอบหน้า Assign Ticket (Media Approval > Assign Ticket): Super Admin (ดูอย่างเดียว) และ Head CG (search / view / assign / re-assign)
import { Page, Locator, expect } from '@playwright/test';
import { openList, footerTotal } from '../Dashboard/_cross-helpers';

export const BASE = 'https://uat-mediacontrol.planbmedia.co.th/mediaApproval/assignTicket';
export const SEARCH_PLACEHOLDER = 'Search Job No / Ticket No / Client / Product…';

export const openAssignList = async (page: Page) => {
  await openList(page, 'assignTicket');
  await page.waitForLoadState('networkidle').catch(() => undefined);
};
export { footerTotal };

export const grid = (page: Page) => page.getByRole('grid', { name: 'Assign Ticket Table' });
export const dataRows = (page: Page) => grid(page).getByRole('row').filter({ has: page.getByRole('gridcell') });
export const rowOfJob = (page: Page, job: string): Locator => dataRows(page).filter({ has: page.getByRole('rowheader', { name: new RegExp(`^${job}\\b`) }) });

/** Titles of the action icons of a row ("View details", "Assign", "Reassign"). */
export const rowActions = (row: Locator) => row.getByRole('gridcell').nth(1).locator('[title]').evaluateAll((els) => els.map((e) => e.getAttribute('title') ?? ''));

export const domClick = (l: Locator) => l.evaluate((e) => (e as HTMLElement).click());

export const statusOf = async (row: Locator) => (await row.getByRole('gridcell').last().innerText()).replace(/\s+/g, ' ').trim();

export type ListRow = {
  job: string;
  ticket: string;
  quotation: string;
  client: string;
  product: string;
  mediaLine: string; // "● Retail → 7-Eleven"
  salePackage: string;
  epicor: string; // '' when the media cell has no 3rd line
  period: string; // "01/10/2026 - 31/10/2026"
  sales: string;
  assigned: string; // "CG - QA head: Head CG - QA" / "— unassigned — head: —"
  status: string;
  actions: string[];
};

const lines = (t: string) => t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

/** Reads one table row into a ListRow. */
export async function readRow(row: Locator): Promise<ListRow> {
  const head = lines(await row.getByRole('rowheader').innerText());
  const cells = row.getByRole('gridcell');
  const text = async (i: number) => lines(await cells.nth(i).innerText());
  const [client, product] = await text(3);
  const media = await text(4);
  return {
    job: head[0],
    ticket: head[1] ?? '',
    quotation: (await text(2))[0] ?? '',
    client: client ?? '',
    product: product ?? '',
    mediaLine: media[0] ?? '',
    salePackage: media[1] ?? '',
    epicor: media[2] ?? '',
    period: (await text(5))[0] ?? '',
    sales: (await text(6))[0] ?? '',
    assigned: (await text(7)).join(' '),
    status: await statusOf(row),
    actions: await rowActions(row),
  };
}

/** Reads every row of the list (all pages, 100 per page). */
export async function readAllRows(page: Page): Promise<ListRow[]> {
  await page.getByRole('combobox').last().selectOption('100').catch(() => undefined);
  await page.waitForTimeout(1500);
  const total = await footerTotal(page);
  const out: ListRow[] = [];
  const seen = new Set<string>();
  for (let p = 0; p < 30 && seen.size < total; p++) {
    const rows = dataRows(page);
    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const r = await readRow(rows.nth(i));
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

// ---------- the Assign / Reassign Graphic Designer dialog ----------
export const dialog = (page: Page) => page.getByRole('dialog').first();

export type Designer = { name: string; load: string; active: number; recommended: boolean };

/** The designer buttons of the open Assign / Reassign dialog, in the order shown. */
export async function readDesigners(page: Page): Promise<Designer[]> {
  const buttons = dialog(page).getByRole('button').filter({ hasText: /active/ });
  const out: Designer[] = [];
  for (const b of await buttons.all()) {
    const t = (await b.innerText()).replace(/\s+/g, ' ').trim(); // "Recommended CG - QA 3 Light · 0 active To Do 0 ..."
    const m = t.match(/^(Recommended )?(.+?) (Light|Medium|Heavy|Normal|Overloaded|\w+) · (\d+) active/);
    if (m) out.push({ name: m[2].trim(), load: m[3], active: Number(m[4]), recommended: !!m[1] });
  }
  return out;
}

export const assignButton = (page: Page) => dialog(page).getByRole('button', { name: /^(Assign|Reassign)$/ });

/** Opens the row's Assign / Reassign dialog (icon in the Actions cell). */
export async function openRowDialog(page: Page, row: Locator, action: 'Assign' | 'Reassign') {
  await domClick(row.locator(`[title="${action}"] button`));
  await expect(dialog(page)).toBeVisible({ timeout: 15000 });
  await expect(dialog(page)).toContainText(`${action} Graphic Designer`);
  await expect(dialog(page).getByRole('button').filter({ hasText: /active/ }).first()).toBeVisible({ timeout: 15000 });
}

export const closeDialog = async (page: Page) => {
  await domClick(dialog(page).getByRole('button', { name: 'Cancel', exact: true }));
  await expect(dialog(page)).toBeHidden();
};

/** Selects the designer with exactly this name in the open dialog (names overlap: "CG - QA" is part of "Head CG - QA" and "CG - QA 2"). */
export async function chooseDesigner(page: Page, name: string) {
  const designers = await readDesigners(page);
  const i = designers.findIndex((d) => d.name === name);
  expect(i, `designer "${name}" is offered (${designers.map((d) => d.name).join(', ')})`).toBeGreaterThanOrEqual(0);
  await domClick(dialog(page).getByRole('button').filter({ hasText: /active/ }).nth(i));
  await expect(dialog(page)).toContainText(new RegExp(`Selected: ${name.replace(/[-/\^$*+?.()|[\]{}]/g, '\$&')}(?! \d)`));
}
