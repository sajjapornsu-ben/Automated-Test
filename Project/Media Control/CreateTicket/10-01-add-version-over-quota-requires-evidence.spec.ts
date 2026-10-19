// กด Add Version จนเกิน Quota แล้วต้องเจอ dialog "Version Quota Reached" ที่บังคับแนบ evidence file ก่อน Confirm ได้
// spec: specs/create-ticket-plan.md (10.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';

test.describe('Version-over-quota flow', () => {
  test('Adding a Version beyond the Quota requires an evidence file', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Overage Client', product: 'QA Overage Product' });

    // 1. Add a Job, select a Package + Period that gives a small Quota (e.g. "3").
    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 28);
    await expect(page.getByText(/Version \d+\/3/)).toBeVisible();

    // then click "Add Version" enough times to exceed it (Quota 3: 2 clicks -> 3 versions, 3rd click exceeds).
    const addVersionBtn = page.getByRole('button', { name: 'Add Version' });
    await addVersionBtn.click();
    await addVersionBtn.click();
    await addVersionBtn.click();

    // A "Version Quota Reached" dialog appears with a required evidence dropzone and a
    // disabled "Confirm Add Version" button.
    await expect(page.getByRole('heading', { name: 'Version Quota Reached' })).toBeVisible();
    await expect(
      page.getByText('This Package has a Version Quota of 3 (used 3). To add more Versions, please attach an evidence file.')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Attach Files' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Reason for requesting additional Version (optional)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm Add Version' })).toBeDisabled();
  });
});
