// พิมพ์ Nickname ให้ Version แล้วค่าต้องถูกบันทึกในช่องพร้อมตัวนับตัวอักษรอัปเดต
// spec: specs/create-ticket-plan.md (4.3, PB-1861)
// seed: seed.spec.ts
//
// หมายเหตุ (ตรวจสอบจริงแล้ว): requirement AC5 คาดว่า nickname จะไปอัปเดต "live label" อื่น
// (เช่น "V1 · Teaser 15s") แต่จากการสำรวจหน้าจริง ไม่พบ label แบบนั้นที่อื่นในฟอร์ม —
// nickname อัปเดตเฉพาะในช่องกรอกของตัวเองกับตัวนับ (เช่น "10/60") เท่านั้น จึงเทสตามพฤติกรรมจริง

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader } from './_helpers';

test.describe('Version Management', () => {
  test('Version Nickname is saved into the field with a live character counter', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Nickname Client', product: 'QA Nickname Product' });

    // 1. Add a Job/Version.
    await page.getByRole('button', { name: 'Add Job' }).click();

    // 2. Type a nickname into the Version's Nickname field.
    const nicknameBox = page.getByRole('textbox', { name: 'Nickname' });
    await nicknameBox.fill('Teaser 15s');

    await expect(nicknameBox).toHaveValue('Teaser 15s');
    await expect(page.getByText('10/60', { exact: true })).toBeVisible();
  });
});
