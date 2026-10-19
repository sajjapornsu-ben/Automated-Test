# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\CreateTicket\02-04-media-type-depends-on-group.spec.ts >> Ticket Header >> Media Type options depend on the selected Media Group
- Location: Project\Media Control\CreateTicket\02-04-media-type-depends-on-group.spec.ts:9:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByRole('button', { name: 'Select media type' })
Expected: "Select media type(s)..."
Received: "Select Media Group first..."
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByRole('button', { name: 'Select media type' })
    14 × locator resolved to <button data-rac="" tabindex="0" type="button" data-slot="button" aria-label="Select media type" data-react-aria-pressable="true" id="react-aria4756374641-_r_2r_" class="button button--md button--ghost w-full min-h-9 px-3 py-1.5 bg-white border rounded-lg text-[13px] text-left flex items-center gap-2 hover:border-[#CBD5E1] focus:outline-none focus:border-[#4790FF] transition-colors min-w-0 h-auto justify-start border-[#E2E8F0]">…</button>
       - unexpected value "Select Media Group first..."

```

```yaml
- button "Select media type":
  - text: Select Media Group first...
  - img
```

# Test source

```ts
  1  | // ก่อนเลือก Media Group ช่อง Media Type ต้องเลือกไม่ได้ พอเลือก Group แล้วค่อยเปิดตัวเลือกได้
  2  | // spec: specs/create-ticket-plan.md (2.4, PB-1861)
  3  | // seed: seed.spec.ts
  4  | 
  5  | import { test, expect } from '@playwright/test';
  6  | import { login, openCreateTicket, switchToManualMode } from './_helpers';
  7  | 
  8  | test.describe('Ticket Header', () => {
  9  |   test('Media Type options depend on the selected Media Group', async ({ page }) => {
  10 |     await login(page);
  11 |     await openCreateTicket(page);
  12 |     await switchToManualMode(page);
  13 | 
  14 |     const mediaTypeBtn = page.getByRole('button', { name: 'Select media type' });
> 15 |     await expect(mediaTypeBtn).toHaveText('Select media type(s)...');
     |                                ^ Error: expect(locator).toHaveText(expected) failed
  16 | 
  17 |     // 1. Complete steps from 2.3 (select Category then Group).
  18 |     await page.getByRole('button', { name: 'Select media category' }).click();
  19 |     await page.getByRole('button', { name: 'DIGITAL', exact: true }).click();
  20 |     await page.getByRole('heading', { name: 'Ticket details' }).click();
  21 | 
  22 |     await expect(mediaTypeBtn).toHaveText('Select Media Group first...');
  23 | 
  24 |     await page.getByRole('button', { name: 'Select media group' }).click();
  25 |     await page.getByRole('button', { name: 'Digital', exact: true }).click();
  26 |     await page.getByRole('heading', { name: 'Ticket details' }).click();
  27 | 
  28 |     // 2. Open the Media Type selector.
  29 |     await expect(mediaTypeBtn).toHaveText('Select media type(s)...');
  30 |     await mediaTypeBtn.click();
  31 | 
  32 |     // Media Type becomes enabled only after a Media Group is chosen, and lists options.
  33 |     await expect(page.getByRole('button', { name: 'Plan B TV', exact: true })).toBeVisible();
  34 |   });
  35 | });
  36 | 
```