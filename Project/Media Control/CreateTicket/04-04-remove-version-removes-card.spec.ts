// กด "Remove version" ที่ Version 2 แล้ว card ต้องหายไป เหลือ Version 1 และป้ายจำนวนเวอร์ชันลดลง
// spec: specs/create-ticket-plan.md (4.4, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('Version Management', () => {
  test('Removing a Version removes its card', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Remove Version Client', product: 'QA Remove Version Product' });

    // 1. Add a Job with 2 versions (via Add Version).
    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Add Version' }).click();
    await expect(page.getByText('2 versions', { exact: true })).toBeVisible();

    // 2. Click "Remove version" on the second version.
    const removeVersionBtns = page.getByRole('button', { name: 'Remove version' });
    await removeVersionBtns.nth(1).click();

    // Version 2's card disappears; Version 1 remains; the job's version-count badge updates back down.
    await expect(page.getByText('Version 2', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Version 1', { exact: true })).toBeVisible();
    await expect(page.getByText('1 version', { exact: true })).toBeVisible();
  });
});
