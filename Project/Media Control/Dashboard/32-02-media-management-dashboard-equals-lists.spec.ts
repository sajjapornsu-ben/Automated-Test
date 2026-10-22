// Media Management: การ์ด Jobs by Status ของ Dashboard (Year) ต้องเท่ากับ Status Overview ของหน้า Media Management, จำนวนท้ายตาราง/หัวหน้าเท่ากับผลรวมการ์ด, Total Jobs/Tickets = หน้า list + Draft และการ์ดหน้า Media Ticket (ticket ของตนเอง) ต้องไม่เกินหน้า Media Management
// test-case: XC-MM-02, XC-MM-03, XC-MM-04 — เทียบ Dashboard ↔ Media Management / Media Ticket; แผน: specs/mediaapproval-dashboard-plan.md (32.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, overview, footerTotal, headerCounts, STATUS_PAIRS } from './_cross-helpers';

test.describe('Cross-check Media Management — Dashboard vs lists', () => {
  test('XC-MM-02 status counts equal the Media Management overview, footer and header', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'mediaManagement');
    const dash = await dashboardYear(page);
    await openList(page, 'mediaManagement');
    const list = await overview(page);
    for (const p of STATUS_PAIRS) expect(list.cards[p.list], `"${p.list}" vs Dashboard "${p.dash}"`).toBe(dash.statuses[p.dash]);
    expect(list.cards['cancelled'], 'Cancelled').toBe(dash.cancelledJobs);
    expect(await footerTotal(page), 'footer = sum of cards').toBe(list.total);
    expect((await headerCounts(page)).jobs, 'header jobs = sum of cards').toBe(list.total);
  });

  test('XC-MM-03 Dashboard totals = Media Management list + Draft', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'mediaManagement');
    const dash = await dashboardYear(page);
    const sla = (await fetchAll(page, 'sla')).rows;
    const drafts = sla.filter((r) => r.status === 'Draft');
    const live = sla.filter((r) => r.status !== 'Draft');
    const liveTickets = new Set(live.map((r) => r.ticketCode));
    const draftOnly = new Set(drafts.map((r) => r.ticketCode).filter((t) => !liveTickets.has(t)));

    await openList(page, 'mediaManagement');
    const jobs = await footerTotal(page);
    const h = await headerCounts(page);
    expect(live.length, 'Export SLA (non-Draft) = Media Management jobs').toBe(jobs);
    expect(h.tickets, 'header tickets = tickets of listed jobs').toBe(liveTickets.size);
    expect(dash.totalJobs, 'Total Jobs = list jobs + Draft jobs').toBe(jobs + drafts.length);
    expect(dash.totalTickets, 'Total Tickets = list tickets + Draft-only tickets').toBe(h.tickets! + draftOnly.size);
  });

  test('XC-MM-04 Media Ticket (own requests) is a subset of Media Management', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'mediaManagement');
    await openList(page, 'mediaManagement');
    const all = await overview(page);
    const allTickets = (await headerCounts(page)).tickets!;
    await openList(page, 'mediaTicket');
    const mine = await overview(page);
    const h = await headerCounts(page);
    expect(h.jobs, 'header jobs = sum of cards').toBe(mine.total);
    expect(h.tickets, 'header tickets = footer').toBe(await footerTotal(page));
    for (const [status, n] of Object.entries(mine.cards)) expect(n, `Media Ticket "${status}" ≤ Media Management`).toBeLessThanOrEqual(all.cards[status]);
    expect(h.tickets!).toBeLessThanOrEqual(allTickets);
  });
});
