// ขอบเขตข้อมูลรายงานของแต่ละ role ต้องเป็นส่วนย่อยของ Super Admin, CG1/CG2 เห็นเฉพาะงานของตน และการใส่ graphicUserId ของคนอื่นใน API ต้องไม่ขยายขอบเขต
// test-case: CMN-R01..R05, BIL-S01 — spec: PB-2114..2117 (role scope); แผน: specs/mediaapproval-dashboard-plan.md (24.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, Role } from './_helpers';
import { fetchAll } from './_report-helpers';

async function jobsOf(browser: any, role: Role, params: Record<string, string> = {}) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await loginAs(page, role);
    await openDashboard(page);
    return (await fetchAll(page, 'sla', params)).rows.map((r: any) => r.jobCode as string);
  } finally {
    await ctx.close();
  }
}

test.describe('Export Report — role scope', () => {
  test('CMN-R01..R05 every role sees a subset of what Super Admin sees', { tag: ['@security', '@regression'] }, async ({ browser }) => {
    test.setTimeout(240000);
    const admin = new Set(await jobsOf(browser, 'superAdmin'));
    expect(admin.size).toBeGreaterThan(0);

    const scopes: Partial<Record<Role, string[]>> = {};
    for (const role of ['headCg', 'mediaManagement', 'cg1', 'cg2'] as Role[]) {
      scopes[role] = await jobsOf(browser, role);
      for (const j of scopes[role]!) expect(admin.has(j), `${role} sees ${j} which Super Admin does not`).toBe(true);
    }
    expect(scopes.cg1!.length, 'CG1 sees only own jobs, fewer than Head CG').toBeLessThan(scopes.headCg!.length);
    expect(scopes.cg2!.length).toBeLessThan(scopes.headCg!.length);
  });

  test('CMN-R05 CG cannot widen scope by passing another graphicUserId', { tag: ['@security', '@negative'] }, async ({ browser }) => {
    test.setTimeout(240000);
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAs(page, 'headCg');
    await openDashboard(page);
    const others = (await (await page.request.get('https://uat-mediacontrol.planbmedia.co.th/api/mediaTickets/reports/options')).json()).data.graphics as { id: number }[];
    await ctx.close();

    const own = await jobsOf(browser, 'cg1');
    for (const g of others) {
      const scoped = await jobsOf(browser, 'cg1', { graphicUserId: String(g.id) });
      for (const j of scoped) expect(own.includes(j), `graphicUserId=${g.id} leaked ${j}`).toBe(true);
    }
  });
});
