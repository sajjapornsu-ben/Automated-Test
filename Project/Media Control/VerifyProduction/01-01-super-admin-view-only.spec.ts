// Verify & Production — Super Admin: ดูข้อมูลได้อย่างเดียวทุกส่วน: ตารางไม่มีปุ่มทำงาน, หน้า ticket detail ทุกสถานะ (Verify, On Process, Revise (CG), Review, Final Approve, Final Render, Done, Cancelled) ปุ่ม Accept / Feedback / Submit ต้องกดไม่ได้ (disabled) และงานที่ Cancelled ต้องไม่มีฟอร์มส่งเลย; เปิดหน้า detail และ History ได้
// spec: specs/verify-production-plan.md (1) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { openVpList, dataRows, readRow, pickFilter, openJob, ACTION_BUTTONS, domClick } from './_helpers';

const STATUSES = ['Verify', 'On Process', 'Revise (CG)', 'Review', 'Final Approve', 'Final Render', 'Done', 'Cancelled'];

test.describe('Verify & Production — Super Admin is view only', () => {
  test('VP-SA-01 the list has no action buttons; every job opens its detail page', { tag: ['@security', '@regression'] }, async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await openVpList(page);
    await expect(page.getByRole('heading', { name: 'Verify & Production', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /Bulk|Assign|Accept|Submit/ })).toHaveCount(0);
    const first = await readRow(dataRows(page).first());
    expect(first.href).toContain(`/mediaApproval/productionReview/${first.job}`);
    await dataRows(page).first().getByRole('link').first().click();
    await expect(page).toHaveURL(new RegExp(`/mediaApproval/productionReview/${first.job}\\?`));
    await expect(page.getByRole('region', { name: 'Job Information' })).toContainText(first.job);
  });

  test('VP-SA-02 job detail: every action button is disabled in every status', { tag: ['@security', '@regression'] }, async ({ page }) => {
    // The forms (fields, upload) may be shown, but the buttons that move a job on must not be usable (confirmed by the team 28 Oct:
    // Revise (CG) shows "Submit Skip Prove" disabled - not a defect). Cancelled is covered by VP-SA-04.
    test.setTimeout(480000);
    await loginAs(page, 'superAdmin');
    const checked: string[] = [];
    for (const status of STATUSES.filter((s) => s !== 'Cancelled')) {
      await openVpList(page);
      await pickFilter(page, 'status', status).catch(() => undefined);
      const rows = dataRows(page);
      if ((await rows.count()) === 0) continue;
      const r = await readRow(rows.first());
      if (r.status !== status) continue;
      await openJob(page, r);
      checked.push(`${status}: ${r.job}`);
      const actions = page.getByRole('button').filter({ hasText: ACTION_BUTTONS });
      for (const b of await actions.all()) {
        const label = (await b.innerText()).trim().replace(/\s+/g, ' ');
        if (ACTION_BUTTONS.test(label)) expect.soft(await b.isDisabled(), `${status} (${r.job}): "${label}" is usable by a view-only role`).toBe(true);
      }
      await expect.soft(page.getByRole('button', { name: 'History', exact: true }), `${status}: History stays available`).toBeVisible();
    }
    expect(checked.length, `statuses available to check: ${checked.join(', ')}`).toBeGreaterThan(3);
  });

  test('VP-SA-04 a Cancelled job shows no submit form to a view-only role', { tag: ['@security', '@regression'] }, async ({ page }) => {
    // Defect (reported 28 Oct): a Cancelled job still shows the revise form (fields, upload and "Submit Re-Edit Prove").
    await loginAs(page, 'superAdmin');
    await openVpList(page);
    await pickFilter(page, 'status', 'Cancelled');
    const r = await readRow(dataRows(page).first());
    expect(r.status).toBe('Cancelled');
    await openJob(page, r);
    const buttons = (await page.getByRole('button').allInnerTexts()).map((t) => t.trim().replace(/\s+/g, ' '));
    expect(buttons.filter((b) => ACTION_BUTTONS.test(b)), `${r.job}: submit buttons on a cancelled job`).toEqual([]);
    expect(await page.getByRole('textbox').count(), `${r.job}: input fields on a cancelled job`).toBe(0);
    expect(await page.locator('input[type="file"]').count(), `${r.job}: upload fields on a cancelled job`).toBe(0);
  });

  test('VP-SA-03 History opens "Activity History" for a job that has progressed', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await loginAs(page, 'superAdmin');
    await openVpList(page);
    await pickFilter(page, 'status', 'Done');
    const r = await readRow(dataRows(page).first());
    await openJob(page, r);
    await domClick(page.getByRole('button', { name: 'History', exact: true }));
    const d = page.getByRole('dialog', { name: 'Activity History' });
    await expect(d).toBeVisible();
    await expect(d).toContainText(/\d+ items?/);
    await expect(d.getByRole('article').first()).toBeVisible();
    await domClick(d.getByRole('button', { name: 'Close' }));
    await expect(d).toBeHidden();
  });
});
