// Head CG: Graphic Workload และตัวเลือกใน SLA per Graphic ต้องมีเฉพาะตัวเองกับ CG ที่อยู่ใต้ตัวเอง (Team CG under this Head ใน User Management) — แถว "Unassigned" และ "Everyone (Average)" ไม่ใช่รายบุคคลจึงอนุญาต
// test-case: XC-HCG-06, XC-HCG-07 — ยืนยันกับ SA แล้ว; แผน: specs/mediaapproval-dashboard-plan.md (35.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, workloadGraphicNames, slaSection, DISPLAY_NAME } from './_helpers';
import { userTeamMembers } from './_cross-helpers';

async function teamOfHeadCg(browser: import('@playwright/test').Browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, 'superAdmin');
  const members = await userTeamMembers(page, process.env.HEAD_CG_EMAIL!);
  await ctx.close();
  return new Set([DISPLAY_NAME.headCg!, ...members]);
}

test.describe('Cross-check Head CG — team scope', () => {
  test('XC-HCG-06 Graphic Workload lists only the Head CG and the CGs under them', { tag: ['@regression', '@security'] }, async ({ page, browser }) => {
    const allowed = await teamOfHeadCg(browser);
    expect(allowed.size, 'Head CG has a team configured').toBeGreaterThan(1);

    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    const names = (await workloadGraphicNames(page)).filter((n) => n !== 'Unassigned');
    expect(names.length).toBeGreaterThan(0);
    const outside = names.filter((n) => !allowed.has(n));
    expect(outside, `Allowed: ${[...allowed].join(', ')}`).toEqual([]);
  });

  test('XC-HCG-07 SLA per Graphic person list has only the Head CG and the CGs under them', { tag: ['@regression', '@security'] }, async ({ page, browser }) => {
    const allowed = await teamOfHeadCg(browser);

    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await slaSection(page).getByRole('group').first().click();
    const options = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((s) => s.trim());
    const people = options.filter((o) => !/^Everyone/.test(o));
    expect(people.length).toBeGreaterThan(0);
    expect(people.filter((n) => !allowed.has(n)), `Allowed: ${[...allowed].join(', ')}`).toEqual([]);
  });
});
