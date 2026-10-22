// CG1 (Team CG): Dashboard นับเฉพาะงานของตนเอง — การ์ดสถานะต้องเท่ากับ Overview ของ Verify & Production (My assigned), Total Jobs = งานในหน้านั้น + Draft ของตน และ Total Tickets = จำนวน ticket จริงของงานเหล่านั้น
// test-case: XC-CG1-01, XC-CG1-02 — เทียบ Dashboard ↔ Verify & Production (งานของตน); แผน: specs/mediaapproval-dashboard-plan.md (34.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, overview, footerTotal, STATUS_PAIRS } from './_cross-helpers';

const mine = (graphic: unknown, me: string) => String(graphic ?? '').split(',').map((s) => s.trim()).includes(me);

test.describe('Cross-check CG1 — Dashboard vs own jobs', () => {
  test('XC-CG1-01 Dashboard statuses equal the Verify & Production overview (own jobs)', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'cg1');
    const dash = await dashboardYear(page);
    await openList(page, 'productionReview');
    const list = await overview(page);

    for (const p of STATUS_PAIRS.filter((x) => x.list !== 'assign' && x.list !== 'verify')) {
      expect(list.cards[p.list], `"${p.list}" vs Dashboard "${p.dash}"`).toBe(dash.statuses[p.dash]);
    }
    expect(list.cards['verify'], 'Verify = Dashboard Assign + Verify').toBe(dash.statuses['Assign (Head CG)'] + dash.statuses['Verify (CG)']);
    expect(list.cards['cancelled'], 'Cancelled').toBe(dash.cancelledJobs);
    expect(await footerTotal(page), 'footer = sum of cards').toBe(list.total);
  });

  test('XC-CG1-02 Dashboard totals = own jobs (+ own Draft) and own tickets', { tag: ['@regression', '@security'] }, async ({ page }) => {
    await loginAs(page, 'cg1');
    const me = DISPLAY_NAME.cg1!;
    const dash = await dashboardYear(page);
    const sla = (await fetchAll(page, 'sla')).rows;
    expect(sla.every((r) => mine(r.graphic, me)), 'Export SLA contains only my jobs').toBe(true);
    const drafts = sla.filter((r) => r.status === 'Draft');
    const live = sla.filter((r) => r.status !== 'Draft');

    await openList(page, 'productionReview');
    expect(await footerTotal(page), 'Verify & Production rows = my live jobs').toBe(live.length);
    expect(dash.totalJobs, 'Total Jobs = my live + Draft jobs').toBe(live.length + drafts.length);
    expect(dash.totalTickets, 'Total Tickets = distinct tickets of my jobs').toBe(new Set(sla.map((r) => r.ticketCode)).size);
  });
});
