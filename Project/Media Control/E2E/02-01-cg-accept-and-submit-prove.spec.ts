// Verify & Production — CG: Accept แล้ว Submit Prove จริง กับ ticket ทดสอบที่สร้างเอง ("QA Test Client ..."): Sale สร้าง+submit → Head CG Assign ให้ CG - QA → CG Accept (เลือก Job Type) → สถานะ On Process → CG Submit Prove (URL link) → สถานะ Review; History มี 4 รายการ (Ticket, Assign, On Process, Prove delivery)
// spec: specs/e2e-plan.md (2) / specs/verify-production-plan.md — Sale + Head CG + CG (cg1)
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT และส่ง Prove จริง (ระบบส่งอีเมลตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น

import { test, expect } from '@playwright/test';
import { loginAs, DISPLAY_NAME } from '../Dashboard/_helpers';
import { login as loginSale, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage, pickDate } from '../CreateTicket/_helpers';
import { openAssignList, searchList as searchAssign, dataRows as assignRows, readRow as readAssignRow, openRowDialog, dialog, assignButton, domClick, chooseDesigner } from '../AssignTicket/_helpers';
import { openVpList, searchList, dataRows, readRow, openJob } from '../VerifyProduction/_helpers';

test.describe('Verify & Production — CG accepts and submits a prove on a QA ticket', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket, assigns it and submits a prove (sends e-mails) — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('VP-CG-12 create ticket, assign to CG, Accept, Submit Prove', { tag: ['@happy', '@regression'] }, async ({ browser }) => {
    test.setTimeout(600000);
    const client = `QA Test Client ${Date.now()}`;
    const cgName = DISPLAY_NAME.cg1!;

    // 1) Sale creates and submits the ticket
    const saleCtx = await browser.newContext();
    const sale = await saleCtx.newPage();
    await loginSale(sale);
    await openCreateTicket(sale);
    await switchToManualMode(sale);
    await fillTicketHeader(sale, { client, product: 'QA Prove Product' });
    await addJobWithPackage(sale);
    const period = sale.getByRole('button', { name: 'DD/MM/YYYY' });
    await pickDate(sale, period.nth(0), 1);
    await pickDate(sale, period.nth(0), 21);
    await sale.getByRole('textbox', { name: 'Minutes' }).fill('0');
    await sale.getByRole('textbox', { name: 'Seconds' }).fill('15');
    const links = sale.getByRole('textbox', { name: 'Paste 1 Link...' });
    await links.nth(0).fill('https://example.com/material.jpg');
    await links.nth(1).fill('https://example.com/brief.pdf');
    await sale.getByRole('button', { name: 'Submit ticket' }).click();
    await sale.getByRole('button', { name: 'Confirm' }).click();
    await expect(sale.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
    await sale.getByRole('button', { name: 'OK' }).click();
    await saleCtx.close();

    // 2) Head CG assigns it to the CG
    const hcCtx = await browser.newContext();
    const hc = await hcCtx.newPage();
    await loginAs(hc, 'headCg');
    await openAssignList(hc);
    await searchAssign(hc, client);
    const aRow = assignRows(hc).filter({ hasText: client }).first();
    await expect(aRow).toBeVisible({ timeout: 30000 });
    const created = await readAssignRow(aRow);
    expect(created.status).toBe('Assign');
    const ticket = created.ticket; // the CG list is searched by ticket no (its Product / Client columns are not unique)
    await openRowDialog(hc, aRow, 'Assign');
    await chooseDesigner(hc, cgName);
    await domClick(assignButton(hc));
    await hc.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 15000 }).catch(() => undefined);
    await expect(dialog(hc)).toBeHidden({ timeout: 15000 });
    await hcCtx.close();

    // 3) CG sees it as Verify and accepts it with a Job Type
    const cgCtx = await browser.newContext();
    const cg = await cgCtx.newPage();
    await loginAs(cg, 'cg1');
    await openVpList(cg);
    await searchList(cg, ticket);
    const row = dataRows(cg).filter({ hasText: ticket }).first();
    await expect(row).toBeVisible({ timeout: 30000 });
    const r = await readRow(row);
    expect(r.status).toBe('Verify');
    await openJob(cg, r);
    await expect(cg.getByRole('heading', { name: 'Accept Job' })).toBeVisible();
    const accept = cg.getByRole('button', { name: 'Accept', exact: true });
    // the job type is required before Accept
    await cg.locator('select').first().selectOption({ label: 'Mockup (Sales Pitch)' });
    await accept.click({ force: true });
    await expect(cg.getByRole('heading', { name: 'Confirm accept job?' })).toBeVisible();
    await expect(cg.getByText('Accepting this job will change its status to On Process and start the Prove production SLA countdown')).toBeVisible();
    await cg.getByRole('button', { name: 'Confirm', exact: true }).click();
    await cg.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 10000 }).catch(() => undefined);
    await expect(cg.getByRole('heading', { name: 'Submit Prove' })).toBeVisible({ timeout: 30000 });
    await cg.reload();
    await expect(cg.locator('main')).toContainText('On Process');

    // 4) CG submits the prove with a URL link
    await cg.getByPlaceholder('https://drive.google.com/...').fill('https://example.com/qa-prove.jpg');
    await cg.getByRole('button', { name: 'Submit Prove', exact: true }).click({ force: true });
    await expect(cg.getByRole('heading', { name: 'Confirm submit Prove?' })).toBeVisible();
    await expect(cg.getByText('The system will create a new Prove version and send it to the reviewer')).toBeVisible();
    await cg.getByRole('button', { name: 'Confirm', exact: true }).click();
    await cg.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 10000 }).catch(() => undefined);
    await openVpList(cg);
    await searchList(cg, ticket);
    await expect.poll(async () => (await readRow(dataRows(cg).filter({ hasText: ticket }).first())).status, { timeout: 30000 }).toBe('Review');
    expect((await readRow(dataRows(cg).filter({ hasText: ticket }).first())).prove).toBe('1');

    // 5) the job now has Prove 1 and History entries
    await openJob(cg, await readRow(dataRows(cg).filter({ hasText: ticket }).first()));
    await expect(cg.getByRole('heading', { name: 'Prove History' })).toBeVisible();
    await expect(cg.getByRole('button', { name: 'Action History · Prove 1' })).toBeVisible();
    await cg.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const history = cg.getByRole('dialog', { name: 'Activity History' });
    await expect(history).toBeVisible();
    // newest first: Prove delivery (Prove 1) → On Process (accepted) → Assign → Ticket (created)
    await expect(history).toContainText('4 items');
    for (const step of ['Prove delivery', 'On Process', 'Assign', 'Ticket']) await expect(history).toContainText(step);
    await expect(history).toContainText('Prove 1');
    await cgCtx.close();
  });
});
