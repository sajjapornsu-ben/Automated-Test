// ตัวช่วยสำหรับเทียบตัวเลข Dashboard กับหน้า list (Media Ticket / Assign Ticket / Verify & Production / Media Management)
import { Page, expect } from '@playwright/test';
import { openDashboard, presetButton, settle, statusCount, kpiValue, STATUS_NAMES } from './_helpers';

const BASE = 'https://uat-mediacontrol.planbmedia.co.th/mediaApproval/';

export type ListKey = 'mediaTicket' | 'assignTicket' | 'productionReview' | 'mediaManagement';
export const LIST_NAME: Record<ListKey, string> = {
  mediaTicket: 'Media Ticket',
  assignTicket: 'Assign Ticket',
  productionReview: 'Verify & Production',
  mediaManagement: 'Media Management',
};
// Media Ticket lists tickets; the other three list jobs ("Showing 1 to 5 of 311 items").
export const LIST_UNIT: Record<ListKey, 'tickets' | 'jobs'> = {
  mediaTicket: 'tickets',
  assignTicket: 'jobs',
  productionReview: 'jobs',
  mediaManagement: 'jobs',
};

// Overview card title (lower-case) → Dashboard "Jobs by Status" card name
export const STATUS_PAIRS: { list: string; dash: (typeof STATUS_NAMES)[number] }[] = [
  { list: 'assign', dash: 'Assign (Head CG)' },
  { list: 'verify', dash: 'Verify (CG)' },
  { list: 'revise (sale)', dash: 'Revise (Sale)' },
  { list: 'on process', dash: 'On Process (CG)' },
  { list: 'review', dash: 'Review (Sale)' },
  { list: 'revise (cg)', dash: 'Revise (CG)' },
  { list: 'final approve', dash: 'Final Approve' },
  { list: 'final render', dash: 'Final Render' },
  { list: 'done', dash: 'Done' },
];

export async function openList(page: Page, key: ListKey) {
  await page.goto(BASE + key);
  await expect(page.getByText(/Showing \d+ to \d+ of \d+ items|Showing 0|No (tickets|jobs) found/).first()).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await overview(page)).total, { timeout: 15000 }).toBeGreaterThanOrEqual(0);
}

/** The status overview cards: lower-case status → number. `total` is the sum of every card. */
export async function overview(page: Page): Promise<{ cards: Record<string, number>; total: number; header: string }> {
  const raw = await page.locator('[title^="Filter status:"]').evaluateAll((els) =>
    els.map((e) => ({ title: e.getAttribute('title') || '', text: (e as HTMLElement).innerText }))
  );
  const cards: Record<string, number> = {};
  for (const r of raw) {
    const name = r.title.replace(/^Filter status:\s*/, '').trim().toLowerCase();
    const n = r.text.split(/\r?\n/).map((l) => l.trim()).find((l) => /^\d+$/.test(l));
    if (n !== undefined) cards[name] = Number(n);
  }
  const header = (await page.locator('main').first().innerText()).match(/\d+ tickets?\s*\|?\s*\d+ jobs?|\d+ jobs?|\d+ tickets?/)?.[0] ?? '';
  return { cards, total: Object.values(cards).reduce((a, b) => a + b, 0), header };
}

/** Header count under the title, e.g. "158 tickets | 311 jobs" → {tickets:158, jobs:311}. */
export async function headerCounts(page: Page): Promise<{ tickets?: number; jobs?: number }> {
  const text = await page.locator('main').first().innerText();
  const t = text.match(/(\d+)\s+tickets?/i);
  const j = text.match(/(\d+)\s+jobs?/i);
  return { tickets: t ? Number(t[1]) : undefined, jobs: j ? Number(j[1]) : undefined };
}

/** Total in the table footer ("Showing 1 to 5 of 311 items"); 0 when the table is empty. */
export async function footerTotal(page: Page): Promise<number> {
  const label = page.getByText(/Showing \d+ to \d+ of \d+ items/).first();
  await label.waitFor({ timeout: 6000 }).catch(() => undefined);
  if ((await label.count()) === 0) return 0;
  return Number((await label.innerText()).match(/of (\d+) items/)![1]);
}

export const statusCardOnList = (page: Page, listName: string) =>
  page.locator('[title^="Filter status:"]').filter({ hasText: new RegExp(`^\\s*${listName.replace(/[()]/g, '\\$&')}\\b`, 'i') });

/** Dashboard numbers for the whole year (Created Date basis). */
export async function dashboardYear(page: Page) {
  await openDashboard(page);
  await presetButton(page, 'Year').click();
  await settle(page);
  let totalJobs = 0;
  await expect.poll(async () => (totalJobs = await kpiValue(page, 'Total Jobs (Version)'))).toBeGreaterThan(0);
  await settle(page);
  const statuses: Record<string, number> = {};
  for (const n of STATUS_NAMES) statuses[n] = await statusCount(page, n);
  return {
    totalTickets: await kpiValue(page, 'Total Tickets'),
    totalJobs: await kpiValue(page, 'Total Jobs (Version)'),
    cancelledJobs: await kpiValue(page, 'Cancelled Jobs (Version)'),
    statuses,
  };
}

/** Rows per Media Group on a list page (applies each option of the "Filter by media" dropdown in turn). */
export async function perGroupCounts(page: Page, key: ListKey): Promise<Record<string, number>> {
  await openList(page, key);
  const filter = page.getByRole('group').filter({ has: page.getByRole('button', { name: /Filter by media$/ }) });
  await filter.click();
  const groups = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((t) => t.trim()).filter((t) => t && !/^All /.test(t));
  await page.keyboard.press('Escape');
  const out: Record<string, number> = {};
  for (const g of groups) {
    await filter.click();
    await page.getByRole('listbox').first().getByRole('option', { name: g, exact: true }).first().click();
    await expect(filter).toContainText(g);
    await settle(page);
    out[g] = await footerTotal(page);
  }
  return out;
}

/** Media Groups configured for a user in Settings > User Management (read as Super Admin). */
export async function userMediaGroups(page: Page, displayName: string): Promise<string[]> {
  await page.goto('https://uat-mediacontrol.planbmedia.co.th/settings/userManagement');
  await page.getByPlaceholder('Search by name, email, phone...').fill(displayName);
  const row = page.locator('tbody tr').filter({ hasText: displayName }).first();
  await expect(row).toBeVisible({ timeout: 15000 });
  const more = row.getByRole('button', { name: /Show all \d+ Media Groups/ });
  if ((await more.count()) === 0) {
    // all chips are visible in the row itself
    return (await row.locator('td').nth(3).innerText()).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  await more.click();
  const pop = page.getByText(/Media Groups \(\d+\)/).first().locator('xpath=..');
  const text = await pop.innerText();
  await page.keyboard.press('Escape');
  return text.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !/^Media Groups \(\d+\)$/.test(s));
}

/**
 * Media access really granted to a user in Settings > User Management > Edit (Media Group > Category > Media Type > Panel Package tree).
 * Verified on UAT: a job is visible to the user exactly when its Sale Package is ticked in this tree, so this returns the ticked package names.
 */
export async function userGrantedPackages(page: Page, displayName: string): Promise<{ granted: Set<string>; notGranted: Set<string> }> {
  await page.goto('https://uat-mediacontrol.planbmedia.co.th/settings/userManagement');
  await page.getByPlaceholder('Search by name, email, phone...').fill(displayName);
  await page.locator('tbody tr').filter({ hasText: displayName }).first().getByRole('button', { name: 'Edit' }).click();
  const dlg = page.getByRole('dialog').first();
  const nodes = dlg.locator('div.rounded-lg:has(input[type=checkbox])');
  await expect(nodes.first()).toBeVisible({ timeout: 15000 });

  const columns = () => nodes.evaluateAll((els) => els.map((e, i) => ({ i, x: Math.round(e.getBoundingClientRect().left / 40) })));
  const click = async (idx: number) => {
    const el = nodes.nth(idx);
    await el.scrollIntoViewIfNeeded();
    const b = (await el.boundingBox())!;
    await page.mouse.click(b.x + b.width * 0.55, b.y + b.height / 2);
    await page.waitForTimeout(100);
  };
  const types = dlg.getByText('Media Type', { exact: true }).first().locator('xpath=ancestor::div[2]').locator('button');

  const xs = [...new Set((await columns()).map((c) => c.x))].sort((a, b) => a - b);
  const granted = new Set<string>();
  const all = new Set<string>();
  // Packages are shared by every Media Group, so browsing the first group's categories and types is enough.
  const firstGroup = (await columns()).filter((c) => c.x === xs[0])[0];
  await click(firstGroup.i);
  for (const cat of (await columns()).filter((c) => c.x === xs[1])) {
    await click(cat.i);
    const n = await types.count();
    for (let t = 0; t < n; t++) {
      await types.nth(t).click();
      await page.waitForTimeout(80);
      const pk = await dlg.locator('input[id^=panel-sale-package]').evaluateAll((els) =>
        els.map((e) => [(e as HTMLInputElement).getAttribute('aria-label') ?? '', (e as HTMLInputElement).checked] as [string, boolean])
      );
      for (const [name, checked] of pk) {
        all.add(name);
        if (checked) granted.add(name);
      }
    }
  }
  await page.keyboard.press('Escape');
  return { granted, notGranted: new Set([...all].filter((p) => !granted.has(p))) };
}
