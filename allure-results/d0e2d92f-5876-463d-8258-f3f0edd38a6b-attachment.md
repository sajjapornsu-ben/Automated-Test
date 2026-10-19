# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\explore.spec.ts >> explore create ticket - select package, quota, version duration, submit validation
- Location: Project\Media Control\explore.spec.ts:38:5

# Error details

```
Error: locator.innerText: Error: strict mode violation: locator('text=Pack').locator('xpath=ancestor::div[2]') resolved to 3 elements:
    1) <div class="flex flex-wrap items-start gap-3 mb-3">…</div> aka locator('div').filter({ hasText: /^Package \*PlanBTV_80Red \(Plan B TV\)$/ }).first()
    2) <div class="flex flex-wrap items-center gap-3">…</div> aka getByText('PackQuota —Duration *')
    3) <div class="flex-1 overflow-auto">…</div> aka getByLabel('Quotation Items', { exact: true }).locator('div').filter({ hasText: 'NoDescription · Qty ·' })

Call log:
  - waiting for locator('text=Pack').locator('xpath=ancestor::div[2]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - img "Plan-B Media" [ref=e8]
      - navigation "Compact navigation" [ref=e9]:
        - button "HOME" [ref=e10] [cursor=pointer]:
          - img [ref=e12]
        - button "DASHBOARD" [ref=e14] [cursor=pointer]:
          - img [ref=e16]
        - button "INVENTORY" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
        - button "SALE" [ref=e22] [cursor=pointer]:
          - img [ref=e24]
        - button "PRODUCTION" [ref=e26] [cursor=pointer]:
          - img [ref=e28]
        - button "CLAIM" [ref=e30] [cursor=pointer]:
          - img [ref=e32]
        - button "MEDIA APPROVAL" [ref=e34] [cursor=pointer]:
          - generic [ref=e35]:
            - img
        - button "REPORT" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]:
            - img
        - button "SETTING" [ref=e38] [cursor=pointer]:
          - generic [ref=e39]:
            - img
      - generic [ref=e41]:
        - generic [ref=e42]: S'
        - button "Log Out" [ref=e43] [cursor=pointer]:
          - img [ref=e44]
    - main [ref=e46]:
      - generic [ref=e47]:
        - button "Toggle sidebar" [ref=e48] [cursor=pointer]:
          - img
        - list "Breadcrumbs" [ref=e49]:
          - listitem [ref=e50]:
            - link "Home" [ref=e51] [cursor=pointer]:
              - /url: /home
            - img [ref=e52]
          - listitem:
            - link "Media Approval":
              - generic: Media Approval
            - img
          - listitem [ref=e54]:
            - link "Media Ticket" [ref=e55] [cursor=pointer]:
              - /url: /mediaApproval/mediaTicket
              - generic [ref=e56]: Media Ticket
            - img [ref=e57]
          - listitem [ref=e59]:
            - link "Create Ticket" [disabled]:
              - generic: Create Ticket
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]:
            - heading "Create Ticket" [level=1] [ref=e65]
            - button "Back to tickets" [ref=e67] [cursor=pointer]:
              - img
              - generic [ref=e68]: Back to tickets
          - generic [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]:
                - generic [ref=e72]:
                  - paragraph [ref=e73]: Search by Quotation Number
                  - button "No Quotation Number" [ref=e74] [cursor=pointer]:
                    - generic [ref=e75]: No Quotation Number
                - generic [ref=e76]:
                  - generic [ref=e77]:
                    - img [ref=e78]
                    - generic [ref=e80]: Manual entry mode — No Quotation Number, fill in details manually
                  - generic [ref=e81]:
                    - generic [ref=e82]:
                      - generic [ref=e83]:
                        - generic [ref=e84]: Sales Person *
                        - generic [ref=e85]: 31/100
                      - textbox "Enter name..." [ref=e86]: Sajjaporn 'Ben' Suksumranpaisan
                    - generic [ref=e87]:
                      - generic [ref=e88]:
                        - generic [ref=e89]: Client *
                        - generic [ref=e90]: 14/100
                      - textbox "Enter client name..." [ref=e91]: QA Test Client
                    - generic [ref=e92]:
                      - generic [ref=e93]:
                        - generic [ref=e94]: Product *
                        - generic [ref=e95]: 15/150
                      - textbox "Enter product name..." [ref=e96]: QA Test Product
                    - generic [ref=e97]:
                      - generic [ref=e98]: Contract Start - End *
                      - generic [ref=e99]:
                        - button "01/09/2026" [ref=e102] [cursor=pointer]:
                          - generic [ref=e103]: 01/09/2026
                          - img [ref=e105]
                        - generic [ref=e107]: →
                        - button "30/09/2026" [ref=e110] [cursor=pointer]:
                          - generic [ref=e111]: 30/09/2026
                          - img [ref=e113]
                    - generic [ref=e115]:
                      - generic [ref=e116]: Contract Period (auto-calculated)
                      - generic [ref=e117]: 1 เดือน
                    - generic [ref=e118]:
                      - generic [ref=e119]: Media Category * (multiple selection)
                      - button "Select media category" [ref=e121] [cursor=pointer]:
                        - generic "DIGITAL" [ref=e123]:
                          - generic [ref=e124]: DIGITAL
                        - img
                    - generic [ref=e125]:
                      - generic [ref=e126]: Media Group * (multiple selection - depends on Category)
                      - button "Select media group" [ref=e128] [cursor=pointer]:
                        - generic "Digital" [ref=e130]:
                          - generic [ref=e131]: Digital
                        - img
                    - generic [ref=e132]:
                      - generic [ref=e133]: Media Type * (multiple selection)
                      - button "Select media type" [ref=e135] [cursor=pointer]:
                        - generic "Plan B TV" [ref=e137]:
                          - generic [ref=e138]: Plan B TV
                        - img
                    - generic [ref=e139]:
                      - generic [ref=e140]: CS Support (multiple selection)
                      - button "Select CS Support" [ref=e142] [cursor=pointer]:
                        - generic [ref=e144]: Select CS Support...
                        - img
              - generic [ref=e145]:
                - generic [ref=e146]:
                  - generic [ref=e147]:
                    - heading "Ticket details" [level=3] [ref=e148]
                    - paragraph [ref=e149]: Click "Add Job" to add a Job
                  - button "Add Job" [ref=e150] [cursor=pointer]:
                    - img
                    - generic [ref=e151]: Add Job
                - generic [ref=e153]:
                  - generic [ref=e154]:
                    - generic [ref=e155]:
                      - generic [ref=e156]: 1 version
                      - generic [ref=e157]:
                        - button "Add Version" [ref=e158] [cursor=pointer]:
                          - img
                          - text: Add Version
                        - button "Remove this Job" [ref=e159] [cursor=pointer]:
                          - img
                    - generic [ref=e161]:
                      - generic [ref=e162]: Package *
                      - button "Select Package" [ref=e164] [cursor=pointer]:
                        - generic [ref=e165]: PlanBTV_80Red (Plan B TV)
                        - img
                    - generic [ref=e166]:
                      - generic [ref=e167]:
                        - generic [ref=e168]: Pack
                        - textbox "Pack Quantity" [ref=e169]: "1"
                        - generic "Version Quota = (Pack × 3) × number of months (rounded up)" [ref=e170]: Quota —
                      - generic [ref=e171]:
                        - generic [ref=e172]: Duration *
                        - generic [ref=e173]:
                          - textbox "Minutes" [ref=e174]:
                            - /placeholder: "0"
                          - generic: min
                        - generic [ref=e175]:
                          - textbox "Seconds" [ref=e176]:
                            - /placeholder: "00"
                          - generic: sec
                      - generic [ref=e177]:
                        - generic [ref=e178]: Period *
                        - button "DD/MM/YYYY" [ref=e180] [cursor=pointer]:
                          - generic [ref=e181]: DD/MM/YYYY
                          - img [ref=e183]
                        - generic [ref=e185]: –
                        - button "DD/MM/YYYY" [ref=e187] [cursor=pointer]:
                          - generic [ref=e188]: DD/MM/YYYY
                          - img [ref=e190]
                  - generic [ref=e193]:
                    - generic [ref=e194]:
                      - generic [ref=e195]:
                        - generic [ref=e196]: Version 1
                        - generic [ref=e197]: Draft
                      - button "Remove version" [ref=e198] [cursor=pointer]:
                        - img
                    - generic [ref=e199]:
                      - generic [ref=e200]:
                        - generic [ref=e201]:
                          - generic [ref=e202]:
                            - generic [ref=e203] [cursor=pointer]: Duration *
                            - generic [ref=e204]:
                              - button "7.5 seconds Select duration" [ref=e205] [cursor=pointer]:
                                - generic [ref=e206]: 7.5 seconds
                                - img [ref=e207]
                              - combobox [ref=e211] [cursor=pointer]
                          - generic [ref=e212]:
                            - generic [ref=e213] [cursor=pointer]: Nickname
                            - textbox "Nickname" [ref=e214]:
                              - /placeholder: Version nickname...
                            - generic [ref=e215]: 0/60
                        - generic [ref=e216]:
                          - generic [ref=e217]: Material *
                          - generic [ref=e218]:
                            - generic [ref=e219]:
                              - generic [ref=e220]: Enter a Link or attach a file
                              - generic [ref=e221]: 0/500
                            - textbox "Paste 1 Link..." [ref=e222]
                            - button "Click to upload or drag and drop Multiple files · Max 50 MB total 0B / 50 MB" [ref=e224] [cursor=pointer]:
                              - img [ref=e225]
                              - generic [ref=e227]:
                                - generic [ref=e228]: Click to upload or drag and drop
                                - generic [ref=e229]: Multiple files · Max 50 MB total
                              - generic [ref=e230]: 0B / 50 MB
                        - generic [ref=e231]:
                          - generic [ref=e232]: Brief *
                          - generic [ref=e233]:
                            - generic [ref=e234]:
                              - generic [ref=e235]: Enter a Link or attach a file
                              - generic [ref=e236]: 0/500
                            - textbox "Paste 1 Link..." [ref=e237]
                            - button "Click to upload or drag and drop Multiple files · Max 50 MB total 0B / 50 MB" [ref=e239] [cursor=pointer]:
                              - img [ref=e240]
                              - generic [ref=e242]:
                                - generic [ref=e243]: Click to upload or drag and drop
                                - generic [ref=e244]: Multiple files · Max 50 MB total
                              - generic [ref=e245]: 0B / 50 MB
                      - generic [ref=e246]:
                        - generic [ref=e247]:
                          - generic [ref=e248]:
                            - img [ref=e249]
                            - generic [ref=e251]: Note
                          - generic [ref=e252]: 0/500
                        - textbox "Add notes for this version..." [ref=e253]
            - generic [ref=e255]:
              - heading "Ticket summary" [level=3] [ref=e256]
              - generic [ref=e257]:
                - generic [ref=e258]:
                  - generic [ref=e259]: Client
                  - generic "QA Test Client" [ref=e260]
                - generic [ref=e261]:
                  - generic [ref=e262]: Product
                  - generic "QA Test Product" [ref=e263]
                - generic [ref=e264]:
                  - generic [ref=e265]: Media
                  - generic "Plan B TV" [ref=e266]
                - generic [ref=e267]:
                  - generic [ref=e268]: PB Number
                  - generic "Manual" [ref=e269]
              - generic [ref=e270]:
                - generic [ref=e271]: Versions
                - generic [ref=e273]:
                  - generic [ref=e274]: PlanBTV_80Red
                  - generic [ref=e275]: 1 ver.
              - generic [ref=e276]:
                - button "Submit ticket" [ref=e277] [cursor=pointer]
                - button "Save as draft" [ref=e278] [cursor=pointer]
        - complementary [ref=e279]:
          - generic [ref=e280]:
            - img [ref=e282]
            - generic [ref=e284]:
              - generic [ref=e285]: Quotation Items
              - generic [ref=e286]: 10 items · Total 15,178,744.00 THB
            - button [ref=e287] [cursor=pointer]:
              - img [ref=e288]
          - table [ref=e291]:
            - rowgroup [ref=e292]:
              - row [ref=e293]:
                - columnheader [ref=e294]: "No"
                - columnheader [ref=e295]: Description · Qty · Period
                - columnheader [ref=e296]: Fee / Disc / Net / Total
            - rowgroup [ref=e297]:
              - row [ref=e298]:
                - cell [ref=e299]: C02001-36A-P001
                - cell [ref=e300]:
                  - generic [ref=e301]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e302]:
                    - generic [ref=e303]: "Qty: 1.00 PACK"
                    - generic [ref=e304]: "Dur: 0.50 Month"
                    - generic [ref=e305]: "Period: 01/05/26 - 15/05/26"
                - cell [ref=e306]:
                  - generic [ref=e307]: 1,375,000.00
                  - generic [ref=e308]:
                    - generic [ref=e309]: "Net: 2,750,000.00"
                    - generic [ref=e310]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e311]: "-25.47%"
              - row [ref=e312]:
                - cell [ref=e313]: A02003-01M-P083
                - cell [ref=e314]:
                  - generic [ref=e315]: L-BK-ECD-22A ค่าสื่อโฆษณา Unipole ทางด่วนเฉลิมมหานคร - ดินแดง มักกะสัน มุ่งหน้าพระราม 4
                  - generic [ref=e316]:
                    - generic [ref=e317]: "Qty: 1.00 PACK"
                    - generic [ref=e318]: "Dur: 5.00 Month"
                    - generic [ref=e319]: "Period: 01/05/26 - 30/09/26"
                - cell [ref=e320]:
                  - generic [ref=e321]: 1,600,000.00
                  - generic [ref=e322]:
                    - generic [ref=e323]: "Net: 320,000.00"
                    - generic [ref=e324]:
                      - text: "Fee: 400,000.00 ·"
                      - generic [ref=e325]: "-20.00%"
              - row [ref=e326]:
                - cell [ref=e327]: A02003-01P-P139
                - cell [ref=e328]:
                  - generic [ref=e329]: L-BK-RM4-20A ค่าผลิตสื่อโฆษณา Unipole ถนนพระราม 4 (สะพานไทย-ญี่ปุ่น)
                  - generic [ref=e330]:
                    - generic [ref=e331]: "Qty: 1.00 PACK"
                    - generic [ref=e332]: "Dur: 1.00 TIME"
                    - generic [ref=e333]: "Period: 01/05/26 - 01/05/26"
                - cell [ref=e334]:
                  - generic [ref=e335]: 96,000.00
                  - generic [ref=e336]:
                    - generic [ref=e337]: "Net: 96,000.00"
                    - generic [ref=e338]:
                      - text: "Fee: 96,000.00 ·"
                      - generic [ref=e339]: "-0.00%"
              - row [ref=e340]:
                - cell [ref=e341]: A02024-01P-P324
                - cell [ref=e342]:
                  - generic [ref=e343]: L-BK-RM4-5 ค่าผลิตสื่อโฆษณา Unipole ถนนพระราม 4 (ท้ายซอยสุขุมวิท 24)
                  - generic [ref=e344]:
                    - generic [ref=e345]: "Qty: 1.00 PACK"
                    - generic [ref=e346]: "Dur: 1.00 TIME"
                    - generic [ref=e347]: "Period: 01/05/26 - 01/05/26"
                - cell [ref=e348]:
                  - generic [ref=e349]: 89,544.00
                  - generic [ref=e350]:
                    - generic [ref=e351]: "Net: 89,544.00"
                    - generic [ref=e352]:
                      - text: "Fee: 89,544.00 ·"
                      - generic [ref=e353]: "-0.00%"
              - row [ref=e354]:
                - cell [ref=e355]: A02003-01P-P120
                - cell [ref=e356]:
                  - generic [ref=e357]: L-BK-ECD-24A ค่าผลิตสื่อโฆษณา Unipole ทางด่วนเฉลิมมหานคร (มักกะสัน) มุ่งหน้าพระราม 4
                  - generic [ref=e358]:
                    - generic [ref=e359]: "Qty: 1.00 PACK"
                    - generic [ref=e360]: "Dur: 1.00 TIME"
                    - generic [ref=e361]: "Period: 01/05/26 - 01/05/26"
                - cell [ref=e362]:
                  - generic [ref=e363]: 268,200.00
                  - generic [ref=e364]:
                    - generic [ref=e365]: "Net: 268,200.00"
                    - generic [ref=e366]:
                      - text: "Fee: 268,200.00 ·"
                      - generic [ref=e367]: "-0.00%"
              - row [ref=e368]:
                - cell [ref=e369]: A02003-01M-P139
                - cell [ref=e370]:
                  - generic [ref=e371]: L-BK-RM4-20A ค่าสื่อโฆษณา Unipole ถนนพระราม 4 (สะพานไทย-ญี่ปุ่น)
                  - generic [ref=e372]:
                    - generic [ref=e373]: "Qty: 1.00 PACK"
                    - generic [ref=e374]: "Dur: 5.00 Month"
                    - generic [ref=e375]: "Period: 01/05/26 - 30/09/26"
                - cell [ref=e376]:
                  - generic [ref=e377]: 1,200,000.00
                  - generic [ref=e378]:
                    - generic [ref=e379]: "Net: 240,000.00"
                    - generic [ref=e380]:
                      - text: "Fee: 300,000.00 ·"
                      - generic [ref=e381]: "-20.00%"
              - row [ref=e382]:
                - cell [ref=e383]: C02001-36A-P001
                - cell [ref=e384]:
                  - generic [ref=e385]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e386]:
                    - generic [ref=e387]: "Qty: 1.00 PACK"
                    - generic [ref=e388]: "Dur: 0.50 Month"
                    - generic [ref=e389]: "Period: 16/05/26 - 31/05/26"
                - cell [ref=e390]:
                  - generic [ref=e391]: 1,375,000.00
                  - generic [ref=e392]:
                    - generic [ref=e393]: "Net: 2,750,000.00"
                    - generic [ref=e394]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e395]: "-25.47%"
              - row [ref=e396]:
                - cell [ref=e397]: A02002-02M-P014
                - cell [ref=e398]:
                  - generic [ref=e399]: ค่าสื่อโฆษณา Gateway Billboard-ประชาชื่น(v)
                  - generic [ref=e400]:
                    - generic [ref=e401]: "Qty: 1.00 PACK"
                    - generic [ref=e402]: "Dur: 3.50 Month"
                    - generic [ref=e403]: "Period: 01/06/26 - 15/09/26"
                - cell [ref=e404]:
                  - generic [ref=e405]: 3,675,000.00
                  - generic [ref=e406]:
                    - generic [ref=e407]: "Net: 1,050,000.00"
                    - generic [ref=e408]:
                      - text: "Fee: 1,400,000.00 ·"
                      - generic [ref=e409]: "-25.00%"
              - row [ref=e410]:
                - cell [ref=e411]: C02001-36A-P001
                - cell [ref=e412]:
                  - generic [ref=e413]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e414]:
                    - generic [ref=e415]: "Qty: 1.00 PACK"
                    - generic [ref=e416]: "Dur: 1.00 Month"
                    - generic [ref=e417]: "Period: 01/09/26 - 30/09/26"
                - cell [ref=e418]:
                  - generic [ref=e419]: 2,750,000.00
                  - generic [ref=e420]:
                    - generic [ref=e421]: "Net: 2,750,000.00"
                    - generic [ref=e422]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e423]: "-25.47%"
              - row [ref=e424]:
                - cell [ref=e425]: C02001-36A-P001
                - cell [ref=e426]:
                  - generic [ref=e427]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e428]:
                    - generic [ref=e429]: "Qty: 1.00 PACK"
                    - generic [ref=e430]: "Dur: 1.00 Month"
                    - generic [ref=e431]: "Period: 01/11/26 - 30/11/26"
                - cell [ref=e432]:
                  - generic [ref=e433]: 2,750,000.00
                  - generic [ref=e434]:
                    - generic [ref=e435]: "Net: 2,750,000.00"
                    - generic [ref=e436]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e437]: "-25.47%"
          - generic [ref=e438]:
            - generic [ref=e439]: Grand Total
            - generic [ref=e440]: 15,178,744.00
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { login, openMediaTicket } from './MediaTicket/_helpers';
  3  | 
  4  | async function fillHeader(page) {
  5  |   await page.getByRole('button', { name: 'No Quotation Number' }).click();
  6  |   await page.waitForTimeout(500);
  7  |   await page.getByRole('textbox', { name: 'Enter client name...' }).fill('QA Test Client');
  8  |   await page.getByRole('textbox', { name: 'Enter product name...' }).fill('QA Test Product');
  9  |   const dateRow = page.locator('text=Contract Start').locator('xpath=ancestor::div[3]');
  10 |   await dateRow.getByRole('button').nth(0).click();
  11 |   await page.waitForTimeout(300);
  12 |   await page.getByRole('button', { name: '1', exact: true }).click();
  13 |   await page.waitForTimeout(300);
  14 |   await dateRow.getByRole('button').nth(1).click();
  15 |   await page.waitForTimeout(300);
  16 |   await page.getByRole('button', { name: '30', exact: true }).click();
  17 |   await page.waitForTimeout(300);
  18 |   await page.getByRole('button', { name: 'Select media category' }).click();
  19 |   await page.waitForTimeout(300);
  20 |   await page.getByRole('button', { name: 'DIGITAL', exact: true }).click();
  21 |   await page.keyboard.press('Escape');
  22 |   await page.waitForTimeout(300);
  23 |   const mediaGroupBtn = page.locator('text=Media Group').first().locator('xpath=following::button[1]');
  24 |   await mediaGroupBtn.click();
  25 |   await page.waitForTimeout(300);
  26 |   await page.getByRole('button', { name: 'Digital', exact: true }).click();
  27 |   await page.keyboard.press('Escape');
  28 |   await page.waitForTimeout(300);
  29 |   const mediaTypeBtn = page.locator('text=Media Type').first().locator('xpath=following::button[1]');
  30 |   await mediaTypeBtn.click();
  31 |   await page.waitForTimeout(300);
  32 |   await page.getByRole('button', { name: 'Plan B TV', exact: true }).click();
  33 |   await page.waitForTimeout(200);
  34 |   await page.getByRole('heading', { name: 'Ticket details' }).click();
  35 |   await page.waitForTimeout(300);
  36 | }
  37 | 
  38 | test('explore create ticket - select package, quota, version duration, submit validation', async ({ page }) => {
  39 |   await login(page);
  40 |   await openMediaTicket(page);
  41 |   await page.getByRole('button', { name: 'Toggle sidebar' }).click().catch(() => {});
  42 |   await page.getByRole('link', { name: 'Create Ticket' }).click();
  43 |   await page.waitForTimeout(800);
  44 |   await fillHeader(page);
  45 | 
  46 |   await page.getByRole('button', { name: 'Add Job' }).click();
  47 |   await page.waitForTimeout(600);
  48 | 
  49 |   await page.getByRole('button', { name: 'Select Package' }).click();
  50 |   await page.waitForTimeout(400);
  51 |   await page.getByText('PlanBTV_80Red (Plan B TV)', { exact: true }).click();
  52 |   await page.waitForTimeout(400);
  53 |   console.log('=== after selecting package ===');
> 54 |   console.log(await page.locator('text=Pack').locator('xpath=ancestor::div[2]').innerText());
     |                                                                                 ^ Error: locator.innerText: Error: strict mode violation: locator('text=Pack').locator('xpath=ancestor::div[2]') resolved to 3 elements:
  55 | 
  56 |   console.log('=== Version Duration dropdown options ===');
  57 |   await page.getByRole('button', { name: /Select duration/ }).click();
  58 |   await page.waitForTimeout(300);
  59 |   const bodyText = await page.locator('body').innerText();
  60 |   const idx = bodyText.indexOf('seconds');
  61 |   console.log(bodyText.slice(Math.max(0, idx - 100), idx + 300));
  62 |   await page.keyboard.press('Escape');
  63 | 
  64 |   console.log('=== Submit without filling required fields (job duration, period, material/brief) ===');
  65 |   await page.getByRole('button', { name: 'Submit ticket' }).click();
  66 |   await page.waitForTimeout(800);
  67 |   await page.screenshot({ path: 'C:\\Users\\SAJJAP~1.SU\\AppData\\Local\\Temp\\claude\\c--Users-sajjaporn-su-Desktop-my-playwright-test\\d534f6b9-c8e2-41fb-bcfd-d2cd04858577\\scratchpad\\ct-validation.png', fullPage: true });
  68 |   console.log('URL after failed submit:', page.url());
  69 | });
  70 | 
```