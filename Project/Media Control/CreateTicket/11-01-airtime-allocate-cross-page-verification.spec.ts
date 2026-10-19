// Submit ticket แล้วเปิดหน้า Airtime Allocate: ตรวจว่าค่า Job/Version Duration ถูกต้อง และ Total คำนวณจาก Duration x Spot/Loop โดยไม่ถูกบล็อกแม้เกิน Plan
// spec: specs/create-ticket-plan.md (11.1 + 11.2, PB-1861)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้ submit ticket จริงบน UAT (ได้รับอนุมัติจากผู้ใช้แล้ว) — รวม 2 สถานการณ์ (carry-over
// values กับ Total auto-calc) ไว้ในเทสเดียวเพื่อ submit ticket จริงแค่ 1 ใบแทนที่จะเป็น 2 ใบ
// เทสนี้ถูก skip by default (สร้าง record จริงบน UAT) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';

test.describe('Airtime Allocate cross-page verification', () => {
  test('Job/Version values carry over, and Total auto-calculates uncapped', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');

    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const clientName = `QA Test Client ${Date.now()}`;

    // 1. Submit a Manual-mode ticket (Package + Job Duration + Version Duration all known values).
    await fillTicketHeader(page, { client: clientName, product: 'QA Airtime Product' });
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
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);

    // Open the new ticket, then click "Airtime Allocate".
    await page.getByRole('textbox', { name: /Search ticket/ }).fill(clientName);
    await page.waitForTimeout(600);
    const row = page.getByRole('row').filter({ hasText: clientName });
    await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/TK-\d+$/);
    await page.getByRole('link', { name: 'Airtime Allocate' }).click();

    // 2. Verify the Airtime Allocate page reflects the values set at creation.
    await expect(page).toHaveURL(/\/mediaApproval\/airtimeAllocate\/TK-\d+$/);

    // The Package summary badge shows "Plan 0 Min. 15 Sec." matching the Job Duration set at creation.
    await expect(page.getByText('Plan 0 Min. 15 Sec.', { exact: false })).toBeVisible();

    // The allocation table row has the Version's Duration (7.5 sec, the default) pre-selected.
    const jobRow = page.getByRole('row').filter({ hasText: 'JOB-' });
    await expect(jobRow).toContainText('7.5');

    // 3. Pick a Duration value and enter a "Number Spot/Loop" count.
    await page.getByRole('button', { name: '7.5', exact: true }).click();
    await page.getByRole('spinbutton', { name: 'Number Spot/Loop' }).fill('10');

    // Total = Duration x Number Spot/Loop, updating live (7.5 x 10 = 75 sec).
    await expect(page.getByText('75 sec', { exact: true })).toBeVisible();

    // Entering enough Spot/Loop to exceed the Plan (15 sec) is accepted, not blocked; the
    // Package badge instead shows "Used"/"Over" amounts.
    await expect(page.getByText(/Used \d+ Min\. \d+ Sec\./)).toBeVisible();
    await expect(page.getByText(/Over \d+ Min\. \d+ Sec\./)).toBeVisible();
  });
});
