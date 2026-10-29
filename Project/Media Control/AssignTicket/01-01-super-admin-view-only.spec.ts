// Assign Ticket — Super Admin: ดูข้อมูลได้อย่างเดียว ไม่มีปุ่ม action ใดๆ 
// (Assign / Reassign / Bulk Assign) ทั้งในตารางและหน้า ticket detail; 
// ปุ่ม View details ใช้เปิดดูรายละเอียดและปุ่ม History ใช้ดูประวัติได้
// spec: specs/assign-ticket-plan.md (1) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { openAssignList, dataRows, readRow, domClick, BASE } from './_helpers';

test.describe('Assign Ticket — Super Admin is view only', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await openAssignList(page);
  });

  test('AT-SA-01 no Assign / Reassign / Bulk Assign anywhere in the list', { tag: ['@security', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000); // reads 100 rows cell by cell
    await page.getByRole('combobox').last().selectOption('100').catch(() => undefined);
    await page.waitForTimeout(1500);
    const rows = dataRows(page);
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = await readRow(rows.nth(i));
      if (r.actions.some((a) => a !== 'View details')) offenders.push(`${r.job} (${r.status}): ${r.actions.join(', ')}`);
    }
    expect(offenders, 'rows that offer an action other than View details').toEqual([]);
    await expect(page.getByRole('button', { name: 'Bulk Assign' })).toHaveCount(0);
    await expect(page.locator('[title="Assign"], [title="Reassign"]')).toHaveCount(0);
  });

  test('AT-SA-02 no row-selection checkboxes (selection only exists for Bulk Assign)', { tag: ['@security', '@regression'] }, async ({ page }) => {
    // Observed 28 Oct: Super Admin sees a "Select all" checkbox and one per Assign-status row although Bulk Assign is not offered.
    await expect(page.getByRole('checkbox'), 'selection checkboxes shown to a view-only role').toHaveCount(0);
  });

  test('AT-SA-03 View details opens the job; the page offers History only, no Assign / Reassign', { tag: ['@happy', '@security'] }, async ({ page }) => {
    const row = dataRows(page).filter({ hasText: /Assign\s*$/ }).first();
    const job = (await readRow(row)).job;
    await domClick(row.locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`/mediaApproval/assignTicket/${job}\\?ticket=TK-`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Job Information' })).toContainText(job);
    await expect(page.getByRole('button', { name: 'History', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Assign', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reassign', exact: true })).toHaveCount(0);

    // an assigned job (Reassign for a Head CG) is view only as well
    await page.goBack();
    await openAssignList(page);
    const assigned = dataRows(page).filter({ hasText: /Final Render|On Process|Verify/ }).first();
    if (await assigned.count()) {
      const j2 = (await readRow(assigned)).job;
      await page.goto(`${BASE}/${j2}`);
      await expect(page.getByRole('button', { name: 'History', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Reassign', exact: true })).toHaveCount(0);
    }
  });

  test('AT-SA-04 History button opens "Activity History" with entries', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    // a job that has progressed has history; open it from its detail page
    const row = dataRows(page).filter({ hasText: /Final Render|Done|On Process|Verify|Review/ }).first();
    await expect(row).toBeVisible();
    await domClick(row.locator('[title="View details"]'));
    await page.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const d = page.getByRole('dialog', { name: 'Activity History' });
    await expect(d).toBeVisible();
    await expect(d).toContainText(/\d+ items?/);
    await expect(d.getByRole('article').first()).toBeVisible();
    await d.getByRole('button', { name: 'Close' }).click({ force: true });
    await expect(d).toBeHidden();
  });
});
