// เลือก "No Quotation Number" ต้องโชว์ข้อความ Manual entry mode และฟอร์ม Ticket information เต็มรูปแบบ (แทนช่องค้นหา Quotation) และสลับกลับ "Pull from Salesforce" ได้
// spec: specs/create-ticket-plan.md (1.2, PB-1861) — UX ใหม่ 28 ต.ค.
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { login, openCreateTicket, switchToManualMode, infoSection, summary, pullFromSalesforceButton, noQuotationButton } from './_helpers';

test.describe('Entry & Mode Switching', () => {
  test('Choosing "No Quotation Number" reveals the full header form, and Pull from Salesforce brings the search back', async ({ page }) => {
    await login(page);
    await openCreateTicket(page);

    // 2. Choose "No Quotation Number".
    await switchToManualMode(page);
    await expect(pullFromSalesforceButton(page)).toHaveAttribute('aria-pressed', 'false');

    // The quotation search is replaced by the manual header fields.
    await expect(page.getByRole('textbox', { name: 'Quotation Number' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Pull SF data' })).toHaveCount(0);
    await expect(infoSection(page).getByText('Who the ticket is for, the contract and the media')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter name...' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter client name...' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter product name...' })).toBeVisible();
    await expect(infoSection(page).getByText('Contract Start - End')).toBeVisible();
    await expect(infoSection(page).getByRole('button', { name: 'DD/MM/YYYY' })).toHaveCount(2);
    await expect(infoSection(page).getByText('Contract Period (auto-calculated)')).toBeVisible();
    await expect(infoSection(page).getByRole('heading', { name: 'Media & support' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select media group' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select media category' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select media type (Epicor/SF)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select CS Support' })).toBeVisible();
    await expect(summary(page)).toContainText('Manual'); // PB Number shows "Manual"

    // Switching back to Pull from Salesforce restores the quotation search.
    await pullFromSalesforceButton(page).click();
    await expect(pullFromSalesforceButton(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(noQuotationButton(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('textbox', { name: 'Quotation Number' })).toBeVisible();
    await expect(page.getByText('Manual entry mode', { exact: false })).toHaveCount(0);
  });
});
