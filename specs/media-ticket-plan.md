# Media Ticket — Test Plan

**Application:** Media Control (UAT) — https://uat-mediacontrol.planbmedia.co.th
**Seed:** `seed.spec.ts`
**Page under test:** Media Ticket list (`/mediaApproval/mediaTicket`)

## Assumptions

- The seed logs in and lands on the post-login Home page. Every scenario below starts from
  that state, so step 1 of each scenario navigates from Home to the Media Ticket page.
- Ticket data on UAT is live and changes over time. Scenarios avoid asserting on exact counts
  or specific ticket numbers except where noted; where a concrete ticket number is used
  (e.g. a ticket in the "Draft" status), treat it as an example and substitute whatever ticket
  currently exists in that status.
- "Status Overview" refers to the row of colored summary cards (Draft, Assign, Verify,
  Revise (SALE), On Process, Review, Revise (CG), Final Approve, Final Render, Done, Cancelled)
  above the search bar. Each card doubles as a one-click status filter and is uniquely
  identified by its `title` attribute, e.g. `Filter status: Assign`.
- The "All Status" control above the table is a separate combobox-style filter that produces
  the same filtering effect as the status cards, but via a dropdown with search/type-ahead.

---

### 1. Navigation

#### 1.1 Open Media Ticket from the sidebar
**Steps:**
1. From the Home page, click the "MEDIA APPROVAL" button in the sidebar.
2. Click the "Media Ticket" link that appears.

**Expected:**
- URL changes to `/mediaApproval/mediaTicket`.
- Page heading "Media Ticket" and subtitle "Manage and track your requests" are visible.
- The Status Overview cards, search box, filter dropdowns, and the "Media Ticket List Table"
  grid are all visible.

---

### 2. Status Overview Quick Filters

#### 2.1 Filter by clicking a status card
**Steps:**
1. Navigate to Media Ticket.
2. Note the ticket count shown on the "Assign" status card.
3. Click the "Assign" status card.

**Expected:**
- The table updates to show only tickets/jobs whose status is Assign.
- Every visible job status badge in the table reads "Assign (Head CG)".

#### 2.2 Switching between status cards replaces the filter (single-select)
**Steps:**
1. Navigate to Media Ticket.
2. Click the "Assign" status card.
3. Click the "Verify" status card.

**Expected:**
- After step 3, the table shows only Verify-status tickets/jobs — Assign results are no
  longer shown (selecting a different card replaces the previous filter rather than adding
  to it).

#### 2.3 Clicking the active status card again clears the filter
**Steps:**
1. Navigate to Media Ticket.
2. Click the "Verify" status card (it becomes the active filter).
3. Click the "Verify" status card again.

**Expected:**
- The filter is cleared and the table returns to the default unfiltered view (same row count
  as when the page first loaded).

#### 2.4 Status card with zero tickets shows an empty state
**Steps:**
1. Navigate to Media Ticket.
2. Click a status card whose count is "0" (e.g. "Final Approve", "Final Render", or "Done" —
   whichever currently reads 0).

**Expected:**
- The table area shows an empty state with the text "No tickets found" and
  "Try adjusting your filters".
- No data rows are rendered.

---

### 3. Search

#### 3.1 Search by exact ticket number returns that ticket
**Steps:**
1. Navigate to Media Ticket.
2. Note a ticket number visible in the table (e.g. the first row's Ticket No).
3. Type that ticket number into the "Search ticket, job, client, assignee..." box.

**Expected:**
- The table updates to show only the row(s) matching that ticket number.

#### 3.2 Search by client name returns matching tickets
**Steps:**
1. Navigate to Media Ticket.
2. Note a client name visible in the table (Client column).
3. Type that client name (or part of it) into the search box.

**Expected:**
- The table updates to show only tickets belonging to that client.

#### 3.3 Search with no matches shows an empty state
**Steps:**
1. Navigate to Media Ticket.
2. Type an arbitrary string that cannot match any ticket, job, or client (e.g.
   "ZZZZZ-NO-MATCH-99999") into the search box.

**Expected:**
- The table shows the empty state: "No tickets found" / "Try adjusting your filters".

#### 3.4 Clearing the search restores the full list
**Steps:**
1. Navigate to Media Ticket.
2. Type any search term that filters the table down.
3. Clear the search box completely.

**Expected:**
- The table returns to showing the default unfiltered list.

---

### 4. Dropdown Filters

#### 4.1 Filter by status via the "All Status" dropdown
**Steps:**
1. Navigate to Media Ticket.
2. Click the "All Status" filter control.
3. Select "Draft" from the option list.

**Expected:**
- The dropdown's visible label changes from "All Status" to "Draft".
- The table shows only tickets in Draft status.

#### 4.2 Re-opening the status dropdown after a selection
**Steps:**
1. Navigate to Media Ticket.
2. Open the "All Status" dropdown and select "Draft".
3. Open the status dropdown again (it now displays "Draft" instead of "All Status") and
   select "Assign".

**Expected:**
- The filter updates to show only Assign-status tickets; the dropdown can be re-opened
  and re-selected repeatedly regardless of its currently displayed label.

#### 4.3 Filter by Head CG
**Steps:**
1. Navigate to Media Ticket.
2. Click the "All Head CG" filter control.
3. Select a specific Head CG option from the list (e.g. "Head CG - QA").

**Expected:**
- The dropdown label updates to the selected Head CG.
- The table shows only tickets/jobs assigned to that Head CG.

#### 4.4 Filter by Team CG
**Steps:**
1. Navigate to Media Ticket.
2. Click the "All Team CG" filter control.
3. Select a specific Team CG option from the list.

**Expected:**
- The table shows only tickets/jobs assigned to that Team CG.

#### 4.5 Filter by Media Group
**Steps:**
1. Navigate to Media Ticket.
2. Click the "All Media Groups" filter control.
3. Select a specific media group option from the list.

**Expected:**
- The table shows only tickets whose Media Group column matches the selection.

#### 4.6 Filter by Media Type
**Steps:**
1. Navigate to Media Ticket.
2. Click the "All Media Types" filter control.
3. Select a specific media type option from the list.

**Expected:**
- The table shows only tickets matching that media type.

#### 4.7 Combine a status filter with a search term
**Steps:**
1. Navigate to Media Ticket.
2. Click the "Assign" status card.
3. Type a client name into the search box that also has at least one Assign-status ticket.

**Expected:**
- The table shows only rows that satisfy both the status filter AND the search term
  (intersection, not union).

#### 4.8 Combine multiple dropdown filters
**Steps:**
1. Navigate to Media Ticket.
2. Select a specific option in the "All Status" dropdown.
3. Select a specific option in the "All Head CG" dropdown.

**Expected:**
- The table only shows tickets/jobs matching both selected filters simultaneously.

---

### 5. Reset

#### 5.1 Reset clears all active filters and search
**Steps:**
1. Navigate to Media Ticket.
2. Type a term into the search box.
3. Click the "Assign" status card.
4. Click the "Reset" button.

**Expected:**
- The search box is empty again.
- All status/dropdown filters return to their default ("All ...") state.
- The table returns to the default unfiltered list.

---

### 6. Sorting

#### 6.1 Sort by Ticket No
**Steps:**
1. Navigate to Media Ticket.
2. Click the "Ticket No" column header.

**Expected:**
- The row order changes (ascending or descending by ticket number); clicking again toggles
  the sort direction back.

#### 6.2 Sort by Created Date
**Steps:**
1. Navigate to Media Ticket.
2. Click the "Created Date" column header (or the "Created Date" sort control near the
   filters, if distinct from the column header).

**Expected:**
- The row order changes based on ticket creation date; clicking again toggles direction.

---

### 7. Pagination

#### 7.1 Navigate to the next page
**Steps:**
1. Navigate to Media Ticket (ensure there is more than one page of results — the pagination
   footer shows "Showing 1 to 10 of N items" with N > 10).
2. Click "Next" in the pagination controls.

**Expected:**
- The table shows the next 10 tickets.
- The pagination text updates (e.g. "Showing 11 to 20 of N items").
- The "Prev" button becomes enabled.

#### 7.2 Change rows per page
**Steps:**
1. Navigate to Media Ticket.
2. Change the "Rows per page" control from 10 to 25.

**Expected:**
- Up to 25 rows are shown on a single page.
- The pagination text reflects the new page size (e.g. "Showing 1 to 19 of 19 items" if there
  are 19 or fewer total tickets).

---

### 8. Ticket & Job Details

#### 8.1 Expand a ticket row to view its jobs
**Steps:**
1. Navigate to Media Ticket.
2. Click the expand icon/button in the first column of a ticket row.

**Expected:**
- A nested row appears beneath the ticket showing its job(s), with columns Job No, Media
  Type, Package, Period, Version, Head CG, Graphic, Status, Approve, Prove, Progress Date,
  SLA.
- Clicking the expand icon again collapses the job row.

#### 8.2 Open a ticket's detail page
**Steps:**
1. Navigate to Media Ticket.
2. Click a ticket number link (e.g. "TK-26090064") in the table.

**Expected:**
- The browser navigates to `/mediaApproval/mediaTicket/<ticket-no>`, the ticket's detail
  page.

---

### 9. Create Ticket

#### 9.1 Navigate to the create-ticket form
**Steps:**
1. Navigate to Media Ticket.
2. Click the "Create Ticket" link/button.

**Expected:**
- The browser navigates to `/mediaApproval/mediaTicket/create`.

---

### 10. Requirement Recheck (Jira PB-1822)

Added after reviewing the official requirement doc (PB-1822). Covers items the requirement
calls out that weren't yet exercised by sections 1-9, plus notes on what could and couldn't be
verified against live UAT data.

**Known discrepancies between PB-1822 and the live app (not covered by tests — need a product
decision, not a test fix):**
- The requirement's column list (Business Rule #2) includes a "Description" column between
  Product and Start-End; the live grid has no such column (Ticket No, Quotation No., Client,
  Media Group, Product, Start-End, Job, Created Date only).
- The requirement's status list (10 statuses, Draft through Done) doesn't include "Cancelled",
  which exists as an 11th status card/filter option in the live app.
- The requirement's filter section (Business Rule #4) only specifies an "All Status" dropdown;
  the live app also has Head CG / Team CG / Media Group / Media Type dropdown filters (likely
  from a later, separate story — see related issue PB-2110 in the Jira links).

#### 10.1 Status Overview bar chart reflects status proportions (BR #1.2)
**Steps:**
1. Navigate to Media Ticket.
2. Inspect the horizontal bar above the status cards.

**Expected:**
- The bar is split into colored segments, one per status with at least one ticket.
- Segment widths are proportional to each status's share of the total ticket count (widths
  sum to ~100%).

#### 10.2 Status Overview shows total Ticket and Job counters (AC1)
**Steps:**
1. Navigate to Media Ticket.

**Expected:**
- A "N tickets" counter and an "N jobs" counter are both visible near the top of the Status
  Overview panel, each showing a non-negative number.

#### 10.3 Ticket without a Quotation shows "Manual" (AC2)
**Steps:**
1. Navigate to Media Ticket.
2. Find a ticket with no linked quotation.

**Expected:**
- Its Quotation No. column shows "Manual".
- Note: as of this writing every ticket on UAT lacks a quotation, so the alternate branch
  (a ticket that *does* have a real quotation number) currently has no test data to verify
  against.

#### 10.4 Search matches by Assignee (AC10)
**Steps:**
1. Navigate to Media Ticket.
2. Type a Head CG/Graphic assignee name into the search box.

**Expected:**
- The table filters down to tickets/jobs associated with that assignee (search matches
  Ticket No, Client, *and* Assignee, not just the two already covered in section 3).

#### 10.5 Expanded job row shows CU and LL approval statuses separately (AC13)
**Steps:**
1. Navigate to Media Ticket.
2. Expand a ticket row with at least one job.

**Expected:**
- The job's Approve column shows two distinct labeled values, "CU" and "LL", each with its
  own approval status — not a single combined status.

#### 10.6 SLA badge renders one of the allowed values (BR #5.5/#5.6, smoke-level)
**Steps:**
1. Navigate to Media Ticket.
2. Expand a ticket row with at least one job.

**Expected:**
- Each SLA badge shown (Feedback timer "FB" and Prove timer "PR") renders one of: "On track"
  (the requirement's "In time", per its footnote), "Overdue", or "—" (not yet applicable).
- Note: this only checks that the badge renders a valid value. The underlying SLA math (3
  business days for the first Prove, 2 for subsequent ones, no reset on Revise, 24-hour timer
  during Review Feedback) can't be verified through black-box UI testing alone — it needs
  either seeded test data with known Prove timestamps or backend/API-level tests.
