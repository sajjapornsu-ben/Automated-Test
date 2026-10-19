// กด "Add Version" ใน Job เดิม แล้วต้องได้ Version 2 (Draft) เพิ่มมา และป้ายจำนวนเวอร์ชันต้องอัปเดต
// spec: specs/create-ticket-plan.md (4.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('Version Management', () => {
  test('Add Version adds another version card under the same Job', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Add Version Client', product: 'QA Add Version Product' });

    // 1. Add a Job (which starts with Version 1).
    await page.getByRole('button', { name: 'Add Job' }).click();
    await expect(page.getByText('1 version', { exact: true })).toBeVisible();
    await expect(page.getByText('Version 1', { exact: true })).toBeVisible();

    // 2. Click "Add Version" on that job.
    await page.getByRole('button', { name: 'Add Version' }).click();

    // A "Version 2" card appears below Version 1, also with status "Draft".
    await expect(page.getByText('Version 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Version 2', { exact: true })).toBeVisible();
    await expect(page.getByText('Draft', { exact: true })).toHaveCount(2);

    // The job's version-count badge updates ("1 version" -> "2 versions").
    await expect(page.getByText('1 version', { exact: true })).toHaveCount(0);
    await expect(page.getByText('2 versions', { exact: true })).toBeVisible();
  });
});
