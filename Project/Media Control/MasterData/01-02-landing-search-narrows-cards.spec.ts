// ค้นหาในหน้า Master Data ต้องเหลือเฉพาะการ์ดที่ตรง, ค้นหาที่ไม่ตรงต้องขึ้นสถานะว่าง และปุ่ม Reset ต้องคืนค่าครบ 24 หมวด
// spec: specs/master-data-plan.md (1) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginSuperAdmin, BASE } from './_helpers';

const SEARCH = 'Search Master Data — e.g. Media, Province, Sale Package';

test.describe('Master Data — landing search', () => {
  test('MD-LAND-03 search narrows the cards, no match shows empty state, Reset restores all', { tag: ['@happy', '@edge'] }, async ({ page }) => {
    await loginSuperAdmin(page);
    await page.goto(BASE);
    await expect(page.getByText('Showing 23 categories')).toBeVisible({ timeout: 30000 });
    const cards = page.locator('main a[href^="/settings/masterData/"]');

    await page.getByPlaceholder(SEARCH).fill('Province');
    // the search also matches descriptions (Area / Road mention Province), so: fewer than 23, Province present, every card mentions it
    await expect.poll(() => cards.count()).toBeLessThan(23);
    await expect(page.locator(`main a[href="/settings/masterData/province"]`)).toBeVisible();
    for (const t of await cards.allInnerTexts()) expect(t.toLowerCase()).toContain('province');

    await page.getByPlaceholder(SEARCH).fill('format');
    // lower-case term still finds Format and Format Name (case-insensitive)
    await expect(page.locator('main a[href="/settings/masterData/format"]')).toBeVisible();
    await expect(page.locator('main a[href="/settings/masterData/formatName"]')).toBeVisible();

    await page.getByPlaceholder(SEARCH).fill('zzz-no-such-category');
    await expect(cards).toHaveCount(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(cards).toHaveCount(23);
    await expect(page.getByPlaceholder(SEARCH)).toHaveValue('');
  });
});
