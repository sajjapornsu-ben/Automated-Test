// Media Management: งานที่เห็นต้องเป็นงานที่ Sale Package ถูกติ๊กใน Media access (User Management > Edit User) เท่านั้น — เทียบกับงานทั้งหมดที่ Super Admin เห็น (Export SLA, Media Management, Dashboard)
// test-case: XC-MM-01 — เทียบ Media access จริง ↔ Media Management / Dashboard / Export SLA; แผน: specs/mediaapproval-dashboard-plan.md (32.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, footerTotal, userGrantedPackages } from './_cross-helpers';

test.describe('Cross-check Media Management — Media access', () => {
  test('XC-MM-01 visible jobs = jobs whose Sale Package is granted in User Management', { tag: ['@regression', '@security'] }, async ({ browser }) => {
    test.setTimeout(600000);
    const as = async (role: Parameters<typeof loginAs>[1]) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await loginAs(page, role);
      return { ctx, page };
    };

    const admin = await as('superAdmin');
    const { granted, notGranted } = await userGrantedPackages(admin.page, process.env.MEDIA_MANAGEMENT_EMAIL!);
    const allJobs = (await fetchAll(admin.page, 'sla')).rows;
    const packageOf = new Map((await fetchAll(admin.page, 'airtime')).rows.map((r) => [r.jobCode as string, r.salePackageName as string]));
    await admin.ctx.close();
    expect(granted.size, 'Media Management has Sale Packages granted').toBeGreaterThan(0);

    const allowed = allJobs.filter((r) => granted.has(packageOf.get(r.jobCode)!));
    const expectedLive = allowed.filter((r) => r.status !== 'Draft');
    const expectedDraft = allowed.filter((r) => r.status === 'Draft');

    const mm = await as('mediaManagement');
    const seen = (await fetchAll(mm.page, 'sla')).rows.map((r) => r.jobCode as string);
    const dash = await dashboardYear(mm.page);
    await openList(mm.page, 'mediaManagement');
    const listed = await footerTotal(mm.page);
    await mm.ctx.close();

    const hidden = allJobs.filter((r) => !granted.has(packageOf.get(r.jobCode)!)).map((r) => `${r.jobCode} (${packageOf.get(r.jobCode)})`);
    expect(seen.sort(), `must see exactly the jobs of granted packages (${notGranted.size} packages not granted). Hidden: ${hidden.join(', ')}`).toEqual(
      allowed.map((r) => r.jobCode as string).sort()
    );
    expect(listed, 'Media Management rows').toBe(expectedLive.length);
    expect(dash.totalJobs, 'Dashboard Total Jobs = granted live jobs + granted Draft jobs').toBe(expectedLive.length + expectedDraft.length);
  });
});
