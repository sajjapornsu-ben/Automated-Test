# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\CreateTicket\11-01-airtime-allocate-carries-job-version-values.spec.ts >> Airtime Allocate cross-page verification >> Job/Version values carry over to the Airtime Allocate page
- Location: Project\Media Control\CreateTicket\11-01-airtime-allocate-carries-job-version-values.spec.ts:12:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Duration 7.5sec')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Duration 7.5sec')

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
      - link "TK-26090075":
        - /url: /mediaApproval/mediaTicket/TK-26090075
    - listitem:
      - link "Airtime Allocate" [disabled]
  - heading "Airtime Allocate" [level=1]
  - paragraph: Allocate Airtime for each Package in the Ticket · TK-26090075
  - button "Expand all"
  - button "Collapse all"
  - button "PlanBTV_80Red Period 01/09/2026 - 21/09/2026 · 1 version Plan 0 Min. 15 Sec. Used 0 Min. 0 Sec."
  - button "Calculate"
  - button "Collapse Package":
    - img
  - table:
    - rowgroup:
      - row "Job No Version Duration Number Spot/Loop (Time) Total Start – End On-Air":
        - columnheader "Job No"
        - columnheader "Version"
        - columnheader "Duration"
        - columnheader "Number Spot/Loop (Time)"
        - columnheader "Total"
        - columnheader "Start – End On-Air"
    - rowgroup:
      - row "JOB-26090075-01 V1 Duration 7.5sec 0 7.5 15 30 45 60 0 sec DD/MM/YYYY → DD/MM/YYYY":
        - cell "JOB-26090075-01"
        - cell "V1"
        - cell "Duration 7.5sec 0 7.5 15 30 45 60":
          - text: Duration 7.5sec
          - slider "Duration": "0"
          - button "7.5"
          - button "15"
          - button "30"
          - button "45"
          - button "60"
        - cell:
          - spinbutton "Number Spot/Loop"
        - cell "0 sec"
        - cell "DD/MM/YYYY → DD/MM/YYYY":
          - button "DD/MM/YYYY":
            - text: DD/MM/YYYY
            - img
          - text: →
          - button "DD/MM/YYYY":
            - text: DD/MM/YYYY
            - img
      - row "Special instructions (optional)":
        - cell "Special instructions (optional)":
          - text: Special instructions (optional)
          - textbox "Add special instructions for V1, e.g. specific on-air time, no competing ads, alternate versions..."
  - button "Save Allocations"
  - text: Total = Durations × Number Spot/Loop (auto-calculated)
```

# Test source

```ts
  1  | // Submit ticket แล้วเปิดหน้า Airtime Allocate ของตั๋วนั้น ค่า Job Duration และ Version Duration ที่ตั้งไว้ตอนสร้างต้องโชว์ถูกต้อง
  2  | // spec: specs/create-ticket-plan.md (11.1, PB-1861)
  3  | // seed: seed.spec.ts
  4  | //
  5  | // หมายเหตุ: เทสนี้ submit ticket จริงบน UAT (ได้รับอนุมัติจากผู้ใช้แล้ว) — ใช้ชื่อ Client
  6  | // ที่มีคำนำหน้า "QA Test Client" พร้อม timestamp
  7  | 
  8  | import { test, expect } from '@playwright/test';
  9  | import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';
  10 | 
  11 | test.describe('Airtime Allocate cross-page verification', () => {
  12 |   test('Job/Version values carry over to the Airtime Allocate page', async ({ page }) => {
  13 |     await login(page);
  14 |     await openCreateTicket(page);
  15 |     await switchToManualMode(page);
  16 | 
  17 |     const clientName = `QA Test Client ${Date.now()}`;
  18 | 
  19 |     // 1. Submit a Manual-mode ticket (Package + Job Duration + Version Duration all known values).
  20 |     await fillTicketHeader(page, { client: clientName, product: 'QA Airtime Product' });
  21 |     await page.getByRole('button', { name: 'Add Job' }).click();
  22 |     await page.getByRole('button', { name: 'Select Package' }).click();
  23 |     await page.getByRole('button', { name: 'PlanBTV_80Red (Plan B TV)', exact: true }).click();
  24 |     await closeOpenPopover(page);
  25 | 
  26 |     const periodBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
  27 |     await pickDate(page, periodBtns.nth(0), 1);
  28 |     await pickDate(page, periodBtns.nth(0), 21);
  29 | 
  30 |     await page.getByRole('textbox', { name: 'Minutes' }).fill('0');
  31 |     await page.getByRole('textbox', { name: 'Seconds' }).fill('15');
  32 | 
  33 |     const linkBoxes = page.getByRole('textbox', { name: 'Paste 1 Link...' });
  34 |     await linkBoxes.nth(0).fill('https://example.com/material.jpg');
  35 |     await linkBoxes.nth(1).fill('https://example.com/brief.pdf');
  36 | 
  37 |     await page.getByRole('button', { name: 'Submit ticket' }).click();
  38 |     await page.getByRole('button', { name: 'Confirm' }).click();
  39 |     await expect(page.getByRole('heading', { name: 'Ticket submitted successfully' })).toBeVisible();
  40 |     await page.getByRole('button', { name: 'OK' }).click();
  41 |     await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket$/);
  42 | 
  43 |     // Open the new ticket, then click "Airtime Allocate".
  44 |     await page.getByRole('textbox', { name: /Search ticket/ }).fill(clientName);
  45 |     await page.waitForTimeout(600);
  46 |     const row = page.getByRole('row').filter({ hasText: clientName });
  47 |     await row.getByRole('link').filter({ hasText: /^TK-/ }).click();
  48 |     await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/TK-\d+$/);
  49 |     await page.getByRole('link', { name: 'Airtime Allocate' }).click();
  50 | 
  51 |     // 2. Verify the Airtime Allocate page.
  52 |     await expect(page).toHaveURL(/\/mediaApproval\/airtimeAllocate\/TK-\d+$/);
  53 | 
  54 |     // The Package summary badge shows "Plan 0 Min. 15 Sec." matching the Job Duration set at creation.
  55 |     await expect(page.getByText('Plan 0 Min. 15 Sec.', { exact: false })).toBeVisible();
  56 | 
  57 |     // The allocation table row has the Version's Duration (7.5sec, the default) pre-selected.
> 58 |     await expect(page.getByText('Duration 7.5sec', { exact: false })).toBeVisible();
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  59 |   });
  60 | });
  61 | 
```