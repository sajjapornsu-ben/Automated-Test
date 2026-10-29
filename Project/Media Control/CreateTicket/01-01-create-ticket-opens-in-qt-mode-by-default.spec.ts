// เปิดหน้า Create Ticket ครั้งแรก ต้องเริ่มที่ "Pull from Salesforce" (เลือกอยู่) ส่วน "No Quotation Number" ไม่ถูกเลือก ไม่โชว์ฟอร์ม header; มี 3 ส่วน Ticket source / Ticket information / Jobs และ Ticket summary
// spec: specs/create-ticket-plan.md (1.1, PB-1861) — UX ใหม่ 28 ต.ค.: ปุ่มเลือกที่มา Ticket แทน switch
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  login, openCreateTicket, sourceSection, infoSection, jobsSection, summary, pullFromSalesforceButton, noQuotationButton,
} from './_helpers';

test.describe('Entry & Mode Switching', () => {
  test('Create Ticket opens with "Pull from Salesforce" selected', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);

    // 1. Navigate to Media Ticket, click "Create Ticket".
    await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/create$/);
    await expect(page.getByText('Choose the source, fill in the ticket and add Jobs — then submit it for assignment')).toBeVisible();

    // Section 1 "Ticket source": two toggle buttons, Pull from Salesforce is the selected one.
    await expect(sourceSection(page).getByText('Pull the ticket from a Salesforce quotation, or continue without one')).toBeVisible();
    await expect(pullFromSalesforceButton(page)).toContainText('Fill client, product and contract from a Quotation Number');
    await expect(noQuotationButton(page)).toContainText('Enter the ticket information manually');
    await expect(pullFromSalesforceButton(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(noQuotationButton(page)).toHaveAttribute('aria-pressed', 'false');

    // The quotation search is shown; the manual header fields and banner are not.
    await expect(page.getByRole('textbox', { name: 'Quotation Number' })).toHaveAttribute('placeholder', 'Enter Quotation Number e.g. 00061306');
    await expect(page.getByRole('button', { name: 'Pull SF data' })).toBeVisible();
    await expect(page.getByText('Manual entry mode', { exact: false })).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Enter client name...' })).toHaveCount(0);
    await expect(infoSection(page).getByText('Pull a quotation first')).toBeVisible();

    // Sections 2 and 3 and the summary panel.
    await expect(jobsSection(page).getByText('No Jobs yet')).toBeVisible();
    await expect(summary(page)).toContainText('0/4 ready');
    await expect(summary(page).getByRole('button', { name: 'Submit ticket' })).toBeVisible();
    await expect(summary(page).getByRole('button', { name: 'Save as draft' })).toBeVisible();
  });
});
