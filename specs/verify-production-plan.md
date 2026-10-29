# Verify & Production (Media Approval > Verify & Production) — test plan

Page: `/mediaApproval/productionReview` (list) and `/mediaApproval/productionReview/<JOB>?status=…&job=…&ticket=…&v=…` (job detail). Specs in `Project/Media Control/VerifyProduction/`.
Roles: **CG** (cg1 = "CG - QA"; sees only the jobs assigned to them) and **Super Admin** (view only, whole system).

## Observed behaviour (28 Oct 2026)
- Title "Verify & Production — My assigned tickets — verify and produce"; "My Workload N" = sum of the status cards (Verify, Revise (SALE), On Process, Review, Revise (CG), Final Approve, Final Render, Done, Cancelled). Search "ticket, product, client…"; filters Status, Head CG, Media Groups, Media Types, Created Date sort, Reset; default 5 rows per page.
- Columns: Job · Ticket (link to the job) · Ver · Prove · Product · Media (group → type, sale package) · Period · Sales Person · Assigned By (head CG + date) · Update Date · SLA (FB / PR) · Status · Approve (CU / LL).
- Job detail: header, status badge, **History**, progress steps (Assign → Verify → On Process → Review → Final Approve → Final Render → Done), Job Information, Material & Brief, a status-specific card, SLA Timer, Prove History (with "Action History · Prove N").
- **Verify:** "Accept Job" card — a Job Type is required (Animate, Final File, AE/PR Project, Mockup (Sales Pitch), Other), buttons **Accept** (confirm "Confirm accept job?" → On Process) and **Feedback**.
- **On Process:** "Submit Prove" card — URL LINK * (or a file; "At least one is required"), Production Note, **Submit Prove** → empty submit "Please attach a file or enter a URL link before submitting"; filled → "Confirm submit Prove?" → status **Review**, Prove 1.
- **Revise (CG):** one of three cards, "Prove N → Prove N+1": **Redo this Job · Re-Edit (n formats)** (Sale re-opened a finished job; **Submit Re-Edit Prove**), **Items to Revise · Feedback (n formats)** (**Submit Feedback Prove**), **Items to Complete · Skip (n formats)** (**Submit Skip Prove**). Empty submit: "Attach at least one file or a URL link".
- **Final Approve:** "APPROVAL RESULT" — CUSTOMER APPROVAL and LANDLORD APPROVAL (each "Approved by <name> <date>" or "Pending …", at least one pending), MEDIA ALLOCATE (Durations, Number Spot/Loop, On-Air), "Waiting for approval from both parties".
- **Done:** both approvals "Approved by …", **Rendered Files (n formats) Confirmed** (FORMAT NAME / FILE NAME / RENDER table), "Rendered on <date time>", "This job is closed — no further edits are allowed"; no action buttons.
- History = "Activity History" dialog, "N items", entries grouped by day (e.g. Ticket → Assign → On Process → Prove delivery).

## Scenarios
| ID | File | What | Data |
|---|---|---|---|
| VP-SA-01 | 01-01 | SA: no action buttons in the list; a job opens its detail | read only |
| VP-SA-02 | 01-01 | SA: every action button on a job detail is disabled, in every status (forms may be shown; Revise (CG) "Submit Skip Prove" is disabled = not a defect, confirmed 28 Oct) | read only |
| VP-SA-04 | 01-01 | SA: a **Cancelled** job shows no submit form at all — **fails today (defect reported to dev)** | read only |
| VP-SA-03 | 01-01 | SA: History opens with entries | read only |
| VP-CG-01 | 02-01 | CG: My Workload = status cards = table total | read only |
| VP-CG-02 | 02-01 | CG: search by job, ticket, product; no match; clear | read only |
| VP-CG-03 | 02-01 | CG: every option of Status / Head CG / Media Group / Media Type shows only matching rows (counts add up) | read only |
| VP-CG-04 | 02-01 | CG: filters combine with each other and with search; Reset restores | read only |
| VP-CG-05 | 03-01 | CG: a job opens from the list with the same data, progress steps, sections | read only |
| VP-CG-06 / 07 | 03-01 | CG: History and "Action History · Prove N" open with entries | read only |
| VP-CG-08 | 04-01 | On Process: Submit Prove form; empty submit refused | read only (no real submit) |
| VP-CG-09 | 04-01 | Revise (CG): Redo / Items to Revise / Items to Complete card, "Prove N → N+1", submit button per kind, empty submit refused | read only |
| VP-CG-10 | 04-01 | Final Approve: Approval Result = Approve column, Media Allocate, "Waiting for approval" | read only |
| VP-CG-11 | 04-01 | Done: both approvals, Rendered Files complete (n formats, file names, date), job closed | read only |
| VP-CG-12 | E2E/02-01 | Create QA ticket → Head CG assigns to CG - QA → CG Accept (confirm) → On Process → Submit Prove (confirm) → Review, Prove 1, History 4 items | **creates a ticket, sends e-mails; `RUN_UAT_SUBMIT_TESTS=1`; run 28 Oct — passes** |

Tests 04-01 take the first jobs of cg1 in each status; when cg1 has none at run time the test is skipped with a reason (statuses change as the team works).

## Full lifecycle (VP-E2E-01, file E2E/03-01) — how a job moves through every status
| # | Actor | Action (UI) | Result |
|---|---|---|---|
| 1 | Sale | Create Ticket (manual, QATEST package) → Submit | job **Assign** |
| 2 | Head CG | Assign Ticket → Assign → choose CG - QA | **Verify** |
| 3 | CG | Verify & Production → job → Job Type → Accept → "Confirm accept job?" Confirm | **On Process** |
| 4 | CG | Submit Prove (URL link) → "Confirm submit Prove?" Confirm | **Review**, Prove 1 |
| 5 | Sale | Airtime Allocate: duration, Number Spot/Loop, on-air dates → Save ("Saved successfully") — **required before Approve** | — |
| 6 | Sale | Media Ticket → job **Review** → Apply to all pending → **Approve** (Final approval) → evidence file (required when the ticket has no quotation) → Submit Review → "Submit this review?" Submit → "Review Submitted — Saved: 6 Approve" | **Final Approve**, CU Approved (the Sale approval is the customer approval), LL Pending |
| 7 | Sale | For Customer: PIN + link; the customer link (`/customerReview/<token>`, PIN-protected) then says "This Artwork Is Already Approved" | — |
| 8 | Media Management | Media Management → job → **Approve** (Landlord) → confirm → "Approval Complete — CU+LL approval complete → Final Render" | **Final Render** |
| 9 | CG | job → File Name → **Render File** → preview of generated names (`yyyymmdd000001_<name>_<FORMAT>`) → **Confirm File Name Render** | **Done**, "Rendered Files (n formats) Confirmed", job closed |

Other Sale decisions in step 6 (not covered yet): Approve-ref (provisional, Feedback can follow), **Feedback** (→ Revise (CG): "Items to Revise", CG submits "Submit Feedback Prove"), Hold, Skip, Cancel. Landlord **Feedback** (Media Management) sends the job back as well ("Landlord Feedback" badge, "Redo this Job").

## Findings (28 Oct)
1. **VP-SA-04 (defect, reported to dev):** a **Cancelled** job still shows the revise form (fields, upload and "Submit Re-Edit Prove") to Super Admin. Not yet checked for CG.
2. Confirmed not a defect: on **Revise (CG)** the Super Admin sees the fields and "Submit Skip Prove", but the action button is disabled.
3. Not covered yet: the Revise (CG) loop for real (Sale Feedback / Landlord Feedback → CG submits the Re-Edit / Feedback Prove) and Approve-ref; those statuses are checked read-only on existing jobs (VP-CG-09).
