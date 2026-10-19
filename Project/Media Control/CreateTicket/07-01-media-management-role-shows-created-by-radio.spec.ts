// ล็อกอินด้วยบัญชีที่มี Media Management role แล้วเข้า Manual mode ต้องเห็น radio group "Created by Media Management as" เพิ่มมา
// spec: specs/create-ticket-plan.md (7.1, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsMediaManagement, openCreateTicket, switchToManualMode } from './_helpers';

test.describe('Media Management role', () => {
  test('Media Management role reveals the "Created by" radio group', async ({ page }) => {
    // 1. Log in as the Media Management-role account, open Create Ticket, switch to Manual mode.
    await loginAsMediaManagement(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    // A "Created by Media Management as:" radiogroup appears above Sales Person.
    const radioGroup = page.getByRole('radiogroup', { name: 'Created by Media Management as' });
    await expect(radioGroup).toBeVisible();
    await expect(radioGroup.getByRole('radio', { name: 'Landlord' })).toBeChecked();
    await expect(radioGroup.getByRole('radio', { name: 'Plan B', exact: true })).not.toBeChecked();
    await expect(radioGroup.getByRole('radio', { name: 'Other' })).not.toBeChecked();
  });
});
