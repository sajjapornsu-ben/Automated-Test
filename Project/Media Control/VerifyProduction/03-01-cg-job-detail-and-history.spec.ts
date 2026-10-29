// Verify & Production — CG: เปิดหน้า ticket detail จากตารางได้ (ข้อมูลตรงกับแถว, ขั้นตอน progress, Material & Brief, SLA Timer, Prove History) และปุ่ม History / Action History (Prove N) เปิดดูได้ มีข้อมูล
// spec: specs/verify-production-plan.md (3) — CG (cg1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { openVpList, dataRows, readRow, openJob, domClick, firstJobWithStatus, BASE } from './_helpers';

test.describe('Verify & Production — CG job detail and History', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cg1');
    await openVpList(page);
  });

  test('VP-CG-05 a job opens from the list and shows the same data', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const row = dataRows(page).nth(1);
    const r = await readRow(row);
    await row.getByRole('link').first().click();
    await expect(page).toHaveURL(new RegExp(`${BASE}/${r.job}\\?`));

    await expect(page.getByRole('heading', { level: 1 })).toContainText(r.product);
    await expect(page.getByRole('list', { name: 'Breadcrumbs' })).toContainText('Verify & Production');
    const info = page.getByRole('region', { name: 'Job Information' });
    await expect(info).toContainText(r.job);
    await expect(info).toContainText(r.ticket);
    await expect(info).toContainText(r.product);
    await expect(info).toContainText(r.salePackage);
    await expect(info).toContainText(r.sales);
    await expect(info).toContainText(r.mediaGroup);
    // the status badge and the progress steps (Assign → … → Done)
    await expect(page.locator('main')).toContainText(r.status.replace(/\s*·.*$/, ''));
    await expect(page.getByRole('navigation', { name: 'Job progress' })).toContainText(/Assign.*Verify.*On Process.*Review.*Final Approve.*Final Render.*Done/s);
    await expect(page.getByRole('heading', { name: 'Material & Brief' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SLA Timer' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prove History' })).toBeVisible();
  });

  test('VP-CG-06 History opens "Activity History" with entries and closes', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const r = (await firstJobWithStatus(page, 'Done')) ?? (await readRow(dataRows(page).first()));
    await openJob(page, r);
    await domClick(page.getByRole('button', { name: 'History', exact: true }));
    const d = page.getByRole('dialog', { name: 'Activity History' });
    await expect(d).toBeVisible();
    await expect(d.getByRole('heading', { name: 'Activity History' })).toBeVisible();
    const count = Number((await d.innerText()).match(/(\d+) items?/)![1]);
    expect(count, 'history items').toBeGreaterThan(0);
    const first = (await d.getByRole('article').first().innerText()).replace(/\s+/g, ' ');
    expect(first).toMatch(/\d{2}:\d{2}/); // time
    expect(first).toContain(r.job);
    await domClick(d.getByRole('button', { name: 'Close' }));
    await expect(d).toBeHidden();
  });

  test('VP-CG-07 "Action History · Prove N" opens the history of that prove round', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const r = await firstJobWithStatus(page, 'Done');
    test.skip(!r, 'no Done job for this CG right now');
    await openJob(page, r!);
    const buttons = page.getByRole('button', { name: /^Action History · Prove \d+$/ });
    expect(await buttons.count(), 'a Done job has at least one prove round').toBeGreaterThan(0);
    await domClick(buttons.first());
    const d = page.getByRole('dialog').first();
    await expect(d).toBeVisible();
    await expect(d).toContainText(/Prove/);
    await expect(d.getByRole('article').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(d).toBeHidden();
  });
});
