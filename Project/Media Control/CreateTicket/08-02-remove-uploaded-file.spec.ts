// อัปโหลดไฟล์แล้วกด "Remove file" ต้องเอาไฟล์ออกจาก dropzone
// spec: specs/create-ticket-plan.md (8.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('File Upload', () => {
  test('Removing an uploaded file removes it', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Remove File Client', product: 'QA Remove File Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();

    const materialFileInput = page.locator('input[type="file"]').first();
    await materialFileInput.setInputFiles({
      name: 'material-test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-jpeg-content-for-testing'),
    });
    await expect(page.getByRole('link', { name: 'material-test.jpg' })).toBeVisible();

    // 1. Click "Remove file".
    await page.getByRole('button', { name: 'Remove file' }).click();

    // The filename link disappears from the dropzone.
    await expect(page.getByRole('link', { name: 'material-test.jpg' })).toHaveCount(0);
    await expect(page.getByText('0B / 50 MB', { exact: true }).first()).toBeVisible();
  });
});
