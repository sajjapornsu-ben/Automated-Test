// เลือกตัวเลือกใน dropdown Media Code แล้วปุ่มต้องอัปเดตข้อความเป็นรหัสที่เลือก
// spec: specs/create-ticket-plan.md (9.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover } from './_helpers';

test.describe('Customize Package', () => {
  test('Selecting a Media Code fills the field', async ({ page }) => {
    test.fixme(true, 'No Customize Sale Package is reachable on UAT since the Media Type (Epicor/SF) change: the only Media Type with a package is Retail > DIGITAL > QATEST (7-Eleven Plus). Re-enable when a Customize package is mapped to a Media Type, and pick it in this test');
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Media Code Client', product: 'QA Media Code Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Sale Package' }).click();
    await page.getByRole('button', { name: 'Customize BKK (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    // 1. Open the Media Code selector and choose an option.
    const mediaCodeBtn = page.locator('text=Media Code').first().locator('xpath=following::button[1]');
    await mediaCodeBtn.click();
    await page.getByRole('button', { name: 'DGT001 - AIATower(ถนนสุรวงศ์)', exact: true }).click();
    await closeOpenPopover(page);

    // The Media Code button's text updates to the chosen code.
    await expect(mediaCodeBtn).toHaveText('DGT001 - AIATower(ถนนสุรวงศ์)');
  });
});
