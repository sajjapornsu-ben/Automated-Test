// Super Admin: จำนวนแถวท้ายตาราง (Showing … of N items) ของ Assign Ticket / Verify & Production / Media Management ต้องเท่ากับผลรวมการ์ดสถานะทั้งหมด (รวม Cancelled) และเท่ากันทั้ง 3 หน้า
// test-case: XC-ADM-04 — แผน: specs/mediaapproval-dashboard-plan.md (30.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { openList, overview, footerTotal, headerCounts, ListKey, LIST_NAME } from './_cross-helpers';

test.describe('Cross-check Admin — list footers', () => {
  test('XC-ADM-04 footer total = sum of overview cards, same on every job list', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'superAdmin');
    const totals: Record<string, number> = {};
    for (const key of ['assignTicket', 'productionReview', 'mediaManagement'] as ListKey[]) {
      await openList(page, key);
      const o = await overview(page);
      totals[key] = await footerTotal(page);
      expect(totals[key], `${LIST_NAME[key]} footer vs sum of cards`).toBe(o.total);
      const h = await headerCounts(page);
      if (h.jobs !== undefined) expect(h.jobs, `${LIST_NAME[key]} header`).toBe(o.total);
    }
    expect(new Set(Object.values(totals)).size, `all job lists show the same total ${JSON.stringify(totals)}`).toBe(1);
  });

  test('XC-ADM-04b Media Ticket header jobs = sum of its cards; tickets = footer', { tag: ['@regression'] }, async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await openList(page, 'mediaTicket');
    const o = await overview(page);
    const h = await headerCounts(page);
    expect(h.jobs).toBe(o.total);
    expect(h.tickets).toBe(await footerTotal(page));
  });
});
