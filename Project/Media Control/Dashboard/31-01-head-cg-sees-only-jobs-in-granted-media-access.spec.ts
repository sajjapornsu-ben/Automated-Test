// Head CG: งานที่เห็นต้องเป็นงานที่ Sale Package ถูกติ๊กใน Media access (User Management > Edit User) เท่านั้น — เทียบกับงานทั้งหมดที่ Super Admin เห็น (Export SLA, Assign Ticket, Dashboard)
// test-case: XC-HCG-01 — เทียบ Media access จริง ↔ Assign Ticket / Dashboard / Export SLA; แผน: specs/mediaapproval-dashboard-plan.md (31.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, footerTotal, userGrantedPackages } from './_cross-helpers';

test.describe('Cross-check Head CG — Media access', () => {
  test('XC-HCG-01 visible jobs = jobs whose Sale Package is granted in User Management', { tag: ['@regression', '@security'] }, async ({ browser }) => {
    test.setTimeout(600000);
    const as = async (role: Parameters<typeof loginAs>[1]) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await loginAs(page, role);
      return { ctx, page };
    };

    // 1) what the admin account says Head CG may see
    const admin = await as('superAdmin');
    const { granted, notGranted } = await userGrantedPackages(admin.page, DISPLAY_NAME.headCg!);
    const allJobs = (await fetchAll(admin.page, 'sla')).rows;
    const packageOf = new Map((await fetchAll(admin.page, 'airtime')).rows.map((r) => [r.jobCode as string, r.salePackageName as string]));
    await admin.ctx.close();
    expect(granted.size, 'Head CG has Sale Packages granted').toBeGreaterThan(0);
    expect(notGranted.size, 'some packages are not granted, so the check is meaningful').toBeGreaterThan(0);

    const allowed = allJobs.filter((r) => granted.has(packageOf.get(r.jobCode)!));
    const expectedLive = allowed.filter((r) => r.status !== 'Draft');
    const expectedDraft = allowed.filter((r) => r.status === 'Draft');

    // 2) what Head CG actually sees
    const head = await as('headCg');
    const seen = (await fetchAll(head.page, 'sla')).rows.map((r) => r.jobCode as string);
    const dash = await dashboardYear(head.page);
    await openList(head.page, 'assignTicket');
    const listed = await footerTotal(head.page);
    await head.ctx.close();

    const hidden = allJobs.filter((r) => !granted.has(packageOf.get(r.jobCode)!)).map((r) => `${r.jobCode} (${packageOf.get(r.jobCode)})`);
    expect(seen.sort(), `Head CG must see exactly the jobs of granted packages. Not granted → hidden: ${hidden.join(', ')}`).toEqual(
      allowed.map((r) => r.jobCode as string).sort()
    );
    expect(listed, 'Assign Ticket rows').toBe(expectedLive.length);
    expect(dash.totalJobs, 'Dashboard Total Jobs = granted live jobs + granted Draft jobs').toBe(expectedLive.length + expectedDraft.length);
  });
});
