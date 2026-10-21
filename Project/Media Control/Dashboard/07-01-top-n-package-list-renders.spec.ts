// การ์ด Tickets & Jobs by Sale Package ต้องมี badge "Top N" และปุ่มแพ็กเกจแต่ละแถวแสดงกลุ่ม ชื่อ และ "X tickets · Y jobs"
// spec: specs/mediaapproval-dashboard-plan.md (7.1)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, packageRows, sectionCard, PACKAGES_HEADING } from './_helpers';

test.describe('Tickets & Jobs by Sale Package', () => {
  test('Top-N list renders', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const card = sectionCard(page, PACKAGES_HEADING);
    await expect(card).toContainText('Click sale packages to filter the cards on the right');
    const badge = (await card.innerText()).match(/Top (\d+)/);
    expect(badge, 'Top N badge').not.toBeNull();
    const topN = Number(badge![1]);

    const rows = await packageRows(page);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(topN);
    for (const r of rows) {
      expect(r.group, 'media group').not.toBe('');
      expect(r.name, 'package name').not.toBe('');
      expect(r.tickets).toBeGreaterThan(0);
      expect(r.jobs).toBeGreaterThanOrEqual(r.tickets);
    }
  });
});
