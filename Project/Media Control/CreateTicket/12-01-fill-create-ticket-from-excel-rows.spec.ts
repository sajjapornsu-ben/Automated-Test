// พิสูจน์แนวคิด: อ่านข้อมูลจากไฟล์ Excel (data/create-ticket-cases.xlsx) มากรอกฟอร์ม Create Ticket ให้อัตโนมัติทีละแถว (ไม่ submit จริง)
// spec: specs/create-ticket-plan.md (12.1, POC)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate, popover, summary } from './_helpers';

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
    test(`Fills the Create Ticket form from a spreadsheet row: ${row.Client}`, async ({ page }) => {
      await login(page);
      await openCreateTicket(page);
      await switchToManualMode(page);

      // 1-2. Fill Client/Product from the row (Contract dates stay fixed for this POC).
      await fillTicketHeader(page, { client: row.Client, product: row.Product });

      // Add a Job, select the row's Package, fill Material/Brief from the row.
      await page.getByRole('button', { name: 'Add Job' }).click();
      await page.getByRole('button', { name: 'Select Sale Package' }).click();
      await popover(page, 'Select Sale Package').getByRole('button', { name: row.Package, exact: true }).click();
      await closeOpenPopover(page);

      const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
      await pickDate(page, periodBtns.nth(0), 1);
      await pickDate(page, periodBtns.nth(0), 21);

      await page.getByRole('textbox', { name: 'Minutes' }).fill(String(row.DurationMinutes));
      await page.getByRole('textbox', { name: 'Seconds' }).fill(String(row.DurationSeconds));

      const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
      await linkBoxes.nth(0).fill(row.MaterialLink);
      await linkBoxes.nth(1).fill(row.BriefLink);

      // The Ticket Header and Ticket summary reflect the row's data.
      await expect(page.getByRole('textbox', { name: 'Enter client name...' })).toHaveValue(row.Client);
      await expect(page.getByRole('textbox', { name: 'Enter product name...' })).toHaveValue(row.Product);
      await expect(page.getByRole('button', { name: 'Select Sale Package' })).toHaveText(row.Package);
      await expect(summary(page)).toContainText(row.Package.split(' (')[0]);

      // Does not submit — this POC only proves the fill mechanism works.
    });
  }
});
