// Super Admin: Total Jobs ของ Dashboard = จำนวนงานในหน้า list (311) + งาน Draft และ Total Tickets = จำนวน ticket ในหน้า Media Ticket + ticket ที่มีแต่งาน Draft (หน้า list ไม่แสดง Draft)
// test-case: XC-ADM-03 — เทียบยอดรวม Dashboard ↔ list + Draft (จาก Export Report SLA); แผน: specs/mediaapproval-dashboard-plan.md (30.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, headerCounts, footerTotal } from './_cross-helpers';

test.describe('Cross-check Admin — totals', () => {
  test('XC-ADM-03 Dashboard totals = list totals + Draft', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'superAdmin');
    const dash = await dashboardYear(page);
    const sla = (await fetchAll(page, 'sla')).rows;
    const ticketKey = Object.keys(sla[0]).find((k) => /ticket/i.test(k))!;
    expect(ticketKey, 'SLA rows expose a ticket field').toBeTruthy();

    const drafts = sla.filter((r) => r.status === 'Draft');
    const live = sla.filter((r) => r.status !== 'Draft');
    const liveTickets = new Set(live.map((r) => r[ticketKey]));
    const draftOnlyTickets = new Set(drafts.map((r) => r[ticketKey]).filter((t) => !liveTickets.has(t)));

    await openList(page, 'mediaTicket');
    const mt = await headerCounts(page);
    const mtTickets = await footerTotal(page);
    expect(mt.tickets, 'header tickets = footer items').toBe(mtTickets);

    await openList(page, 'assignTicket');
    const jobs = await footerTotal(page);
    expect(jobs, 'Media Ticket header jobs = Assign Ticket job rows').toBe(mt.jobs);

    expect(live.length, 'Export SLA rows (non-Draft) = jobs on the list pages').toBe(jobs);
    expect(dash.totalJobs, 'Dashboard Total Jobs = list jobs + Draft jobs').toBe(jobs + drafts.length);
    expect(dash.totalTickets, 'Dashboard Total Tickets = list tickets + Draft-only tickets').toBe(mtTickets + draftOnlyTickets.size);
  });
});
