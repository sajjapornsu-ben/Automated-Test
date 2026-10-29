// เช็คเงื่อนไข Multi Assign การที่ CG 2 คนทำการกด Prove งานซ้ำกัน --> ต้องไม่สามารถทำได้
// E2E Multi-Assignee (PB-2163, 
// สื่อ BTS: Digital VGI / QATEST-BTS / BTS MAX 2.0 Half B): 
// CG - QA กด Accept (Work Type "Final File") 
// → On Process เปิดให้ทั้งสองคน 
// → CG - QA 2 กด Submit Prove ก่อน 
// → สถานะ Review (SALE); 
// CG - QA กด Submit Prove จากหน้าเก่าถูก server reject ไม่เกิด Prove ซ้ำ; 
// History มี Prove delivery ครั้งเดียว (ชื่อคนที่กด)
// spec: specs/e2e-plan.md (6) — Sale + Head CG + CG (cg1) + CG 2 (cg2); อ้างอิงผลทดสอบมือ BTS_Multi_Assignee_Test_Result.pdf (C-13, AC5)
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT และส่ง Prove จริง (ส่งอีเมลตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 (ตั้งไว้ใน .env แล้ว)

import { test, expect } from '@playwright/test';
import { DISPLAY_NAME } from '../Dashboard/_helpers';
import { openVpList, searchList, dataRows, readRow } from '../VerifyProduction/_helpers';
import { as, ok, ensureBtsMapping, createBtsTicket, assignToCgs, openCgJob } from './_helpers';

const CG1 = DISPLAY_NAME.cg1!;
const CG2 = DISPLAY_NAME.cg2!;

test.describe('Multi-assignee (BTS, Digital VGI) — first Submit Prove wins', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket and submits a prove (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MA-E2E-03 CG - QA 2 submits the Prove first → CG - QA Submit Prove from the old page is rejected', { tag: ['@edge', '@regression'] }, async ({ browser }) => {
    test.setTimeout(900000);
    const client = `QA Test Client ${Date.now()}`;
    await ensureBtsMapping(browser);
    const { ticket } = await createBtsTicket(browser, client);
    await assignToCgs(browser, client, [CG1, CG2]);

    const cg1 = await as(browser, 'cg1');
    const cg2 = await as(browser, 'cg2');
    await openCgJob(cg1.page, ticket);

    // ---- CG - QA accepts with the Work Type "Final File" (new value of PB-2163)
    await cg1.page.locator('select').first().selectOption({ label: 'Final File' });
    await cg1.page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await ok(cg1.page).click({ timeout: 10000 }).catch(() => undefined);
    await expect(cg1.page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });

    // ---- On Process: both CGs have the Submit Prove form (a new gate is open to everybody)
    await openCgJob(cg2.page, ticket);
    for (const [name, a] of [['cg1', cg1], ['cg2', cg2]] as const) {
      await expect(a.page.getByRole('heading', { name: 'Submit Prove' }), `${name}: Submit Prove form`).toBeVisible();
      await expect(a.page.getByRole('button', { name: 'Submit Prove', exact: true }), `${name}: Submit Prove`).toBeEnabled();
    }
    // no link / file: refused for both (unchanged rule)
    await cg2.page.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
    await expect(cg2.page.getByText('Please attach a file or enter a URL link before submitting')).toBeVisible();
    await ok(cg2.page).click();

    // ---- CG - QA 2 submits first
    await cg2.page.getByPlaceholder('https://drive.google.com/...').fill('https://example.com/cg2-prove.jpg');
    await cg2.page.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
    await expect(cg2.page.getByRole('heading', { name: 'Confirm submit Prove?' })).toBeVisible();
    await cg2.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(cg2.page.getByRole('heading', { name: 'Prove submitted successfully' })).toBeVisible();
    await expect(cg2.page.getByText('New Prove version submitted · Job → Review')).toBeVisible();
    await ok(cg2.page).click({ timeout: 10000 }).catch(() => undefined);

    // ---- CG - QA still has the old On Process page: Submit Prove is rejected
    await cg1.page.getByPlaceholder('https://drive.google.com/...').fill('https://example.com/cg1-late.jpg');
    await cg1.page.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
    await expect(cg1.page.getByRole('heading', { name: 'Confirm submit Prove?' })).toBeVisible();
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(cg1.page.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await expect(cg1.page.getByText('Choose Feedback revision, Re-Edit or Skip supplement.')).toBeVisible(); // the Prove gate is closed: the job is already in Review
    await ok(cg1.page).click({ timeout: 10000 }).catch(() => undefined);

    for (const [name, a] of [['cg1', cg1], ['cg2', cg2]] as const) {
      await openVpList(a.page);
      await searchList(a.page, ticket);
      await expect.poll(async () => (await readRow(dataRows(a.page).first())).status, { message: `${name} sees Review`, timeout: 30000 }).toBe('Review');
      expect((await readRow(dataRows(a.page).first())).prove, `${name}: one Prove`).toBe('1');
    }
    await cg1.ctx.close();
    await cg2.ctx.close();
  });
});
