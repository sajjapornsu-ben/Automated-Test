// ตรวจสอบเงื่อนไขการ Render File ซ้ำกันสำหรับ CG มากกว่า 1 คน

// E2E Multi-Assignee (PB-2163, 
// สื่อ BTS: Digital VGI / QATEST-BTS / BTS MAX 2.0 Half B): 

// เดินจนถึง Final Render (Sale Approve + Media Management Landlord Approve) 
// → CG - QA กด Render File ก่อน 
// → CG - QA 2 (หน้าเก่า) Render ซ้ำไม่ได้; Render สำเร็จครั้งเดียว งาน Done
// spec: specs/e2e-plan.md (7) — Sale + Head CG + CG (cg1) + CG 2 (cg2) + Media Management; อ้างอิงผลทดสอบมือ BTS_Multi_Assignee_Test_Result.pdf (C-15, AC8)
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT และเดิน flow ถึง Done (ส่งอีเมลตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 (ตั้งไว้ใน .env แล้ว)

import { test, expect } from '@playwright/test';
import { DISPLAY_NAME } from '../Dashboard/_helpers';
import { pickDate } from '../CreateTicket/_helpers';
import { as, ok, BASE, ensureBtsMapping, createBtsTicket, assignToCgs, openCgJob } from './_helpers';

const CG1 = DISPLAY_NAME.cg1!;
const CG2 = DISPLAY_NAME.cg2!;

test.describe('Multi-assignee (BTS, Digital VGI) — first Render wins', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket and walks it to Done (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MA-E2E-04 Final Render: CG - QA renders first → CG - QA 2 cannot render again', { tag: ['@edge', '@regression'] }, async ({ browser }) => {
    test.setTimeout(1200000);
    const client = `QA Test Client ${Date.now()}`;
    await ensureBtsMapping(browser);
    const { ticket, job } = await createBtsTicket(browser, client);
    await assignToCgs(browser, client, [CG1, CG2]);

    // ---- CG - QA accepts and submits the Prove (→ Review)
    const cg1 = await as(browser, 'cg1');
    await openCgJob(cg1.page, ticket);
    await cg1.page.locator('select').first().selectOption({ label: 'Final File' });
    await cg1.page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await ok(cg1.page).click({ timeout: 10000 }).catch(() => undefined);
    await expect(cg1.page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });
    await cg1.page.getByPlaceholder('https://drive.google.com/...').fill('https://example.com/qa-prove.jpg');
    await cg1.page.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(cg1.page.getByRole('heading', { name: 'Prove submitted successfully' })).toBeVisible();
    await ok(cg1.page).click();

    // ---- Sale: airtime + approve every Format (evidence file: the ticket has no quotation) → Final Approve
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
      await drawer.getByRole('button', { name: 'Apply to all pending' }).click({ force: true });
      await drawer.getByRole('button', { name: /^Approve Final approval/ }).click({ force: true });
      await page.locator('input[type="file"]').last().setInputFiles({ name: 'approval-evidence.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 qa evidence') });
      await page.getByRole('dialog').last().getByRole('button', { name: 'Submit Review' }).click({ force: true });
      await page.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(page.getByText('Review Submitted')).toBeVisible();
      await ok(page).click();
      await ctx.close();
    }

    // ---- Media Management approves for the landlord → Final Render
    {
      const { ctx, page } = await as(browser, 'mediaManagement');
      await page.goto(`${BASE}/mediaApproval/mediaManagement/${job}?status=Final+Approve&job=${job}&ticket=${ticket}`);
      await expect(page.getByText('Waiting for landlord approval')).toBeVisible({ timeout: 30000 });
      await page.getByRole('button', { name: 'Approve', exact: true }).click({ force: true });
      await page.getByRole('button', { name: 'Confirm', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Approval Complete' })).toBeVisible();
      await ok(page).click();
      await ctx.close();
    }

    // ---- both CGs open the Final Render page; CG - QA 2 keeps it open
    const cg2 = await as(browser, 'cg2');
    for (const a of [cg1, cg2]) {
      const r = await openCgJob(a.page, ticket);
      expect(r.status).toMatch(/^Final Render/);
      await expect(a.page.getByRole('button', { name: 'Render File', exact: true })).toBeEnabled();
    }

    // ---- CG - QA fills the File Name, renders and confirms
    await cg1.page.getByPlaceholder('e.g. chang_metro_final').fill('qa_bts_render');
    await cg1.page.getByRole('button', { name: 'Render File', exact: true }).click();
    await expect(cg1.page.locator('main')).toContainText(/\d{14}_qa_bts_render_/);
    await cg1.page.getByRole('button', { name: 'Confirm File Name Render' }).click({ force: true });
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click({ timeout: 5000 }).catch(() => undefined);
    await ok(cg1.page).click({ timeout: 10000 }).catch(() => undefined);
    await expect(cg1.page.locator('main')).toContainText('This job is closed — no further edits are allowed', { timeout: 30000 });

    // ---- CG - QA 2 (old page) tries to render the same job
    await cg2.page.getByPlaceholder('e.g. chang_metro_final').fill('qa_bts_render_cg2');
    await cg2.page.getByRole('button', { name: 'Render File', exact: true }).click();
    await cg2.page.getByRole('button', { name: 'Confirm File Name Render' }).click({ force: true, timeout: 8000 }).catch(() => undefined);
    await cg2.page.getByRole('button', { name: 'Confirm', exact: true }).click({ timeout: 4000 }).catch(() => undefined);
    await cg2.page.waitForTimeout(2500);
    await expect(cg2.page.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await expect(cg2.page.getByText("This job's status has already changed (now: Done) — please refresh the page and try again")).toBeVisible();
    await ok(cg2.page).click();
    await cg2.page.reload();
    await expect(cg2.page.locator('main')).toContainText('This job is closed — no further edits are allowed');
    // the files rendered by CG - QA are the ones saved (once, by one CG); the rejected attempt left nothing
    await expect(cg2.page.getByText(/Rendered Files \(\d+ formats?\)/)).toBeVisible({ timeout: 30000 });
    const done = (await cg2.page.locator('main').innerText()).replace(/\s+/g, ' ');
    expect(done).toMatch(/\d{14}_qa_bts_render_/);
    expect(done).not.toContain('qa_bts_render_cg2');
    await cg1.ctx.close();
    await cg2.ctx.close();
  });
});
