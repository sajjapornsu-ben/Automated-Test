// เปิดฟอร์ม "New Job" แล้วกด "Remove Job" ต้องยกเลิกฟอร์มโดยไม่บันทึก และปุ่ม Add Job กลับมาใช้ได้
// spec: specs/ticket-detail-plan.md (3.2)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openTicketDetail, FIXTURE_TICKET_NO } from './_helpers';

test.describe('Add Job', () => {
  test('"Remove Job" discards the new-job form without saving', async ({ page }) => {
    await login(page);
    await openTicketDetail(page, FIXTURE_TICKET_NO);

    const jobsCount = page.getByText('1 job', { exact: true });
    await expect(jobsCount).toBeVisible();

    await page.getByRole('button', { name: 'Add Job' }).click();
    await expect(page.getByRole('button', { name: 'Remove Job' })).toBeVisible();

    // 1. Click "Remove Job".
    await page.getByRole('button', { name: 'Remove Job' }).click();

    // The inline form disappears; the existing Job list is unchanged; "Add Job" is enabled again.
    await expect(page.getByRole('button', { name: 'Save Job' })).toHaveCount(0);
    await expect(jobsCount).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Job' })).toBeEnabled();
  });
});
