# my-playwright-test

ชุดทดสอบอัตโนมัติ (Playwright + TypeScript) สำหรับระบบ **Media Control** บน UAT
`https://uat-mediacontrol.planbmedia.co.th`

> ทุกอย่างรันกับ **UAT เท่านั้น** บางเทสสร้างข้อมูลจริง (Ticket ชื่อ "QA Test Client …", User "qa.test.…@example.com") และส่งอีเมล ข้อมูลที่เทสสร้างลบจาก UI ไม่ได้ทั้งหมด

## เริ่มต้นใช้งาน

```bash
npm install
npx playwright install chromium
cp .env.example .env      # แล้วกรอกบัญชีทดสอบ (ดูหัวข้อ "ไฟล์ .env")
npx playwright test       # รันทั้งหมด
```

## คำสั่งที่ใช้บ่อย

| ต้องการ | คำสั่ง |
|---|---|
| รันทั้งหมด | `npx playwright test` |
| รันเทสที่แก้ข้อมูลจริงบน UAT ด้วย | `npm run test:uat-submit` (ตั้ง `RUN_UAT_SUBMIT_TESTS=1`) |
| รันไฟล์เดียว (ใช้ชื่อไฟล์ เพราะ path มีเว้นวรรค) | `npx playwright test 02-02-search-matches` |
| รันทีละตัว (ไม่ขนาน) | `npx playwright test <ชื่อไฟล์> --workers=1` |
| รันตามชื่อเทส | `npx playwright test -g "AT-HC-12"` |
| เปิดรายงาน HTML | `npm run report` |
| รายงาน Allure | `npm run allure:generate` แล้ว `npm run allure:open` |

หมายเหตุ
- โฟลเดอร์ **E2E** และชุดที่มีข้อมูลร่วมกัน (เช่น Master Data CRUD) ควรรันด้วย `--workers=1` เพื่อไม่ให้ชนกัน
- มี `slowMo: 200` ใน [playwright.config.ts](playwright.config.ts) เทสจึงช้ากว่าปกติ
- เทสที่สร้าง/แก้ข้อมูลจริงจะ `test.skip` ถ้าไม่ได้ตั้ง `RUN_UAT_SUBMIT_TESTS=1`

## ไฟล์ .env

คัดลอกจาก [.env.example](.env.example) ห้าม commit `.env`, `.auth/`, `test-results/`

| ตัวแปร | ใช้เป็น role |
|---|---|
| `MEDIA_CONTROL_EMAIL/PASSWORD` | Sale |
| `MEDIA_MANAGEMENT_EMAIL/PASSWORD` | Media Management |
| `HEAD_CG_EMAIL/PASSWORD` | Head CG |
| `CG1_EMAIL/PASSWORD` | CG - QA |
| `CG2_EMAIL/PASSWORD` | CG - QA 2 |
| `SUPER_ADMIN_EMAIL/PASSWORD` | Super Admin |
| `QA_USER_PASSWORD`, `QA_USER_NEW_PASSWORD` | รหัสผ่านของ User ชั่วคราวที่เทส User Management สร้าง |
| `RUN_UAT_SUBMIT_TESTS=1` | เปิดเทสที่สร้าง/แก้ข้อมูลจริง |
| `IMPORT_USERS=1` | เปิดสคริปต์นำเข้า User จาก Excel (ดูด้านล่าง) |

การ login ใช้ `loginAs(page, role)` ใน [Dashboard/_helpers.ts](Project/Media%20Control/Dashboard/_helpers.ts) และเก็บ cookie ต่อ role ไว้ที่ `.auth/*.json` ([auth-cache.ts](Project/Media%20Control/auth-cache.ts)) เพื่อข้ามหน้า Login

## โครงสร้างโฟลเดอร์

```
Project/Media Control/     เทสทั้งหมด แยกตามหน้าจอ (ดูตารางด้านล่าง)
specs/                     แผนทดสอบ (test plan) ของแต่ละส่วน เป็น Markdown
scripts/                   สคริปต์ Node สร้างไฟล์ Excel/รายงาน
reports/                   ไฟล์ผลลัพธ์/Excel ที่สร้างออกมา
tests/ , seed.spec.ts      ตัวอย่างจาก Playwright / seed สำหรับ Test Agents
tmp-e2e.spec.ts            ไฟล์ทดลองสำรวจหน้าจอชั่วคราว (ไม่ใช่เทสจริง)
.github/workflows/         CI (playwright.yml)
.claude/agents/            Test Agents (planner / generator / healer)
```

### เทสแยกตามหน้าจอ (`Project/Media Control/`)

| โฟลเดอร์ | ครอบคลุม | แผน |
|---|---|---|
| `Dashboard` | Media Approval Dashboard และ Export Report (ไฟล์เยอะที่สุด) | [mediaapproval-dashboard-plan](specs/mediaapproval-dashboard-plan.md), [export-report-testcase-mapping](specs/export-report-testcase-mapping.md) |
| `MasterData` | Master Data 23 หมวด, Holiday, Province, Media tree | [master-data-plan](specs/master-data-plan.md) |
| `UserManagement` | Setting > User Management | [user-management-plan](specs/user-management-plan.md) |
| `UserGroup` | Setting > User Group | [user-group-plan](specs/user-group-plan.md) |
| `EmailTemplate` | Setting > Email Template (CRUD) | [email-template-plan](specs/email-template-plan.md) |
| `CreateTicket` | สร้าง Ticket (Pull from Salesforce / No Quotation Number) | [create-ticket-plan](specs/create-ticket-plan.md) |
| `MediaTicket` | หน้ารายการ Media Ticket | [media-ticket-plan](specs/media-ticket-plan.md) |
| `TicketDetail` | หน้ารายละเอียด Ticket | [ticket-detail-plan](specs/ticket-detail-plan.md) |
| `AssignTicket` | Head CG Assign / Reassign (Super Admin ดูอย่างเดียว) | [assign-ticket-plan](specs/assign-ticket-plan.md) |
| `VerifyProduction` | Verify & Production (CG, Super Admin ดูอย่างเดียว) | [verify-production-plan](specs/verify-production-plan.md) |
| `E2E` | Flow ครบวงจรตั้งแต่สร้าง Ticket จน Done | [e2e-plan](specs/e2e-plan.md) |
| `UiWording` | ตรวจ wording หน้าจอต้องเป็นภาษาอังกฤษ | [ui-wording-plan](specs/ui-wording-plan.md) |

### รูปแบบการตั้งชื่อ

- ไฟล์: `NN-NN-ชื่อ.spec.ts` ตัวเลขตรงกับ section-scenario ในแผนของโฟลเดอร์นั้น
- แต่ละไฟล์ขึ้นต้นด้วยคอมเมนต์ภาษาไทย 1 บรรทัดสรุปสิ่งที่เทส
- ชื่อเทสมี ID เช่น `AT-HC-12`, `VP-CG-08`, `MD-SRCH-01` และ tag `@happy`, `@negative`, `@edge`, `@security`, `@regression`
- เทสที่ยังไม่รันเพราะรอแก้/รอคำตอบใช้ `test.fixme`

## E2E (`Project/Media Control/E2E/`)

เล่น flow จริงด้วยหลาย role สลับกัน

| ไฟล์ | เนื้อหา |
|---|---|
| `01-01` | สร้าง Ticket → Assign → Reassign → History |
| `02-01` | CG Accept → Submit Prove |
| `03-01` | วงจรเต็มของ 1 Job: Assign → Verify → On Process → Review → Final Approve → Final Render → **Done** |
| `04-01` ถึง `04-04` | Job ที่ Assign ให้ CG 2 คน (BTS, Digital VGI): คนแรกที่กดชนะ (Accept / Feedback / Submit Prove / Render) คนที่สองถูกระบบปฏิเสธ |
| `05-01` | Media Management สร้าง Ticket เอง: Landlord Feedback เป็นแค่ comment ไม่เปลี่ยน workflow (เคส Approve และเคส Cancel approve) |

ข้อมูลที่ใช้
- Media แบบ CG คนเดียว: Retail / DIGITAL / QATEST, Package "7-Eleven Plus (QATEST)"
- Media แบบ CG หลายคน: Digital VGI / DIGITAL / QATEST-BTS (BTS On Station), Package "BTS MAX 2.0 Half B (QATEST-BTS)"

## เอกสารและไฟล์ที่สร้างจากสคริปต์ (`scripts/` → `reports/`)

| สคริปต์ | ผลลัพธ์ | หมายเหตุ |
|---|---|---|
| `node scripts/build-e2e-manual-testcases.js [ไฟล์ปลายทาง]` | `reports/E2E-Manual-Test-Cases.xlsx` | Test Case แบบ Manual สำหรับ UAT e2e 3 ชีท (Assign 1 คน, VGI Assign 2 คน, Media Management สร้างเอง) ทุกชีทเล่นจนสถานะ Done ถ้าไฟล์เปิดค้างใน Excel ให้ระบุชื่อไฟล์ใหม่ |
| `node scripts/build-dashboard-report.js` | `reports/dashboard-test-summary.xlsx` | สรุปผลเทส Dashboard จาก `dashboard-results*.json` |
| `node scripts/build-user-import-template.js` | `reports/User-Import-Template.xlsx` | แม่แบบ Excel สำหรับกรอก User ที่จะเพิ่ม |

รายงานอื่นใน `reports/`: `visibility-defects.md` (บัคเรื่องสิทธิ์การมองเห็น), `ui-wording/` (ผลตรวจ wording)

## นำเข้า User จาก Excel

สคริปต์: [99-01-import-users-from-excel.spec.ts](Project/Media%20Control/UserManagement/99-01-import-users-from-excel.spec.ts)

```bash
IMPORT_USERS=1 npx playwright test 99-01-import-users --workers=1
```

- อ่าน `reports/User_Create.xlsx` คอลัมน์: No., ชื่อ, Email, Department, User Group, Role, จำนวนกลุ่มที่อยู่, Media Group, Media Category, Media Type, Package (หลายค่าในช่องเดียวให้ขึ้นบรรทัดใหม่)
- ตั้ง password เป็น `12345678`, ปิด Email Notification, เว้น Phone
- Media access ในฟอร์มเป็นต้นไม้ Group → Category → Media Type → Panel Package ติ๊กได้เฉพาะ **Group, Category, Package** ส่วน Media Type ต้องคลิกชื่อเพื่อเปิดดู Package ใต้มัน
- ค่าที่ไม่มีในระบบ **ข้าม ไม่สร้างเอง ไม่ใส่ค่าอื่นแทน** แล้วสรุปไว้ใน `reports/User_Create_Result.json` และ `.xlsx`
- Email ที่มีอยู่แล้วจะไม่สร้างซ้ำ

## ความรู้เฉพาะของระบบ (ควรรู้ก่อนเขียนเทสเพิ่ม)

- ระบบใช้ react-aria: ปุ่ม/select หลายตัวขนาดเป็นศูนย์หรืออยู่นอก viewport ต้องคลิกด้วย `evaluate(e => e.click())` Popover เป็น `div[aria-label="<ชื่อปุ่มที่เปิด>"]` Modal (OK / Confirm) ไม่ใช่ `role=dialog` แต่ Drawer เป็น
- ตัวเลขบน tile ของ Master Data เป็น animated counter ต้องอ่านซ้ำจนสองครั้งติดกันเท่ากัน
- อ่านตารางใหญ่ทีละ cell จะช้ากว่า timeout 30 วินาที ให้ใช้ `evaluateAll` ครั้งเดียวต่อหน้า
- ชื่อซ้ำข้ามระดับเกิดได้ (เช่น "CG - QA", "CG - QA 2", "Head CG - QA") ต้องเลือกด้วยชื่อแบบ exact
- Job หลาย CG (BTS): คนแรกที่กดชนะ คนอื่นจะเห็น modal "Something Went Wrong" ให้ refresh
- Landlord Feedback ของ Media Management เป็นแค่ comment ไม่เปลี่ยนสถานะ Job

## ข้อบกพร่องที่ยืนยันแล้ว (ปล่อยเป็นเทสที่ fail / fixme)

- Email Template: ไม่บังคับ Mail Body (ET-VALID-02)
- Assign Ticket: Super Admin เห็น checkbox เลือก (AT-SA-02)
- Assign Ticket: Reassign ให้ designer คนเดิมได้ (AT-HC-13, `fixme` รอ dev แก้)
- Verify & Production: Job ที่ Cancelled แสดงฟอร์ม submit ให้ Super Admin (VP-SA-04 ผ่านในการรันล่าสุด ยังไม่ทราบสาเหตุ)

## CI

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) รัน `playwright test` เมื่อ push หรือเปิด pull request เข้า `main` / `master` (CI ใช้ 1 worker และ retry 2 ครั้ง) ถ้าไม่ได้ตั้งบัญชีทดสอบเป็น secret ใน GitHub เทสที่ต้อง login จะรันไม่ผ่านบน CI
