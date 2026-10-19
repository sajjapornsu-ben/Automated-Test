# Create Ticket — Test Plan (Manual mode)

**Application:** Media Control (UAT) — https://uat-mediacontrol.planbmedia.co.th
**Seed:** `seed.spec.ts`
**Page under test:** Create Ticket (`/mediaApproval/mediaTicket/create`)
**Requirement:** Jira PB-1861

## Scope

Per direction from the user (2026-09-21), this plan covers **Manual entry mode** only (the
"No Quotation Number" switch turned ON) — the flow described in the requirement's Business Rule
#2 and AC2. QT mode (pulling Client/Product/Contract/Quotation Items from Salesforce via a PB
number, Business Rule #1 / AC1) is explicitly deferred and not covered here.

**Out of scope for this plan:**
- **QT mode** (Salesforce PB lookup) — deferred per the scope decision above; the user
  explicitly confirmed (2026-09-21) that everything else previously listed as out-of-scope
  (Media Management role, Airtime Allocate, real file upload, over-quota/over-round overage
  flows, Customize Package) should now be covered — see sections 7-11 below.

Section 7 (Media Management role) uses a second account with that role
(`MEDIA_MANAGEMENT_EMAIL`/`MEDIA_MANAGEMENT_PASSWORD` in `.env`, via the `loginAsMediaManagement`
helper) since the primary `sajjaporn.su` account does not have it.

## Assumptions / verified facts (from live exploration, not just the requirement doc)

- Every scenario starts from the seed's post-login Home page, then navigates: Home → "MEDIA
  APPROVAL" → "Media Ticket" → "Create Ticket" link/button.
- Submitting a ticket on UAT **creates a real record** (confirmed by actually completing one
  full submission during planning — a ticket with client "QA Test Client <timestamp>" now
  exists on UAT). Test scenarios that submit should keep using clearly-tagged, obviously-fake
  data (e.g. a "QA Test Client" prefix with a timestamp) so seeded test tickets are easy for the
  team to recognize and clean up later.
- **Real-record tests are skipped by default** (2026-09-24, per user feedback that regular
  regression runs were littering UAT with too many QA test tickets): every test that actually
  calls "Submit ticket" or "Save as draft" starts with
  `test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, ...)`, so a normal `npx playwright test` run
  reports them as skipped and creates nothing. Run `npm run test:uat-submit` (or
  `RUN_UAT_SUBMIT_TESTS=1 npx playwright test`) to actually exercise them. Currently this is:
  `06-01-full-manual-submission-happy-path.spec.ts`, `06-02-save-as-draft.spec.ts`, and
  `11-01-airtime-allocate-cross-page-verification.spec.ts` (which also covers what was
  previously two separate Airtime Allocate tests, merged into one flow so it only creates 1
  ticket instead of 2). Apply the same `test.skip` guard to any future test that submits or
  saves a real ticket.
- The page defaults to QT mode (the "No Quotation Number" switch is OFF); toggling it ON reveals
  the Manual-mode banner and the full Ticket Header form. Before toggling, only the QT search
  box and empty Job/Summary panels are visible.
- **Submit is a two-step confirmation, not a single click**: clicking "Submit ticket" opens a
  dialog "Confirm sending this Ticket? Once confirmed, the system will create this Ticket and
  forward all jobs to the graphics team for the next step." (Cancel / Confirm). Confirming shows
  a second dialog, "Ticket submitted successfully" (OK). Clicking OK redirects to
  `/mediaApproval/mediaTicket` (the Media Ticket list) — not to a ticket-specific "Assign"
  screen as the requirement's wording might suggest; treat this as the actual, verified
  redirect target rather than the literal requirement text.
- Required-field validation on Submit shows a modal dialog headed "Something Went Wrong" with a
  field-specific message (e.g. "Please specify the Duration (minutes and seconds) for every
  Job") and an OK button; the offending input(s) get a red outline, marked in the DOM with
  `aria-invalid="true"`. Validation stops at the first problem found rather than listing every
  error at once — confirmed for both a missing Job Duration ("Please specify the Duration
  (minutes and seconds) for every Job") and, when Material and Brief are both empty, Material is
  reported first ("Please provide Material (link or attached file) for every Version"); Brief's
  own message was not observed since Material always blocks first when both are missing.
- Clicking "Add Job" adds a job card that **already contains one Version ("Version 1", status
  "Draft")** — you don't need a separate action to get the first version.
- The Media Category → Media Group → Media Type selects are multiselect popovers (checkbox list
  with a search box), not native `<select>` elements, and each level is disabled until its
  parent is chosen. For Category "DIGITAL", Media Group offers: Digital, Airport, Classic,
  Digital VGI, Retail, Transit, Transit VGI. Escape does not close these popovers; click
  elsewhere on the page instead.
- The two Contract date buttons and the two Job Period date buttons all render as plain
  "DD/MM/YYYY" buttons until a date is picked (after which the button's own accessible name
  becomes the picked date) — a useful trick for locating "the next empty date button" once
  earlier ones have been filled.
- Version Duration dropdown options are exactly: 7.5 seconds, 15 seconds, 30 seconds, 45
  seconds, 60 seconds (default 7.5) — matches AC6.
- The Job card shows a live Quota badge once Package + Job Period are both set (e.g. "Version
  1/3"), matching the formula `Quota = 3 × Pack quantity × ceil(Period in months)`.
- Contract Period and Job Period both render an auto-calculated duration next to the date
  inputs (e.g. Contract Period shows Thai text like "1 เดือน"; Job Period shows a day-count
  badge like "21 วัน").
- **Media Management role** (logged in as the `MEDIA_MANAGEMENT_EMAIL` account): Manual mode
  shows an extra "Created by Media Management as:" radiogroup (Landlord / Plan B / Other,
  defaulting to Landlord) right above Sales Person. No other field changes were found anywhere
  in the form for any of the 3 choices — AC13's "expense exemption" has no distinguishing UI
  element, so it isn't directly assertable beyond the radio selection itself.
- **File upload**: the "Click to upload or drag and drop" dropzones are real `<input
  type="file" multiple>` elements (2 per Version: Material, Brief), reachable via
  `page.locator('input[type="file"]')`/`setInputFiles`. A successful upload shows the filename
  as a download link, a byte-size badge, and a "Remove file" button, and updates the "X B / 50
  MB" counter. Selecting a file over 50MB is **silently rejected** client-side — no toast/error,
  the dropzone just stays at "0B / 50 MB" with no file added (a UX gap worth flagging, not
  fixing).
- **Customize Package**: one of the regular Package dropdown options (e.g. "Customize BKK (Plan
  B TV)") — not a separate action. Selecting it reveals an extra required "Media Code *" field
  (a searchable popover of location codes like "DGT001 - AIATower(ถนนสุรวงศ์)") that doesn't
  appear for non-customize packages.
- **Version-over-quota flow**: clicking "Add Version" once the Job's Quota is already fully used
  (e.g. "3/3") opens a "Version Quota Reached" dialog ("This Package has a Version Quota of 3
  (used 3). To add more Versions, please attach an evidence file.") with an "Attach Files"
  dropzone (required), an optional "Reason for requesting additional Version" textbox, and
  Cancel/"Confirm Add Version" (disabled until a file is attached). Attaching a file enables
  Confirm; confirming adds the extra version and updates the version-count badge normally.
- **Airtime Allocate cross-page verification**: a submitted (non-draft) ticket's detail page
  (`/mediaApproval/mediaTicket/<TK-...>`) has an "Airtime Allocate" link to
  `/mediaApproval/airtimeAllocate/<TK-...>`. That page shows, per Package, a summary badge ("Plan
  X Min. Y Sec." from the Job Duration set at creation, plus "Used"/"Over" once allocated) and a
  table row per Job/Version reusing the Version's Duration as the default value. "Total" =
  Duration × "Number Spot/Loop", auto-calculated live, and is **not capped** — entering enough
  Spot/Loop to exceed the Plan just updates the badge to show "Used" and "Over" amounts rather
  than blocking input.

---

### 1. Entry & Mode Switching

#### 1.1 Create Ticket opens in QT mode by default
**Steps:**
1. Navigate to Media Ticket, click "Create Ticket".

**Expected:**
- URL is `/mediaApproval/mediaTicket/create`.
- The "No Quotation Number" switch is OFF.
- Only the "Search by Quotation Number" PB input + "Pull SF data" button are visible; no
  Ticket Header fields, no Manual-mode banner.
- "Ticket details" section shows "No Jobs yet".

#### 1.2 Switching to Manual mode reveals the full header form
**Steps:**
1. Navigate to Create Ticket.
2. Toggle "No Quotation Number" ON.

**Expected:**
- A banner appears: "Manual entry mode — No Quotation Number, fill in details manually".
- The Ticket Header fields appear: Sales Person (pre-filled with the current user), Client,
  Product, Contract Start – End, Contract Period (read-only), Media Category, Media Group
  (disabled until Category is chosen), Media Type (disabled until Group is chosen), CS Support.

---

### 2. Ticket Header

#### 2.1 Sales Person is pre-filled from the logged-in user
**Steps:**
1. Navigate to Create Ticket, switch to Manual mode.

**Expected:**
- The Sales Person field already contains the current user's display name (not empty).

#### 2.2 Contract Period auto-calculates from Start/End dates
**Steps:**
1. Switch to Manual mode.
2. Pick a Contract Start date and a Contract End date about a month apart.

**Expected:**
- The read-only "Contract Period" field updates to show a calculated duration (e.g. "1 เดือน")
  without any direct input.

#### 2.3 Media Group options depend on the selected Media Category
**Steps:**
1. Switch to Manual mode.
2. Open the Media Group selector before choosing a Category.
3. Choose a Media Category (e.g. "DIGITAL").
4. Open the Media Group selector again.

**Expected:**
- Before step 3, Media Group shows a "Select Media Category first..." placeholder and cannot be
  opened/has no options.
- After step 3, Media Group becomes enabled and lists options belonging to that category.

#### 2.4 Media Type options depend on the selected Media Group
**Steps:**
1. Complete steps from 2.3, then select a Media Group option (e.g. "Digital").
2. Open the Media Type selector.

**Expected:**
- Media Type becomes enabled only after a Media Group is chosen, and lists relevant options
  (e.g. "Plan B TV").

---

### 3. Job Management

#### 3.1 Adding a Job creates a job card with one default Version
**Steps:**
1. Fill the Ticket Header (Manual mode) with valid data.
2. Click "Add Job".

**Expected:**
- A job card appears with a "1 version" badge, a Package selector, Pack quantity (default 1), a
  Quota indicator, Job Duration (minutes/seconds) inputs, and a Job Period date range.
- Inside the job card, "Version 1" (status "Draft") is already present.

#### 3.2 Selecting a Package updates the Ticket summary
**Steps:**
1. Add a Job.
2. Select a Package from the dropdown (e.g. "PlanBTV_80Red (Plan B TV)").

**Expected:**
- The Package selector shows the chosen package.
- The "Ticket summary" panel at the bottom updates its Versions section to reference that
  package instead of "(unset package)".

#### 3.3 Job Quota badge appears once Package and Period are both set
**Steps:**
1. Add a Job, select a Package.
2. Set the Job Period (start and end dates about 3 weeks apart).

**Expected:**
- The Quota badge changes from "—" to a "Version X/Y" indicator (e.g. "1/3"), consistent with
  `Quota = 3 × Pack × ceil(months in Period)`.

#### 3.4 Removing a Job removes its card
**Steps:**
1. Add a Job.
2. Click the "Remove this Job" (×) control on the job card.

**Expected:**
- The job card disappears; "Ticket details" reverts to the "No Jobs yet" empty state (assuming
  no other jobs exist).

---

### 4. Version Management

#### 4.1 Add Version adds another version card under the same Job
**Steps:**
1. Add a Job (which starts with Version 1).
2. Click "Add Version" on that job.

**Expected:**
- A "Version 2" card appears below Version 1, also with status "Draft".
- The job's version-count badge updates (e.g. "1 version" → "2 versions").

#### 4.2 Version Duration only offers the fixed allowed values
**Steps:**
1. Add a Job/Version.
2. Open the Version's Duration dropdown.

**Expected:**
- The only options are: 7.5 seconds, 15 seconds, 30 seconds, 45 seconds, 60 seconds.

#### 4.3 Version Nickname reflects in a live label
**Steps:**
1. Add a Job/Version.
2. Type a nickname into the Version's Nickname field (e.g. "Teaser 15s").

**Expected (as written in AC5):**
- The version's display label updates to something like "V1 · Teaser 15s".

**Verified live (2026-09-21) — discrepancy from AC5:** no such label exists anywhere else in
the form. The nickname is saved only into its own field (with a live "10/60"-style character
counter); the "Version 1 / Draft" heading above it does not change. Test
`04-03-version-nickname-input-and-counter.spec.ts` asserts the actual behavior (value + counter)
rather than the AC5 label, per the same "verify against the live app, not the doc" policy used
for the Media Ticket recheck.

#### 4.4 Removing a Version removes its card
**Steps:**
1. Add a Job with 2 versions (via Add Version).
2. Click "Remove version" on the second version.

**Expected:**
- Version 2's card disappears; Version 1 remains; the job's version-count badge updates back
  down.

---

### 5. Validation

#### 5.1 Submitting with a missing Job Duration is blocked
**Steps:**
1. Fill the Ticket Header and add a Job with a Package selected, but leave Job Duration (min/sec)
   empty.
2. Click "Submit ticket".

**Expected:**
- A "Something Went Wrong" dialog appears: "Please specify the Duration (minutes and seconds)
  for every Job."
- The Duration inputs are outlined in red.
- The ticket is not created (URL stays on `/mediaApproval/mediaTicket/create`).

#### 5.2 Submitting with a missing Material or Brief is blocked
**Steps:**
1. Fill the Ticket Header, add a Job with Package/Duration/Period set, and a Version with
   Duration set — but leave Material and Brief both empty.
2. Click "Submit ticket".

**Expected:**
- Submission is blocked with an error indicating Material/Brief is required (exact wording to
  be confirmed when generating this test), matching AC19.

---

### 6. Submit & Save as Draft

#### 6.1 Full Manual-mode submission succeeds (happy path)
**Steps:**
1. Switch to Manual mode; fill Client, Product, Contract Start–End, Media Category, Media
   Group, Media Type.
2. Add a Job: select a Package, set Job Duration and Job Period.
3. On Version 1: leave Duration at its default, paste a Material link and a Brief link.
4. Click "Submit ticket", then "Confirm" on the confirmation dialog.

**Expected:**
- A "Ticket submitted successfully" dialog appears.
- Clicking "OK" redirects to the Media Ticket list (`/mediaApproval/mediaTicket`).
- The newly created ticket (matching the Client name used) is visible in that list.

#### 6.2 Save as Draft keeps the ticket editable and unsent
**Steps:**
1. Fill the Ticket Header only (no Job yet, or a partially-filled Job).
2. Click "Save as draft".

**Expected:**
- Per the requirement (AC21), the ticket is saved with Draft status and is not sent for
  Assign — confirm the actual UI feedback (redirect vs. staying on the page vs. a toast) live
  when generating this test, since it hasn't been directly observed during planning.

---

### 7. Media Management role (AC12/AC13)

Uses `loginAsMediaManagement` (a second account, since `sajjaporn.su` lacks this role).

#### 7.1 Media Management role reveals the "Created by" radio group
**Steps:**
1. Log in as the Media Management-role account, open Create Ticket, switch to Manual mode.

**Expected:**
- A "Created by Media Management as:" radiogroup appears above Sales Person with options
  Landlord / Plan B / Other, defaulting to "Landlord" checked.

#### 7.2 Switching the "Created by" selection updates which option is checked
**Steps:**
1. As 7.1. Click "Plan B", then click "Other".

**Expected:**
- Only one radio is checked at a time; each click moves the checked state to the clicked option
  (Landlord → Plan B → Other).

---

### 8. File Upload (AC18)

#### 8.1 Uploading a file via the dropzone attaches it
**Steps:**
1. Add a Job (Version 1's Material dropzone is a real file input).
2. Select a small file for the Material dropzone.

**Expected:**
- The filename appears as a download link, with a byte-size badge and a "Remove file" button;
  the dropzone's "X B / 50 MB" counter updates.

#### 8.2 Removing an uploaded file removes it
**Steps:**
1. As 8.1, then click "Remove file".

**Expected:**
- The filename link disappears from the dropzone.

#### 8.3 Selecting a file over 50MB is rejected
**Steps:**
1. Select a file larger than 50MB for the Material dropzone.

**Expected (verified live):** the file is silently rejected — no crash, no toast; the dropzone
counter stays at "0B / 50 MB" and no filename is added.

---

### 9. Customize Package

#### 9.1 Selecting a Customize package reveals a required Media Code field
**Steps:**
1. Add a Job, open the Package selector, choose a "Customize ..." package (e.g. "Customize BKK
   (Plan B TV)").

**Expected:**
- A "Media Code *" selector appears (not shown for non-customize packages).

#### 9.2 Selecting a Media Code fills the field
**Steps:**
1. As 9.1, open the Media Code selector and choose an option (e.g. "DGT001 -
   AIATower(ถนนสุรวงศ์)").

**Expected:**
- The Media Code button's text updates to the chosen code.

---

### 10. Version-over-quota flow (AC15/AC16/AC17)

#### 10.1 Adding a Version beyond the Quota requires an evidence file
**Steps:**
1. Add a Job, select a Package + Period that gives a small Quota (e.g. "3"), then click "Add
   Version" enough times to exceed it.

**Expected:**
- A "Version Quota Reached" dialog appears: "This Package has a Version Quota of N (used N). To
  add more Versions, please attach an evidence file." with a required "Attach Files" dropzone, an
  optional Reason textbox, and Cancel/"Confirm Add Version" — Confirm starts disabled.

#### 10.2 Attaching evidence and confirming adds the over-quota version
**Steps:**
1. As 10.1, attach a file to the evidence dropzone, then click "Confirm Add Version".

**Expected:**
- "Confirm Add Version" becomes enabled once a file is attached; confirming adds the extra
  version and the job's version-count badge updates normally (e.g. "3 versions" → "4 versions").

---

### 11. Airtime Allocate cross-page verification (AC7/AC8/AC9)

#### 11.1 Job/Version values carry over, and Total auto-calculates uncapped
**Note:** originally planned as two separate scenarios (11.1 carry-over, 11.2 Total
auto-calc/uncapped); merged into a single test (2026-09-24) so it submits only 1 real UAT ticket
instead of 2.

**Steps:**
1. Submit a Manual-mode ticket (Package + Job Duration + Version Duration all known values).
2. From the ticket's detail page, click "Airtime Allocate".
3. Pick a Duration value and enter a "Number Spot/Loop" count.

**Expected:**
- URL is `/mediaApproval/airtimeAllocate/<TK-...>`.
- The Package summary badge shows "Plan {Job Duration}" matching what was set at creation.
- The allocation table has one row per Job/Version, with the Version's Duration (e.g. "7.5sec")
  pre-selected as the row's Duration.
- "Total" = Duration × Number Spot/Loop, updating live.
- Entering enough Spot/Loop to exceed the Package's Plan quota is accepted (not blocked); the
  Package badge instead shows "Used"/"Over" amounts (verified live — not a hard cap).

---

### 12. Data-driven testing (proof of concept)

Per user direction (2026-09-25): a proof-of-concept exploring whether Playwright can read test
data from a spreadsheet file and use it to fill the Create Ticket form, instead of hardcoding
values in each spec. Uses the `xlsx` (SheetJS) package to read
`Project/Media Control/CreateTicket/data/create-ticket-cases.xlsx` (2 rows: Client, Product,
Package, DurationMinutes, DurationSeconds, MaterialLink, BriefLink columns — regenerate via
`node data/generate-sample-xlsx.js` if the fixture needs editing) and loops one `test()` per row.

#### 12.1 Filling the Create Ticket form from spreadsheet rows
**Steps:**
1. Read all rows from `create-ticket-cases.xlsx`.
2. For each row: switch to Manual mode, fill Client/Product from the row, add a Job, select the
   row's Package, fill Material/Brief from the row (Contract dates and Job Period stay fixed —
   1st to 21st/28th of the visible month — to keep the POC simple; not read from the sheet).

**Expected:**
- The Ticket Header and Ticket summary panel reflect each row's Client/Product/Package
  correctly.
- **Does not submit** — this POC only proves the fill mechanism works; it doesn't create real
  UAT records, so no `RUN_UAT_SUBMIT_TESTS` gate is needed. If this pattern gets adopted for
  real submission flows later, apply the same gate per row (each row would create 1 ticket).

#### 12.2 [Gated] Submitting a real ticket per spreadsheet row
Per user direction (2026-09-25): same data source and columns as 12.1 — no new columns needed,
since Client/Product/Package/DurationMinutes/DurationSeconds/MaterialLink/BriefLink already
cover everything a full Submit needs (Contract dates and Job Period stay fixed, same as every
other submit test).

**Steps:**
1. Read all rows from `create-ticket-cases.xlsx`.
2. For each row: fill the header and Job exactly as in 12.1, then actually click "Submit
   ticket" → "Confirm".

**Expected:**
- A "Ticket submitted successfully" dialog appears; clicking "OK" redirects to the Media Ticket
  list, where the new ticket (Client tagged with a timestamp for traceability, e.g. "SAWASDEE
  1790...") is visible.
- **Creates one real UAT ticket per row** — gated behind `test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, ...)`,
  same as the other submit tests. The fixture file currently has 1 row (the user replaced the
  original 2-row sample by editing the .xlsx directly), so a run currently creates 1 ticket; add
  more rows and it scales accordingly.
- Note: the `data/generate-sample-xlsx.js` script is now out of sync with the live `.xlsx` (the
  user edited the spreadsheet directly rather than through the script) — that's fine, the script
  is just an optional convenience for code-based edits and isn't read by the tests.
