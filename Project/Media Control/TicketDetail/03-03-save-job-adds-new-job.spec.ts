// เติมข้อมูลฟอร์ม "New Job" แล้วกด "Save Job" ต้องเพิ่ม Job ใหม่เข้าตั๋วจริง และจำนวน Job ต้องเพิ่มขึ้น
// spec: specs/ticket-detail-plan.md (3.3)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้สร้างตั๋วทดสอบใหม่ (ผ่าน Create Ticket) แล้ว Save Job จริงบน UAT
// (ได้รับอนุมัติจากผู้ใช้แล้ว) เทสนี้ถูก skip by default — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import {
  login,
  openCreateTicket,
  switchToManualMode,
  fillTicketHeader,
  closeOpenPopover,
  pickDate,
} from '../CreateTicket/_helpers';

test.describe('Add Job', () => {
  test('Saving a new Job actually adds it to the ticket', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Mutates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');

    // 1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already).
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const clientName = `QA Test Client ${Date.now()}`;
    await fillTicketHeader(page, { client: clientName, product: 'QA TicketDetail Product' });

    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 21);

    await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
    await page.getByRole('textbox', { name: 'Seconds' }).fill('15');

    const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
    await linkBoxes.nth(0).fill('https://example.com/material.jpg');
    await linkBoxes.nth(1).fill('https://example.com/brief.pdf');

    await page.getByRole('button', { name: 'Submit ticket' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    await page.getByRole('textbox', { name: /Search ticket/ }).fill(clientName);
    await page.waitForTimeout(600);
    const row = page.getByRole('row').filter({ hasText: clientName });
    await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/TK-\d+$/);

    await expect(page.getByText('1 job', { exact: true })).toBeVisible();

    // 2. On its detail page, click "Add Job", fill the new Job's Package (Duration/Period
    // auto-prefill from the existing Job), and Material/Brief.
    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('option', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();

    await page.getByRole('textbox', { name: 'Material link' }).fill('https://example.com/material2.jpg');
    await page.getByRole('textbox', { name: 'Brief link' }).fill('https://example.com/brief2.pdf');

    // 3. Click "Save Job".
    await page.getByRole('button', { name: 'Save Job' }).click();

    // A success dialog confirms the new Job was added.
    await expect(page.getByRole('heading', { name: 'Job Added' })).toBeVisible();
    await expect(page.getByText('New job added successfully')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // The new Job appears in the Jobs list; the Jobs count badge increments.
    await expect(page.getByText('1 job', { exact: true })).toHaveCount(0);
    await expect(page.getByText('2 jobs', { exact: true })).toBeVisible();
  });
});
