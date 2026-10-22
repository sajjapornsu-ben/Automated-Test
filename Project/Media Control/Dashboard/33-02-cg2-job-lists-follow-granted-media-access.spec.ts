// CG2: หน้า Assign Ticket / Media Management (สิทธิ์เมนูจาก User Group Super Admin) แสดงงานตาม Media access — ต้องตรงกับงานของ Super Admin ที่ Sale Package ถูกติ๊กของ CG2 และ Overview ต้องเท่ากันทั้งสองหน้า
// test-case: XC-CG2-03 — เทียบ Media access จริง ↔ Assign Ticket / Media Management; แผน: specs/mediaapproval-dashboard-plan.md (33.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { fetchAll } from './_report-helpers';
import { openList, overview, footerTotal, userGrantedPackages, ListKey } from './_cross-helpers';

test.describe('Cross-check CG2 — Media access on job lists', () => {
  test('XC-CG2-03 Assign Ticket and Media Management rows = granted-package jobs', { tag: ['@regression', '@security'] }, async ({ browser }) => {
    test.setTimeout(600000);
    const as = async (role: Parameters<typeof loginAs>[1]) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await loginAs(page, role);
      return { ctx, page };
    };

    const admin = await as('superAdmin');
    const { granted, notGranted } = await userGrantedPackages(admin.page, process.env.CG2_EMAIL!);
    const allJobs = (await fetchAll(admin.page, 'sla')).rows;
    const packageOf = new Map((await fetchAll(admin.page, 'airtime')).rows.map((r) => [r.jobCode as string, r.salePackageName as string]));
    const adminLive = allJobs.filter((r) => r.status !== 'Draft');
    await admin.ctx.close();
    expect(granted.size, 'CG2 has Sale Packages granted').toBeGreaterThan(0);

    const expected = adminLive.filter((r) => granted.has(packageOf.get(r.jobCode)!)).length;
    const cg = await as('cg2');
    const totals: Record<string, number> = {};
    const sums: Record<string, number> = {};
    for (const key of ['assignTicket', 'mediaManagement'] as ListKey[]) {
      await openList(cg.page, key);
      totals[key] = await footerTotal(cg.page);
      sums[key] = (await overview(cg.page)).total;
    }
    await cg.ctx.close();

    expect(totals, `expected ${expected} live jobs (${notGranted.size} packages not granted)`).toEqual({ assignTicket: expected, mediaManagement: expected });
    expect(sums, 'sum of status cards = rows').toEqual(totals);
  });
});
