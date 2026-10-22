// Super Admin: คลิกการ์ดสถานะในหน้า Assign Ticket / Media Management แล้วจำนวนแถวท้ายตารางต้องเท่ากับตัวเลขบนการ์ด — Media Ticket นับเป็น ticket จึงต้องอยู่ระหว่าง 1 ถึงตัวเลขบนการ์ด (0 ถ้าการ์ดเป็น 0)
// test-case: XC-ADM-05 — แผน: specs/mediaapproval-dashboard-plan.md (30.5)
// seed: seed.spec.ts

import { test, expect, Page } from '@playwright/test';
import { loginAs } from './_helpers';
import { openList, overview, footerTotal, ListKey, LIST_NAME } from './_cross-helpers';

async function cardTitles(page: Page): Promise<Record<string, string>> {
  const titles = await page.locator('[title^="Filter status:"]').evaluateAll((els) => els.map((e) => e.getAttribute('title') || ''));
  return Object.fromEntries(titles.map((t) => [t.replace(/^Filter status:\s*/, '').trim().toLowerCase(), t]));
}

for (const key of ['assignTicket', 'mediaManagement', 'mediaTicket'] as ListKey[]) {
  test.describe(`Cross-check Admin — ${LIST_NAME[key]} status cards`, () => {
    test(`XC-ADM-05 clicking a status card shows that many rows (${LIST_NAME[key]})`, { tag: ['@regression'] }, async ({ page }) => {
      test.setTimeout(300000);
      await loginAs(page, 'superAdmin');
      await openList(page, key);
      const all = await footerTotal(page);
      const cards = (await overview(page)).cards;
      const titles = await cardTitles(page);

      for (const [name, count] of Object.entries(cards)) {
        const card = page.locator(`[title="${titles[name]}"]`);
        await card.click();
        if (key === 'mediaTicket') {
          // tickets, not jobs: a ticket may hold several jobs of one status
          await expect.poll(() => footerTotal(page), { message: name }).toBeLessThanOrEqual(count);
          if (count > 0) expect(await footerTotal(page), name).toBeGreaterThan(0);
        } else {
          await expect.poll(() => footerTotal(page), { message: name }).toBe(count);
        }
        await card.click(); // click again → filter cleared
        await expect.poll(() => footerTotal(page), { message: `${name} cleared` }).toBe(all);
      }
    });
  });
}
