// Assign Ticket — Head CG: Assign และ Reassign จริง กับ ticket ทดสอบที่สร้างเอง ("QA Test Client ..."): 
// Sale สร้าง+submit ticket → Head CG Assign ให้ designer คนที่ 1 (สถานะเปลี่ยน, คอลัมน์ Assigned เปลี่ยน) → Reassign ให้อีกคน 
// (Assigned เปลี่ยน) → History มีรายการ
// spec: specs/e2e-plan.md (1) / specs/assign-ticket-plan.md — Sale + Head CG
// seed: seed.spec.ts
//
// เทสนี้สร้าง ticket จริงบน UAT และ Assign/Reassign จริง (ระบบส่งอีเมลแจ้ง Sale / CS Support / Head CG / Team CG ตาม template) — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น
// รันกับ UAT แล้ว 28 ต.ค. (ผ่าน, ได้รับอนุมัติจากผู้ใช้) — ปิด modal หลัง Assign/Reassign ด้วยปุ่ม OK โดยไม่ตรวจข้อความ

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { login as loginSale, openCreateTicket, switchToManualMode, fillTicketHeader, addJobWithPackage, pickDate } from '../CreateTicket/_helpers';
import {
  openAssignList, searchList, dataRows, readRow, openRowDialog, readDesigners, dialog, assignButton, domClick, chooseDesigner, BASE,
} from '../AssignTicket/_helpers';

test.describe('Assign Ticket — Head CG assigns and reassigns a QA ticket', () => {
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket, assigns it and sends notification e-mails — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('AT-HC-12 create QA ticket, Assign, Reassign, History', { tag: ['@happy', '@regression'] }, async ({ browser }) => {
    test.setTimeout(480000);
    const client = `QA Test Client ${Date.now()}`;

    // 1) Sale creates and submits a ticket
    const saleCtx = await browser.newContext();
    const sale = await saleCtx.newPage();
    await loginSale(sale);
    await openCreateTicket(sale);
    await switchToManualMode(sale);
    await fillTicketHeader(sale, { client, product: 'QA Assign Product' });
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

    // 2) Head CG finds it in Assign Ticket (status Assign, unassigned)
    const hcCtx = await browser.newContext();
    const page = await hcCtx.newPage();
    await loginAs(page, 'headCg');
    await openAssignList(page);
    await searchList(page, client);
    const row = () => dataRows(page).filter({ hasText: client }).first();
    await expect(row()).toBeVisible({ timeout: 30000 });
    const before = await readRow(row());
    expect(before.status).toBe('Assign');
    expect(before.assigned).toContain('unassigned');

    // 3) Assign to the first designer
    await openRowDialog(page, row(), 'Assign');
    const designers = await readDesigners(page);
    expect(designers.length, 'need two designers to test Assign then Reassign').toBeGreaterThan(1);
    const first = designers[0].name;
    await domClick(dialog(page).getByRole('button').filter({ hasText: /active/ }).first());
    await expect(assignButton(page)).toBeEnabled();
    await domClick(assignButton(page));
    await page.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 15000 }).catch(() => undefined);
    await expect(dialog(page)).toBeHidden({ timeout: 15000 });
    await searchList(page, client);
    await expect.poll(async () => (await readRow(row())).status, { timeout: 30000 }).not.toBe('Assign');
    expect((await readRow(row())).assigned).toContain(first);
    expect((await readRow(row())).actions).toContain('Reassign');

    // 4) Reassign to a different designer
    await openRowDialog(page, row(), 'Reassign');
    await expect(dialog(page)).toContainText('Currently Assigned To');
    const options = await readDesigners(page);
    const other = options.find((d) => d.name !== first);
    expect(other, 'another designer to reassign to').toBeTruthy();
    await chooseDesigner(page, other!.name);
    await domClick(assignButton(page));
    await page.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 15000 }).catch(() => undefined);
    await expect(dialog(page)).toBeHidden({ timeout: 15000 });
    await searchList(page, client);
    await expect.poll(async () => (await readRow(row())).assigned, { timeout: 30000 }).toContain(other!.name);

    // 5) History shows entries for the job
    const job = (await readRow(row())).job;
    await domClick(row().locator('[title="View details"]'));
    await expect(page).toHaveURL(new RegExp(`${BASE}/${job}`));
    await page.getByRole('button', { name: 'History', exact: true }).click({ force: true });
    const history = page.getByRole('dialog', { name: 'Activity History' });
    await expect(history).toBeVisible();
    await expect(history).toContainText(/\d+ items?/);
    await expect(history).toContainText(/Assign/i);
    await hcCtx.close();
  });
});
