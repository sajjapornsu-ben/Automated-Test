# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\CreateTicket\05-02-submit-blocked-missing-material-brief.spec.ts >> Validation >> Submitting with a missing Material or Brief is blocked
- Location: Project\Media Control\CreateTicket\05-02-submit-blocked-missing-material-brief.spec.ts:12:7

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: getByRole('textbox', { name: 'Paste 1 Link...' }).first()
Expected pattern: /border-rose-400/
Received string:  "input input--primary w-full h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-md text-[12px] focus:outline-none focus:border-[#4790FF]"
Timeout: 5000ms

Call log:
  - Expect "toHaveClass" with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'Paste 1 Link...' }).first()
    14 × locator resolved to <input value="" data-rac="" type="text" maxlength="500" data-slot="input" aria-invalid="true" data-invalid="true" placeholder="Paste 1 Link..." class="input input--primary w-full h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-md text-[12px] focus:outline-none focus:border-[#4790FF]"/>
       - unexpected value "input input--primary w-full h-8 px-2.5 bg-white border border-[#E2E8F0] rounded-md text-[12px] focus:outline-none focus:border-[#4790FF]"

```

```yaml
- textbox "Paste 1 Link..."
```

# Test source

```ts
  1  | // Submit ticket โดยไม่กรอก Material (Brief ก็ยังว่างเช่นกัน) ต้องถูกบล็อกด้วย dialog แจ้งเตือน
  2  | // spec: specs/create-ticket-plan.md (5.2, PB-1861)
  3  | // seed: seed.spec.ts
  4  | //
  5  | // หมายเหตุ: ระบบเช็คทีละ field (หยุดที่ข้อผิดพลาดแรกที่เจอ) — เมื่อทั้ง Material และ Brief ว่าง
  6  | // พร้อมกัน ข้อความที่ขึ้นจะเป็นของ Material ก่อนเสมอ (ตรวจสอบจริงแล้ว)
  7  | 
  8  | import { test, expect } from '@playwright/test';
  9  | import { login, openCreateTicket, switchToManualMode, fillTicketHeader, closeOpenPopover, pickDate } from './_helpers';
  10 | 
  11 | test.describe('Validation', () => {
  12 |   test('Submitting with a missing Material or Brief is blocked', async ({ page }) => {
  13 |     await login(page);
  14 |     await openCreateTicket(page);
  15 |     await switchToManualMode(page);
  16 |     await fillTicketHeader(page, { client: 'QA Val Material Client', product: 'QA Val Material Product' });
  17 | 
  18 |     // 1. Add a Job with Package/Duration/Period set, and a Version with Duration set —
  19 |     // but leave Material and Brief both empty.
  20 |     await page.getByRole('button', { name: 'Add Job' }).click();
  21 | 
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
  33 |     // 2. Click "Submit ticket".
  34 |     await page.getByRole('button', { name: 'Submit ticket' }).click();
  35 | 
  36 |     // Submission is blocked with an error indicating Material is required.
  37 |     await expect(page.getByRole('heading', { name: 'Something Went Wrong' })).toBeVisible();
  38 |     await expect(page.getByText('Please provide Material (link or attached file) for every Version')).toBeVisible();
  39 | 
  40 |     const materialLinkBox = page.getByRole('textbox', { name: 'Paste 1 Link...' }).first();
> 41 |     await expect(materialLinkBox).toHaveClass(/border-rose-400/);
     |                                   ^ Error: expect(locator).toHaveClass(expected) failed
  42 | 
  43 |     await page.getByRole('button', { name: 'OK' }).click();
  44 | 
  45 |     // The ticket is not created (URL stays on the Create Ticket page).
  46 |     await expect(page).toHaveURL(/\/mediaApproval\/mediaTicket\/create/);
  47 |   });
  48 | });
  49 | 
```