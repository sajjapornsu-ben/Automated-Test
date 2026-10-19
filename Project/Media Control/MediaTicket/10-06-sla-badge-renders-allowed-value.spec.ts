// smoke test: badge SLA (FB/PR) ต้องโชว์ค่าใดค่าหนึ่งที่ระบบอนุญาตเท่านั้น
// ไม่ได้เทสต์ business logic การนับวัน SLA จริง (ทำผ่าน UI อย่างเดียวไม่ได้ ต้อง seed ข้อมูล/เวลาจาก backend)
// spec: specs/media-ticket-plan.md (10.6, PB-1822 BR#5.5/#5.6)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

const ALLOWED_SLA_VALUES = ['On track', 'Overdue', '—'];

test.describe('Requirement Recheck (PB-1822)', () => {
  test('SLA badge renders one of the allowed values', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    const firstRow = grid.getByRole('rowheader').first().locator('xpath=ancestor::tr[1]');

    // 1. Navigate to Media Ticket. (done above)
    // 2. Expand a ticket row with at least one job.
    await firstRow.getByRole('button').first().click();

    // Each SLA badge (Feedback timer "FB" and Prove timer "PR") renders an allowed value.
    const fbValue = (await page.getByText('FB', { exact: true }).locator('xpath=following-sibling::span[1]').innerText()).trim();
    const prValue = (await page.getByText('PR', { exact: true }).locator('xpath=following-sibling::span[1]').innerText()).trim();

    expect(ALLOWED_SLA_VALUES).toContain(fbValue);
    expect(ALLOWED_SLA_VALUES).toContain(prValue);
  });
});
