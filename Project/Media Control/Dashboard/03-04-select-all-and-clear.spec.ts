// กด "Select All" ต้องติ๊กครบทุกแพ็กเกจ (ตัวเลข KPI เท่าไม่กรอง) แล้วกด "Clear" 
// ต้องเอาติ๊กออกทั้งหมดและแถบกลับเป็น All Sale Packages
// spec: specs/mediaapproval-dashboard-plan.md (3.4)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs, openDashboard, settle, kpiValue, salePackageButton, openSalePackagePopover, closePopover, packageOptionNames } from './_helpers';
import { openList } from './_cross-helpers';
import type { Page } from '@playwright/test';

/** Tickets of the Media Ticket list created in the current month whose Job count is 0 (Drafts saved before any Job was added). */
async function jobLessTicketsThisMonth(page: Page): Promise<number> {
  await openList(page, 'mediaTicket');
  await page.getByRole('combobox').last().selectOption('100');
  await page.waitForTimeout(1500);
  const now = new Date();
  const thisMonth = `/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const rows = await page.getByRole('row').filter({ has: page.getByRole('gridcell') }).evaluateAll((trs) =>
    trs.map((tr) => Array.from(tr.querySelectorAll('[role=gridcell]')).map((c) => (c as HTMLElement).innerText.replace(/\s+/g, ' ').trim())));
  // cells: [expand, Manual/Quotation, Client, Media Group, Product, Start - End, Job, Created Date]
  return rows.filter((c) => c[c.length - 1].includes(thisMonth) && c[c.length - 2] === '0').length;
}

test.describe('Sale Package Filter', () => {
  test('Select All / Clear', async ({ page }) => {
    await loginAs(page, 'sale');
    await openDashboard(page);
    await settle(page);

    const unfilteredTickets = await kpiValue(page, 'Total Tickets');
    const unfilteredJobs = await kpiValue(page, 'Total Jobs (Version)');
    await openSalePackagePopover(page);
    const names = await packageOptionNames(page);

    // Select All ticks every package.
    await page.getByRole('checkbox', { name: 'Select All' }).check({ force: true });
    await settle(page);
    for (const n of names) await expect(page.getByRole('checkbox', { name: n, exact: true })).toBeChecked();

    // Every package selected = the same scope as no filter.
    await closePopover(page);
    await expect(salePackageButton(page)).toContainText(String(names.length));
    // Select All = every package in my scope: every Job is still counted and so is every Ticket that has a Job. A Draft Ticket without a Job has
    // no Sale Package yet (a Job must be added first), so the package filter correctly leaves it out:
    // expected Total Tickets = unfiltered - job-less tickets created this month (confirmed by the team 28 Oct: the system is right).
    await expect.poll(() => kpiValue(page, 'Total Jobs (Version)'), { message: 'Total Jobs with every package ticked' }).toBe(unfilteredJobs);
    const jobless = await jobLessTicketsThisMonth(page);
    await openDashboard(page);
    await settle(page);
    await openSalePackagePopover(page);
    await page.getByRole('checkbox', { name: 'Select All' }).check({ force: true });
    await settle(page);
    await closePopover(page);
    await expect.poll(() => kpiValue(page, 'Total Tickets'), { message: `Total Tickets with every package ticked (job-less Draft tickets this month: ${jobless})` }).toBe(unfilteredTickets - jobless);

    await openSalePackagePopover(page);
    await page.getByText('Clear', { exact: true }).first().click();
    await settle(page);
    for (const n of names) await expect(page.getByRole('checkbox', { name: n, exact: true })).not.toBeChecked();
    await expect(salePackageButton(page)).toContainText('All Sale Packages (in my scope)');
  });
});
