// กรอกข้อมูลครบและ Submit ticket (ยืนยัน 2 ขั้นตอน) ต้องสร้างตั๋วสำเร็จและเห็นตั๋วใหม่ในลิสต์ Media Ticket
// spec: specs/create-ticket-plan.md (6.1, PB-1861)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้ submit ticket จริงบน UAT (ได้รับอนุมัติจากผู้ใช้แล้ว) — ใช้ชื่อ Client
// ที่มีคำนำหน้า "QA Test Client" พร้อม timestamp เพื่อให้ทีมแยกตั๋วทดสอบออกจากตั๋วจริงได้ง่าย
// เทสนี้ถูก skip by default (สร้าง record จริงบน UAT) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';

test.describe('Submit & Save as Draft', () => {
  test('Full Manual-mode submission succeeds (happy path)', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');

    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const clientName = `QA Test Client ${Date.now()}`;

    // 1. Fill Client, Product, Contract Start-End, Media Category, Media Group, Media Type.
    await fillTicketHeader(page, { client: clientName, product: 'QA Test Product' });

    // 2. Add a Job: select a Package, set Job Duration and Job Period.
    await page.getByRole('button', { name: 'Add Job' }).click();
    await page.getByRole('button', { name: 'Select Package' }).click();
    await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
    await closeOpenPopover(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 21);

    await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
    await page.getByRole('textbox', { name: 'Seconds' }).fill('15');

    // 3. On Version 1: leave Duration at its default, paste a Material link and a Brief link.
    const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
    await linkBoxes.nth(0).fill('https://example.com/material.jpg');
    await linkBoxes.nth(1).fill('https://example.com/brief.pdf');

    // 4. Click "Submit ticket", then "Confirm" on the confirmation dialog.
    await page.getByRole('button', { name: 'Submit ticket' }).click();
    await expect(page.getByRole('heading', { name: 'Confirm sending this Ticket?' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // A "Ticket submitted successfully" dialog appears.
    await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // Clicking "OK" redirects to the Media Ticket list.
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);

    // The newly created ticket (matching the Client name used) is visible in that list.
    await expect(page.getByText(clientName).first()).toBeVisible();
  });
});
