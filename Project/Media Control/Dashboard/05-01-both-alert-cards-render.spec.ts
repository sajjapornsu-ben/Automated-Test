// การ์ด Alerts & Exceptions ต้องมี High-Version Jobs ("Jobs with >3 prove rounds") และ High-Prove Versions ("Prove rounds beyond #3") พร้อมจำนวน ≥ 0
// spec: specs/mediaapproval-dashboard-plan.md (5.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, alertCard } from './_helpers';

test.describe('Alerts & Exceptions', () => {
  test('Both alert cards render', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    await expect(page.getByRole('heading', { name: 'Alerts & Exceptions', exact: true })).toBeVisible();

    const versionJobs = await alertCard(page, 'High-Version Jobs');
    expect(versionJobs.subtitle).toBe('Jobs with >3 prove rounds');
    expect(versionJobs.unit).toBe('Jobs');
    expect(versionJobs.count).toBeGreaterThanOrEqual(0);

    const proveVersions = await alertCard(page, 'High-Prove Versions');
    expect(proveVersions.subtitle).toBe('Prove rounds beyond #3');
    expect(proveVersions.unit).toBe('Versions');
    expect(proveVersions.count).toBeGreaterThanOrEqual(0);
  });
});
