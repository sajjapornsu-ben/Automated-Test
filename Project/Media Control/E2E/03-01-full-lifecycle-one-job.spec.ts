// E2E ครบวงจรของ 1 job (ticket ทดสอบ "QA Test Client ..."): 
// Sale สร้าง ticket 
// → Head CG Assign 
// → CG Accept + Submit Prove 
// → Sale ตั้ง Airtime Allocate + Review (Approve ทุก Format พร้อม evidence) 
// → [Final Approve: CU Approved / LL Pending] 
// → Media Management (Landlord) Approve 
// → [Final Render] 
// → CG Render File + Confirm 
// → [Done: Rendered Files, job ปิด]
// spec: specs/e2e-plan.md (3) / specs/verify-production-plan.md — Sale + Head CG + CG (cg1) + Media Management
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT และเดิน flow ทุกขั้น (ระบบส่งอีเมลตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect, Browser, Page } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from '../Dashboard/_helpers';
import { login as loginSale, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage, pickDate } from '../CreateTicket/_helpers';
import { openAssignList, searchList as searchAssign, dataRows as assignRows, readRow as readAssignRow, openRowDialog, dialog, assignButton, domClick, chooseDesigner } from '../AssignTicket/_helpers';
import { openVpList, searchList, dataRows, readRow, openJob } from '../VerifyProduction/_helpers';

const BASE = 'https://uat-mediacontrol.planbmedia.co.th';
const ok = (page: Page) => page.getByRole('button', { name: 'OK', exact: true });

async function as(browser: Browser, role: Parameters<typeof loginAs>[1]) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, role);
  return { ctx, page };
}

test.describe('Verify & Production — full lifecycle of one job (Sale → Head CG → CG → Sale → Media Management → CG)', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket and walks it through every status (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('VP-E2E-01 Assign → Verify → On Process → Review → Final Approve → Final Render → Done', { tag: ['@happy', '@regression'] }, async ({ browser }) => {
    test.setTimeout(900000);
    const client = `QA Test Client ${Date.now()}`;
    const cgName = DISPLAY_NAME.cg1!;
    let ticket = '';
    let job = '';

    // ---- 1) Sale creates and submits the ticket (status: Assign)
    {
      const sale = await browser.newContext();
      const page = await sale.newPage();
      await loginSale(page);
      await openCreateTicket(page);
      await switchToManualMode(page);
      await fillTicketHeader(page, { client, product: 'QA E2E Product' });
      await addJobWithPackage(page);
      const period = page.getByRole('button', { name: 'DD/MM/YYYY' });
      await pickDate(page, period.nth(0), 1);
      await pickDate(page, period.nth(0), 21);
      await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
      await page.getByRole('textbox', { name: 'Seconds' }).fill('15');
      const links = page.getByRole('textbox', { name: 'Paste 1 Link...' });
      await links.nth(0).fill('https://example.com/material.jpg');
      await links.nth(1).fill('https://example.com/brief.pdf');
      await page.getByRole('button', { name: 'Submit ticket' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
      await ok(page).click();
      await sale.close();
    }

    // ---- 2) Head CG assigns it to the CG (Assign → Verify)
    {
      const { ctx, page } = await as(browser, 'headCg');
      await openAssignList(page);
      await searchAssign(page, client);
      const row = assignRows(page).filter({ hasText: client }).first();
      await expect(row).toBeVisible({ timeout: 30000 });
      const r = await readAssignRow(row);
      expect(r.status).toBe('Assign');
      ticket = r.ticket;
      job = r.job;
      await openRowDialog(page, row, 'Assign');
      await chooseDesigner(page, cgName);
      await domClick(assignButton(page));
      await ok(page).click({ timeout: 15000 }).catch(() => undefined);
      await expect(dialog(page)).toBeHidden({ timeout: 15000 });
      await ctx.close();
    }

    // ---- 3) CG accepts (Verify → On Process) and submits a Prove (→ Review)
    {
      const { ctx, page } = await as(browser, 'cg1');
      await openVpList(page);
      await searchList(page, ticket);
      const r = await readRow(dataRows(page).filter({ hasText: ticket }).first());
      expect(r.status).toBe('Verify');
      await openJob(page, r);
      await page.locator('select').first().selectOption({ label: 'Mockup (Sales Pitch)' });
      await page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
      await expect(page.getByRole('heading', { name: 'Confirm accept job?' })).toBeVisible();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await ok(page).click({ timeout: 10000 }).catch(() => undefined);
      await expect(page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });
      await page.getByPlaceholder('https://drive.google.com/...').fill('https://example.com/qa-prove.jpg');
      await page.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
      await expect(page.getByRole('heading', { name: 'Confirm submit Prove?' })).toBeVisible();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await ok(page).click({ timeout: 10000 }).catch(() => undefined);
      await openVpList(page);
      await searchList(page, ticket);
      await expect.poll(async () => (await readRow(dataRows(page).filter({ hasText: ticket }).first())).status, { timeout: 30000 }).toBe('Review');
      await ctx.close();
    }

    // ---- 4) Sale sets the airtime, reviews the prove and approves every Format (Review → Final Approve)
    {
      const { ctx, page } = await as(browser, 'sale');
      await page.goto(`${BASE}/mediaApproval/airtimeAllocate/${ticket}`);
      await page.getByRole('button', { name: '7.5', exact: true }).click({ force: true });
      await page.getByRole('spinbutton', { name: 'Number Spot/Loop' }).fill('2');
      const dates = page.getByRole('button', { name: 'DD/MM/YYYY' });
      await pickDate(page, dates.nth(0), 1);
      await pickDate(page, dates.nth(0), 20);
      await page.getByRole('button', { name: 'Save Allocations' }).click({ force: true });
      await expect(page.getByText('Saved successfully')).toBeVisible();
      await ok(page).click();

      await page.goto(`${BASE}/mediaApproval/mediaTicket/${ticket}`);
      await page.getByRole('button', { name: 'Review', exact: true }).click({ force: true });
      const drawer = page.getByRole('dialog').first();
      await expect(drawer).toContainText(new RegExp(String.raw`Review Prove\s*${job}`));
      await expect(drawer).toContainText('Approved 0 / 6');
      await drawer.getByRole('button', { name: 'Apply to all pending' }).click({ force: true });
      await drawer.getByRole('button', { name: /^Approve Final approval/ }).click({ force: true });
      // a ticket without a quotation needs an approval evidence file
      await expect(page.getByRole('dialog').last()).toContainText('No Quotation Yet — Approval Evidence Required');
      await page.locator('input[type="file"]').last().setInputFiles({ name: 'approval-evidence.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 qa evidence') });
      await page.getByRole('dialog').last().getByRole('button', { name: 'Submit Review' }).click({ force: true });
      await expect(page.getByText('Submit this review?')).toBeVisible();
      await expect(page.getByText('Summary: 6 Approve')).toBeVisible();
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByText('Review Submitted')).toBeVisible();
      await expect(page.getByText('Saved: 6 Approve')).toBeVisible();
      await ok(page).click();

      // the Sale approval is the customer approval: the customer link now says the artwork is already approved
      await page.reload();
      await expect(page.locator('main')).toContainText('Final Approve');
      await page.getByRole('button', { name: 'Review', exact: true }).click({ force: true });
      await page.getByRole('dialog').first().getByRole('button', { name: 'For Customer' }).click({ force: true });
      const fc = page.getByRole('dialog', { name: 'For Customer' });
      await fc.getByRole('textbox').first().fill('123456');
      await fc.getByRole('button', { name: 'Save PIN' }).click({ force: true });
      await expect(fc).toContainText('Current PIN', { ignoreCase: true });
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => undefined);
      await fc.getByRole('button', { name: 'Copy Link' }).click({ force: true });
      const link = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
      if (link.includes('/customerReview/')) {
        const cust = await browser.newContext();
        const cp = await cust.newPage();
        await cp.goto(link);
        for (let i = 1; i <= 6; i++) await cp.getByRole('textbox', { name: `PIN digit ${i}` }).fill(String(i));
        await cp.getByRole('button', { name: 'View Review' }).click();
        await expect(cp.getByRole('heading', { name: 'This Artwork Is Already Approved' })).toBeVisible();
        await cust.close();
      }
      await ctx.close();
    }

    // ---- 5) CG sees Final Approve: customer approved, landlord pending
    {
      const { ctx, page } = await as(browser, 'cg1');
      await openVpList(page);
      await searchList(page, ticket);
      const r = await readRow(dataRows(page).filter({ hasText: ticket }).first());
      expect(r.status).toBe('Final Approve');
      expect(r.approve).toContain('CU Approved');
      expect(r.approve).toContain('LL Pending');
      await openJob(page, r);
      const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      expect(text).toMatch(/CUSTOMER APPROVAL Approved by .+? \d{2}\/\d{2}\/\d{4}/);
      expect(text).toMatch(/LANDLORD APPROVAL Pending/);
      expect(text).toMatch(/MEDIA ALLOCATE Durations 7\.50 seconds Number Spot\/Loop 2 times On-Air 01\/10\/2026–20\/10\/2026/);
      await expect(page.getByText('Waiting for approval from both parties')).toBeVisible();
      await ctx.close();
    }

    // ---- 6) Media Management approves for the landlord (Final Approve → Final Render)
    {
      const { ctx, page } = await as(browser, 'mediaManagement');
      await page.goto(`${BASE}/mediaApproval/mediaManagement/${job}?status=Final+Approve&job=${job}&ticket=${ticket}`);
      await expect(page.getByText('Waiting for landlord approval')).toBeVisible({ timeout: 30000 });
      await page.getByRole('button', { name: 'Approve', exact: true }).click({ force: true });
      await expect(page.getByText('Approve Job — confirm approval from the Landlord (LL)')).toBeVisible();
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Approval Complete' })).toBeVisible();
      await expect(page.getByText(`CU+LL approval complete → Final Render · ${job}`)).toBeVisible();
      await ok(page).click();
      await ctx.close();
    }

    // ---- 7) CG renders the files and confirms (Final Render → Done)
    {
      const { ctx, page } = await as(browser, 'cg1');
      await openVpList(page);
      await searchList(page, ticket);
      const r = await readRow(dataRows(page).filter({ hasText: ticket }).first());
      expect(r.status).toMatch(/^Final Render/); // "Final Render · 100%"
      expect(r.approve).toContain('CU Approved');
      expect(r.approve).toContain('LL Approved');
      await openJob(page, r);
      const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      expect(text).toMatch(/LANDLORD APPROVAL Approved by Media Management/);
      expect(text).toContain('Rendered Files (6 formats ready to render)');
      await page.getByPlaceholder('e.g. chang_metro_final').fill('qa_render_test');
      await page.getByRole('button', { name: 'Render File', exact: true }).click();
      // preview: one generated file name per Format, nothing saved yet
      const main = page.locator('main');
      for (const f of ['F1', 'F2', 'F3', 'F4', 'POS', 'RDO']) await expect(main).toContainText(new RegExp(`\\d{14}_qa_render_test_${f}`));
      await expect(main).toContainText('Preview — Review the rendered file names, then click Confirm to save');
      await page.getByRole('button', { name: 'Confirm File Name Render' }).click({ force: true });
      await page.getByRole('button', { name: 'Confirm', exact: true }).click({ timeout: 5000 }).catch(() => undefined);
      await ok(page).click({ timeout: 10000 }).catch(() => undefined);

      await expect(main).toContainText('This job is closed — no further edits are allowed', { timeout: 30000 });
      const done = (await main.innerText()).replace(/\s+/g, ' ');
      expect(done).toMatch(/Rendered Files \(6 formats\) Confirmed/);
      expect(done).toMatch(/Rendered on \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
      await openVpList(page);
      await searchList(page, ticket);
      expect((await readRow(dataRows(page).filter({ hasText: ticket }).first())).status).toBe('Done');
      await ctx.close();
    }
  });
});
