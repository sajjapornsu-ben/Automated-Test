# Media Approval Dashboard — Test Plan (Dashboard + Export Report)

**Application:** Media Control (UAT) — https://uat-mediacontrol.planbmedia.co.th
**Seed:** `seed.spec.ts`
**Page under test:** Media Approval → Dashboard (`/mediaApproval/dashboard`)
**Explored live:** 2026-10-21

## Scope

Per user direction (2026-10-21): every case on the Media Approval Dashboard page, covering both
the **Dashboard** analytics sections and the **Export Report** section at the bottom of the same
page. No separate requirement doc was provided — expectations below come from live exploration
and from the page's own on-screen copy; anything not directly observed is marked *(to verify)*.

**Out of scope:** the old REPORT sidebar group (KPI Dashboard, Export Airtime, Monthly Report,
Audit Log) as a feature. As of 2026-10-21 Sale, Media Management, Head CG and CG 1 don't have it
and its URLs (`/report/kpiDashboard`, `/report/exportAirtime`, `/report/monthlyReport`,
`/report/auditLog`) redirect them to the generic `/dashboard` home page. **Correction found
while writing Section 1:** CG 2 (sasakorn.tr) is a full-access account that still has the REPORT
group and can open those URLs (Monthly Report / Audit Log render an H1; KPI Dashboard / Export
Airtime stay on their URL with no H1 — not explored further). The user confirmed "Report" for
this plan means the Export Report section on the dashboard page instead.

## Accounts / roles (all passwords `11111111`)

What a user sees on this page depends on role — this is itself a test area (Section 1).

| Role | Email | Sidebar under MEDIA APPROVAL | Extra dashboard sections |
|---|---|---|---|
| Sale | `MEDIA_CONTROL_EMAIL` (sajjaporn.su) | Dashboard, Media Ticket | — |
| Media Management | ssywimon@gmail.com | Dashboard, Media Ticket, Media Management | Graphic Workload, SLA per Graphic, Export Report |
| Head CG | somying.wii@gmail.com | Dashboard, Assign Ticket, Verify & Production | Graphic Workload, SLA per Graphic, Export Report |
| CG 1 | qatestplanb1@gmail.com | Dashboard, Verify & Production | Graphic Workload, SLA per Graphic, Export Report |
| CG 2 | sasakorn.tr@planbmedia.co.th | **Full sidebar** (verified while writing tests): HOME/DASHBOARD/INVENTORY/SALE/PRODUCTION/CLAIM + MEDIA APPROVAL (Dashboard, Media Ticket, Assign Ticket, Verify & Production, Media Management) + REPORT (KPI Dashboard, Export Airtime, Monthly Report, Audit Log) + SETTING (User Management, User Group Management, Email Setup, Email Template, Master Data, UI Kit) | Graphic Workload, SLA per Graphic, Export Report |

Head CG is the main account for Sections 9-11 (widest data scope among the role accounts).
When generating, add `HEAD_CG_EMAIL`/`HEAD_CG_PASSWORD` (and the other role accounts if used)
to `.env` / `.env.example` rather than hardcoding them, same as the existing
`MEDIA_MANAGEMENT_*` vars.

## Data-dependence rule

All numbers come from live UAT data that changes daily (e.g. Sale saw 6 tickets for October,
Head CG saw 20; the "Year" preset showed 73). **Tests must not assert fixed counts.** Assert
structure, labels, filter effects (value changed / list narrowed / count matches), and the
cross-card invariants below, which held across every role and filter tried.

## Assumptions / verified facts (from live exploration)

- Post-login landing is the generic `/dashboard` (Home), not this page — navigate via the
  sidebar (MEDIA APPROVAL → Dashboard) or `page.goto('/mediaApproval/dashboard')`. Wait for
  `getByRole('button', { name: 'Log Out' })` after login before navigating (same login race as
  the Ticket Detail suite). The sidebar renders its links only after permissions load — wait for
  network idle before asserting sidebar contents.
- Page header: H1 "Media Approval Dashboard", subtitle "Overview of tickets, jobs, and SLA",
  breadcrumb Home › Media Approval › Dashboard.
- **Date range bar**: two date buttons (start → end, `DD/MM/YYYY`) plus presets Today / Week /
  Month / Quarter / Year. Default is **Month** (highlighted), 1st → last day of the current
  month. Verified preset results on 2026-10-21 (a Wednesday): Today = 21/10–21/10, Week =
  19/10–25/10 (Mon–Sun), Month = 01/10–31/10, Quarter = 01/10–31/12, Year = 01/01–31/12.
- **Sale Package filter** (top right, "All Sale Packages (in my scope)"): opens a popover with a
  "Search..." box, "Select All", one checkbox per package, a "Clear" link and an "N items" count.
  Once a package is applied, the bar shows "Sale Package: <name>" with a separate "Clear" button.
- **Overview & Status** — 8 KPI cards: Total Tickets ("In selected range"), Total Jobs (Version)
  ("In selected range"), Total Prove ("Across all jobs"), Cancelled Jobs (Version), Approved by
  Format, Approved-Ref by Format, Hold by Format ("On hold"), Cancelled by Format.
- **Alerts & Exceptions** — High-Version Jobs ("Jobs with >3 prove rounds", N Jobs) and
  High-Prove Versions ("Prove rounds beyond #3", N Versions).
- **Financial Impact** — Extra Version Surcharge ("฿X", "THB · N jobs") and Extra Prove Surcharge
  ("฿Y", "THB · N rounds").
- **Invariants that held everywhere tried** (Sale unfiltered, Sale filtered to one package, Head
  CG):
  - Extra Prove Surcharge = rounds × ฿7,000 (PB-2112 BR4: 7,000 THB per round beyond #3).
  - Extra Version Surcharge is a multiple of ฿20,000 and ≥ jobs × ฿20,000 (BR5 charges per
    *Version* over Quota, while the card counts *jobs* — one job can have several extra versions;
    "jobs × 20,000" only held because each job in the data had exactly one).
  - Financial "N jobs" ≤ High-Version Jobs (Quota = 3 × Pack × ceil(Month) ≥ 3, so over-quota ⇒
    >3 Versions). It is **not** guaranteed equal: Landlord / Media-Management-created tickets are
    exempt from the charge but still count in Alerts (BR6, BR7). An earlier version of test 06-03
    asserted equality; it was corrected after reading PB-2112.
  - Sum of "Y jobs" over the package rows = Total Jobs (Version) when the Top-N card isn't truncating
    (test 07-05); the Job Type legend total ≤ Total Jobs (only Accepted jobs count, BR12; 08-03).
  - SLA card %: Feedback 86% with "4 overdue of 28" ≈ (28−4)/28; Progress 17% with "19 overdue
    of 23" ≈ (23−19)/23 — i.e. % = round((total − overdue) / total × 100).
  - Graphic Workload "Total" column = sum of that row's 9 status columns.
  - Export Report row count shown on screen ("Showing N records") = data rows in the exported
    Excel file.
- **Tickets & Jobs by Sale Package** — a "Top N" badge (Top 5 for Sale, Top 7 for Head CG) and one
  button per package: "<media group> <package> X tickets · Y jobs". Clicking one sets it
  `[pressed]`, shows a "Clear (1)" button, syncs the top Sale Package filter ("Sale Package:
  <name>" + Clear), and re-filters **every** card on the page (KPIs, alerts, financial, charts) —
  not only "the cards on the right" as the hint text says. Multiple packages can be picked.
- **Job Type Distribution (CG)** — bar chart + legend with 5 types: Animate, ไฟล์สำเร็จ (Final
  File), มีโปรเจค AE/PR, Mockup (เสนอขาย), งานอื่นๆ (Other); bar labels match legend counts.
- **Jobs by Status** — 9 status cards: Assign (Head CG), Verify (CG), Revise (Sale), On Process
  (CG), Review (Sale), Revise (CG), Final Approve, Final Render, Done. Clicking one sets it
  `[pressed]` (checkmark) and shows a "Filter: <status>" chip. For non-Sale roles the hint reads
  "Click a status to filter the Graphic Workload table below", and it does (Final Approve
  narrowed the workload table from 8 graphics to 3). **For Sale** (no workload table) the chip
  appears but nothing else on the page changes.
- **Graphic Workload** (non-Sale) — "N graphics" badge, hint "Click a row to focus, click a
  status chip above to filter this table", grid "Graphic Workload Table" with columns Graphic +
  the 9 statuses + Total; includes an "Unassigned" row.
- **SLA per Graphic** (non-Sale) — scope dropdown ("Everyone (Average)"; per-graphic options
  *(to verify — only "Everyone (Average)" was captured)*), "Selected Scope: ..." text, Month/Year
  toggle, two cards "Feedback SLA X% · N overdue of M" and "Progress SLA X% · N overdue of M"
  ("Click a card to filter the line in the chart"), and a Jan–Dec line chart.
- **Export Report** (non-Sale) — tablist "Report Type" with tabs SLA (default) / Transaction /
  Airtime / Billing; one Export button whose label follows the tab; per-tab description, filters,
  table, "Showing N records|groups", "per page" (Auto, 10, 25, 50, 100 — Auto = 5 rows) and
  pagination "Showing 1 to 5 of N records" with Prev/Next.
  - **Independent of the top filters**: switching the top range to "Today" left the SLA tab at
    "Showing 320 records" — Export Report uses only its own filters ("with the filters applied
    below").
  | Tab | Description | Filters | Export file | Sheets |
  |---|---|---|---|---|
  | SLA | Feedback & Progress SLA per job, with the filters applied below | Status, Media, Graphic, From, To | `SLA_Report_DDMMYYYY_HHmm.xlsx` | "SLA Report" (10 cols: Job No, Ticket, Client, Product, Media, Graphic, Status, Feedback SLA, Progress SLA, Created Date) |
  | Transaction | 26 columns, one row per Format of each job | Search (Quote / Company / Product), Sale Approve, Landlord Approve, From, To | `Transaction_Report_DDMMYYYY_HHmm.xlsx` | "Transaction Report" (26 cols) |
  | Airtime | 26 columns, one row per job with every Format listed together | same as Transaction | `Airtime_Report_DDMMYYYY_HHmm.xlsx` | "Airtime Report" (same 26 cols) |
  | Billing | Charges for Prove rounds beyond each job's free quota — exports 2 sheets | Status, Media, Graphic, From, To | `ค่าใช้จ่าย Prove เกิน DD Mon YY.xlsx` | "สรุป" (No., สื่อ/Pack, สินค้า, Version, จำนวน Prove จริง, จำนวน Prove ที่เกิน, Rate / Prove, มูลค่า Prove ที่เกิน) + "รายละเอียด Prove" (12 cols) |
  - After each export a modal "Export Successful" appears ("Exported N records to Excel"; Billing:
    "Exported N groups to Excel (sheet สรุป) · M Prove rows in sheet รายละเอียด Prove") with an
    OK button — it blocks the page until dismissed.
  - Filter option lists — Status: All Status, Assign, Cancelled, Done, Draft, Final Approve, Final
    Render, On Process, Review, Revise (CG), Revise (SALE), Verify. Sale/Landlord Approve: All,
    Approved, Pending, Rejected. Media / Graphic: data-driven lists.
  - Search "biscuit" → 4 records; a no-match search → "Showing 0 records" + "No records found".
  - Dropdowns here close with Escape; clicking a heading to dismiss them hung (same occlusion
    class as earlier suites).
  - Exports are **read-only** (no UAT record is created), so no `RUN_UAT_SUBMIT_TESTS` gate is
    needed. Use `page.waitForEvent('download')` and parse the file with the `xlsx` package
    already in devDependencies.

## Findings worth a look (observed, not "fixed")

- The Airtime tab's table has the accessible name **"Transaction Report Table"** — same as the
  Transaction tab (a11y label copy-paste).
- The Media filter on the SLA tab lists **"BTS On Station" twice**.
- On the Sale role, clicking a Jobs-by-Status card shows a "Filter: …" chip but changes nothing
  on the page (the table it filters isn't shown to Sale).
- The Sale Package hint says it filters "the cards on the right", but it filters the whole page.
- Count copy isn't pluralised: "1 tickets · 1 jobs".
- After picking a custom date range, the **"Month" preset stays highlighted** even though the
  range is no longer a month (verified while writing 2.7) — the active preset is shown only by an
  inline purple text colour, there's no aria state, so tests read `style.color`.
- The four "by Format" KPI cards **do** follow the date range (all 8 KPIs read 0 for a
  range with no data — verified with Today and with Jan-2018, test 02-09). An earlier note here
  that they might not be date-bound was wrong: they simply had the same value for the whole month
  and for 5/10-31/10.
- Picking day "1" in the Transaction tab's From calendar left the count unchanged (641) — either
  the 1st of the visible month predates all data or the date filter didn't apply *(to verify)*.

---

### 1. Access, Layout & Role Visibility

#### 1.1 Navigate to the dashboard from the sidebar
**Steps:** 1. Log in as Sale. 2. Click MEDIA APPROVAL → Dashboard.
**Expected:** URL `/mediaApproval/dashboard`; H1 "Media Approval Dashboard"; subtitle "Overview of
tickets, jobs, and SLA"; breadcrumb Home › Media Approval › Dashboard.

#### 1.2 Sale role sees only the 6 core sections
**Steps:** 1. Log in as Sale, open the dashboard.
**Expected:** Headings Overview & Status, Alerts & Exceptions, Financial Impact, Tickets & Jobs by
Sale Package, Job Type Distribution (CG), Jobs by Status are visible; Graphic Workload, SLA per
Graphic and Export Report are **not** present.

#### 1.3 Head CG / CG / Media Management also see Workload, SLA and Export Report
**Steps:** 1. Log in as each of Head CG, CG 1, CG 2, Media Management; open the dashboard.
**Expected:** All 9 section headings are visible, including Graphic Workload, SLA per Graphic and
Export Report.

#### 1.4 Sidebar menu per role
**Steps:** 1. Log in as each role; wait for the sidebar to load.
**Expected:** MEDIA APPROVAL group shows exactly the links listed in the roles table above.

#### 1.5 Old REPORT pages are not reachable for a Sale account
**Steps:** 1. Logged in as Sale, go directly to `/report/kpiDashboard`, `/report/exportAirtime`,
`/report/monthlyReport`, `/report/auditLog`.
**Expected:** Each redirects to `/dashboard` (no report page renders). (CG 2 is excluded — see
the correction in Scope.)

---

### 2. Date Range Filter

#### 2.1 Default range is the current month
**Steps:** 1. Open the dashboard.
**Expected:** "Month" is the active preset; start = 01/<MM>/<YYYY>, end = last day of the current
month.

#### 2.2 Today preset
**Steps:** 1. Click "Today".
**Expected:** start = end = today's date; Total Tickets card shows a number ≥ 0.

#### 2.3 Week preset
**Expected:** start = Monday, end = Sunday of the current week.

#### 2.4 Quarter preset
**Expected:** start = 1st day of the current quarter, end = last day of that quarter.

#### 2.5 Year preset
**Expected:** start = 01/01, end = 31/12 of the current year; Total Tickets ≥ the Month value.

#### 2.6 Changing the range refreshes the KPIs
**Steps:** 1. Note Total Tickets for Month. 2. Click Year.
**Expected:** Total Tickets for Year ≥ Month value (Year ⊇ Month); all 8 KPI cards still render
numbers.

#### 2.7 Custom range via the calendars
**Steps:** 1. Pick a start date, then an end date, in the date buttons.
**Expected:** Buttons show the picked dates; KPIs refresh (Total Tickets ≤ the whole month's).
**Verified live:** the "Month" preset stays highlighted (see Findings) — not asserted.

#### 2.8 End date before start date
**Steps:** 1. Pick start = the 5th. 2. Open the end calendar.
**Expected (verified live):** days before the start (1-4) are **disabled** in the end calendar;
the start day and later stay enabled — an invalid range can't be built.

---

### 3. Sale Package Filter

#### 3.1 Dropdown contents
**Steps:** 1. Click the "All Sale Packages (in my scope)" button.
**Expected:** Popover with a "Search.." box (placeholder, not a textbox role), "Select All", one
checkbox per package, "Clear" and an "N items" count equal to the number of package checkboxes.
**Mechanics (verified live):** ticking applies immediately (no Apply button); **Escape closes
the popover**; with every package ticked the button reads "Sale Package" + a count badge (5) and
KPIs equal the unfiltered values; a no-match search shows "No matching options".

#### 3.2 Search narrows the package list
**Steps:** 1. Type part of a package name (e.g. "7-Eleven").
**Expected:** Only matching packages remain listed.

#### 3.3 Selecting one package filters the whole page
**Steps:** 1. Tick one package; close the popover (Escape).
**Expected:** Bar shows "Sale Package: <name>" + "Clear"; Total Tickets/Jobs change to that
package's values; the matching row in "Tickets & Jobs by Sale Package" is `[pressed]`.

#### 3.4 Select All / Clear
**Steps:** 1. Click "Select All", then "Clear".
**Expected:** Select All ticks every package; Clear unticks all and the bar returns to "All Sale
Packages (in my scope)".

#### 3.5 The top "Clear" button resets the filter
**Steps:** 1. Apply a package (3.3). 2. Click the bar's "Clear".
**Expected:** Back to "All Sale Packages (in my scope)"; KPIs return to the unfiltered values.

---

### 4. Overview & Status

#### 4.1 All 8 KPI cards render
**Expected:** Labels Total Tickets, Total Jobs (Version), Total Prove, Cancelled Jobs (Version),
Approved by Format, Approved-Ref by Format, Hold by Format, Cancelled by Format, each with an
integer ≥ 0 and its caption (In selected range / Across all jobs / Cancelled / Approved /
Approved-Ref / On hold / Cancelled).

#### 4.2 Cancelled Jobs never exceeds Total Jobs
**Expected:** Cancelled Jobs (Version) ≤ Total Jobs (Version), under any preset/filter.

---

### 5. Alerts & Exceptions

#### 5.1 Both alert cards render
**Expected:** "High-Version Jobs — Jobs with >3 prove rounds — N Jobs" and "High-Prove Versions —
Prove rounds beyond #3 — N Versions", N ≥ 0.

---

### 6. Financial Impact

#### 6.1 Both surcharge cards render with THB amounts
**Expected:** "Extra Version Surcharge ฿X — THB · N jobs" and "Extra Prove Surcharge ฿Y — THB · N
rounds".

#### 6.2 Surcharge amounts follow the per-unit rates
**Expected:** X = N(jobs) × 20,000 and Y = N(rounds) × 7,000 — checked unfiltered and again after
filtering by one sale package.

#### 6.3 Financial counts match the alert counts
**Expected:** "N jobs" = High-Version Jobs count; "N rounds" = High-Prove Versions count.

---

### 7. Tickets & Jobs by Sale Package

#### 7.1 Top-N list renders
**Expected:** "Top N" badge; N package buttons, each "<group> <package> X tickets · Y jobs".

#### 7.2 Clicking a package filters the page and syncs the top filter
**Steps:** 1. Click one package button.
**Expected:** Button `[pressed]`; "Clear (1)" appears; the top bar shows "Sale Package: <name>";
KPI/Alert/Financial/Chart values change.

#### 7.3 Multiple packages can be selected
**Steps:** 1. Click two package buttons.
**Expected:** Both `[pressed]`; "Clear (2)".

#### 7.4 "Clear (N)" resets the selection
**Expected:** No package pressed; "Clear (N)" gone; values back to unfiltered.

---

### 8. Job Type Distribution (CG)

#### 8.1 Chart and legend render with the 5 job types
**Expected:** Legend Animate, ไฟล์สำเร็จ (Final File), มีโปรเจค AE/PR, Mockup (เสนอขาย), งานอื่นๆ
(Other), each with a count.

#### 8.2 Chart follows the sale-package filter
**Steps:** 1. Click a sale package (7.2).
**Expected:** Legend counts update (≤ the unfiltered values).

---

### 9. Jobs by Status

#### 9.1 All 9 status cards render
**Expected:** Assign (Head CG), Verify (CG), Revise (Sale), On Process (CG), Review (Sale), Revise
(CG), Final Approve, Final Render, Done — each with a count ≥ 0.

#### 9.2 Clicking a status card selects it
**Steps:** 1. Click a card (e.g. Review (Sale)).
**Expected:** Card `[pressed]`; a "Filter: <status>" chip appears.

#### 9.3 Clicking the "Filter: …" chip clears it *(to verify)*
**Expected:** Card no longer pressed; chip gone.

#### 9.4 (Head CG) Status card filters the Graphic Workload table
**Steps:** 1. As Head CG, click a status card with a non-zero count (e.g. Final Approve).
**Expected:** Workload rows reduce to graphics with a non-zero value in that status column.

---

### 10. Graphic Workload (Head CG)

#### 10.1 Table structure
**Expected:** Grid "Graphic Workload Table"; columns Graphic, the 9 statuses, Total; "N
graphics" badge = number of data rows; an "Unassigned" row is present.

#### 10.2 Row Total equals the sum of its status columns
**Expected:** For every row, Total = sum of the 9 status cells.

#### 10.3 Clicking a row focuses it *(to verify)*
**Steps:** 1. Click a graphic row.
**Expected:** Row highlighted; record whether other sections change.

---

### 11. SLA per Graphic (Head CG)

#### 11.1 Section renders
**Expected:** Scope dropdown "Everyone (Average)", "Selected Scope: Everyone (Average)", Month/Year
toggle, Feedback SLA and Progress SLA cards, Jan–Dec chart.

#### 11.2 SLA % matches its overdue counts
**Expected:** For each card, X% = round((M − N) / M × 100) where the card reads "N overdue of M".

#### 11.3 Month / Year toggle
**Steps:** 1. Toggle between Month and Year.
**Expected:** Active state switches; card values refresh *(record whether they change)*.

#### 11.4 Clicking an SLA card filters the chart line *(to verify)*
**Expected:** Clicked card selected; only its line remains / is emphasised in the chart.

#### 11.5 Scope dropdown options *(to verify)*
**Expected:** Lists Everyone (Average) plus individual graphics; picking one updates "Selected
Scope" and the cards.

---

### 12. Export Report — common behaviour (Head CG)

#### 12.1 Tabs and default state
**Expected:** Tablist "Report Type" with SLA (selected), Transaction, Airtime, Billing; button
"Export SLA".

#### 12.2 Switching tabs updates description, filters, table and export label
**Steps:** 1. Click each tab.
**Expected:** Each matches the table in Assumptions (description, filters, button "Export <Tab>").

#### 12.3 Not affected by the top date range / sale package
**Steps:** 1. Note "Showing N records" on SLA. 2. Click "Today" in the top bar (and separately
apply a sale package).
**Expected:** N unchanged.

#### 12.4 Per-page options and pagination
**Expected:** "per page" offers Auto, 10, 25, 50, 100; switching to 10 shows 10 rows and "Showing 1
to 10 of N"; Next/Prev move pages; Prev disabled on page 1 *(to verify)*.

---

### 13. Export Report — SLA tab (Head CG)

#### 13.1 Table columns
**Expected:** Job No, Ticket, Client, Product, Media, Graphic, Status, Feedback SLA, Progress SLA,
Created Date.

#### 13.2 Status filter options and effect
**Expected:** Options as listed in Assumptions; choosing one (e.g. Done) lowers "Showing N" and
every row's Status equals it.

#### 13.3 Media filter narrows rows
**Expected:** Every remaining row's Media equals the choice.

#### 13.4 Graphic filter narrows rows
**Expected:** Every remaining row's Graphic contains the choice.

#### 13.5 From / To date filter
**Expected:** Rows' Created Date fall within the range; count ≤ unfiltered *(to verify — see
Findings)*.

#### 13.6 Export SLA downloads a matching Excel file
**Steps:** 1. Click "Export SLA".
**Expected:** Download named `SLA_Report_DDMMYYYY_HHmm.xlsx`; one sheet "SLA Report" with the 10
headers; data rows = "Showing N records"; dialog "Export Successful — Exported N records to Excel";
OK closes it.

#### 13.7 Export respects active filters
**Steps:** 1. Apply a Status filter. 2. Export.
**Expected:** File data rows = filtered N; every Status cell equals the filter.

---

### 14. Export Report — Transaction tab (Head CG)

#### 14.1 Table has the 26 report columns
**Expected:** Transaction Date … Date Landlord Approve (see Assumptions table).

#### 14.2 Search by Quote / Company / Product
**Steps:** 1. Type a term present in the data (e.g. "biscuit").
**Expected:** "Showing N" drops; each row contains the term.

#### 14.3 Search with no match
**Expected:** "Showing 0 records" and "No records found".

#### 14.4 Sale Approve / Landlord Approve filters
**Expected:** Options All / Approved / Pending / Rejected; picking one narrows rows to that status.

#### 14.5 Export Transaction downloads a matching file
**Expected:** `Transaction_Report_DDMMYYYY_HHmm.xlsx`, sheet "Transaction Report", 26 headers, rows
= "Showing N"; success dialog.

---

### 15. Export Report — Airtime tab (Head CG)

#### 15.1 One row per job (fewer rows than Transaction)
**Expected:** "Showing N" for Airtime ≤ Transaction's N (one row per job vs one per Format).

#### 15.2 Search, approve filters
**Expected:** Same behaviour as 14.2–14.4.

#### 15.3 Export Airtime downloads a matching file
**Expected:** `Airtime_Report_DDMMYYYY_HHmm.xlsx`, sheet "Airtime Report", 26 headers, rows =
"Showing N"; success dialog.

---

### 16. Export Report — Billing tab (Head CG)

#### 16.1 Grouped table
**Expected:** "Showing N groups"; columns No., สื่อ/Pack, สินค้า, Version, จำนวน Prove จริง, จำนวน
Prove ที่เกิน, Rate / Prove, มูลค่า Prove ที่เกิน.

#### 16.2 Status / Media / Graphic / date filters
**Expected:** Same option lists as the SLA tab; picking one changes the group count.

#### 16.3 Export Billing downloads a 2-sheet file
**Expected:** `ค่าใช้จ่าย Prove เกิน DD Mon YY.xlsx`; sheets "สรุป" (N group rows, plus any summary
rows *(to verify — 10 rows for 8 groups)*) and "รายละเอียด Prove"; dialog "Exported N groups to
Excel (sheet สรุป) · M Prove rows in sheet รายละเอียด Prove" where M = detail sheet data rows.

#### 16.4 Billing amount = excess prove × rate *(to verify)*
**Expected:** In "สรุป", มูลค่า Prove ที่เกิน = จำนวน Prove ที่เกิน × Rate / Prove for each row.

---

### Notes from implementing sections 12-17 (verified live, Head CG)

- Filters are **per tab** (the From/To dates set on SLA are not carried to Transaction) and
  every filter is a react-aria dropdown: click the filter's *group* (its inner button has no
  size), then pick the item from the listbox. Filter selection works with Status = "Done" → 3
  records, + Media "Plan B TV" → 2, Graphic "CG - QA 2" → 25, From 15/10 → 22, 15-16/10 → 17.
- The date calendars are native month/year `<select>`s (month value 0-11). The report's table
  pager also has buttons named "1", "2", ... so day buttons must be scoped to the calendar
  popover or `getByRole('button', {name: '1'})` is ambiguous.
- "per page" re-renders asynchronously (Auto = 5 rows). Tests wait for the pager text
  ("Showing 1 to N of T") before reading rows, otherwise they read 5 stale rows.
- A Billing result with no groups renders **no** "Showing N groups" label at all (rather than
  "Showing 0 groups"); the helper treats a missing label, after waiting, as 0. Billing also has a
  **footer rowgroup** (totals) in addition to the body, so data rows are read from `<tbody>`.
- The Billing export's success text is "Exported N groups to Excel (sheet สรุป) · M Prove rows in
  sheet รายละเอียด Prove" (M = data rows of the detail sheet); the file name is
  `ค่าใช้จ่าย Prove เกิน DD Mon YY.xlsx`. In the page, the Billing tab description says
  "...exports 2 sheets" and the dialog text is exactly the one above.
- Billing row arithmetic holds on every row seen: มูลค่า Prove ที่เกิน = จำนวน Prove ที่เกิน × Rate /
  Prove (7,000), and the excess never exceeds the actual Prove count.
- Not covered (the sub-specs PB-2114...PB-2117 weren't attached): column meaning/format rules such
  as Quotation vs PB number prefixes (AC29) and Transaction vs Create dates (AC30).

### 17. Export edge cases

#### 17.1 Exporting with 0 matching rows
**Steps:** 1. On Transaction, search a no-match term. 2. Click Export.
**Verified live:** the Export button stays **enabled**, but clicking it does **nothing visible** —
no download, no "Export Successful" dialog, no warning and no error. Test 17-01 asserts exactly
that. It's a UX gap rather than a spec violation (PB-2112 only says "no data → no error"); if
the team adds a disabled button or a "nothing to export" message, update the test.

#### 17.2 Export dialog must be dismissed before further interaction
**Expected:** "Export Successful" modal is shown after every export; clicking OK closes it and
the page is interactive again.


---

### 18. Spec conformance — PB-2112 (Dashboard) & PB-2113 (Create Report)

Added 2026-10-21 after the user attached the Jira specs. Each requirement below was checked
against the live page. **Passing** rows are covered by ordinary tests above; **gaps** are written
as tests that assert the *spec* and are marked `test.fail(true, ...)` — they pass while the gap
exists and start failing ("unexpectedly passed") the moment the behaviour is fixed, at which
point remove the `test.fail` line. Each gap test was confirmed to fail for the intended reason
(not a locator typo) by running it with `test.fail` removed.

| # | Spec requirement | Live result (2026-10-21) | Test |
|---|---|---|---|
| S1 | KPI cards x8, recompute with the range (Req 1, 5; BR9; AC1, AC7) | OK — all 8 follow the range | 04-01, 02-06, 02-09 |
| S2 | Alerts: High-Version Job = job with **>3 Versions**; High-Proof Version = version with >3 Proofs (BR2-3) | Card subtitle reads "Jobs with >3 **prove rounds**" — wording differs from BR2 (counts not verifiable without driving the workflow) | 05-01 asserts the on-page text |
| S3 | Financial: 7,000/round, 20,000/Version (BR4-5, AC3-4) | OK for the arithmetic | 06-02 |
| S4 | Landlord / Media-Management-created tickets are **not** charged, only logged (BR6-7, AC5-6) | **Not automated** — needs tickets with >3 versions/proofs created by those roles across the CG/Sale workflow | - |
| S5 | Widgets include **Jobs by Period** (Today/Week/Month/Year) (Req 7, 2.1 #6) | **Missing** for every role | 18-01 (gap) |
| S6 | Click a status chip → Graphic Workload filtered/highlighted (BR10, AC8) | OK | 09-04 |
| S7 | Click a package → filter Job Type, click again to cancel (BR11, AC9) | OK (it also filters the whole page, consistent with BR13) | 07-02, 07-06, 08-02 |
| S8 | Job Type counts only Accepted jobs (BR12) | OK as an upper bound (legend total ≤ Total Jobs) | 08-03 |
| S9 | All widgets agree under any filter (BR13) | OK for package job counts vs Total Jobs | 07-05 |
| S10 | Range/filter with no data → empty state, no error (BR14, AC31) | OK — zeros everywhere + "No jobs found in the selected range" on the package card; the Job Type chart shows an all-zero chart rather than an empty state | 02-09 |
| S11 | SLA per Graphic: only Month/Year, **default Month** (BR28, AC17) | Options OK; **default is Year** | 11-01, 18-02 (gap) |
| S12 | Month = 1st of month → today; Year = 1 Jan → today (BR29-30, AC18-19) | Axis OK (Month day ticks, Year Jan → current month). Month ticks are every 5 days while Assumption 4 says Month points are **weekly** | 11-03 |
| S13 | SLA % = (not overdue / total) x 100 (BR25) | OK, rounded to nearest | 11-02 |
| S14 | Health level ดี >=90% / เฝ้าระวัง 80-89% / เสี่ยง <80% (BR26, AC14) | **Not shown** on the cards (only % and "N overdue of M") | 18-03 (gap) |
| S15 | Click an SLA card → chart shows **that** metric's line (2.3 #5, AC20) | Cards are visibility toggles: both active at start, clicking Feedback **hides** the Feedback line | 11-04 (actual), 18-07 (gap) |
| S16 | HCG can pick Everyone or an individual (BR32, BR36, AC20) | OK | 11-05, 11-02 |
| S17 | CG: own data only, no person selector (BR33, BR35, AC21) | No selector OK. But Graphic Workload shows 3 graphics for CG 1 (itself + 2 others) | 11-06 OK, 18-05 (gap) |
| S18 | Media Management: overview per package, per-person selector (BR34, BR37, AC22) | The spec card was wrong — SA confirmed the current page (same Everyone / person dropdown as Head CG) is correct | 18-04 |
| S19 | Sale/CS Support: no SLA section, no Report tab, no Export (BR40, AC27) | OK for Sale (CS Support has no test account) | 01-02 |
| S20 | CG/HCG/MM/Super Admin see the Report with 4 tabs (BR39) | OK; tab labels are SLA / Transaction / Airtime / Billing (spec order: SLA, Airtime, Transaction, Billing; names "... Report") | 01-03 |
| S21 | **Export as Excel and CSV** (Report #1, BR45, AC28) | Only Excel (.xlsx) downloads directly; no CSV and no format choice | 18-06 (gap) |
| S22 | CG export = only own jobs (BR41, AC23) | OK — every preview row and exported row lists the CG | 18-08 |
| S23 | Export file rows = preview rows (BR45) | OK (SLA/Transaction/Airtime/Billing explored; CG/SLA automated) | 18-08; rest pending |
| S24 | HCG per-package selection & only own packages (BR42, AC24); MM overview by package + own tickets (BR43, AC25); Super Admin all (BR44, AC26); out-of-scope rows excluded (BR46) | **Not automated yet** — needs package-ownership data per account (and no Super Admin account) | - |
| S25 | SLA clock rules: Feedback 24h, Progress 72h/48h, runs 24h incl. weekends, pauses on Sale side & holidays; AC10-13, AC15-16, AC32 | **Not automated** — requires driving a ticket through assign/accept/proof across roles and controlling time/Holiday Management | - |
| S26 | Terminology: spec says "Proof" (Total Proof, High-Proof Versions, Extra Proof Surcharge); UI says "Prove" | Wording difference only — tests assert the UI text | - |
| S27 | Report: Quotation vs PB number formats, Transaction/Create dates (AC29-30), column/filter detail (BR47) | Defined in sub-specs PB-2114...PB-2117 which weren't attached — **not assessed** | - |

### Open questions for the team
1. Is **Year** meant to be the default for SLA per Graphic (page) or **Month** (spec BR28/AC17)?
2. Should Media Management see the per-person SLA dropdown and workload rows (page) or not (BR34/37)?
3. Should a CG see other graphics in Graphic Workload (page shows 3 for CG 1) or only themselves (BR35)?
4. Is CSV export still wanted (spec), and is "Jobs by Period" still in scope?
5. Does the high-version alert count Versions (BR2) or prove rounds (card text)?

---

## Sections 19–24 — Export Report test-case document (PB-2114/2115/2116/2117)

Full ID → file mapping, non-automatable list, doc-vs-app discrepancies and the `data-testid` wishlist are in
`specs/export-report-testcase-mapping.md`.

| Section | Files | Scope |
|---|---|---|
| 19 | 19-01..19-04 | filters persist across tabs, double-click export, Sale 403, anonymous 401 |
| 20 | 20-01..20-12 | SLA: 24h feedback rule, "-" cells, order, counts, filters AND, inclusive dates, open-ended dates, export = table row-by-row, DD/MM/YYYY, From > To, reset, export 500/abort |
| 21 | 21-01..21-05 | Transaction/Airtime: split vs joined formats, search (API parity, case, spaces), `%` wildcard (expected-fail), export = table (26 cols), From > To + export 500 |
| 22 | 22-01 | Sales parity and Total (Sec) = Durations × spots |
| 23 | 23-01..23-04 | Billing: arithmetic invariants, workbook structure + reconcile, filters on both sheets, From > To + export 500 |
| 24 | 24-01 | role report scope ⊆ Super Admin; CG cannot widen via `graphicUserId` |

Verified facts added: report API `export=1` returns every row (billing returns `summary / details / rate / grandTotal`, quota 3, rate 7000);
`maxExportRows` 50000; picker buttons change name after a date is chosen; Job Type label differs between table and file; file cells may carry trailing spaces.

---

## Section 30 — Cross-check Dashboard ↔ list pages (Super Admin)

Basis agreed with the user: Created Date (Dashboard preset **Year**, lists unfiltered), statuses compared one by one, a mismatch fails the test.
Account: Super Admin (`SUPER_ADMIN_*` in `.env`). Helpers: `Dashboard/_cross-helpers.ts`.

| ID | File | What is compared |
|---|---|---|
| XC-ADM-01 | 30-01 | Jobs by Status cards = Status Overview of Media Ticket, Assign Ticket, Media Management (9 statuses + Cancelled) |
| XC-ADM-02 | 30-02 | Verify & Production: Verify card = Dashboard Assign + Verify; other statuses and Cancelled equal |
| XC-ADM-03 | 30-03 | Dashboard Total Jobs = list jobs + Draft jobs; Total Tickets = list tickets + Draft-only tickets (Draft comes from Export SLA) |
| XC-ADM-04 | 30-04 | table footer = sum of overview cards; same total on all three job lists; Media Ticket header jobs/tickets |
| XC-ADM-05 | 30-05 | clicking each status card gives that many rows (Media Ticket: ≤ card, tickets not jobs) and clears again |
| XC-ADM-06 | 30-06 | Σ rows per Media Group = all rows (job lists); Media Ticket groups cover every ticket (158 tickets → 188 group rows) |
| XC-ADM-07 | 30-07 | Graphic Workload column sums = jobs per status counted once per assigned graphic (Σ max(1, #CG)) |

Verified numbers (Year 2026, 22 Oct 2026): 158 tickets / 311 jobs on lists; Dashboard 165 tickets / 330 jobs → 7 Draft-only tickets, 19 Draft jobs.
Not a bug: workload totals exceed the status cards because a job with two CGs appears under both.
Verify & Production shows "311 tickets" in its header but the rows are jobs.

## Section 31 — Cross-check Dashboard ↔ list pages (Head CG: Head CG - QA)

Head CG's sidebar has Dashboard, Assign Ticket, Verify & Production only (no Media Ticket / Media Management).

**Media access rule (verified on UAT):** access is defined by the tree in User Management > Edit User (Media Group > Category > Media Type > **Panel Package**).
A Head CG sees a job exactly when the job's **Sale Package is ticked** in that tree. The "11 Media Groups" chips in the user list are not what decides visibility
(Head CG - QA has 36 of 52 packages ticked; unticked ones include Digital MRT, Signaturemax 3.0, Pid@MRT, BTS Ciltyline, …).
Jobs on those packages (e.g. JOB-0038-09 / JOB-26090021-01 "Digital MRT", JOB-0038-08 "Signaturemax 3.0") are correctly hidden. An earlier version of XC-HCG-01 compared by Media Group and was wrong; it was replaced.

| ID | File | Result |
|---|---|---|
| XC-HCG-01 | 31-01 | Export SLA of Head CG = Super Admin jobs whose Sale Package is granted (325 = 325, 0 missing, 0 extra); Assign Ticket rows = granted live jobs; Dashboard Total Jobs = granted live + Draft |
| XC-HCG-02 | 31-02 | Dashboard statuses = Assign Ticket overview, footer, header (Assign 170 / Verify 33 / … / Cancelled 29; 307 jobs) |
| XC-HCG-03 | 31-02 | Dashboard 325 jobs = 307 + 18 Draft; tickets = listed + Draft-only |
| XC-HCG-04 | 31-03 | Verify & Production = jobs where Graphic = Head CG - QA (24) |
| XC-HCG-05 | 31-04 | Graphic Workload sums = jobs counted once per assigned graphic |

All five pass. Helper: `userGrantedPackages()` in `Dashboard/_cross-helpers.ts` reads the ticked packages from the Edit User drawer.

## Section 32 — Cross-check Dashboard ↔ list pages (Media Management account)

Sidebar: Dashboard, Media Ticket, Media Management. Visibility rule is the same as Head CG: a job is visible when its Sale Package is ticked in the user's Media access (read from User Management by e-mail).
Numbers (Year 2026): Media Management list 296 jobs / 150 tickets; Dashboard 315 jobs / 157 tickets = 296 + 19 Draft jobs, 150 + 7 Draft-only tickets.

| ID | File | Result |
|---|---|---|
| XC-MM-01 | 32-01 | Export SLA = Super Admin jobs of granted packages; Media Management rows and Dashboard Total Jobs agree |
| XC-MM-02 | 32-02 | Dashboard statuses = Media Management overview, footer, header |
| XC-MM-03 | 32-02 | Dashboard totals = list + Draft (jobs and tickets) |
| XC-MM-04 | 32-02 | Media Ticket (this user's own requests: 8 tickets / 20 jobs) ≤ Media Management per status; header = sum of cards |
| XC-MM-05 | 32-03 | Graphic Workload sums = jobs counted once per assigned graphic |

All pass. Not verified: what exactly defines "own requests" on Media Ticket for this role (only the subset relation is checked).

## Section 33 — Cross-check Dashboard ↔ list pages (CG2: CG - QA 2)

CG2 has role **Team CG** but User Group **Super Admin** (full menu). Two different scopes apply:
- **Dashboard and Verify & Production = own jobs only** (Graphic = CG - QA 2): Dashboard 26 jobs / 19 tickets, Verify & Production 26 rows, no Draft.
- **Assign Ticket and Media Management = by Media access** (ticked Sale Packages): 304 jobs on both pages (Media Ticket shows 0 — no requests of its own).
So Dashboard (26) ≠ Assign Ticket / Media Management (304) by design for this account.

| ID | File | Result |
|---|---|---|
| XC-CG2-01 | 33-01 | Dashboard statuses = Verify & Production overview (Verify = Assign + Verify), Cancelled, footer |
| XC-CG2-02 | 33-01 | Export SLA has only own jobs; Verify & Production rows = own live jobs; Dashboard Total Jobs/Tickets = own jobs (+ Draft) / distinct tickets |
| XC-CG2-03 | 33-02 | Assign Ticket and Media Management rows = Super Admin jobs of granted packages; cards add up to rows |

All pass. Not covered: Graphic Workload (a CG sees other rows — see expected-fail 18-05).

## Section 34 — Cross-check Dashboard ↔ list pages (CG1: CG - QA)

Sidebar: Dashboard, Verify & Production. Dashboard and Verify & Production show **own jobs only** (Graphic = CG - QA), and only jobs whose Sale Package is ticked in the user's Media access (25 of 52 ticked).
Numbers (Year 2026): 37 jobs / 32 tickets, no Draft; Verify & Production 37 rows.

| ID | File | Result |
|---|---|---|
| XC-CG1-01 | 34-01 | Dashboard statuses = Verify & Production overview (Verify = Assign + Verify), Cancelled, footer |
| XC-CG1-02 | 34-01 | Export SLA has only own jobs; rows = own live jobs; Dashboard Total Jobs/Tickets = own jobs (+ Draft) / distinct tickets |
| XC-CG1-03 | 34-02 | visible jobs = Super Admin jobs where Graphic includes CG - QA and the package is granted; rows and Dashboard agree |

All pass. Sections 30–34 now cover Super Admin, Head CG, Media Management, CG2 and CG1.

## Team feedback on the spec-gap tests (22 Oct 2026)

| Test | Decision | Action |
|---|---|---|
| 18-01 Jobs by Period | OK — period tabs exist, heading not required | rewritten to check the Today/Week/Month/Quarter/Year tabs; passes |
| 18-03 health level | OK — not required | now checks the on-track % and "N overdue of M"; passes |
| 18-06 CSV | OK — Excel only | now checks that Export SLA downloads .xlsx; passes |
| 18-07 SLA card click | OK — lines shown by default, click hides own line | rewritten to that behaviour; passes |
| 18-04 Media Management person selector | Spec was wrong (confirmed by SA, 26 Oct) — the page is correct | test rewritten to assert the current behaviour (renamed `18-04-media-management-has-person-selector`); passes |
| 18-05 CG workload shows others | **DEFECT** | `test.fail` removed — the test fails until fixed |
| 18-02 SLA default period | **DEFECT** (confirmed by team, dev to fix; Year chip is active on open) | `test.fail` removed — the test fails until fixed |
| 21-03 `%` in search | not a real use case (test was self-made from doc case TRX-E03) | test deleted |

## Section 35 — Head CG sees only self and own team (confirmed with SA, 22 Oct 2026)

Rule: Head CG sees only themselves and the CGs listed under them in User Management > Edit User > "Team CG under this Head" (Head CG - QA: CG - QA, CG - QA 2, CG - QA 3).
"Unassigned" (workload row) and "Everyone (Average)" (SLA scope) are not people and are allowed (assumption — not yet confirmed).

| ID | File | Result |
|---|---|---|
| XC-HCG-06 | 35-01 | **DEFECT** — Graphic Workload also lists Prapat 'Net' Tochang, Sajjaporn 'Ben' Suksumranpaisan, CGDEV 'CGDEV' CGDEV, Head CG & Media Management - QA |
| XC-HCG-07 | 35-01 | **DEFECT** — SLA per Graphic scope dropdown offers the same four people outside the team |

Both tests fail until fixed. Not required by the tests: that every team member (e.g. CG - QA 3, no jobs) appears in the lists.

## Update 26 Oct 2026 — new column "Media Type (Epicor/SF)" in the Export Report
The SLA table/export went from 10 to 11 columns and Transaction / Airtime from 26 to 27 (new column right after Media / Media Type).
Tests updated (display only; data correctness is to be checked later): `SLA_COLUMNS` and `TRANSACTION_COLUMNS` in `Dashboard/_helpers.ts`, 14-01 (length from the list), and the specs that read a column by position (18-08, 20-01, 20-02, 20-03) now look the column up by name.
Still failing and deliberately left for the data-correctness round: 31-01/31-02/32-01/32-02 (Head CG / Media Management numbers no longer match the Media access rule or the list pages).
Observation for that round: the SLA report API returns jobs that are not shown in the table (20-02 records an annotation).
