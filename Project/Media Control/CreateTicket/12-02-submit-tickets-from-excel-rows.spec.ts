// อ่านข้อมูลจากไฟล์ Excel (data/create-ticket-cases.xlsx) มา submit ticket จริงทีละแถวบน UAT
// spec: specs/create-ticket-plan.md (12.2, POC)
// seed: seed.spec.ts
//
// หมายเหตุ: เทสนี้ submit ticket จริงบน UAT ต่อ 1 แถวในไฟล์ (ตอนนี้มี 2 แถว = 2 ตั๋ว/รอบรัน)
// ได้รับอนุมัติจากผู้ใช้แล้ว — คอลัมน์ที่มีอยู่เดิม (Client, Product, Package, DurationMinutes,
// DurationSeconds, MaterialLink, BriefLink) ครบพอสำหรับ submit จริงแล้ว ไม่ต้องเพิ่มคอลัมน์ใหม่
// (Contract/Job Period ยังคงค่าคงที่เหมือนเทสอื่นๆ ไม่ได้อ่านจาก sheet)
// เทสนี้ถูก skip by default — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';

type CaseRow = {
  Client: string;
  Product: string;
  Package: string;
  DurationMinutes: number;
  DurationSeconds: number;
  MaterialLink: string;
  BriefLink: string;
};

const workbook = XLSX.readFile(path.join(__dirname, 'data', 'create-ticket-cases.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows: CaseRow[] = XLSX.utils.sheet_to_json(sheet);

test.describe('Data-driven testing (POC)', () => {
  for (const row of rows) {
    test(`Submits a real ticket from a spreadsheet row: ${row.Client}`, async ({ page }) => {
      test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');

      // Tag with a timestamp so repeat runs don't collide, same convention as the other
      // submit tests (still traceable back to the sheet row via the "QA Sheet Client" prefix).
      const clientName = `${row.Client} ${Date.now()}`;

      await login(page);
      await openCreateTicket(page);
      await switchToManualMode(page);

      await fillTicketHeader(page, { client: clientName, product: row.Product });

      await page.getByRole('button', { name: 'Add Job' }).click();
      await page.getByRole('button', { name: 'Select Package' }).click();
      await page.getByRole('button', { name: row.Package, exact: true }).click();
      await closeOpenPopover(page);

      const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
      await pickDate(page, periodBtns.nth(0), 1);
      await pickDate(page, periodBtns.nth(0), 21);

      await page.getByRole('textbox', { name: 'Minutes' }).fill(String(row.DurationMinutes));
      await page.getByRole('textbox', { name: 'Seconds' }).fill(String(row.DurationSeconds));

      const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
      await linkBoxes.nth(0).fill(row.MaterialLink);
      await linkBoxes.nth(1).fill(row.BriefLink);

      // Submit ticket, confirm, and verify it lands in the Media Ticket list.
      await page.getByRole('button', { name: 'Submit ticket' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
      await page.getByRole('button', { name: 'OK' }).click();

      await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);
      await expect(page.getByText(clientName).first()).toBeVisible();
    });
  }
});
