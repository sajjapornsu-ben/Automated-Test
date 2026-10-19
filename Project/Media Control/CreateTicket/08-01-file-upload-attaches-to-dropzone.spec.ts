// อัปโหลดไฟล์จริงผ่านช่อง Material (drag & drop dropzone) แล้วต้องเห็นชื่อไฟล์ ขนาด และปุ่ม Remove file
// spec: specs/create-ticket-plan.md (8.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('File Upload', () => {
  test('Uploading a file via the dropzone attaches it', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Upload Client', product: 'QA Upload Product' });

    // 1. Add a Job (Version 1's Material dropzone is a real file input).
    await page.getByRole('button', { name: 'Add Job' }).click();

    // 2. Select a small file for the Material dropzone.
    const materialFileInput = page.locator('input[type="file"]').first();
    await materialFileInput.setInputFiles({
      name: 'material-test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-jpeg-content-for-testing'),
    });

    // The filename appears as a download link, with a byte-size badge and a "Remove file" button;
    // the dropzone's counter updates.
    await expect(page.getByRole('link', { name: 'material-test.jpg' })).toBeVisible();
    await expect(page.getByText('29 B', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove file' })).toBeVisible();
    await expect(page.getByText('29B / 50 MB', { exact: true })).toBeVisible();
  });
});
