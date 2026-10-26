// Media Management เห็นตัวเลือกรายบุคคลใน SLA per Graphic (Everyone (Average) + รายชื่อ CG) เหมือน Head CG — ทีมยืนยันแล้วว่าระบบถูกต้อง (spec ฉบับเดิมเขียนการ์ดผิด) เลือกคนแล้ว Selected Scope ต้องเปลี่ยนตาม
// spec: specs/mediaapproval-dashboard-plan.md (18.4) — PB-2112 BR34, BR37, AC22 (ยืนยันกับ SA แล้วว่าพฤติกรรมปัจจุบันถูกต้อง)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, slaSection, waitForSlaLoaded, slaScopeText, selectSlaScope } from './_helpers';

test.describe('Spec conformance (PB-2112 / PB-2113)', () => {
  test('Media Management can pick Everyone or one person in SLA per Graphic', { tag: ['@happy'] }, async ({ page }) => {
    await loginAs(page, 'mediaManagement');
    await openDashboard(page);
    await settle(page);
    await waitForSlaLoaded(page);

    // the scope dropdown is there and starts on the team average
    await slaSection(page).getByRole('group').first().click();
    const options = (await page.getByRole('listbox').first().getByRole('option').allInnerTexts()).map((s) => s.trim());
    await page.keyboard.press('Escape');
    expect(options[0]).toMatch(/^Everyone/);
    expect(options.length, 'Everyone + at least one person').toBeGreaterThan(1);
    expect(await slaScopeText(page)).toMatch(/Everyone/);

    // picking a person changes the selected scope
    await selectSlaScope(page, options[1]);
    await expect.poll(() => slaScopeText(page)).toBe(options[1]);
  });
});
