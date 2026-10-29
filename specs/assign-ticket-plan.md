# Assign Ticket (Media Approval > Assign Ticket) — test plan

Page: `/mediaApproval/assignTicket` (list of **jobs**) and `/mediaApproval/assignTicket/<JOB>?ticket=<TK>` (job detail). Specs in `Project/Media Control/AssignTicket/`.
Roles: **Super Admin** (view only) and **Head CG** (search, view, assign, re-assign). Head CG = `HEAD_CG_EMAIL`; its team = "Current team" in Settings > User Management > Edit User.

## Observed behaviour (28 Oct 2026)
- Header "Assignment Overview N jobs", 10 status cards (Assign, Verify, Revise (SALE), On Process, Review, Revise (CG), Final Approve, Final Render, Done, Cancelled). Search "Job No / Ticket No / Client / Product…"; filters Status, Head CG, Team CG, Media Group, Media Type, Created Date sort, Reset. Footer "Showing 1 to N of M items".
- Columns: Select · Actions · Job · Ticket · Quotation · Client / Product · Media (group → type, sale package, Epicor/SF type) · Period (**Job** period) · Sales Person · Assigned / Head · Update Date · SLA · Status.
- **Row actions (Head CG):** Assign status → *View details + Assign*; a CG is assigned (Verify … Final Render) → *View details + Reassign*; Done / Cancelled → *View details* only. Only Assign-status rows have a selection checkbox; selecting enables **Bulk Assign**.
- **Dialog "Assign / Reassign Graphic Designer":** ticket no, job(s) (sale package, media group, section › type, Media Type (Epicor/SF)), search box, designers sorted by lowest workload → highest (lightest tagged *Recommended*, each with "Light/Heavy · N active" and To Do / On Process / Review / Revise / Final Render counts), "No Graphic selected yet" and **Assign disabled** until one is chosen. Reassign also shows "Currently Assigned To" and starts with the current designer selected. Bulk: "N jobs selected".
- Job detail: header (client, package), status, **Assign** / **Reassign** button, **History** button, progress steps, Job Information, Material & Brief, feedback, Prove History.
- History: dialog "Activity History", "N items", grouped by day, each entry = action, detail, time, actor, job · version.
- **Super Admin:** list and detail show only *View details* and *History* — no Assign / Reassign / Bulk Assign.

## Scenarios
| ID | File | What | Data |
|---|---|---|---|
| AT-SA-01 | 01-01 | SA: no Assign / Reassign / Bulk Assign in any row | read only |
| AT-SA-02 | 01-01 | SA: no row-selection checkboxes (view-only role) — **fails today**, see findings | read only |
| AT-SA-03 | 01-01 | SA: View details opens the job; detail has History only | read only |
| AT-SA-04 | 01-01 | SA: History opens Activity History with entries | read only |
| AT-SA-05 | 01-02 | SA: every job equals its Transaction row (client, product, sale package, media type, Epicor/SF, sales person, quotation) and exists in Transaction | read only |
| AT-HC-01 | 02-01 | Head CG: actions follow the status (all rows) | read only |
| AT-HC-02 | 02-01 | Head CG: search by job, ticket, client, product; no match; clear | read only |
| AT-HC-03 | 02-01 | Head CG: status card narrows to the card count; Reset | read only |
| AT-HC-04 | 02-01 | Head CG: selection enables Bulk Assign (Assign rows only); View details opens the job | read only |
| AT-HC-05 | 03-01 | Assign dialog: job info = row; designers ⊆ Head CG + team; sorted by workload; Recommended; no choice → Assign disabled; search; select; Cancel changes nothing | read only |
| AT-HC-06 | 03-01 | Reassign dialog: current designer shown; same designer rules; clearing the choice disables Reassign | read only |
| AT-HC-07 | 03-01 | Bulk Assign dialog: "2 jobs selected"; designers ⊆ self + team; Assign disabled until chosen | read only |
| AT-HC-08 | 04-01 | Detail: data = list row; Assign dialog same rules | read only |
| AT-HC-09 | 04-01 | Detail of an assigned job: Reassign, current designer, same rules | read only |
| AT-HC-10 | 04-01 | History opens with entries (time, actor, job) and closes | read only |
| AT-HC-11 | 04-01 | History on an Assign-status job | read only |
| AT-HC-13 | 06-01 | Reassign must be disabled while the current designer is selected — **`fixme`: written, waiting for dev fix (team reports it)** | read only |
| AT-HC-12 | E2E/01-01 | Create QA ticket → Assign → Reassign → History (real actions) | **creates a ticket, sends e-mails; `RUN_UAT_SUBMIT_TESTS=1`; run 28 Oct — passes** |

## Findings (28 Oct)
1. **AT-SA-02 (confirmed defect, to be reported to dev):** Super Admin sees a "Select all" checkbox and a checkbox on every Assign-status row although no action is allowed (Bulk Assign is hidden). Rule from the team: Super Admin is view only.
2. Confirmed by the team: *View details* is allowed for Super Admin (opens the job; History button only). The tests treat it as allowed.
3. Period in Assign Ticket is the **Job** period; the Transaction report has only contract and on-air dates, so Period is not compared in AT-SA-05.
4. Reassign dialog starts with the current designer selected, so Reassign is enabled without a change; clearing the choice disables it (AT-HC-06). Reassigning to the same designer is not blocked — **defect, reported to dev (28 Oct)**; test AT-HC-13 is written and set to `fixme` until it is fixed.
