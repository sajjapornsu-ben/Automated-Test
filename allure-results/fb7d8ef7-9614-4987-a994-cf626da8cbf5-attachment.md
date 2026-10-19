# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\CreateTicket\02-02-contract-period-auto-calculates.spec.ts >> Ticket Header >> Contract Period auto-calculates from Start/End dates
- Location: Project\Media Control\CreateTicket\02-02-contract-period-auto-calculates.spec.ts:9:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('label').filter({ hasText: 'Contract Period' }).locator('xpath=following-sibling::div[1]')
Expected: "—"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('label').filter({ hasText: 'Contract Period' }).locator('xpath=following-sibling::div[1]')

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
      - link "Create Ticket" [disabled]
  - heading "Create Ticket" [level=1]
  - button "Back to tickets":
    - img
    - text: Back to tickets
  - paragraph: Search by Quotation Number
  - button "No Quotation Number"
  - img
  - text: Manual entry mode — No Quotation Number, fill in details manually Sales Person * 31/100
  - textbox "Enter name...": Sajjaporn 'Ben' Suksumranpaisan
  - text: Client * 0/100
  - textbox "Enter client name..."
  - text: Product * 0/150
  - textbox "Enter product name..."
  - text: Contract Start - End *
  - button "DD/MM/YYYY":
    - text: DD/MM/YYYY
    - img
  - text: →
  - button "DD/MM/YYYY":
    - text: DD/MM/YYYY
    - img
  - text: Contract Period (auto-calculated) — Media Category * (multiple selection)
  - button "Select media category":
    - text: Select media category(s)...
    - img
  - text: Media Group * (multiple selection - depends on Category)
  - button "Select media group":
    - text: Select Media Category first...
    - img
  - text: Media Type * (multiple selection)
  - button "Select media type":
    - text: Select Media Group first...
    - img
  - text: CS Support (multiple selection)
  - button "Select CS Support":
    - text: Select CS Support...
    - img
  - heading "Ticket details" [level=3]
  - paragraph: Click "Add Job" to add a Job
  - button "Add Job":
    - img
    - text: Add Job
  - img
  - text: No Jobs yet Click the Add Job button in the top-right corner to get started
  - heading "Ticket summary" [level=3]
  - text: Client — Product — Media — PB Number Manual Versions No versions added yet
  - button "Submit ticket"
  - button "Save as draft"
```

# Test source

```ts
  1  | // เลือกวันที่ Contract Start - End แล้ว ช่อง Contract Period (read-only) ต้องคำนวณให้อัตโนมัติ
  2  | // spec: specs/create-ticket-plan.md (2.2, PB-1861)
  3  | // seed: seed.spec.ts
  4  | 
  5  | import { test, expect } from '@playwright/test';
  6  | import { login, openCreateTicket, switchToManualMode, pickDate } from './_helpers';
  7  | 
  8  | test.describe('Ticket Header', () => {
  9  |   test('Contract Period auto-calculates from Start/End dates', async ({ page }) => {
  10 |     await login(page);
  11 |     await openCreateTicket(page);
  12 |     await switchToManualMode(page);
  13 | 
  14 |     const contractPeriod = page.locator('label', { hasText: 'Contract Period' }).locator('xpath=following-sibling::div[1]');
> 15 |     await expect(contractPeriod).toHaveText('—');
     |                                  ^ Error: expect(locator).toHaveText(expected) failed
  16 | 
  17 |     // 1. Switch to Manual mode. (done above)
  18 |     // 2. Pick a Contract Start date and a Contract End date about a month apart.
  19 |     const dateButtons = page.getByRole('button', { name: 'DD/MM/YYYY' });
  20 |     await pickDate(page, dateButtons.nth(0), 1);
  21 |     await pickDate(page, dateButtons.nth(0), 28);
  22 | 
  23 |     // The read-only "Contract Period" field updates to show a calculated duration.
  24 |     await expect(contractPeriod).not.toHaveText('—');
  25 |   });
  26 | });
  27 | 
```