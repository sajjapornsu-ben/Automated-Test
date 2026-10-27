// Media Management (ยืนยันกับ SA): ดูภาพรวมแยกตาม Package ที่สังกัด และของ Ticket ที่ตัวเองสร้าง (Create Ticket) — งานที่เห็น = Sale Package ถูกติ๊กใน Media access ∨ งานใน Ticket ที่ตัวเองสร้าง เทียบกับงานทั้งหมดของ Super Admin
// test-case: XC-MM-01 — เทียบกฎ Package + Ticket ของตน ↔ Export SLA / Dashboard / Media Management; แผน: specs/mediaapproval-dashboard-plan.md (32.1)
// seed: seed.spec.ts

import { test, expect, Page } from '@playwright/test';
import { loginAs } from './_helpers';
import { fetchAll } from './_report-helpers';
import { dashboardYear, openList, footerTotal, userGrantedPackages } from './_cross-helpers';

/** Ticket numbers on the Media Ticket page (for Media Management this is the tickets the user created). */
async function ownTickets(page: Page): Promise<Set<string>> {
  await openList(page, 'mediaTicket');
  await page.getByRole('combobox').last().selectOption('100').catch(() => undefined);
  await page.waitForTimeout(1500);
  const out = new Set<string>();
  for (const t of await page.locator('tbody tr').allInnerTexts()) {
    const m = t.match(/TK-[0-9A-Za-z-]+/);
    if (m) out.add(m[0]);
  }
  return out;
}

test.describe('Cross-check Media Management — Media access + own tickets', () => {
  test('XC-MM-01 visible jobs = granted packages ∨ jobs of tickets created by the user', { tag: ['@regression', '@security'] }, async ({ browser }) => {
    test.fixme(true, 'Media Management rule not confirmed: the jobs missing from Dashboard / Export SLA are mostly old data (Aug-Sep) and a ticket created now shows on the Media Management page (team retest 27 Oct) - re-enable when SA confirms the rule');
    test.setTimeout(600000);
    const as = async (role: Parameters<typeof loginAs>[1]) => {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await loginAs(page, role);
      return { ctx, page };
    };

    const admin = await as('superAdmin');
    const { granted } = await userGrantedPackages(admin.page, process.env.MEDIA_MANAGEMENT_EMAIL!);
    const allJobs = (await fetchAll(admin.page, 'sla')).rows;
    const packageOf = new Map((await fetchAll(admin.page, 'airtime')).rows.map((r) => [r.jobCode as string, r.salePackageName as string]));
    await admin.ctx.close();
    expect(granted.size, 'Media Management has Sale Packages granted').toBeGreaterThan(0);

    const mm = await as('mediaManagement');
    const own = await ownTickets(mm.page);
    const seen = (await fetchAll(mm.page, 'sla')).rows.map((r) => r.jobCode as string);
    const dash = await dashboardYear(mm.page);
    await openList(mm.page, 'mediaManagement');
    const listed = await footerTotal(mm.page);
    await mm.ctx.close();

    const allowed = allJobs.filter((r) => granted.has(packageOf.get(r.jobCode)!) || own.has(r.ticketCode));
    const expectedLive = allowed.filter((r) => r.status !== 'Draft');
    const expectedDraft = allowed.filter((r) => r.status === 'Draft');
    const wanted = allowed.map((r) => r.jobCode as string).sort();

    expect.soft(seen.sort(), `Export SLA: ${seen.length} jobs, expected ${wanted.length} (own tickets: ${[...own].join(', ')})`).toEqual(wanted);
    expect.soft(dash.totalJobs, 'Dashboard Total Jobs = expected live + Draft').toBe(expectedLive.length + expectedDraft.length);
    expect.soft(listed, 'Media Management rows = expected live jobs').toBe(expectedLive.length);
  });
});
