// เมนูใต้ MEDIA APPROVAL ใน sidebar ต้องตรงตาม role ที่ล็อกอิน (Sale / Media Management / Head CG / CG)
// spec: specs/mediaapproval-dashboard-plan.md (1.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, sidebarLinks, Role } from './_helpers';

const EXPECTED_LINKS: Record<Role, string[]> = {
  sale: ['Dashboard', 'Media Ticket'],
  mediaManagement: ['Dashboard', 'Media Ticket', 'Media Management'],
  headCg: ['Dashboard', 'Assign Ticket', 'Verify & Production'],
  cg1: ['Dashboard', 'Verify & Production'],
  // CG 2 (sasakorn.tr) is a broader/admin-type account: full sidebar incl. REPORT and SETTING groups.
  cg2: [
    'HOME', 'DASHBOARD', 'INVENTORY', 'SALE', 'PRODUCTION', 'CLAIM',
    'Dashboard', 'Media Ticket', 'Assign Ticket', 'Verify & Production', 'Media Management',
    'KPI Dashboard', 'Export Airtime', 'Monthly Report', 'Audit Log',
    'User Management', 'User Group Management', 'Email Setup', 'Email Template', 'Master Data', 'UI Kit',
  ],
};

test.describe('Access, Layout & Role Visibility', () => {
  for (const [role, expected] of Object.entries(EXPECTED_LINKS) as [Role, string[]][]) {
    test(`Sidebar menu for ${role}`, async ({ page }) => {
      await loginAs(page, role);

      const links = (await sidebarLinks(page)).map((l) => l.trim());
      expect(links).toEqual(expected);
    });
  }
});
