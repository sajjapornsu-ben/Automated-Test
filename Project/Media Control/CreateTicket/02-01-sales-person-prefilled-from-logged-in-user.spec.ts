// เปิดโหมด Manual ช่อง Sales Person ต้องมีชื่อผู้ใช้ที่ login อยู่กรอกมาให้อัตโนมัติแล้ว
// spec: specs/create-ticket-plan.md (2.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode } from './_helpers';

test.describe('Ticket Header', () => {
  test('Sales Person is pre-filled from the logged-in user', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);

    // 1. Navigate to Create Ticket, switch to Manual mode.
    await switchToManualMode(page);

    // The Sales Person field already contains the current user's display name (not empty).
    const salesPerson = page.getByRole('textbox', { name: 'Enter name...' });
    await expect(salesPerson).toBeVisible();
    const value = await salesPerson.inputValue();
    expect(value.trim().length).toBeGreaterThan(0);
  });
});
