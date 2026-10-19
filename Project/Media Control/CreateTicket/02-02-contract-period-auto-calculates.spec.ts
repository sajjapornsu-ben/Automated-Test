// เลือกวันที่ Contract Start - End แล้ว ช่อง Contract Period (read-only) ต้องคำนวณให้อัตโนมัติ
// spec: specs/create-ticket-plan.md (2.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, pickDate } from './_helpers';

test.describe('Ticket Header', () => {
  test('Contract Period auto-calculates from Start/End dates', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const contractPeriod = page.getByText('Contract Period', { exact: false }).locator('xpath=following-sibling::div[1]');
    await expect(contractPeriod).toHaveText('—');

    // 1. Switch to Manual mode. (done above)
    // 2. Pick a Contract Start date and a Contract End date about a month apart.
    const dateButtons = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, dateButtons.nth(0), 1);
    await pickDate(page, dateButtons.nth(0), 28);

    // The read-only "Contract Period" field updates to show a calculated duration.
    await expect(contractPeriod).not.toHaveText('—');
  });
});
