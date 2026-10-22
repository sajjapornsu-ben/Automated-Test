// (ไม่ล็อกอิน) เรียก API ของ Report และ export ตรงๆ ต้องได้ 401 ทั้ง 4 ประเภท
// test-case: CMN-N03 — แผน: specs/mediaapproval-dashboard-plan.md (19.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { API, ReportType } from './_report-helpers';

const TYPES: ReportType[] = ['sla', 'transaction', 'airtime', 'billing'];

test.describe('Export Report — common (CMN)', () => {
  for (const type of TYPES) {
    test(`CMN-N03 anonymous gets 401 from the ${type} report API`, { tag: ['@security'] }, async ({ playwright }) => {
      const anon = await playwright.request.newContext();
      expect((await anon.get(`${API}/${type}?page=1&pageSize=5`)).status()).toBe(401);
      expect((await anon.get(`${API}/${type}?export=1`)).status()).toBe(401);
      await anon.dispose();
    });
  }
});
