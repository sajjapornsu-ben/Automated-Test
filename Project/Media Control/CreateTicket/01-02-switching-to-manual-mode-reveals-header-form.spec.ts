// เปิด switch "No Quotation Number" ต้องโชว์ banner Manual entry mode และฟอร์ม Ticket Header เต็มรูปแบบ
// spec: specs/create-ticket-plan.md (1.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode } from './_helpers';

test.describe('Entry & Mode Switching', () => {
  test('Switching to Manual mode reveals the full header form', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);

    // 1. Navigate to Create Ticket. (done above)
    // 2. Toggle "No Quotation Number" ON.
    await switchToManualMode(page);

    // A Manual-mode banner appears.
    await expect(page.getByText('Manual entry mode — No Quotation Number, fill in details manually')).toBeVisible();

    // The Ticket Header fields appear.
    await expect(page.getByRole('textbox', { name: 'Enter name...' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter client name...' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter product name...' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'DD/MM/YYYY' }).first()).toBeVisible();
    await expect(page.getByText('Contract Period')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select media category' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select media group' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select media type' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select CS Support' })).toBeVisible();
  });
});
