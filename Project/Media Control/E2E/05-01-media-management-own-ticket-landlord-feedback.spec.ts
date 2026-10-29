// E2E ticket ที่ Media Management สร้างเอง (Created by Landlord) และเดิน flow เอง: MM สร้าง → Head CG Assign → CG Accept + Submit Prove → MM (ในฐานะ Sale) ตั้ง Airtime + Approve เอง → Final Approve; จากนั้น Landlord (Media Management) กด Feedback = เป็นแค่ feedback ไม่กระทบ workflow (สถานะยัง Final Approve, LL ยัง Pending) แล้วแยก 2 เคส: (A) Approve → Final Render → CG Render → Done, (B) ยกเลิกการ Approve (Cancel ใน dialog) → ยังเป็น Final Approve ไม่มีอะไรเปลี่ยน
// spec: specs/e2e-plan.md (8) — Media Management (สร้าง + Review + Landlord) + Head CG + CG (cg1)
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT (ส่งอีเมลตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 (ตั้งไว้ใน .env แล้ว)

import { test, expect, Browser } from '@playwright/test';
import { DISPLAY_NAME } from '../Dashboard/_helpers';
import { pickDate } from '../CreateTicket/_helpers';
import { openVpList, searchList, dataRows, readRow } from '../VerifyProduction/_helpers';
import { as, ok, BASE, ensureBtsMapping, createBtsTicket, assignToCgs, openCgJob } from './_helpers';

const CG1 = DISPLAY_NAME.cg1!;
const NOTE = 'QA Test landlord feedback: only a comment, the workflow must not change';

/** MM creates the ticket, the CG proves it, MM approves it as Sale → the job is in Final Approve (customer approved, landlord pending). */
async function walkToFinalApprove(browser: Browser) {
  const client = `QA Test Client ${Date.now()}`;
  await ensureBtsMapping(browser);
  const { ticket, job } = await createBtsTicket(browser, client, 'mediaManagement');
  await assignToCgs(browser, client, [CG1]);

  const cg = await as(browser, 'cg1');
  await openCgJob(cg.page, ticket);
  await cg.page.locator('select').first().selectOption({ label: 'Final File' });
  await cg.page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
  await cg.page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await ok(cg.page).click({ timeout: 10000 }).catch(() => undefined);
  await expect(cg.page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });
  await cg.page.getByPlaceholder('https://drive.google.com/...').fill('https://example.com/qa-prove.jpg');
  await cg.page.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
  await cg.page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(cg.page.getByRole('heading', { name: 'Prove submitted successfully' })).toBeVisible();
  await ok(cg.page).click();
  await cg.ctx.close();

  // Media Management is the Sales Person of its own ticket: airtime, then Review → Approve (no quotation: evidence file)
  const mm = await as(browser, 'mediaManagement');
  const page = mm.page;
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
  await expect(page.locator('main')).toContainText('Media Management - QA'); // Sales Person = the creator
  await page.getByRole('button', { name: 'Review', exact: true }).click({ force: true });
  const drawer = page.getByRole('dialog').first();
  await drawer.getByRole('button', { name: 'Apply to all pending' }).click({ force: true });
  await drawer.getByRole('button', { name: /^Approve Final approval/ }).click({ force: true });
  await page.locator('input[type="file"]').last().setInputFiles({ name: 'approval-evidence.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 qa evidence') });
  await page.getByRole('dialog').last().getByRole('button', { name: 'Submit Review' }).click({ force: true });
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText('Review Submitted')).toBeVisible();
  await ok(page).click();
  return { ticket, job, mm };
}

/** The Landlord side of the job (Media Management > job): customer approved by MM, landlord pending, Feedback and Approve offered. */
async function openLandlordJob(page: import('@playwright/test').Page, ticket: string, job: string) {
  await page.goto(`${BASE}/mediaApproval/mediaManagement/${job}?status=Final+Approve&job=${job}&ticket=${ticket}`);
  await expect(page.getByText('Waiting for landlord approval')).toBeVisible({ timeout: 30000 });
}

async function assertStillFinalApprove(browser: Browser, ticket: string) {
  const cg = await as(browser, 'cg1');
  await openVpList(cg.page);
  await searchList(cg.page, ticket);
  const r = await readRow(dataRows(cg.page).first());
  expect(r.status, 'the job is still in Final Approve').toBe('Final Approve');
  expect(r.approve).toContain('CU Approved');
  expect(r.approve).toContain('LL Pending');
  await cg.ctx.close();
}

test.describe('Media Management creates and approves its own ticket — Landlord Feedback does not change the workflow', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket and walks it through the flow (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MM-E2E-01 (A) Landlord Feedback is only a comment, then Approve → Final Render → CG renders → Done', { tag: ['@happy', '@regression'] }, async ({ browser }) => {
    test.setTimeout(1200000);
    const { ticket, job, mm } = await walkToFinalApprove(browser);
    const page = mm.page;

    // Landlord side: customer approval is by Media Management itself (as Sale), landlord is pending
    await openLandlordJob(page, ticket, job);
    const approval = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
    expect(approval).toMatch(/CUSTOMER APPROVED Approved By Media Management - QA/i);
    expect(approval).toMatch(/LANDLORD APPROVED Pending Approval/i);

    // Landlord Feedback: a note is required; once sent it changes nothing
    await page.getByRole('button', { name: 'Feedback', exact: true }).click({ force: true });
    const fb = page.getByRole('dialog', { name: 'Send Feedback' });
    await expect(fb).toContainText(`${job} · QA Multi Product`);
    await fb.getByRole('button', { name: 'Send Feedback' }).click({ force: true }); // empty note
    await expect(fb, 'an empty note is not sent: the dialog stays open').toBeVisible();
    await expect(page.getByRole('heading', { name: 'Feedback Sent' })).toHaveCount(0);
    await fb.getByRole('textbox', { name: 'Describe what needs to be changed...' }).fill(NOTE);
    await fb.getByRole('button', { name: 'Send Feedback' }).click({ force: true });
    await expect(page.getByRole('heading', { name: 'Feedback Sent' })).toBeVisible();
    await expect(page.getByText(`Feedback sent · ${job}`)).toBeVisible();
    await ok(page).click({ timeout: 8000 }).catch(() => undefined);

    await assertStillFinalApprove(browser, ticket);
    await page.reload();
    await expect(page.getByText('Waiting for landlord approval')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeEnabled();

    // (A) Approve → Final Render
    await page.getByRole('button', { name: 'Approve', exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Approval Complete' })).toBeVisible();
    await ok(page).click();
    await mm.ctx.close();

    // CG renders → Done
    const cg = await as(browser, 'cg1');
    const r = await openCgJob(cg.page, ticket);
    expect(r.status).toMatch(/^Final Render/);
    await cg.page.getByPlaceholder('e.g. chang_metro_final').fill('qa_mm_render');
    await cg.page.getByRole('button', { name: 'Render File', exact: true }).click();
    await expect(cg.page.locator('main')).toContainText(/\d{14}_qa_mm_render_/);
    await cg.page.getByRole('button', { name: 'Confirm File Name Render' }).click({ force: true });
    await cg.page.getByRole('button', { name: 'Confirm', exact: true }).click({ timeout: 5000 }).catch(() => undefined);
    await ok(cg.page).click({ timeout: 10000 }).catch(() => undefined);
    await expect(cg.page.locator('main')).toContainText('This job is closed — no further edits are allowed', { timeout: 30000 });
    await openVpList(cg.page);
    await searchList(cg.page, ticket);
    expect((await readRow(dataRows(cg.page).first())).status).toBe('Done');
    await cg.ctx.close();
  });

  test('MM-E2E-02 (B) Landlord Feedback is only a comment, then cancelling the Approve changes nothing', { tag: ['@edge', '@regression'] }, async ({ browser }) => {
    test.setTimeout(900000);
    const { ticket, job, mm } = await walkToFinalApprove(browser);
    const page = mm.page;
    await openLandlordJob(page, ticket, job);

    await page.getByRole('button', { name: 'Feedback', exact: true }).click({ force: true });
    const fb = page.getByRole('dialog', { name: 'Send Feedback' });
    await fb.getByRole('textbox', { name: 'Describe what needs to be changed...' }).fill(NOTE);
    await fb.getByRole('button', { name: 'Send Feedback' }).click({ force: true });
    await ok(page).click({ timeout: 8000 }).catch(() => undefined);
    await assertStillFinalApprove(browser, ticket);

    // (B) open the Approve confirmation and cancel it: still Final Approve, landlord still pending, Approve still available
    await page.reload();
    await page.getByRole('button', { name: 'Approve', exact: true }).click({ force: true });
    await expect(page.getByText('Approve Job — confirm approval from the Landlord (LL)')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByText('Approve Job — confirm approval from the Landlord (LL)')).toBeHidden();
    await expect(page.getByText('Waiting for landlord approval')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve', exact: true })).toBeEnabled();
    await assertStillFinalApprove(browser, ticket);
    await mm.ctx.close();
  });
});
