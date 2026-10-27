// Head CG (ยืนยันกับ SA): เลือกดู Job ของทั้งทีม แยกตาม Package ที่รับผิดชอบ — งานที่เห็น = Sale Package ถูกติ๊กใน Media access ∧ (ยังไม่มี CG รับงาน ∨ มี CG ในทีมของ Head CG (Team CG under this Head) หรือตัวเองรับงาน) เทียบกับงานทั้งหมดของ Super Admin
// test-case: XC-HCG-01 — เทียบกฎ Package + ทีม ↔ Export SLA / Dashboard / Assign Ticket; แผน: specs/mediaapproval-dashboard-plan.md (31.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, footerTotal, userGrantedPackages, userTeamMembers } from './_cross-helpers';

const names = (graphic: unknown) => String(graphic ?? '').split(',').map((s) => s.trim()).filter((s) => s && s !== '-');

test.describe('Cross-check Head CG — Media access + team', () => {
  test('XC-HCG-01 visible jobs = granted packages ∧ (unassigned ∨ own team)', { tag: ['@regression', '@security'] }, async ({ browser }) => {
    test.setTimeout(600000);
    const as = async (role: Parameters<typeof loginAs>[1]) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await loginAs(page, role);
      return { ctx, page };
    };

    // 1) what the admin account says Head CG may see
    const admin = await as('superAdmin');
    const email = process.env.HEAD_CG_EMAIL!;
    const { granted } = await userGrantedPackages(admin.page, email);
    const team = new Set([DISPLAY_NAME.headCg!, ...(await userTeamMembers(admin.page, email))]);
    const allJobs = (await fetchAll(admin.page, 'sla')).rows;
    const packageOf = new Map((await fetchAll(admin.page, 'airtime')).rows.map((r) => [r.jobCode as string, r.salePackageName as string]));
    await admin.ctx.close();
    expect(granted.size, 'Head CG has Sale Packages granted').toBeGreaterThan(0);
    expect(team.size, 'Head CG has a team').toBeGreaterThan(1);

    const allowed = allJobs.filter((r) => {
      if (!granted.has(packageOf.get(r.jobCode)!)) return false;
      const who = names(r.graphic);
      return who.length === 0 || who.some((n) => team.has(n));
    });
    const expectedLive = allowed.filter((r) => r.status !== 'Draft');
    const expectedDraft = allowed.filter((r) => r.status === 'Draft');

    // 2) what Head CG actually sees
    const head = await as('headCg');
    const seen = (await fetchAll(head.page, 'sla')).rows.map((r) => r.jobCode as string);
    const dash = await dashboardYear(head.page);
    await openList(head.page, 'assignTicket');
    const listed = await footerTotal(head.page);
    await head.ctx.close();

    const wanted = allowed.map((r) => r.jobCode as string).sort();
    expect.soft(seen.sort(), `Export SLA: ${seen.length} jobs, expected ${wanted.length}`).toEqual(wanted);
    expect.soft(dash.totalJobs, 'Dashboard Total Jobs = expected live + Draft').toBe(expectedLive.length + expectedDraft.length);
    expect.soft(listed, 'Assign Ticket rows = expected live jobs').toBe(expectedLive.length);
  });
});
