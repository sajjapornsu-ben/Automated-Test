// พิมพ์คำค้นหา + เลือกการ์ดสถานะ แล้วกด Reset ทุกอย่างต้องกลับเป็นค่าเริ่มต้น
// spec: specs/media-ticket-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openMediaTicket } from './_helpers';

test.describe('Reset', () => {
  test('Reset clears all active filters and search', async ({ page }) => {
    await login(page);
    await openMediaTicket(page);

    const grid = page.getByRole('grid', { name: 'Media Ticket List Table' });
    await expect(grid.getByRole('row', { name: /^TK-/ }).first()).toBeVisible();
    const defaultRowCount = await grid.getByRole('row').count();

    const search = page.getByRole('textbox', { name: 'Search ticket, job, client,' });
    const statusFilterGroup = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'Filter by status' }) });

    // 1. Navigate to Media Ticket. (done above)
    // 2. Type a term into the search box.
    await search.fill('TK-');
    // 3. Click the "Assign" status card.
    await page.getByTitle('Filter status: Assign', { exact: true }).click();
    await expect(statusFilterGroup).toHaveText(/Assign/);

    // 4. Click the "Reset" button.
    await page.getByRole('button', { name: 'Reset' }).click();

    // The search box is empty again.
    await expect(search).toHaveValue('');
    // All status/dropdown filters return to their default ("All ...") state.
    await expect(statusFilterGroup).toHaveText(/All Status/);
    // The table returns to the default unfiltered list.
    await expect(grid.getByRole('row')).toHaveCount(defaultRowCount);
  });
});
