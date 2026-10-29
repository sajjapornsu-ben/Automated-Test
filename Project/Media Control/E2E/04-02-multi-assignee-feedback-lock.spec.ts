// เช็คเงื่อนไขกรณี Multi assign คนนึงกด Feedback อีกคนกดรับงาน (ไม่ผ่าน)

// E2E Multi-Assignee (PB-2163, สื่อ BTS: Digital VGI / QATEST-BTS / BTS MAX 2.0 Half B): 
// Verify gate เดียวกันทั้ง Accept และ Feedback — 
// CG - QA กด Feedback (มีหมายเหตุ) ก่อน 
// → สถานะ Revise (SALE); 
// CG - QA 2 กด Accept จากหน้าเก่า ถูก server reject (BR8, E7); ทั้งสองคนเห็นสถานะ Revise (SALE)
// spec: specs/e2e-plan.md (5) — Sale + Head CG + CG (cg1) + CG 2 (cg2); อ้างอิงผลทดสอบมือ BTS_Multi_Assignee_Test_Result.pdf (C-11, E7)
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT (ส่งอีเมลตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 (ตั้งไว้ใน .env แล้ว)

import { test, expect } from '@playwright/test';
import { DISPLAY_NAME } from '../Dashboard/_helpers';
import { openVpList, searchList, dataRows, readRow, openJob } from '../VerifyProduction/_helpers';
import { as, ok, ensureBtsMapping, createBtsTicket, assignToCgs, openCgJob } from './_helpers';

const CG1 = DISPLAY_NAME.cg1!;
const CG2 = DISPLAY_NAME.cg2!;

test.describe('Multi-assignee (BTS, Digital VGI) — Feedback closes the Verify gate for the other CG', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket and sends Feedback (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MA-E2E-02 CG - QA sends Feedback first → CG - QA 2 Accept from the old page is rejected', { tag: ['@edge', '@regression'] }, async ({ browser }) => {
    test.setTimeout(900000);
    const client = `QA Test Client ${Date.now()}`;
    await ensureBtsMapping(browser);
    const { ticket } = await createBtsTicket(browser, client);
    await assignToCgs(browser, client, [CG1, CG2]);

    const cg1 = await as(browser, 'cg1');
    const cg2 = await as(browser, 'cg2');
    await openCgJob(cg1.page, ticket);
    await openCgJob(cg2.page, ticket);

    // CG - QA opens Feedback: the note is required, so Send Feedback cannot be pressed with an empty note
    await cg1.page.getByRole('button', { name: 'Feedback', exact: true }).click({ force: true });
    await expect(cg1.page.getByText('Feedback to Sales')).toBeVisible();
    await expect(cg1.page.getByText('Use this when Material/Brief information is incomplete — the job will be sent back to Sales to complete first')).toBeVisible();
    const send = cg1.page.getByRole('button', { name: 'Send Feedback', exact: true });
    await send.click({ force: true }); // empty note: refused, the dialog stays open
    await expect(cg1.page.getByText('Please enter a note or question before sending feedback')).toBeVisible();
    await expect(cg1.page.getByText('Feedback to Sales')).toBeVisible();
    await cg1.page.getByRole('textbox', { name: /Note \/ Question for Sales/ }).or(cg1.page.getByRole('textbox').last()).fill('QA Test feedback: please send a larger material file');
    await send.click({ force: true });
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click({ timeout: 5000 }).catch(() => undefined);
    await ok(cg1.page).click({ timeout: 10000 }).catch(() => undefined);

    // CG - QA 2 still has the old Verify page: Accept is rejected by the server (same gate as Feedback), nothing happens twice
    await cg2.page.locator('select').first().selectOption({ label: 'Mockup (Sales Pitch)' });
    await cg2.page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
    await expect(cg2.page.getByRole('heading', { name: 'Confirm accept job?' })).toBeVisible();
    await cg2.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(cg2.page.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await expect(cg2.page.getByText(/This job's status has already changed \(now: Revise \(SALE\)\) — please refresh the page and try again/)).toBeVisible();
    await ok(cg2.page).click();

    // the job is with Sale: Revise (SALE) for both CGs, and the History has exactly one action after the Assign
    for (const [name, a] of [['cg1', cg1], ['cg2', cg2]] as const) {
      await openVpList(a.page);
      await searchList(a.page, ticket);
      await expect.poll(async () => (await readRow(dataRows(a.page).first())).status, { message: `${name} sees Revise (SALE)`, timeout: 30000 }).toBe('Revise (SALE)');
    }
    const r = await readRow(dataRows(cg2.page).first());
    await openJob(cg2.page, r);
    await cg2.page.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const history = cg2.page.getByRole('dialog', { name: 'Activity History' });
    await expect(history).toBeVisible();
    await expect(history).toContainText('3 items'); // Ticket, Assign (both CGs), Feedback — no Accept, nothing twice
    await expect(history).toContainText(CG1);
    await cg1.ctx.close();
    await cg2.ctx.close();
  });
});
