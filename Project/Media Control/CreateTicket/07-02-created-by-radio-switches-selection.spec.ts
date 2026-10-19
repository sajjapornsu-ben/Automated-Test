// กดเปลี่ยน radio "Created by Media Management as" ระหว่าง Landlord/Plan B/Other แล้วต้องมีแค่ตัวเดียวที่ checked เสมอ
// spec: specs/create-ticket-plan.md (7.2, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsMediaManagement, openCreateTicket, switchToManualMode } from './_helpers';

test.describe('Media Management role', () => {
  test('Switching the "Created by" selection updates which option is checked', async ({ page }) => {
    await loginAsMediaManagement(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const radioGroup = page.getByRole('radiogroup', { name: 'Created by Media Management as' });

    // 1. Click "Plan B".
    await radioGroup.getByText('Plan B', { exact: true }).click();
    await expect(radioGroup.getByRole('radio', { name: 'Plan B', exact: true })).toBeChecked();
    await expect(radioGroup.getByRole('radio', { name: 'Landlord' })).not.toBeChecked();
    await expect(radioGroup.getByRole('radio', { name: 'Other' })).not.toBeChecked();

    // 2. Click "Other".
    await radioGroup.getByText('Other', { exact: true }).click();
    await expect(radioGroup.getByRole('radio', { name: 'Other' })).toBeChecked();
    await expect(radioGroup.getByRole('radio', { name: 'Landlord' })).not.toBeChecked();
    await expect(radioGroup.getByRole('radio', { name: 'Plan B', exact: true })).not.toBeChecked();
  });
});
