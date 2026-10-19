# Media Ticket Detail — Test Plan (Add Job / Cancel Job / View History / Back)

**Application:** Media Control (UAT) — https://uat-mediacontrol.planbmedia.co.th
**Seed:** `seed.spec.ts`
**Page under test:** Media Ticket Detail (`/mediaApproval/mediaTicket/<TK-...>`)

## Scope

Per direction from the user (2026-09-24), this plan covers 4 specific areas of the Ticket Detail
page reached via Media Approval → Media Ticket → (open a ticket): **Add Job**, **Cancel Job**,
**View History**, **Back**. Nothing else on this page (e.g. the "Sync" QT/Salesforce pull,
Assign-related workflow, attachments UI) is in scope unless the user asks later.

## Real-record discipline (carried over from the Create Ticket suite)

Per the same 2026-09-24 feedback that drove the `RUN_UAT_SUBMIT_TESTS` gate on the Create Ticket
suite, this plan keeps the same discipline:
- **Read-only scenarios** (opening/closing dialogs, viewing a form without saving it) run
  against one **fixture ticket** — `TK-26090085` (`QA Test Client 1789987002570` / `QA Test
  Product`), a leftover QA ticket from the Create Ticket suite's own testing, referenced by a
  `FIXTURE_TICKET_NO` constant in `_helpers.ts`. These scenarios don't mutate anything, so
  reusing one fixture doesn't add UAT clutter. If this ticket is ever deleted/cancelled by
  someone, create a similar throwaway "QA Test Client ..." Manual-mode ticket with 1 Job and
  update the constant.
- **Mutating scenarios** (actually saving a new Job, actually confirming a Job cancellation) are
  gated behind `test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, ...)`, same as the Create Ticket
  submit/draft tests, and each creates its own disposable ticket at test time (via the
  `CreateTicket/_helpers.ts` flow) rather than mutating the shared fixture — so a normal
  `npx playwright test` run touches nothing, and an opted-in `npm run test:uat-submit` run stays
  self-contained per test.

## Assumptions / verified facts (from live exploration)

- Every scenario starts from the seed's post-login Home page. Non-mutating scenarios navigate
  directly to `/mediaApproval/mediaTicket/<FIXTURE_TICKET_NO>` (faster and avoids list-page
  pagination); mutating scenarios go through Create Ticket first to get a fresh ticket, then to
  that ticket's detail page.
- **Login race condition**: navigating straight to a URL right after `login()` can race the
  app's own post-login client-side redirect and land on `/dashboard` instead. Always wait for
  `getByRole('button', { name: 'Log Out' })` to be visible after `login()` before doing anything
  else (including `page.goto`).
- **Header actions**: the ticket detail page's header has (left to right) a status pill (e.g.
  "Assign"), an "Airtime Allocate" link (see `create-ticket-plan.md` §11), a "History" button,
  and a "Back" button.
- **Back** navigates to `/mediaApproval/mediaTicket` (the Media Ticket list) — a plain
  navigation, no confirmation dialog.
- **History** opens a `dialog` named "Activity History" listing an activity log (e.g. "<user>
  <date time> สร้าง Ticket"). It has an icon-only close button (first button inside the dialog)
  that dismisses it without navigating away.
- **Add Job** replaces the "Add Job" button's row with an inline "New Job" form (not a separate
  page/modal) and disables the "Add Job" button while that form is open (so only one new Job can
  be drafted at a time). The form has: Package selector, Duration (Minutes/Seconds), Period (2
  date buttons), Pack Quantity, a "Version Quota" readout (starts at "Quota —"), a "Versions"
  sub-section (starts with "1 version", an "Add Version" button, and "Version 1 Draft" with its
  own Duration/Nickname/Material/Brief/Note fields, mirroring Create Ticket's Job/Version
  fields), and "Cancel"/"Save Job" buttons at the bottom of the form.
- Clicking **"Remove Job"** (the icon button next to the new-job form, distinct from "Cancel Job"
  below) discards the inline new-job form entirely and re-enables the page's "Add Job" button —
  without saving anything.
- Each existing Job on the ticket has its own **"Cancel"** button (top-right of that Job's card).
  Clicking it opens a `dialog` headed "Cancel Job" (level 2), labeled with the Job No (e.g. "JOB
  JOB-26090085-01"), with the text "This cancels only this Job. The Ticket and other Jobs keep
  their current status." — i.e. **this is a per-Job cancel, not a ticket-level cancel**. It has
  a required-looking "Cancel Reason" `combobox` (options: — Select Reason —, Customer changed
  material spec, Media not available in period, Production timeline missed, Landlord rejected,
  Replaced by new job, Wrong job created, Other), an optional "Remark" textbox, a "Close" button,
  and a "Confirm Cancel" button.
  - **Caution / unverified**: "Confirm Cancel" was NOT observed to be disabled even before a
    Cancel Reason is chosen — unlike Create Ticket's Submit flow, there's no confirmed
    client-side gating here. This wasn't pushed further live (to avoid actually cancelling a Job
    with no reason on shared data). The gated Confirm-Cancel test (4.3) always selects a real
    reason before confirming; whether Confirm Cancel truly requires a reason is left
    unconfirmed and not asserted.
  - **Verified live (2026-09-24) — cancelling a ticket's *only* Job cascades to cancel the whole
    ticket**: the detail page is replaced entirely by a plain "This ticket has been cancelled" /
    "Back to Media Ticket" placeholder, not the normal Job list with a "Cancelled" status pill.
    This only reproduces when the Job being cancelled is the ticket's last remaining one. To
    actually exercise the dialog's own claim ("the Ticket and other Jobs keep their current
    status"), test 4.3 adds a 2nd Job first, then cancels one of the two — confirming the
    cancelled Job shows "Cancelled", the other Job stays "Assign", and the ticket page itself
    stays normal.
- **Add Job's inline form auto-prefills Duration and Period** from the ticket's existing Job (so
  a fresh "New Job" form already has valid Duration/Period values without touching those
  fields) — only Package (and Material/Brief per Version) need to be filled to make the form
  saveable. The Package field here is a native `<select>`-style listbox
  (`getByRole('option', ...)`), unlike Create Ticket's own Package field which is a
  button-triggered popover — don't reuse `closeOpenPopover` for it, it isn't needed (the listbox
  closes itself on selection).
- Saving a new Job shows a success dialog headed "Job Added" ("New job added successfully",
  "OK"). Confirming a Job cancellation shows one headed "Job Cancelled" ("Job {Job No} cancelled
  successfully", "OK").
- A job-level "Cancel" button positioned lower on the page can be occluded by a sticky breadcrumb
  bar during `scrollIntoViewIfNeeded()`, causing a plain `.click()` to hang (same class of bug
  documented in `create-ticket-plan.md` for Job Period date buttons). Where this happens, scroll
  first and retry, or use the same fix pattern already established (a stable anchor / explicit
  scroll) rather than blindly reaching for `force: true`.

---

### 1. Back

#### 1.1 Back returns to the Media Ticket list
**Steps:**
1. Open the fixture ticket's detail page.
2. Click "Back".

**Expected:**
- URL becomes `/mediaApproval/mediaTicket`.

---

### 2. View History

#### 2.1 History opens the Activity History dialog
**Steps:**
1. Open the fixture ticket's detail page.
2. Click "History".

**Expected:**
- A dialog titled "Activity History" appears, listing at least one activity entry (e.g. "...
  สร้าง Ticket").

#### 2.2 Closing the Activity History dialog
**Steps:**
1. As 2.1, then click the dialog's close button.

**Expected:**
- The dialog is no longer visible; the ticket detail page underneath is unaffected.

---

### 3. Add Job

#### 3.1 Add Job opens an inline new-job form
**Steps:**
1. Open the fixture ticket's detail page.
2. Click "Add Job".

**Expected:**
- An inline "New Job" form appears (Package, Duration, Period, Pack Quantity, Quota, Versions
  sub-section with Version 1, Cancel/Save Job buttons).
- The page's "Add Job" button becomes disabled while the form is open.

#### 3.2 "Remove Job" discards the new-job form without saving
**Steps:**
1. As 3.1, then click "Remove Job".

**Expected:**
- The inline form disappears; the existing Job list is unchanged; "Add Job" is enabled again.

#### 3.3 [Gated] Saving a new Job actually adds it to the ticket
**Steps:**
1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already).
2. On its detail page, click "Add Job". Duration/Period auto-prefill from the existing Job
   (verified live — see Assumptions), so only Package and Material/Brief need filling. Click
   "Save Job".

**Expected:**
- A "Job Added" success dialog appears ("New job added successfully", "OK").
- The new Job appears in the Jobs list; the Jobs count badge increments (e.g. "1 job" → "2
  jobs").

---

### 4. Cancel Job

#### 4.1 Cancel opens the "Cancel Job" dialog for that specific Job
**Steps:**
1. Open the fixture ticket's detail page.
2. Click the Job's "Cancel" button.

**Expected:**
- A dialog headed "Cancel Job" appears, naming the specific Job No, with the text "This cancels
  only this Job. The Ticket and other Jobs keep their current status.", a "Cancel Reason"
  dropdown, an optional "Remark" field, and "Close"/"Confirm Cancel" buttons.

#### 4.2 Closing the Cancel Job dialog leaves the Job unchanged
**Steps:**
1. As 4.1, then click "Close".

**Expected:**
- The dialog closes; the Job's status/data on the page is unchanged.

#### 4.3 [Gated] Confirming with a reason actually cancels the Job
**Steps:**
1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job already), then add a
   2nd Job to it (see 3.3) — cancelling a ticket's *only* Job cascades to cancel the whole
   ticket (verified live), which wouldn't exercise the "other Jobs keep their current status"
   claim.
2. Click the 2nd Job's "Cancel" button, select a Cancel Reason, click "Confirm Cancel".

**Expected:**
- A "Job Cancelled" success dialog appears ("Job {Job No} cancelled successfully", "OK").
- The cancelled Job's status updates to "Cancelled"; the other Job stays "Assign"; the ticket
  detail page itself is unaffected (not replaced by the "This ticket has been cancelled"
  placeholder).

---

### 5. Full flow (fresh ticket)

Per user direction (2026-09-24): sections 1-4 above stay as focused, one-behavior-per-file tests
against the shared `FIXTURE_TICKET_NO`. This section adds a **separate, self-contained flow**
that provisions its own fresh ticket and exercises all 4 areas (Back, View History, Add Job,
Cancel Job) end-to-end in a single file — useful as a standalone smoke test that doesn't depend
on the fixture ticket still existing. It duplicates coverage of 1.1/2.1/2.2/3.1/3.2/3.3/4.1/4.2/4.3
rather than replacing them.

#### 5.1 [Gated] End-to-end Ticket Detail flow on a freshly created ticket
**Steps:**
1. Create a fresh disposable ticket via Create Ticket (Manual mode, 1 Job).
2. On its detail page: open History and close it.
3. Add Job: open the inline form and discard it via "Remove Job"; then open it again for real,
   fill Package + Material/Brief, and "Save Job" (Duration/Period auto-prefill).
4. Cancel Job: open the 2nd Job's "Cancel Job" dialog and close it without confirming; reopen
   it, select a Cancel Reason, and "Confirm Cancel" for real.
5. Click "Back".

**Expected:** each step's behavior matches its counterpart in sections 1-4 (dialogs/success
messages/status changes as documented above), and the final "Back" click lands on
`/mediaApproval/mediaTicket`.
