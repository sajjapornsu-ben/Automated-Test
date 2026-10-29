// แนบ evidence file ใน dialog "Version Quota Reached" แล้วกด Confirm ต้องเพิ่ม version สำเร็จ และ badge จำนวนเวอร์ชันอัปเดต
// spec: specs/create-ticket-plan.md (10.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage, pickDate } from './_helpers';

test.describe('Version-over-quota flow', () => {
  test('Attaching evidence and confirming adds the over-quota version', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Overage Confirm Client', product: 'QA Overage Confirm Product' });

    await addJobWithPackage(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 28);

    const addVersionBtn = page.getByRole('button', { name: 'Add Version' });
    await addVersionBtn.click();
    await addVersionBtn.click();
    await addVersionBtn.click();
    await expect(page.getByRole('heading', { name: 'Version Quota Reached' })).toBeVisible();
    await expect(page.getByText('3 versions', { exact: true })).toBeVisible();

    // 1. Attach a file to the evidence dropzone.
    const evidenceInput = page.locator('input[type="file"]').last();
    await evidenceInput.setInputFiles({
      name: 'evidence.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-evidence-content'),
    });

    // Confirm Add Version becomes enabled.
    const confirmBtn = page.getByRole('button', { name: 'Confirm Add Version' });
    await expect(confirmBtn).toBeEnabled();

    // 2. Click "Confirm Add Version".
    await confirmBtn.click();

    // The extra version is added and the version-count badge updates.
    await expect(page.getByRole('heading', { name: 'Version Quota Reached' })).toHaveCount(0);
    await expect(page.getByText('4 versions', { exact: true })).toBeVisible();
  });
});
