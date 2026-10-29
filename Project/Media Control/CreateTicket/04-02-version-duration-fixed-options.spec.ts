// เปิด dropdown "Duration" ของ Version แล้วต้องมีตัวเลือกตายตัวแค่ 5 ค่าตามที่กำหนด
// spec: specs/create-ticket-plan.md (4.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage } from './_helpers';

test.describe('Version Management', () => {
  test('Version Duration only offers the fixed allowed values', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);
    await fillTicketHeader(page, { client: 'QA Duration Client', product: 'QA Duration Product' });

    // 1. Add a Job with a Sale Package (the Version fields are only available once a package is chosen).
    await addJobWithPackage(page);

    // 2. Open the Version's Duration dropdown.
    // (the button named "Select duration" is a zero-size react-aria trigger: click the visible field that holds the current value)
    await page.getByRole('group').filter({ hasText: '7.5 seconds' }).first().click();

    // The only options are: 7.5 seconds, 15 seconds, 30 seconds, 45 seconds, 60 seconds.
    const listbox = page.getByRole('listbox', { name: 'Select duration' });
    await expect(listbox.getByRole('option')).toHaveText([
      '7.5 seconds',
      '15 seconds',
      '30 seconds',
      '45 seconds',
      '60 seconds',
    ]);
  });
});
