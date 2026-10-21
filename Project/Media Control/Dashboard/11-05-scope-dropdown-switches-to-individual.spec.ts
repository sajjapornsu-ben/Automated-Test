// (Head CG) dropdown ใน SLA per Graphic ต้องมี "Everyone (Average)" + รายบุคคล และเมื่อเลือกคนแล้ว "Selected Scope" กับการ์ดต้องเปลี่ยนเป็นของคนนั้น
// spec: specs/mediaapproval-dashboard-plan.md (11.5) — PB-2112 BR32, AC20, 2.3 ข้อ 4
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaSection, slaCard, slaScopeText, waitForSlaLoaded } from './_helpers';

test.describe('SLA per Graphic', () => {
  test('Scope dropdown switches to an individual (Head CG)', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);
    await waitForSlaLoaded(page);

    const everyone = await slaCard(page, 'Feedback');

    await slaSection(page).getByRole('group').first().click();
    await expect(page.getByRole('option', { name: 'Everyone (Average)', exact: true })).toBeVisible();
    const person = page.getByRole('option', { name: 'CG - QA 2', exact: true });
    await expect(person).toBeVisible();
    await person.click();
    await settle(page);

    expect(await slaScopeText(page)).toBe('CG - QA 2');
    const individual = await slaCard(page, 'Feedback');
    // An individual's jobs are a subset of everyone's.
    expect(individual.total).toBeLessThanOrEqual(everyone.total);
    expect(individual.total).not.toBe(0);
  });
});
