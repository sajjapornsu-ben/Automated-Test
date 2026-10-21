// สลับแต่ละแท็บแล้วคำอธิบาย ตัวกรอง และชื่อปุ่ม Export ต้องเปลี่ยนตามแท็บนั้น (SLA / Transaction / Airtime / Billing)
// spec: specs/mediaapproval-dashboard-plan.md (12.2) — PB-2113 Report #1, BR47 (คอลัมน์/ตัวกรองตามสเปคย่อยของแต่ละ Report)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, openReportTab, reportPanel, reportFilter, sectionCard, ReportTab } from './_helpers';

const EXPECTED: Record<ReportTab, { description: string; filters: RegExp[]; search: boolean }> = {
  SLA: {
    description: 'Feedback & Progress SLA per job, with the filters applied below',
    filters: [/Filter by status$/, /Filter by media$/, /Filter by graphic$/],
    search: false,
  },
  Transaction: {
    description: '26 columns, one row per Format of each job',
    filters: [/Filter by sale approve status$/, /Filter by landlord approve status$/],
    search: true,
  },
  Airtime: {
    description: '26 columns, one row per job with every Format listed together',
    filters: [/Filter by sale approve status$/, /Filter by landlord approve status$/],
    search: true,
  },
  Billing: {
    description: "Charges for Prove rounds beyond each job's free quota — exports 2 sheets",
    filters: [/Filter by status$/, /Filter by media$/, /Filter by graphic$/],
    search: false,
  },
};

test.describe('Export Report — common', () => {
  test('Switching tabs updates description, filters and export label', async ({ page }) => {
    await loginAs(page, 'headCg');
    await openDashboard(page);
    await settle(page);

    for (const [tab, exp] of Object.entries(EXPECTED) as [ReportTab, (typeof EXPECTED)[ReportTab]][]) {
      await openReportTab(page, tab);

      await expect(sectionCard(page, 'Export Report'), tab).toContainText(exp.description);
      await expect(page.getByRole('button', { name: `Export ${tab}` }), tab).toBeVisible();
      for (const f of exp.filters) {
        await expect(reportFilter(page, tab, f), `${tab} ${f}`).toBeVisible();
      }
      await expect(reportPanel(page, tab).getByRole('textbox', { name: 'Search report' }), `${tab} search`).toHaveCount(exp.search ? 1 : 0);
      await expect(reportPanel(page, tab).getByRole('button', { name: 'From DD/MM/YYYY' }), `${tab} From`).toBeVisible();
      await expect(reportPanel(page, tab).getByRole('button', { name: 'To DD/MM/YYYY' }), `${tab} To`).toBeVisible();
    }
  });
});
