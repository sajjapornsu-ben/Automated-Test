// ลำดับใหม่ Media Group → Media Category: ก่อนเลือก Media Group ช่อง Media Category ต้องเลือกไม่ได้ ("Select Media Group first...") พอเลือก Group แล้วค่อยแสดงเฉพาะ Category ของ Group นั้น
// spec: specs/create-ticket-plan.md (2.3, PB-1861) — UX ใหม่ 28 ต.ค.: เดิม Category → Group
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, pickMulti, popover } from './_helpers';

test.describe('Ticket Header', () => {
  test('Media Category options depend on the selected Media Group', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);
    await switchToManualMode(page);

    const categoryBtn = page.getByRole('button', { name: 'Select media category' });

    // 2. Before choosing a Media Group the category field is not usable.
    await expect(page.getByRole('button', { name: 'Select media group' })).toHaveText('Select media group(s)...');
    await expect(categoryBtn).toHaveText('Select Media Group first...');
    await categoryBtn.click({ force: true });
    await expect(popover(page, 'Select media category').getByRole('button')).toHaveCount(0); // nothing to choose from

    // 3. Choose a Media Group (e.g. "Digital").
    await pickMulti(page, 'Select media group', 'Digital');
    await expect(page.getByRole('button', { name: 'Select media group' })).toContainText('Digital');

    // 4. Media Category becomes enabled and lists the categories of that group.
    await expect(categoryBtn).toHaveText('Select media category(s)...');
    await categoryBtn.click({ force: true });
    await expect(popover(page, 'Select media category').getByRole('button', { name: 'DIGITAL', exact: true })).toBeVisible();
  });
});
