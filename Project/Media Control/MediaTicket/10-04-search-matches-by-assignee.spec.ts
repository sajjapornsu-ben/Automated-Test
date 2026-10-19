// พิมพ์ชื่อ assignee (Head CG) ลงช่องค้นหา ต้องกรองตารางเหลือเฉพาะทิกเก็ต/job ของ assignee นั้น
// spec: specs/media-ticket-plan.md (10.4, PB-1822 AC10)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Requirement Recheck (PB-1822)', () => {
  test('Search matches by Assignee', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const defaultRowCount = await grid.getByRole('row').count();

    // 1. Navigate to Media Ticket. (done above)
    // 2. Type a Head CG assignee name into the search box.
    // "Head CG - QA" is one of the fixed Head CG option values also used by the Head CG
    // filter dropdown (see 04-03), so it's a stable, known-good assignee to search for.
    await page.getByRole('textbox', { name: 'Search ticket, job, client,' }).fill('Head CG - QA');
    await page.waitForTimeout(600);

    // The table filters down to tickets/jobs associated with that assignee.
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const filteredRowCount = await grid.getByRole('row').count();
    expect(filteredRowCount).toBeLessThan(defaultRowCount);
  });
});
