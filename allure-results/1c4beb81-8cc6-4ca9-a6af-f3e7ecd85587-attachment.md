# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: Project\Media Control\TicketDetail\explore.spec.ts >> explore add job save + cancel job confirm
- Location: Project\Media Control\TicketDetail\explore.spec.ts:17:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'DD/MM/YYYY' }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e6]:
        - img "Plan-B Media" [ref=e8]
        - generic [ref=e9]: Media Control System
      - navigation "Main navigation" [ref=e10]:
        - link "HOME" [ref=e11] [cursor=pointer]:
          - /url: /home
          - img [ref=e13]
          - generic [ref=e15]: HOME
        - link "DASHBOARD" [ref=e16] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e18]
          - generic [ref=e20]: DASHBOARD
        - link "INVENTORY" [ref=e21] [cursor=pointer]:
          - /url: /inventory
          - img [ref=e23]
          - generic [ref=e25]: INVENTORY
        - link "SALE" [ref=e26] [cursor=pointer]:
          - /url: /sale
          - img [ref=e28]
          - generic [ref=e30]: SALE
        - link "PRODUCTION" [ref=e31] [cursor=pointer]:
          - /url: /production
          - img [ref=e33]
          - generic [ref=e35]: PRODUCTION
        - link "CLAIM" [ref=e36] [cursor=pointer]:
          - /url: /claim
          - img [ref=e38]
          - generic [ref=e40]: CLAIM
        - generic [ref=e41]:
          - button "MEDIA APPROVAL" [ref=e42] [cursor=pointer]:
            - img [ref=e44]
            - generic [ref=e46]: MEDIA APPROVAL
            - img [ref=e47]
          - generic [ref=e51]:
            - link "Dashboard" [ref=e52] [cursor=pointer]:
              - /url: /mediaApproval/dashboard
              - generic [ref=e54]: Dashboard
            - link "Media Ticket" [ref=e55] [cursor=pointer]:
              - /url: /mediaApproval/mediaTicket
              - generic [ref=e57]: Media Ticket
            - link "Assign Ticket" [ref=e58] [cursor=pointer]:
              - /url: /mediaApproval/assignTicket
              - generic [ref=e60]: Assign Ticket
            - link "Verify & Production" [ref=e61] [cursor=pointer]:
              - /url: /mediaApproval/productionReview
              - generic [ref=e63]: Verify & Production
            - link "Media Management" [ref=e64] [cursor=pointer]:
              - /url: /mediaApproval/mediaManagement
              - generic [ref=e66]: Media Management
        - generic [ref=e67]:
          - button "REPORT" [ref=e68] [cursor=pointer]:
            - img [ref=e70]
            - generic [ref=e72]: REPORT
            - img [ref=e73]
          - generic [ref=e75]:
            - link "KPI Dashboard" [ref=e76] [cursor=pointer]:
              - /url: /report/kpiDashboard
              - generic [ref=e78]: KPI Dashboard
            - link "Export Airtime" [ref=e79] [cursor=pointer]:
              - /url: /report/exportAirtime
              - generic [ref=e81]: Export Airtime
            - link "Monthly Report" [ref=e82] [cursor=pointer]:
              - /url: /report/monthlyReport
              - generic [ref=e84]: Monthly Report
            - link "Audit Log" [ref=e85] [cursor=pointer]:
              - /url: /report/auditLog
              - generic [ref=e87]: Audit Log
        - generic [ref=e88]:
          - button "SETTING" [ref=e89] [cursor=pointer]:
            - img [ref=e91]
            - generic [ref=e93]: SETTING
            - img [ref=e94]
          - generic [ref=e96]:
            - link "User Management" [ref=e97] [cursor=pointer]:
              - /url: /settings/userManagement
              - generic [ref=e99]: User Management
            - link "User Group Management" [ref=e100] [cursor=pointer]:
              - /url: /settings/userGroupManagement
              - generic [ref=e102]: User Group Management
            - link "Email Setup" [ref=e103] [cursor=pointer]:
              - /url: /settings/emailSetup
              - generic [ref=e105]: Email Setup
            - link "Email Template" [ref=e106] [cursor=pointer]:
              - /url: /settings/emailTemplate
              - generic [ref=e108]: Email Template
            - link "UI Kit" [ref=e109] [cursor=pointer]:
              - /url: /ui-kit
              - generic [ref=e111]: UI Kit
            - link "Master Data" [ref=e112] [cursor=pointer]:
              - /url: /settings/masterData
              - generic [ref=e114]: Master Data
      - generic [ref=e116]:
        - generic [ref=e117]: S'
        - generic [ref=e118]:
          - generic [ref=e119]: Sajjaporn 'Ben' Suksumranpaisan
          - generic [ref=e120]: sajjaporn.su@planbmedia.co.th
        - button "Log Out" [ref=e121] [cursor=pointer]:
          - img [ref=e122]
    - main [ref=e124]:
      - generic [ref=e125]:
        - button "Toggle sidebar" [ref=e126] [cursor=pointer]:
          - img
        - list "Breadcrumbs" [ref=e127]:
          - listitem [ref=e128]:
            - link "Home" [ref=e129] [cursor=pointer]:
              - /url: /home
            - img [ref=e130]
          - listitem:
            - link "Media Approval":
              - generic: Media Approval
            - img
          - listitem [ref=e132]:
            - link "Media Ticket" [ref=e133] [cursor=pointer]:
              - /url: /mediaApproval/mediaTicket
              - generic [ref=e134]: Media Ticket
            - img [ref=e135]
          - listitem [ref=e137]:
            - link "TK-26090098" [disabled]:
              - generic: TK-26090098
      - generic [ref=e139]:
        - generic [ref=e140]:
          - generic [ref=e141]:
            - generic [ref=e142]:
              - heading "QA TicketDetail Product" [level=1] [ref=e143]
              - paragraph [ref=e144]: QA Test Client 1790219977987 · Manual Entry
            - generic [ref=e145]:
              - generic [ref=e146]: Assign
              - link "Airtime Allocate" [ref=e148] [cursor=pointer]:
                - /url: /mediaApproval/airtimeAllocate/TK-26090098
                - img [ref=e149]
                - generic [ref=e151]: Airtime Allocate
              - button "History" [ref=e152] [cursor=pointer]:
                - img
                - generic [ref=e153]: History
              - button "Back" [ref=e154] [cursor=pointer]:
                - img
                - generic [ref=e155]: Back
          - group [ref=e157]:
            - generic "Ticket Information" [ref=e158] [cursor=pointer]:
              - generic [ref=e159]:
                - img [ref=e161]
                - heading "Ticket Information" [level=3] [ref=e163]
              - img [ref=e164]
            - generic [ref=e166]:
              - generic [ref=e167]:
                - generic [ref=e170]: Ticket
                - generic [ref=e171]:
                  - generic [ref=e172]:
                    - generic [ref=e173]: Ticket No
                    - generic [ref=e174]: TK-26090098
                  - generic [ref=e175]:
                    - generic [ref=e176]: Quotation No.
                    - generic [ref=e177]: — None (Manual Entry)
                  - generic [ref=e178]:
                    - generic [ref=e179]:
                      - img [ref=e180]
                      - generic [ref=e182]: Manual Entry — No Quotation Yet
                    - generic [ref=e183]: This ticket was created manually. Search for a Quotation from Salesforce to sync the data.
                    - generic [ref=e184]:
                      - generic [ref=e185]:
                        - img
                        - textbox "ค้นหา PB202604521" [ref=e186]
                      - button "Sync" [ref=e187] [cursor=pointer]
                    - generic [ref=e188]: The system will automatically pull Client, Product, and Period from Salesforce.
                  - generic [ref=e189]:
                    - generic [ref=e190]: Sales Person
                    - generic [ref=e191]: Sajjaporn 'Ben' Suksumranpaisan
                  - generic [ref=e192]:
                    - generic [ref=e193]: CS Support
                    - generic [ref=e194]: —
              - generic [ref=e195]:
                - generic [ref=e198]: Customer & Media
                - generic [ref=e199]:
                  - generic [ref=e200]:
                    - generic [ref=e201]: Client
                    - generic [ref=e202]: QA Test Client 1790219977987
                  - generic [ref=e203]:
                    - generic [ref=e204]: Product
                    - generic [ref=e205]: QA TicketDetail Product
                  - generic [ref=e206]:
                    - generic [ref=e207]: Media Group
                    - generic [ref=e209]: Digital
                  - generic [ref=e210]:
                    - generic [ref=e211]: Media Type
                    - generic [ref=e212]: Plan B TV
              - generic [ref=e213]:
                - generic [ref=e216]: Schedule
                - generic [ref=e217]:
                  - generic [ref=e218]:
                    - generic [ref=e219]: Contract Start
                    - generic [ref=e220]: 01/09/2026
                  - generic [ref=e221]:
                    - generic [ref=e222]: Contract End
                    - generic [ref=e223]: 28/09/2026
                  - generic [ref=e224]:
                    - generic [ref=e225]: Contract Period
                    - generic [ref=e226]:
                      - img [ref=e227]
                      - generic [ref=e229]: 28 วัน
          - generic [ref=e230]:
            - generic [ref=e231]:
              - generic [ref=e232]:
                - heading "Jobs" [level=3] [ref=e233]
                - generic [ref=e234]: 1 job
              - button "Add Job" [disabled]:
                - img
                - generic: Add Job
            - generic [ref=e236]:
              - generic [ref=e237]:
                - generic [ref=e238]:
                  - generic [ref=e239]: New Job
                  - generic [ref=e240]: New · Draft
                - button "Remove Job" [ref=e241] [cursor=pointer]:
                  - img
              - generic [ref=e242]:
                - generic [ref=e243]:
                  - generic [ref=e244]:
                    - generic [ref=e245] [cursor=pointer]: Package *
                    - generic [ref=e246]:
                      - button "PlanBTV_80Red (Plan B TV) Package" [active] [ref=e247] [cursor=pointer]:
                        - generic [ref=e248]: PlanBTV_80Red (Plan B TV)
                        - img [ref=e249]
                      - combobox [ref=e253] [cursor=pointer]
                  - generic [ref=e254]:
                    - generic [ref=e255]: Duration *
                    - generic [ref=e256]:
                      - textbox "Minutes" [ref=e257]: "0"
                      - textbox "Seconds" [ref=e258]: "15"
                - generic [ref=e259]:
                  - generic [ref=e260]: Period *
                  - generic [ref=e261]:
                    - button "01/09/2026" [ref=e263] [cursor=pointer]:
                      - generic [ref=e264]: 01/09/2026
                      - img [ref=e266]
                    - generic [ref=e268]: —
                    - button "21/09/2026" [ref=e270] [cursor=pointer]:
                      - generic [ref=e271]: 21/09/2026
                      - img [ref=e273]
                - generic [ref=e275]:
                  - generic [ref=e276]:
                    - generic [ref=e277] [cursor=pointer]: Pack Quantity
                    - textbox "Pack Quantity" [ref=e278]:
                      - /placeholder: "1"
                      - text: "1"
                  - generic [ref=e279]:
                    - generic [ref=e280]: Version Quota
                    - generic "Version Quota = (Pack x 3) x number of months (rounded up) — includes existing Versions of this Package already on this ticket" [ref=e281]: Version 2/3
              - generic [ref=e282]:
                - generic [ref=e283]:
                  - heading "Versions" [level=4] [ref=e284]
                  - generic [ref=e285]: 1 version
                  - button "Add Version" [ref=e286] [cursor=pointer]:
                    - img
                    - text: Add Version
                - generic [ref=e288]:
                  - generic [ref=e289]:
                    - generic [ref=e290]:
                      - generic [ref=e291]: Version 2
                      - generic [ref=e292]: Draft
                    - button "Remove version" [ref=e293] [cursor=pointer]:
                      - img
                  - generic [ref=e294]:
                    - generic [ref=e295]:
                      - generic [ref=e296]:
                        - generic [ref=e297] [cursor=pointer]: Duration
                        - generic [ref=e298]:
                          - button "7.5 seconds Duration" [ref=e299] [cursor=pointer]:
                            - generic [ref=e300]: 7.5 seconds
                            - img [ref=e301]
                          - combobox [ref=e305] [cursor=pointer]
                      - generic [ref=e306]:
                        - generic [ref=e307] [cursor=pointer]: Nickname
                        - textbox "Nickname" [ref=e308]:
                          - /placeholder: Version nickname...
                      - generic [ref=e309]:
                        - generic [ref=e310]: Material
                        - generic [ref=e311]:
                          - textbox "Material link" [ref=e312]:
                            - /placeholder: Paste 1 link...
                          - button "Click to upload or drag and drop Multiple files · Max 50 MB total 0B / 50 MB" [ref=e314] [cursor=pointer]:
                            - img [ref=e315]
                            - generic [ref=e317]:
                              - generic [ref=e318]: Click to upload or drag and drop
                              - generic [ref=e319]: Multiple files · Max 50 MB total
                            - generic [ref=e320]: 0B / 50 MB
                      - generic [ref=e321]:
                        - generic [ref=e322]: Brief
                        - generic [ref=e323]:
                          - textbox "Brief link" [ref=e324]:
                            - /placeholder: Paste 1 link...
                          - button "Click to upload or drag and drop Multiple files · Max 50 MB total 0B / 50 MB" [ref=e326] [cursor=pointer]:
                            - img [ref=e327]
                            - generic [ref=e329]:
                              - generic [ref=e330]: Click to upload or drag and drop
                              - generic [ref=e331]: Multiple files · Max 50 MB total
                            - generic [ref=e332]: 0B / 50 MB
                    - generic [ref=e333]:
                      - generic [ref=e334]:
                        - img [ref=e335]
                        - generic [ref=e337]: Note
                      - textbox "Add notes for this version..." [ref=e338]
              - generic [ref=e339]:
                - button "Cancel" [ref=e340] [cursor=pointer]
                - button "Save Job" [ref=e341] [cursor=pointer]:
                  - img
                  - text: Save Job
            - generic [ref=e344]:
              - generic [ref=e345]: P
              - generic [ref=e346]:
                - generic [ref=e347]:
                  - generic [ref=e348]: JOB-26090098-01
                  - generic [ref=e349]: PlanBTV_80Red
                  - generic [ref=e350]: Assign
                - generic [ref=e352]:
                  - generic [ref=e353]:
                    - term [ref=e354]: Period
                    - definition [ref=e355]: 01/09/2026 - 21/09/2026
                  - generic [ref=e356]:
                    - term [ref=e357]: Versions
                    - definition [ref=e358]: "1"
                  - generic [ref=e359]:
                    - term [ref=e360]: Max Prove
                    - definition [ref=e361]: —
                  - generic [ref=e362]:
                    - term [ref=e363]: Nickname
                    - definition [ref=e364]: —
                  - generic [ref=e365]:
                    - term [ref=e366]: Duration
                    - definition [ref=e367]: 7.5 seconds
                  - generic [ref=e368]:
                    - term [ref=e369]: Assigned To
                    - definition [ref=e370]: Unassigned
                  - generic [ref=e371]:
                    - term [ref=e372]: Assign Date
                    - definition [ref=e373]: "-"
                - generic [ref=e374]:
                  - region "Material attachments" [ref=e375]:
                    - generic [ref=e376]:
                      - img [ref=e377]
                      - generic [ref=e379]: Material
                      - generic [ref=e380]: "1"
                    - region "Attachment gallery" [ref=e382]:
                      - generic [ref=e383]:
                        - button "Material" [ref=e384] [cursor=pointer]:
                          - img "Material" [ref=e385]
                        - generic [ref=e386]:
                          - generic "https://example.com/material.jpg" [ref=e387]: Material
                          - link "Download Material" [ref=e388] [cursor=pointer]:
                            - /url: https://example.com/material.jpg
                            - img [ref=e389]
                  - region "Brief attachments" [ref=e391]:
                    - generic [ref=e392]:
                      - img [ref=e393]
                      - generic [ref=e395]: Brief
                    - button "Brief https://example.com/brief.pdf" [ref=e397] [cursor=pointer]:
                      - img [ref=e398]
                      - generic [ref=e400]:
                        - generic [ref=e401]: Brief
                        - generic [ref=e402]: https://example.com/brief.pdf
              - button "Cancel" [ref=e404] [cursor=pointer]:
                - img
                - text: Cancel
        - complementary [ref=e405]:
          - generic [ref=e406]:
            - img [ref=e408]
            - generic [ref=e410]:
              - generic [ref=e411]: Quotation Items
              - generic [ref=e412]: 10 items · Total 15,178,744.00 THB
            - button [ref=e413] [cursor=pointer]:
              - img [ref=e414]
          - table [ref=e417]:
            - rowgroup [ref=e418]:
              - row [ref=e419]:
                - columnheader [ref=e420]: "No"
                - columnheader [ref=e421]: Description · Qty · Period
                - columnheader [ref=e422]: Fee / Disc / Net / Total
            - rowgroup [ref=e423]:
              - row [ref=e424]:
                - cell [ref=e425]: C02001-36A-P001
                - cell [ref=e426]:
                  - generic [ref=e427]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e428]:
                    - generic [ref=e429]: "Qty: 1.00 PACK"
                    - generic [ref=e430]: "Dur: 0.50 Month"
                    - generic [ref=e431]: "Period: 01/05/26 - 15/05/26"
                - cell [ref=e432]:
                  - generic [ref=e433]: 1,375,000.00
                  - generic [ref=e434]:
                    - generic [ref=e435]: "Net: 2,750,000.00"
                    - generic [ref=e436]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e437]: "-25.47%"
              - row [ref=e438]:
                - cell [ref=e439]: A02003-01M-P083
                - cell [ref=e440]:
                  - generic [ref=e441]: L-BK-ECD-22A ค่าสื่อโฆษณา Unipole ทางด่วนเฉลิมมหานคร - ดินแดง มักกะสัน มุ่งหน้าพระราม 4
                  - generic [ref=e442]:
                    - generic [ref=e443]: "Qty: 1.00 PACK"
                    - generic [ref=e444]: "Dur: 5.00 Month"
                    - generic [ref=e445]: "Period: 01/05/26 - 30/09/26"
                - cell [ref=e446]:
                  - generic [ref=e447]: 1,600,000.00
                  - generic [ref=e448]:
                    - generic [ref=e449]: "Net: 320,000.00"
                    - generic [ref=e450]:
                      - text: "Fee: 400,000.00 ·"
                      - generic [ref=e451]: "-20.00%"
              - row [ref=e452]:
                - cell [ref=e453]: A02003-01P-P139
                - cell [ref=e454]:
                  - generic [ref=e455]: L-BK-RM4-20A ค่าผลิตสื่อโฆษณา Unipole ถนนพระราม 4 (สะพานไทย-ญี่ปุ่น)
                  - generic [ref=e456]:
                    - generic [ref=e457]: "Qty: 1.00 PACK"
                    - generic [ref=e458]: "Dur: 1.00 TIME"
                    - generic [ref=e459]: "Period: 01/05/26 - 01/05/26"
                - cell [ref=e460]:
                  - generic [ref=e461]: 96,000.00
                  - generic [ref=e462]:
                    - generic [ref=e463]: "Net: 96,000.00"
                    - generic [ref=e464]:
                      - text: "Fee: 96,000.00 ·"
                      - generic [ref=e465]: "-0.00%"
              - row [ref=e466]:
                - cell [ref=e467]: A02024-01P-P324
                - cell [ref=e468]:
                  - generic [ref=e469]: L-BK-RM4-5 ค่าผลิตสื่อโฆษณา Unipole ถนนพระราม 4 (ท้ายซอยสุขุมวิท 24)
                  - generic [ref=e470]:
                    - generic [ref=e471]: "Qty: 1.00 PACK"
                    - generic [ref=e472]: "Dur: 1.00 TIME"
                    - generic [ref=e473]: "Period: 01/05/26 - 01/05/26"
                - cell [ref=e474]:
                  - generic [ref=e475]: 89,544.00
                  - generic [ref=e476]:
                    - generic [ref=e477]: "Net: 89,544.00"
                    - generic [ref=e478]:
                      - text: "Fee: 89,544.00 ·"
                      - generic [ref=e479]: "-0.00%"
              - row [ref=e480]:
                - cell [ref=e481]: A02003-01P-P120
                - cell [ref=e482]:
                  - generic [ref=e483]: L-BK-ECD-24A ค่าผลิตสื่อโฆษณา Unipole ทางด่วนเฉลิมมหานคร (มักกะสัน) มุ่งหน้าพระราม 4
                  - generic [ref=e484]:
                    - generic [ref=e485]: "Qty: 1.00 PACK"
                    - generic [ref=e486]: "Dur: 1.00 TIME"
                    - generic [ref=e487]: "Period: 01/05/26 - 01/05/26"
                - cell [ref=e488]:
                  - generic [ref=e489]: 268,200.00
                  - generic [ref=e490]:
                    - generic [ref=e491]: "Net: 268,200.00"
                    - generic [ref=e492]:
                      - text: "Fee: 268,200.00 ·"
                      - generic [ref=e493]: "-0.00%"
              - row [ref=e494]:
                - cell [ref=e495]: A02003-01M-P139
                - cell [ref=e496]:
                  - generic [ref=e497]: L-BK-RM4-20A ค่าสื่อโฆษณา Unipole ถนนพระราม 4 (สะพานไทย-ญี่ปุ่น)
                  - generic [ref=e498]:
                    - generic [ref=e499]: "Qty: 1.00 PACK"
                    - generic [ref=e500]: "Dur: 5.00 Month"
                    - generic [ref=e501]: "Period: 01/05/26 - 30/09/26"
                - cell [ref=e502]:
                  - generic [ref=e503]: 1,200,000.00
                  - generic [ref=e504]:
                    - generic [ref=e505]: "Net: 240,000.00"
                    - generic [ref=e506]:
                      - text: "Fee: 300,000.00 ·"
                      - generic [ref=e507]: "-20.00%"
              - row [ref=e508]:
                - cell [ref=e509]: C02001-36A-P001
                - cell [ref=e510]:
                  - generic [ref=e511]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e512]:
                    - generic [ref=e513]: "Qty: 1.00 PACK"
                    - generic [ref=e514]: "Dur: 0.50 Month"
                    - generic [ref=e515]: "Period: 16/05/26 - 31/05/26"
                - cell [ref=e516]:
                  - generic [ref=e517]: 1,375,000.00
                  - generic [ref=e518]:
                    - generic [ref=e519]: "Net: 2,750,000.00"
                    - generic [ref=e520]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e521]: "-25.47%"
              - row [ref=e522]:
                - cell [ref=e523]: A02002-02M-P014
                - cell [ref=e524]:
                  - generic [ref=e525]: ค่าสื่อโฆษณา Gateway Billboard-ประชาชื่น(v)
                  - generic [ref=e526]:
                    - generic [ref=e527]: "Qty: 1.00 PACK"
                    - generic [ref=e528]: "Dur: 3.50 Month"
                    - generic [ref=e529]: "Period: 01/06/26 - 15/09/26"
                - cell [ref=e530]:
                  - generic [ref=e531]: 3,675,000.00
                  - generic [ref=e532]:
                    - generic [ref=e533]: "Net: 1,050,000.00"
                    - generic [ref=e534]:
                      - text: "Fee: 1,400,000.00 ·"
                      - generic [ref=e535]: "-25.00%"
              - row [ref=e536]:
                - cell [ref=e537]: C02001-36A-P001
                - cell [ref=e538]:
                  - generic [ref=e539]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e540]:
                    - generic [ref=e541]: "Qty: 1.00 PACK"
                    - generic [ref=e542]: "Dur: 1.00 Month"
                    - generic [ref=e543]: "Period: 01/09/26 - 30/09/26"
                - cell [ref=e544]:
                  - generic [ref=e545]: 2,750,000.00
                  - generic [ref=e546]:
                    - generic [ref=e547]: "Net: 2,750,000.00"
                    - generic [ref=e548]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e549]: "-25.47%"
              - row [ref=e550]:
                - cell [ref=e551]: C02001-36A-P001
                - cell [ref=e552]:
                  - generic [ref=e553]: ค่าสื่อโฆษณา Plan B TV 240
                  - generic [ref=e554]:
                    - generic [ref=e555]: "Qty: 1.00 PACK"
                    - generic [ref=e556]: "Dur: 1.00 Month"
                    - generic [ref=e557]: "Period: 01/11/26 - 30/11/26"
                - cell [ref=e558]:
                  - generic [ref=e559]: 2,750,000.00
                  - generic [ref=e560]:
                    - generic [ref=e561]: "Net: 2,750,000.00"
                    - generic [ref=e562]:
                      - text: "Fee: 3,690,000.00 ·"
                      - generic [ref=e563]: "-25.47%"
          - generic [ref=e564]:
            - generic [ref=e565]: Grand Total
            - generic [ref=e566]: 15,178,744.00
```

# Test source

```ts
  1  | import { Page } from '@playwright/test';
  2  | 
  3  | export async function login(page: Page) {
  4  |   const email = process.env.MEDIA_CONTROL_EMAIL;
  5  |   const password = process.env.MEDIA_CONTROL_PASSWORD;
  6  |   if (!email || !password) {
  7  |     throw new Error('Missing MEDIA_CONTROL_EMAIL or MEDIA_CONTROL_PASSWORD in .env');
  8  |   }
  9  |   await page.goto('https://uat-mediacontrol.planbmedia.co.th/login');
  10 |   await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  11 |   await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  12 |   await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  13 | }
  14 | 
  15 | // Account that has the Media Management role, needed for AC12/AC13 (Landlord/Plan B/Other).
  16 | export async function loginAsMediaManagement(page: Page) {
  17 |   const email = process.env.MEDIA_MANAGEMENT_EMAIL;
  18 |   const password = process.env.MEDIA_MANAGEMENT_PASSWORD;
  19 |   if (!email || !password) {
  20 |     throw new Error('Missing MEDIA_MANAGEMENT_EMAIL or MEDIA_MANAGEMENT_PASSWORD in .env');
  21 |   }
  22 |   await page.goto('https://uat-mediacontrol.planbmedia.co.th/login');
  23 |   await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  24 |   await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  25 |   await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  26 | }
  27 | 
  28 | export async function openCreateTicket(page: Page) {
  29 |   await page.getByRole('button', { name: 'MEDIA APPROVAL' }).click();
  30 |   await page.getByRole('link', { name: 'Media Ticket' }).click();
  31 |   await page.getByRole('link', { name: 'Create Ticket' }).click();
  32 | }
  33 | 
  34 | export async function switchToManualMode(page: Page) {
  35 |   await page.getByRole('button', { name: 'No Quotation Number' }).click();
  36 | }
  37 | 
  38 | // Opens a "DD/MM/YYYY"-style date button's calendar popover and clicks the given day
  39 | // in the currently displayed month.
  40 | export async function pickDate(page: Page, dateButton: import('@playwright/test').Locator, day: number) {
  41 |   // A plain click without first scrolling the button fully into view can hang indefinitely
  42 |   // on buttons further down the page (e.g. Job/Version Period), so always scroll first.
> 43 |   await dateButton.scrollIntoViewIfNeeded();
     |                    ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 60000ms exceeded.
  44 |   await dateButton.click();
  45 |   await page.getByRole('button', { name: String(day), exact: true }).click();
  46 | }
  47 | 
  48 | // Fills Client, Product, a ~1 month Contract Start-End, and the Media
  49 | // Category -> Group -> Type cascade (DIGITAL -> Digital -> Plan B TV). Assumes Manual mode is
  50 | // already switched on.
  51 | export async function fillTicketHeader(page: Page, opts: { client: string; product: string }) {
  52 |   await page.getByRole('textbox', { name: 'Enter client name...' }).fill(opts.client);
  53 |   await page.getByRole('textbox', { name: 'Enter product name...' }).fill(opts.product);
  54 | 
  55 |   const contractDateBtns = page.getByRole('button', { name: 'DD/MM/YYYY' });
  56 |   await pickDate(page, contractDateBtns.nth(0), 1);
  57 |   await pickDate(page, contractDateBtns.nth(0), 28);
  58 | 
  59 |   await page.getByRole('button', { name: 'Select media category' }).click();
  60 |   await page.getByRole('button', { name: 'DIGITAL', exact: true }).click();
  61 |   await closeOpenPopover(page);
  62 | 
  63 |   const mediaGroupBtn = page.locator('text=Media Group').first().locator('xpath=following::button[1]');
  64 |   await mediaGroupBtn.click();
  65 |   await page.getByRole('button', { name: 'Digital', exact: true }).click();
  66 |   await closeOpenPopover(page);
  67 | 
  68 |   const mediaTypeBtn = page.locator('text=Media Type').first().locator('xpath=following::button[1]');
  69 |   await mediaTypeBtn.click();
  70 |   await page.getByRole('button', { name: 'Plan B TV', exact: true }).click();
  71 |   await closeOpenPopover(page);
  72 | }
  73 | 
  74 | // These multiselect popovers don't close on Escape, and closing them by clicking a fixed
  75 | // landmark further down the page (e.g. a heading) is unreliable: a popover opened from a field
  76 | // further down the form can expand far enough to cover that landmark and block the click. The
  77 | // page title, at the very top of the form, is above every popover's expansion area.
  78 | export async function closeOpenPopover(page: Page) {
  79 |   await page.getByRole('heading', { name: 'Create Ticket', level: 1 }).click();
  80 | }
  81 | 
```