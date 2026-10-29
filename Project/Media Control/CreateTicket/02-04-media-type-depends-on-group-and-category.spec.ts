// ก่อนเลือก Media Group ช่อง Media Type ต้องเลือกไม่ได้ พอเลือก Group แล้วค่อยเปิดตัวเลือกได้
// spec: specs/create-ticket-plan.md (2.4, PB-1861)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, closeOpenPopover } from './_helpers';

test.describe('Ticket Header', () => {
  test('Media Type options depend on the selected Media Group', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const mediaTypeBtn = page.getByRole('button', { name: 'Select media type' });
    await expect(mediaTypeBtn).toHaveText('Select Media Group first...');

    // 1. Complete steps from 2.3 (select Category then Group).
    await page.getByRole('button', { name: 'Select media category' }).click();
    await page.getByRole('button', { name: 'DIGITAL', exact: true }).click();
    await closeOpenPopover(page);

    await expect(mediaTypeBtn).toHaveText('Select Media Group first...');

    const mediaGroupBtn = page.getByRole('button', { name: 'Select media group' });
    await mediaGroupBtn.click();
    await page.getByRole('button', { name: 'Digital', exact: true }).click();
    await closeOpenPopover(page);

    // 2. Open the Media Type selector.
    await expect(mediaTypeBtn).toHaveText('Select media type(s)...');
    await mediaTypeBtn.click();

    // Media Type becomes enabled only after a Media Group is chosen, and lists options.
    await expect(page.getByRole('button', { name: 'Plan B TV', exact: true })).toBeVisible();
  });
});
