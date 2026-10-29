// ลำดับใหม่ Media Group → Media Category → Media Type (Epicor/SF): ก่อนเลือก Category ช่อง Media Type ต้องเลือกไม่ได้ ("Select Media Category first...") พอเลือกแล้วจึงแสดงเฉพาะ Type ของ Group/Category นั้น (UAT มีให้เลือกที่ Retail > DIGITAL > QATEST เท่านั้น)
// spec: specs/create-ticket-plan.md (2.4, PB-1861) — UX ใหม่ 28 ต.ค.
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, pickMulti, popover, MEDIA } from './_helpers';

test.describe('Ticket Header', () => {
  test('Media Type (Epicor/SF) options depend on the selected Media Group and Category', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const typeBtn = page.getByRole('button', { name: 'Select media type (Epicor/SF)' });

    // Not usable until a Media Group and a Media Category are chosen.
    await expect(typeBtn).toHaveText('Select Media Category first...');
    await pickMulti(page, 'Select media group', MEDIA.group);
    await expect(typeBtn).toHaveText('Select Media Category first...');

    // After the Category is chosen the field opens and lists the types of that Group / Category.
    await pickMulti(page, 'Select media category', MEDIA.category);
    await expect(typeBtn).toHaveText('Select Media Type (Epicor/SF)...');
    await typeBtn.click({ force: true });
    await expect(popover(page, 'Select media type (Epicor/SF)').getByRole('button', { name: MEDIA.type, exact: true })).toBeVisible();
  });
});
