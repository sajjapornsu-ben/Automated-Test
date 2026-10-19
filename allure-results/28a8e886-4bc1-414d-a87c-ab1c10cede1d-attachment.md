# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\TicketDetail\04-03-confirm-cancel-cancels-job.spec.ts >> Cancel Job >> Confirming with a reason actually cancels the Job
- Location: Project\Media Control\TicketDetail\04-03-confirm-cancel-cancels-job.spec.ts:19:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Cancelled', { exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Cancelled', { exact: true })

```

```yaml
- alert
- complementary:
  - img "Plan-B Media"
  - text: Media Control System
  - navigation "Main navigation":
    - link "HOME":
      - /url: /home
    - link "DASHBOARD":
      - /url: /dashboard
    - link "INVENTORY":
      - /url: /inventory
    - link "SALE":
      - /url: /sale
    - link "PRODUCTION":
      - /url: /production
    - link "CLAIM":
      - /url: /claim
    - button "MEDIA APPROVAL":
      - text: MEDIA APPROVAL
      - img
    - link "Dashboard":
      - /url: /mediaApproval/dashboard
    - link "Media Ticket":
      - /url: /mediaApproval/mediaTicket
    - link "Assign Ticket":
      - /url: /mediaApproval/assignTicket
    - link "Verify & Production":
      - /url: /mediaApproval/productionReview
    - link "Media Management":
      - /url: /mediaApproval/mediaManagement
    - button "REPORT":
      - text: REPORT
      - img
    - link "KPI Dashboard":
      - /url: /report/kpiDashboard
    - link "Export Airtime":
      - /url: /report/exportAirtime
    - link "Monthly Report":
      - /url: /report/monthlyReport
    - link "Audit Log":
      - /url: /report/auditLog
    - button "SETTING":
      - text: SETTING
      - img
    - link "User Management":
      - /url: /settings/userManagement
    - link "User Group Management":
      - /url: /settings/userGroupManagement
    - link "Email Setup":
      - /url: /settings/emailSetup
    - link "Email Template":
      - /url: /settings/emailTemplate
    - link "UI Kit":
      - /url: /ui-kit
    - link "Master Data":
      - /url: /settings/masterData
  - text: S' Sajjaporn 'Ben' Suksumranpaisan sajjaporn.su@planbmedia.co.th
  - button "Log Out":
    - img
- main:
  - button "Toggle sidebar":
    - img
  - list "Breadcrumbs":
    - listitem:
      - link "Home":
        - /url: /home
    - listitem:
      - link "Media Approval"
    - listitem:
      - link "Media Ticket":
        - /url: /mediaApproval/mediaTicket
    - listitem:
      - link "TK-26090102" [disabled]
  - text: This ticket has been cancelled
  - link "Back to Media Ticket":
    - /url: /mediaApproval/mediaTicket
```

# Test source

```ts
  1  | // เลือก Cancel Reason แล้วกด "Confirm Cancel" จริง ต้องยกเลิก Job นั้นสำเร็จ และสถานะ Job ต้องเปลี่ยนเป็น Cancelled
  2  | // spec: specs/ticket-detail-plan.md (4.3)
  3  | // seed: seed.spec.ts
  4  | //
  5  | // หมายเหตุ: เทสนี้สร้างตั๋วทดสอบใหม่ (ผ่าน Create Ticket) แล้ว Cancel Job จริงบน UAT
  6  | // (ได้รับอนุมัติจากผู้ใช้แล้ว) เทสนี้ถูก skip by default — รันด้วย RUN_UAT_SUBMIT_TESTS=1 npx playwright test
  7  | 
  8  | import { test, expect } from '@playwright/test';
  9  | import {
  10 |   login,
  11 |   openCreateTicket,
  12 |   switchToManualMode,
  13 |   fillTicketHeader,
  14 |   closeOpenPopover,
  15 |   pickDate,
  16 | } from '../CreateTicket/_helpers';
  17 | 
  18 | test.describe('Cancel Job', () => {
  19 |   test('Confirming with a reason actually cancels the Job', async ({ page }) => {
  20 |     test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Mutates a real UAT ticket — set RUN_UAT_SUBMIT_TESTS=1 to run');
  21 | 
  22 |     // 1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already).
  23 |     await login(page);
  24 |     await openCreateTicket(page);
  25 |     await switchToManualMode(page);
  26 | 
  27 |     const clientName = `QA Test Client ${Date.now()}`;
  28 |     await fillTicketHeader(page, { client: clientName, product: 'QA CancelJob Product' });
  29 | 
  30 |     await page.getByRole('button', { name: 'Add Job' }).click();
  31 |     await page.getByRole('button', { name: 'Select Package' }).click();
  32 |     await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
  33 |     await closeOpenPopover(page);
  34 | 
  35 |     const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
  36 |     await pickDate(page, periodBtns.nth(0), 1);
  37 |     await pickDate(page, periodBtns.nth(0), 21);
  38 | 
  39 |     await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
  40 |     await page.getByRole('textbox', { name: 'Seconds' }).fill('15');
  41 | 
  42 |     const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
  43 |     await linkBoxes.nth(0).fill('https://example.com/material.jpg');
  44 |     await linkBoxes.nth(1).fill('https://example.com/brief.pdf');
  45 | 
  46 |     await page.getByRole('button', { name: 'Submit ticket' }).click();
  47 |     await page.getByRole('button', { name: 'Confirm' }).click();
  48 |     await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
  49 |     await page.getByRole('button', { name: 'OK' }).click();
  50 | 
  51 |     await page.getByRole('textbox', { name: /Search ticket/ }).fill(clientName);
  52 |     await page.waitForTimeout(600);
  53 |     const row = page.getByRole('row').filter({ hasText: clientName });
  54 |     await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
  55 |     await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/TK-\d+$/);
  56 | 
  57 |     // 2. On its detail page, click the Job's "Cancel" button, select a Cancel Reason, click
  58 |     // "Confirm Cancel".
  59 |     const jobCancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
  60 |     await jobCancelBtn.scrollIntoViewIfNeeded();
  61 |     await jobCancelBtn.click();
  62 | 
  63 |     const dialog = page.getByRole('dialog', { name: 'Cancel Job' });
  64 |     await expect(dialog).toBeVisible();
  65 |     await dialog.getByRole('combobox', { name: 'Cancel Reason' }).selectOption({ label: 'Wrong job created' });
  66 |     await dialog.getByRole('button', { name: 'Confirm Cancel' }).click();
  67 | 
  68 |     // The dialog closes and a success dialog confirms the Job was cancelled.
  69 |     await expect(page.getByRole('heading', { name: 'Job Cancelled' })).toBeVisible();
  70 |     await expect(page.getByText('cancelled successfully', { exact: false })).toBeVisible();
  71 |     await page.getByRole('button', { name: 'OK' }).click();
  72 | 
  73 |     // The Job's status updates to "Cancelled".
> 74 |     await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  75 |   });
  76 | });
  77 | 
```