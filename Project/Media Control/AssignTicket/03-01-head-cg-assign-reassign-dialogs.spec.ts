// Assign Ticket — Head CG: dialog "Assign / Reassign Graphic Designer" (ไม่กดยืนยัน ไม่เปลี่ยนข้อมูล): ข้อมูล Job ในกล่องตรงกับแถว, 
// รายชื่อ Graphic Designer มีเฉพาะตนเองและทีมที่อยู่ภายใต้ (Team CG ใน User Management), 
// เรียงตาม workload น้อย→มาก, ไม่เลือกแล้วกด Assign ไม่ได้, 
// ค้นหาในรายชื่อ, Reassign แสดงผู้รับงานปัจจุบัน และ Bulk Assign
// spec: specs/assign-ticket-plan.md (3) — Head CG (HEAD_CG_EMAIL)
// seed: seed.spec.ts

import { test, expect, Browser } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from '../Dashboard/_helpers';
import { userTeamMembers } from '../Dashboard/_cross-helpers';
import {
  openAssignList, dataRows, readRow, openRowDialog, readDesigners, dialog, assignButton, closeDialog, domClick, statusOf,
} from './_helpers';

/** Head CG + the CGs under them (Settings > User Management > Edit > "Current team"), read as Super Admin. */
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

test.describe('Assign Ticket — Head CG Assign / Reassign dialogs (read only)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'headCg');
    await openAssignList(page);
  });

  test('AT-HC-05 Assign dialog: job info, designers = self + own team, sorted by workload, Assign needs a choice', { tag: ['@happy', '@negative', '@security', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    const scope = await headCgScope(browser);
    expect(scope.size, 'Head CG has a team').toBeGreaterThan(1);

    const row = dataRows(page).filter({ has: page.locator('[title="Assign"]') }).first();
    const r = await readRow(row);
    await openRowDialog(page, row, 'Assign');
    const d = dialog(page);

    // the job shown in the dialog is the row's job
    await expect(d).toContainText(r.ticket);
    await expect(d).toContainText(`1 job (${r.job})`);
    await expect(d).toContainText(r.salePackage);
    if (r.epicor) await expect(d).toContainText(r.epicor);
    await expect(d.getByRole('textbox', { name: 'Search Graphic Designer...' })).toBeVisible();
    await expect(d).toContainText('Sorted by lowest workload → highest');

    // designers: only the Head CG and the CGs under them
    const designers = await readDesigners(page);
    expect(designers.length, 'at least one designer to choose').toBeGreaterThan(0);
    const outsiders = designers.filter((x) => !scope.has(x.name)).map((x) => x.name);
    expect(outsiders, `designers outside ${[...scope].join(', ')}`).toEqual([]);
    // sorted by workload, the lightest one is "Recommended"
    const loads = designers.map((x) => x.active);
    expect(loads, 'ascending by active jobs').toEqual([...loads].sort((a, b) => a - b));
    expect(designers[0].recommended, 'first (lightest) designer is Recommended').toBe(true);
    expect(designers.filter((x) => x.recommended)).toHaveLength(1);

    // nothing chosen: Assign cannot be pressed
    await expect(d).toContainText('No Graphic selected yet');
    await expect(assignButton(page)).toBeDisabled();

    // search inside the list
    const search = d.getByRole('textbox', { name: 'Search Graphic Designer...' });
    const some = designers[designers.length - 1].name;
    await search.fill(some);
    await page.waitForTimeout(500);
    const filtered = await readDesigners(page);
    expect(filtered.map((x) => x.name)).toContain(some);
    for (const f of filtered) expect(f.name.toLowerCase()).toContain(some.toLowerCase());
    await search.fill('zzzz-nobody');
    await page.waitForTimeout(500);
    expect(await readDesigners(page)).toHaveLength(0);
    await search.fill('');
    await page.waitForTimeout(500);

    // choose one: it is shown as selected and Assign is enabled; choose another: the selection moves
    const buttons = d.getByRole('button').filter({ hasText: /active/ });
    await domClick(buttons.first());
    await expect(d).toContainText(`Selected: ${designers[0].name}`);
    await expect(assignButton(page)).toBeEnabled();
    if (designers.length > 1) {
      await domClick(buttons.nth(1));
      await expect(d).toContainText(`Selected: ${designers[1].name}`);
    }

    // Cancel: nothing was assigned
    await closeDialog(page);
    const after = await readRow(dataRows(page).filter({ hasText: r.job }).first());
    expect(after.status).toBe('Assign');
    expect(after.assigned).toBe(r.assigned);
  });

  test('AT-HC-06 Reassign dialog: current designer shown, same designer rules, nothing chosen cannot be confirmed', { tag: ['@happy', '@negative', '@security', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    const scope = await headCgScope(browser);
    const row = dataRows(page).filter({ has: page.locator('[title="Reassign"]') }).first();
    const r = await readRow(row);
    await openRowDialog(page, row, 'Reassign');
    const d = dialog(page);

    await expect(d).toContainText(`1 job (${r.job})`);
    await expect(d.getByText('Currently Assigned To')).toBeVisible();
    // "CG - QA head: Head CG - QA" on the row → the dialog names the same person
    const current = r.assigned.split(' head:')[0].trim();
    await expect(d).toContainText(current);

    const designers = await readDesigners(page);
    expect(designers.length).toBeGreaterThan(0);
    expect(designers.filter((x) => !scope.has(x.name)).map((x) => x.name), 'designers outside self + team').toEqual([]);
    const loads = designers.map((x) => x.active);
    expect(loads, 'ascending by active jobs').toEqual([...loads].sort((a, b) => a - b));

    // the current designer starts selected; clearing the selection must disable Reassign, like Assign does
    const currentBtn = d.getByRole('button', { pressed: true }).filter({ hasText: /active/ });
    await expect(currentBtn).toHaveCount(1);
    await domClick(currentBtn);
    await expect(d).toContainText('No Graphic selected yet');
    await expect(assignButton(page), 'Reassign with no designer selected').toBeDisabled();

    await closeDialog(page);
    expect(await statusOf(dataRows(page).filter({ hasText: r.job }).first())).toBe(r.status);
  });

  test('AT-HC-07 Bulk Assign dialog shows the number of selected jobs; Assign needs a designer', { tag: ['@happy', '@negative', '@regression'] }, async ({ page, browser }) => {
    test.setTimeout(240000);
    const scope = await headCgScope(browser);
    const selectable = dataRows(page).filter({ has: page.getByRole('checkbox') });
    for (let i = 0; i < 2; i++) await selectable.nth(i).getByRole('checkbox').check({ force: true });
    await expect(page.getByText(/^2 selected/)).toBeVisible();
    await domClick(page.getByRole('button', { name: 'Bulk Assign' }));
    const d = dialog(page);
    await expect(d).toBeVisible({ timeout: 15000 });
    await expect(d).toContainText('Assign Graphic Designer');
    await expect(d).toContainText('2 jobs selected');
    const designers = await readDesigners(page);
    expect(designers.length).toBeGreaterThan(0);
    expect(designers.filter((x) => !scope.has(x.name)).map((x) => x.name), 'designers outside self + team').toEqual([]);
    await expect(d).toContainText('No Graphic selected yet');
    await expect(assignButton(page)).toBeDisabled();
    await closeDialog(page);
    await expect(page.getByText(/^2 selected/)).toBeVisible(); // Cancel keeps the selection, nothing assigned
  });
});
