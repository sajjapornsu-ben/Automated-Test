// CG1: งานที่เห็นต้องเป็นงานที่ตนเองเป็น Graphic และ Sale Package ถูกติ๊กใน Media access เท่านั้น — เทียบกับงานทั้งหมดของ Super Admin (Export SLA, Verify & Production, Dashboard)
// test-case: XC-CG1-03 — เทียบ Media access + งานของตน ↔ Verify & Production / Dashboard; แผน: specs/mediaapproval-dashboard-plan.md (34.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, footerTotal, userGrantedPackages } from './_cross-helpers';

const mine = (graphic: unknown, me: string) => String(graphic ?? '').split(',').map((s) => s.trim()).includes(me);

test.describe('Cross-check CG1 — own jobs within Media access', () => {
  test('XC-CG1-03 visible jobs = my jobs whose Sale Package is granted', { tag: ['@regression', '@security'] }, async ({ browser }) => {
    test.setTimeout(600000);
    const as = async (role: Parameters<typeof loginAs>[1]) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await loginAs(page, role);
      return { ctx, page };
    };
    const me = DISPLAY_NAME.cg1!;

    const admin = await as('superAdmin');
    const { granted } = await userGrantedPackages(admin.page, process.env.CG1_EMAIL!);
    const allJobs = (await fetchAll(admin.page, 'sla')).rows;
    const packageOf = new Map((await fetchAll(admin.page, 'airtime')).rows.map((r) => [r.jobCode as string, r.salePackageName as string]));
    await admin.ctx.close();

    const allowed = allJobs.filter((r) => mine(r.graphic, me) && granted.has(packageOf.get(r.jobCode)!));
    const expectedLive = allowed.filter((r) => r.status !== 'Draft');
    const expectedDraft = allowed.filter((r) => r.status === 'Draft');

    const cg = await as('cg1');
    const seen = (await fetchAll(cg.page, 'sla')).rows.map((r) => r.jobCode as string);
    const dash = await dashboardYear(cg.page);
    await openList(cg.page, 'productionReview');
    const listed = await footerTotal(cg.page);
    await cg.ctx.close();

    expect(seen.sort(), 'Export SLA = my jobs of granted packages').toEqual(allowed.map((r) => r.jobCode as string).sort());
    expect(listed, 'Verify & Production rows').toBe(expectedLive.length);
    expect(dash.totalJobs, 'Dashboard Total Jobs').toBe(expectedLive.length + expectedDraft.length);
  });
});
