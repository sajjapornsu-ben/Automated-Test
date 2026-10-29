// Assign Ticket — Head CG หน้า job detail (View details): ข้อมูลตรงกับแถวในตาราง, ปุ่ม Assign / Reassign เปิด dialog เดียวกับในตาราง (รายชื่อเฉพาะตนเอง+ทีม, ไม่เลือกกด Assign ไม่ได้) และ
// ปุ่ม History เปิด "Activity History" แสดงรายการ
// spec: specs/assign-ticket-plan.md (4) — Head CG (HEAD_CG_EMAIL); ไม่กดยืนยัน ไม่เปลี่ยนข้อมูล
// seed: seed.spec.ts

import { test, expect, Browser } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from '../Dashboard/_helpers';
import { userTeamMembers } from '../Dashboard/_cross-helpers';
import { openAssignList, dataRows, readRow, readDesigners, dialog, assignButton, closeDialog, domClick, BASE } from './_helpers';

async function headCgScope(browser: Browser): Promise<Set<string>> {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  try {
    await loginAs(p, 'superAdmin');
    return new Set([DISPLAY_NAME.headCg!, ...(await userTeamMembers(p, process.env.HEAD_CG_EMAIL!))]);
  } finally {
    await ctx.close();
  }
}

test.describe('Assign Ticket — Head CG job detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'headCg');
    await openAssignList(page);
  });

  test('AT-HC-08 detail page shows the same job data as the list and an Assign dialog with the same rules', { tag: ['@happy', '@negative', '@security', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    const scope = await headCgScope(browser);
    const row = dataRows(page).filter({ has: page.locator('[title="Assign"]') }).first();
    const r = await readRow(row);
    await domClick(row.locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`${BASE}/${r.job}\\?ticket=${r.ticket}`));

    // header + Job Information = the list row
    await expect(page.getByRole('heading', { level: 1 })).toContainText(r.client);
    const info = page.getByRole('region', { name: 'Job Information' });
    await expect(info).toContainText(r.job);
    await expect(info).toContainText(r.ticket);
    await expect(info).toContainText(r.client);
    await expect(info).toContainText(r.salePackage);
    await expect(info).toContainText(r.sales);
    if (r.epicor) await expect(info).toContainText(r.epicor);
    await expect(page.getByRole('navigation', { name: 'Job progress' })).toContainText('Assign');

    // Assign here works like in the list
    await page.getByRole('button', { name: 'Assign', exact: true }).click({ force: true });
    await expect(dialog(page)).toContainText('Assign Graphic Designer');
    await expect(dialog(page)).toContainText(`1 job (${r.job})`);
    await expect(dialog(page).getByRole('button').filter({ hasText: /active/ }).first()).toBeVisible({ timeout: 15000 });
    const designers = await readDesigners(page);
    expect(designers.length).toBeGreaterThan(0);
    expect(designers.filter((x) => !scope.has(x.name)).map((x) => x.name), 'designers outside self + team').toEqual([]);
    await expect(dialog(page)).toContainText('No Graphic selected yet');
    await expect(assignButton(page), 'Assign with no designer selected').toBeDisabled();
    await domClick(dialog(page).getByRole('button').filter({ hasText: /active/ }).first());
    await expect(assignButton(page)).toBeEnabled();
    await closeDialog(page);
    await expect(page).toHaveURL(new RegExp(`${BASE}/${r.job}`)); // Cancel: still on the job, still unassigned
    await expect(page.getByRole('button', { name: 'Assign', exact: true })).toBeVisible();
  });

  test('AT-HC-09 detail page of an assigned job offers Reassign with the current designer and the same rules', { tag: ['@happy', '@negative', '@security', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    const scope = await headCgScope(browser);
    const row = dataRows(page).filter({ has: page.locator('[title="Reassign"]') }).first();
    const r = await readRow(row);
    await domClick(row.locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`${BASE}/${r.job}\\?ticket=${r.ticket}`));
    await expect(page.getByRole('button', { name: 'Assign', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Reassign', exact: true }).click({ force: true });
    await expect(dialog(page)).toContainText('Reassign Graphic Designer');
    await expect(dialog(page)).toContainText('Currently Assigned To');
    await expect(dialog(page)).toContainText(r.assigned.split(' head:')[0].trim());
    await expect(dialog(page).getByRole('button').filter({ hasText: /active/ }).first()).toBeVisible({ timeout: 15000 });
    const designers = await readDesigners(page);
    expect(designers.filter((x) => !scope.has(x.name)).map((x) => x.name), 'designers outside self + team').toEqual([]);
    await domClick(dialog(page).getByRole('button', { pressed: true }).filter({ hasText: /active/ })); // clear the current choice
    await expect(assignButton(page), 'Reassign with no designer selected').toBeDisabled();
    await closeDialog(page);
  });

  test('AT-HC-10 History opens "Activity History" with the job\'s entries and closes', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    // a job that has progressed has history
    const row = dataRows(page).filter({ hasText: /Final Render|On Process|Verify|Review|Revise|Done/ }).first();
    const r = await readRow(row);
    await domClick(row.locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`${BASE}/${r.job}`));
    await page.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const d = page.getByRole('dialog', { name: 'Activity History' });
    await expect(d).toBeVisible();
    await expect(d.getByRole('heading', { name: 'Activity History' })).toBeVisible();
    const count = Number((await d.innerText()).match(/(\d+) items?/)![1]);
    expect(count, 'history items').toBeGreaterThan(0);
    const entries = d.getByRole('article');
    expect(await entries.count()).toBeGreaterThan(0);
    // every entry says what happened, when, who did it and for which job
    const first = (await entries.first().innerText()).replace(/\s+/g, ' ');
    expect(first).toMatch(/\d{2}:\d{2}/);
    expect(first).toContain(r.job);
    await d.getByRole('button', { name: 'Close' }).click({ force: true });
    await expect(d).toBeHidden();
    await expect(page.getByRole('button', { name: 'History', exact: true })).toBeVisible();
  });

  test('AT-HC-11 History is also available on a job that has not started (Assign status)', { tag: ['@edge', '@regression'] }, async ({ page }) => {
    const row = dataRows(page).filter({ has: page.locator('[title="Assign"]') }).first();
    const r = await readRow(row);
    await domClick(row.locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`${BASE}/${r.job}`));
    await page.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const d = page.getByRole('dialog', { name: 'Activity History' });
    await expect(d).toBeVisible();
    await expect(d).toContainText(/\d+ items?|No (history|activity)/i);
    await d.getByRole('button', { name: 'Close' }).click({ force: true });
    await expect(d).toBeHidden();
  });
});
