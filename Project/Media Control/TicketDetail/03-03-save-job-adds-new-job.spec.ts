// เติมข้อมูลฟอร์ม "New Job" แล้วกด "Save Job" ต้องเพิ่ม Job ใหม่เข้าตั๋วจริง และจำนวน Job ต้องเพิ่มขึ้น
// spec: specs/ticket-detail-plan.md (3.3)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้สร้างตั๋วทดสอบใหม่ (ผ่าน Create Ticket) แล้ว Save Job จริงบน UAT
// (ได้รับอนุมัติจากผู้ใช้แล้ว) เทสนี้ถูก skip by default — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import { login, createTicketAndOpenDetail, addJobOnDetail } from './_helpers';

test.describe('Add Job', () => {
  test('Saving a new Job actually adds it to the ticket', async ({ page }) => {
    test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Mutates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');
    test.setTimeout(180000); // creates a ticket, adds a Job and more: 25-30 s is close to the 30 s default

    // 1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already).
    await login(page);
    const clientName = `QA Test Client ${Date.now()}`;
    await createTicketAndOpenDetail(page, clientName, 'QA TicketDetail Product');
    await expect(page.getByText('1 job', { exact: true })).toBeVisible();

    // 2. On its detail page, click "Add Job", fill the new Job's Package (Duration/Period
    // auto-prefill from the existing Job), and Material/Brief.
    await addJobOnDetail(page);
    await expect(page.getByRole('heading', { name: 'Job Added' })).toBeVisible();
    await expect(page.getByText('New job added successfully')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();

    // The new Job appears in the Jobs list; the Jobs count badge increments.
    await expect(page.getByText('1 job', { exact: true })).toHaveCount(0);
    await expect(page.getByText('2 jobs', { exact: true })).toBeVisible();
  });
});
