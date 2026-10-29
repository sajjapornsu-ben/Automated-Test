// Submit ticket โดยไม่กรอก Material (Brief ก็ยังว่างเช่นกัน) ต้องถูกบล็อกด้วย dialog แจ้งเตือน
// spec: specs/create-ticket-plan.md (5.2, PB-1861)
// seed: seed.spec.ts
//
// หมายเหตุ: ระบบเช็คทีละ field (หยุดที่ข้อผิดพลาดแรกที่เจอ) — เมื่อทั้ง Material และ Brief ว่าง
// พร้อมกัน ข้อความที่ขึ้นจะเป็นของ Material ก่อนเสมอ (ตรวจสอบจริงแล้ว)

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage, pickDate } from './_helpers';

test.describe('Validation', () => {
  test('Submitting with a missing Material or Brief is blocked', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Val Material Client', product: 'QA Val Material Product' });

    // 1. Add a Job with Package/Duration/Period set, and a Version with Duration set —
    // but leave Material and Brief both empty.
    await addJobWithPackage(page);

    const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(page, periodBtns.nth(0), 1);
    await pickDate(page, periodBtns.nth(0), 21);

    await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
    await page.getByRole('textbox', { name: 'Seconds' }).fill('15');

    // 2. Click "Submit ticket".
    await page.getByRole('button', { name: 'Submit ticket' }).click();

    // Submission is blocked with an error indicating Material is required.
    await expect(page.getByRole('heading', { name: 'Incomplete Information' })).toBeVisible();
    await expect(page.getByText('Please provide Material (link or attached file) for every Version')).toBeVisible();

    const materialLinkBox = page.getByRole('textbox', { name: 'Paste 1 Link...' }).first();
    await expect(materialLinkBox).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('button', { name: 'OK' }).click();

    // The ticket is not created (URL stays on the Create Ticket page).
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/create/);
  });
});
