// Assign Ticket — Head CG: ปุ่ม action ตามสถานะ (Assign → View + Assign, มี CG แล้ว → View + Reassign, Done/Cancelled → View อย่างเดียว), 
// Search (Job / Ticket / Client / Product), ตัวกรอง Status + Reset, 
// เลือกแถวเพื่อ Bulk Assign และ View details เปิดหน้า job
// spec: specs/assign-ticket-plan.md (2) — Head CG (HEAD_CG_EMAIL)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { footerTotal, overview } from '../Dashboard/_cross-helpers';
import { openAssignList, dataRows, readAllRows, readRow, searchList, domClick, BASE } from './_helpers';

test.describe('Assign Ticket — Head CG list', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'headCg');
    await openAssignList(page);
  });

  test('AT-HC-01 row actions follow the job status', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    const rows = await readAllRows(page);
    expect(rows.length).toBeGreaterThan(0);
    const wrong: string[] = [];
    const seen: Record<string, string> = {};
    for (const r of rows) {
      const st = r.status.replace(/\s*·.*$/, '').trim(); // "Final Render · 100%" → "Final Render"
      const acts = r.actions.join(' + ');
      seen[st] = acts;
      const expected = st === 'Assign' ? 'View details + Assign' : /^(Done|Cancelled)$/.test(st) ? 'View details' : 'View details + Reassign';
      if (acts !== expected) wrong.push(`${r.job} [${st}]: ${acts} (expected ${expected})`);
    }
    expect(wrong, `rows whose actions do not follow the status. Seen: ${JSON.stringify(seen)}`).toEqual([]);
  });

  test('AT-HC-02 search by Job No, Ticket No, Client and Product; no match; clear', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    const total = await footerTotal(page);
    const sample = await readRow(dataRows(page).nth(1));
    for (const term of [sample.job, sample.ticket, sample.client, sample.product].filter(Boolean)) {
      await searchList(page, term);
      const n = await footerTotal(page);
      expect(n, `"${term}" finds the job`).toBeGreaterThan(0);
      expect(n).toBeLessThanOrEqual(total);
      const texts = await dataRows(page).allInnerTexts();
      expect(texts.some((t) => t.includes(sample.job)), `"${term}" result contains ${sample.job}`).toBe(true);
      for (const t of texts) expect(t.toLowerCase(), `row matches "${term}"`).toContain(term.toLowerCase());
    }
    await searchList(page, 'zzzz-no-such-job');
    expect(await footerTotal(page)).toBe(0);
    await expect(dataRows(page)).toHaveCount(0);
    await searchList(page, '');
    expect(await footerTotal(page)).toBe(total);
  });

  test('AT-HC-03 status card / Status filter narrow the list and Reset restores it', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const total = await footerTotal(page);
    const ov = await overview(page);
    expect(ov.cards['assign'], 'the Assign card has jobs').toBeGreaterThan(0);

    // the cards carry title="Filter status: Assign"; click the one for Assign
    await page.locator('[title="Filter status: Assign"]').first().click();
    await page.waitForTimeout(1200);
    expect(await footerTotal(page)).toBe(ov.cards['assign']);
    for (const t of await dataRows(page).allInnerTexts()) expect(t.replace(/\s+/g, ' ').trim()).toMatch(/Assign$/);

    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForTimeout(1200);
    expect(await footerTotal(page)).toBe(total);
  });

  test('AT-HC-04 selecting rows enables Bulk Assign (Assign-status rows only); View details opens the job', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await expect(page.getByText('0 selected')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bulk Assign' })).toBeDisabled();

    const selectable = dataRows(page).filter({ has: page.getByRole('checkbox') });
    const first = selectable.first();
    const job = (await readRow(first)).job;
    expect((await readRow(first)).status, 'only Assign-status jobs can be selected').toBe('Assign');
    await first.getByRole('checkbox').check({ force: true });
    await expect(page.getByText(/^1 selected/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bulk Assign' })).toBeEnabled();
    await first.getByRole('checkbox').uncheck({ force: true });
    await expect(page.getByText('0 selected')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bulk Assign' })).toBeDisabled();

    await domClick(first.locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`${BASE}/${job}\\?ticket=TK-`));
    await expect(page.getByRole('region', { name: 'Job Information' })).toContainText(job);
  });
});
