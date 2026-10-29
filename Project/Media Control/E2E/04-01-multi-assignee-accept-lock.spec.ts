// E2E Multi-Assignee (PB-2163 เช็คเงื่อนไข CG กดรับงานได้แค่คนเดียว), 

// สื่อ BTS: Media Group = Digital VGI, Category = DIGITAL, Media Type (Epicor/SF) = QATEST-BTS (BTS On Station), Package = BTS MAX 2.0 Half B): 
// Sale สร้าง ticket 
// → Head CG Assign ให้ 2 คน (CG - QA + CG - QA 2) 
// → ทั้งสองคนเห็น Job 
// → CG - QA กด Accept ก่อน (first-click-wins) 
// → CG - QA 2 กด Accept จากหน้าเก่า ถูก server reject ไม่เกิด action ซ้ำ 
// → รีเฟรชเห็น On Process และ History บันทึกคนที่กดเพียงคนเดียว
// spec: specs/e2e-plan.md (4) — Sale + Head CG + CG (cg1) + CG 2 (cg2); อ้างอิงผลทดสอบมือ BTS_Multi_Assignee_Test_Result.pdf (A, B)
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT (และสร้าง Master Data Media Type (Epicor/SF) "QATEST-BTS" → BTS On Station ถ้ายังไม่มี) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 (ตั้งไว้ใน .env แล้ว)

import { test, expect } from '@playwright/test';
import { DISPLAY_NAME } from '../Dashboard/_helpers';
import { openVpList, searchList, dataRows, readRow, openJob } from '../VerifyProduction/_helpers';
import {
  as, ok, BTS, ensureBtsMapping, createBtsTicket, openAssignList, searchAssign, assignRows, readAssignRow, openRowDialog, dialog, assignButton, domClick, readDesigners,
} from './_helpers';

const CG1 = DISPLAY_NAME.cg1!; // "CG - QA"
const CG2 = DISPLAY_NAME.cg2!; // "CG - QA 2"

test.describe('Multi-assignee (BTS, Digital VGI) — Assign to 2 CGs and first-click-wins Accept', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket and walks it through Assign / Accept (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('MA-E2E-01 create ticket → assign 2 CGs → both see the job → CG - QA accepts first → CG - QA 2 is rejected', { tag: ['@happy', '@edge', '@regression'] }, async ({ browser }) => {
    test.setTimeout(900000);
    const client = `QA Test Client ${Date.now()}`;

    // ---- 0) the Media Type (Epicor/SF) "QATEST-BTS" must exist and be mapped to BTS On Station
    await ensureBtsMapping(browser);

    // ---- 1) Sale creates the ticket with the BTS media
    const { ticket, job } = await createBtsTicket(browser, client);

    // ---- 2) Head CG assigns the job to two CGs at once (the dialog allows "Multiple selection" for BTS)
    {
      const { ctx, page } = await as(browser, 'headCg');
      await openAssignList(page);
      await searchAssign(page, client);
      const row = assignRows(page).filter({ hasText: client }).first();
      const before = await readAssignRow(row);
      expect(before.status).toBe('Assign');
      expect(before.mediaLine).toContain(`${BTS.group} → ${BTS.mediaType}`);
      expect(before.epicor).toBe(BTS.epicor);
      await openRowDialog(page, row, 'Assign');
      const d = dialog(page);
      await expect(d).toContainText(BTS.epicor);
      await expect(d).toContainText(BTS.mediaType);
      await expect(d).toContainText('Multiple selection');
      const designers = await readDesigners(page);
      expect(designers.map((x) => x.name), 'both CGs are offered').toEqual(expect.arrayContaining([CG1, CG2]));
      const buttons = d.getByRole('button').filter({ hasText: /active/ });
      for (const who of [CG1, CG2]) await domClick(buttons.nth(designers.findIndex((x) => x.name === who)));
      await expect(d).toContainText(/Selected\s*2 people:\s*\S/); // "Selected 2 people: CG - QA 2, CG - QA"
      await expect(d).toContainText(CG2);
      await expect(assignButton(page)).toBeEnabled();
      await domClick(assignButton(page));
      await ok(page).click({ timeout: 15000 }).catch(() => undefined);
      await expect(d).toBeHidden({ timeout: 15000 });
      await searchAssign(page, client);
      const after = await readAssignRow(assignRows(page).filter({ hasText: client }).first());
      expect(after.status).toBe('Verify');
      expect(after.assigned).toContain(CG1);
      expect(after.assigned).toContain(CG2);
      expect(after.actions).toContain('Reassign');
      await ctx.close();
    }

    // ---- 3) both CGs see the job in Verify & Production, with the same data and usable Accept / Feedback buttons
    const cg1 = await as(browser, 'cg1');
    const cg2 = await as(browser, 'cg2');
    const rows: Record<string, Awaited<ReturnType<typeof readRow>>> = {};
    for (const [name, a] of [['cg1', cg1], ['cg2', cg2]] as const) {
      await openVpList(a.page);
      await searchList(a.page, ticket);
      await expect(dataRows(a.page)).toHaveCount(1);
      rows[name] = await readRow(dataRows(a.page).first());
      expect(rows[name].job).toBe(job);
      expect(rows[name].status).toBe('Verify');
      await openJob(a.page, rows[name]);
      await expect(a.page.getByRole('region', { name: 'Job Information' })).toContainText(BTS.epicor);
      // Accept stays disabled until a Work Type is chosen (unchanged rule); Feedback is usable at once
      await expect(a.page.getByRole('button', { name: 'Accept', exact: true }), `${name}: Accept before a Work Type`).toBeDisabled();
      await expect(a.page.getByRole('button', { name: 'Feedback', exact: true }), `${name}: Feedback`).toBeEnabled();
    }
    expect(rows.cg2.product).toBe(rows.cg1.product);
    expect(rows.cg2.period).toBe(rows.cg1.period);

    // ---- 4) CG - QA accepts first with a Work Type; CG - QA 2 still has the old page open
    await cg1.page.locator('select').first().selectOption({ label: 'Animate' }); // new Work Type of PB-2163
    await expect(cg1.page.getByRole('button', { name: 'Accept', exact: true })).toBeEnabled();
    await cg1.page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
    await expect(cg1.page.getByRole('heading', { name: 'Confirm accept job?' })).toBeVisible();
    await cg1.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await ok(cg1.page).click({ timeout: 10000 }).catch(() => undefined);
    await expect(cg1.page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });

    // ---- 5) CG - QA 2 presses Accept from the stale page → the server rejects it, nothing happens twice
    await cg2.page.locator('select').first().selectOption({ label: 'Mockup (Sales Pitch)' });
    await cg2.page.getByRole('button', { name: 'Accept', exact: true }).click({ force: true });
    await expect(cg2.page.getByRole('heading', { name: 'Confirm accept job?' })).toBeVisible();
    await cg2.page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(cg2.page.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
    await expect(cg2.page.getByText("This job's status has already changed (now: On Process) — please refresh the page and try again")).toBeVisible();
    await ok(cg2.page).click();

    // ---- 6) after a refresh CG - QA 2 sees On Process (the Accept gate is closed); History has one Accept, by CG - QA
    await cg2.page.reload();
    await expect(cg2.page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });
    await expect(cg2.page.getByRole('button', { name: 'Accept', exact: true })).toHaveCount(0);
    await cg2.page.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const history = cg2.page.getByRole('dialog', { name: 'Activity History' });
    await expect(history).toBeVisible();
    await expect(history).toContainText('3 items'); // Ticket, Assign (to both), On Process — no second Accept
    const text = (await history.innerText()).replace(/\s+/g, ' ');
    expect((text.match(/On Process/g) ?? []).length, 'one On Process (Accept) entry').toBe(1);
    expect(text).toMatch(new RegExp(`On Process.*?${CG1.replace(/[-]/g, '\\-')}`));
    expect(text, 'the Assign entry names both people').toMatch(new RegExp(`${CG2}.*${CG1}|${CG1}.*${CG2}`));
    await cg1.ctx.close();
    await cg2.ctx.close();
  });
});
