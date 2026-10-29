// ก่อนเลือก Media Category ช่อง Media Group ต้องเลือกไม่ได้ พอเลือก Category แล้วค่อยเปิดตัวเลือกได้
// spec: specs/create-ticket-plan.md (2.3, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, closeOpenPopover } from './_helpers';

test.describe('Ticket Header', () => {
  test('Media Group options depend on the selected Media Category', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const mediaGroupBtn = page.getByRole('button', { name: 'Select media group' });

    // 1. Switch to Manual mode. (done above)
    // 2. Open the Media Group selector before choosing a Category.
    await expect(mediaGroupBtn).toHaveText('Select Media Category first...');
    await mediaGroupBtn.click();
    await expect(page.getByRole('button', { name: 'Digital', exact: true })).toHaveCount(0);

    // 3. Choose a Media Category (e.g. "DIGITAL").
    await page.getByRole('button', { name: 'Select media category' }).click();
    await page.getByRole('button', { name: 'DIGITAL', exact: true }).click();
    await closeOpenPopover(page);

    // 4. Open the Media Group selector again.
    await expect(mediaGroupBtn).toHaveText('Select media group(s)...');
    await mediaGroupBtn.click();

    // Media Group becomes enabled and lists options belonging to that category.
    await expect(page.getByRole('button', { name: 'Digital', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Airport', exact: true })).toBeVisible();
  });
});
