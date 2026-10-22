// (Sale) เรียก API ของ Report ทั้ง 4 ประเภท และ export ตรงๆ ต้องถูกปฏิเสธ 403 และไม่มีข้อมูลหลุดออกมา
// test-case: CMN-N02 — spec: PB-2113 BR40, AC27; แผน: specs/mediaapproval-dashboard-plan.md (19.3)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from './_helpers';
import { API, ReportType } from './_report-helpers';

const TYPES: ReportType[] = ['sla', 'transaction', 'airtime', 'billing'];

test.describe('Export Report — common (CMN)', () => {
  for (const type of TYPES) {
    test(`CMN-N02 Sale gets 403 from the ${type} report API`, { tag: ['@security'] }, async ({ page }) => {
      await loginAs(page, 'sale');

      const list = await page.request.get(`${API}/${type}?page=1&pageSize=5`);
      expect(list.status()).toBe(403);
      expect(await list.text()).not.toContain('"rows"');

      const exp = await page.request.get(`${API}/${type}?export=1`);
      expect(exp.status()).toBe(403);
      expect(await exp.text()).not.toContain('"rows"');
    });
  }
});
