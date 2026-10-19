// เข้าเมนู MEDIA APPROVAL > Media Ticket แล้วเช็คว่าหน้าโหลดถูกต้อง (heading, ตาราง)
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Navigation', () => {
  test('Open Media Ticket from the sidebar', async ({ page }) => {
    await login(page);

    // 1. From the Home page, click the "MEDIA APPROVAL" button in the sidebar.
    // 2. Click the "Media Ticket" link that appears.
    await openMediaTicket(page);

    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);
    await expect(page.getByRole('heading', { name: 'Media Ticket' })).toBeVisible();
    await expect(page.getByText('Manage and track your requests')).toBeVisible();
    await expect(page.getByRole('grid', { name: 'Media Ticket List Table' })).toBeVisible();
  });
});
