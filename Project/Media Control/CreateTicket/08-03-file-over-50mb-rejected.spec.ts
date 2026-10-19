// เลือกไฟล์ที่มีขนาดเกิน 50MB ต้องถูกปฏิเสธเงียบๆ (ไม่มี error/crash แต่ dropzone ไม่รับไฟล์)
// spec: specs/create-ticket-plan.md (8.3, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('File Upload', () => {
  test('Selecting a file over 50MB is rejected', async ({ page }) => {
    // A >50MB buffer can't go through setInputFiles directly (Playwright's own 50MB buffer
    // limit), so write a real 51MB file to a temp path first and clean it up afterwards.
    const bigFilePath = path.join(os.tmpdir(), `playwright-big-upload-${Date.now()}.jpg`);
    fs.writeFileSync(bigFilePath, Buffer.alloc(51 * 1024 * 1024));

    try {
      await login(page);
      await openCreateTicket(page);
      await switchToManualMode(page);
      await fillTicketHeader(page, { client: 'QA Big File Client', product: 'QA Big File Product' });

      await page.getByRole('button', { name: 'Add Job' }).click();

      // 1. Select a file larger than 50MB for the Material dropzone.
      const materialFileInput = page.locator('input[type="file"]').first();
      await materialFileInput.setInputFiles(bigFilePath);
      await page.waitForTimeout(1000);

      // The file is silently rejected — no filename added, counter stays at 0B / 50 MB.
      await expect(page.getByText('0B / 50 MB', { exact: true }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /playwright-big-upload/ })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Remove file' })).toHaveCount(0);
    } finally {
      fs.unlinkSync(bigFilePath);
    }
  });
});
