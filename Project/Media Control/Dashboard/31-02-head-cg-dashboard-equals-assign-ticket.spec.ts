// Head CG: การ์ด Jobs by Status ของ Dashboard (Year) ต้องเท่ากับ Status Overview ของหน้า Assign Ticket ทุกสถานะ, จำนวนท้ายตารางเท่าผลรวมการ์ด, และ Total Jobs/Tickets = หน้า list + Draft
// test-case: XC-HCG-02, XC-HCG-03 — เทียบ Dashboard ↔ Assign Ticket (Head CG); แผน: specs/mediaapproval-dashboard-plan.md (31.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, overview, footerTotal, headerCounts, STATUS_PAIRS } from './_cross-helpers';

test.describe('Cross-check Head CG — Dashboard vs Assign Ticket', () => {
  test('XC-HCG-02 status counts equal the Assign Ticket overview and footer', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    const dash = await dashboardYear(page);
    await openList(page, 'assignTicket');
    const list = await overview(page);

    for (const p of STATUS_PAIRS) expect(list.cards[p.list], `"${p.list}" vs Dashboard "${p.dash}"`).toBe(dash.statuses[p.dash]);
    expect(list.cards['cancelled'], 'Cancelled').toBe(dash.cancelledJobs);
    expect(await footerTotal(page), 'footer = sum of cards').toBe(list.total);
    expect((await headerCounts(page)).jobs, 'header jobs = sum of cards').toBe(list.total);
  });

  test('XC-HCG-03 Dashboard totals = Assign Ticket jobs + Draft', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'headCg');
    const dash = await dashboardYear(page);
    const sla = (await fetchAll(page, 'sla')).rows;
    const drafts = sla.filter((r) => r.status === 'Draft');
    const live = sla.filter((r) => r.status !== 'Draft');
    const liveTickets = new Set(live.map((r) => r.ticketCode));
    const draftOnly = new Set(drafts.map((r) => r.ticketCode).filter((t) => !liveTickets.has(t)));

    await openList(page, 'assignTicket');
    const jobs = await footerTotal(page);
    expect(live.length, 'Export SLA (non-Draft) = Assign Ticket jobs').toBe(jobs);
    expect(dash.totalJobs, 'Total Jobs = list jobs + Draft jobs').toBe(jobs + drafts.length);
    expect(dash.totalTickets, 'Total Tickets = tickets of the listed jobs + Draft-only tickets').toBe(liveTickets.size + draftOnly.size);
  });
});
