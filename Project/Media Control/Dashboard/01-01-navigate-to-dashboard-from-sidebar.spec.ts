// เข้าหน้า Media Approval Dashboard จาก sidebar (MEDIA APPROVAL → Dashboard) ต้องเห็นหัวข้อ คำอธิบาย และ breadcrumb ถูกต้อง
// spec: specs/mediaapproval-dashboard-plan.md (1.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboardFromSidebar } from './_helpers';

test.describe('Access, Layout & Role Visibility', () => {
  test('Navigate to the dashboard from the sidebar', async ({ page }) => {
    await loginAs(page, 'sale');

    // 2. Click MEDIA APPROVAL → Dashboard.
    await openDashboardFromSidebar(page);

    await expect(page).toHaveURL(/\/mediaApproval\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Media Approval Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByText('Overview of tickets, jobs, and SLA')).toBeVisible();

    const breadcrumbs = page.getByRole('list', { name: 'Breadcrumbs' });
    await expect(breadcrumbs.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(breadcrumbs).toContainText('Media Approval');
    await expect(breadcrumbs).toContainText('Dashboard');
  });
});
