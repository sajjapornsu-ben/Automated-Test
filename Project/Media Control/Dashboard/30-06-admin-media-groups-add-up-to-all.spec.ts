// Super Admin เห็นทุก Media Group: ผลรวมจำนวนแถวของแต่ละ Media Group ต้องเท่ากับทั้งหมดของหน้า (Assign Ticket = งาน) และครอบคลุมทุก ticket ของ Media Ticket
// test-case: XC-ADM-06 — แผน: specs/mediaapproval-dashboard-plan.md (30.6)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, settle } from './_helpers';
import { openList, footerTotal, ListKey, LIST_NAME } from './_cross-helpers';

for (const key of ['assignTicket', 'mediaTicket'] as ListKey[]) {
  test.describe(`Cross-check Admin — ${LIST_NAME[key]} media groups`, () => {
    test(`XC-ADM-06 every Media Group together = all rows (${LIST_NAME[key]})`, { tag: ['@regression', '@security'] }, async ({ page }) => {
      test.setTimeout(300000);
      await loginAs(page, 'superAdmin');
      await openList(page, key);
      const all = await footerTotal(page);

      const filter = page.getByRole('group').filter({ has: page.getByRole('button', { name: /Filter by media$/ }) });
      await filter.click();
      const groups = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((t) => t.trim()).filter((t) => t && !/^All /.test(t));
      await page.keyboard.press('Escape');
      expect(groups.length, 'Admin sees every configured Media Group').toBeGreaterThan(0);

      let sum = 0;
      const per: string[] = [];
      for (const g of groups) {
        await filter.click();
        await page.getByRole('listbox').first().getByRole('option', { name: g, exact: true }).first().click();
        await expect(filter).toContainText(g);
        await settle(page);
        const n = await footerTotal(page);
        per.push(`${g}=${n}`);
        sum += n;
      }
      // Media Ticket lists tickets, and one ticket can hold jobs of several Media Groups (all=158 tickets, groups add up to 188),
      // so there the groups must cover every ticket (sum >= all). Job lists are one row per job, so they must add up exactly.
      if (key === 'mediaTicket') expect(sum, `all=${all}; ${per.join(", ")}`).toBeGreaterThanOrEqual(all);
      else expect(sum, `all=${all}; ${per.join(", ")}`).toBe(all);
    });
  });
}
