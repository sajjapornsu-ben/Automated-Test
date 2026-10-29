# E2E scenarios (several roles, from creating the ticket) — plan

Specs in `Project/Media Control/E2E/` (they create real tickets on UAT and send e-mails; `RUN_UAT_SUBMIT_TESTS=1` is set in `.env`, so pressing Run is enough). Each actor has its own browser session (`as(browser, role)` in `_helpers.ts`).

| # | File | Scenario | Roles |
|---|---|---|---|
| 1 | 01-01 | Assign → History → Reassign of one job (AT-HC-12) | Sale, Head CG |
| 2 | 02-01 | Accept → Submit Prove of one job (VP-CG-12) | Sale, Head CG, CG |
| 3 | 03-01 | Full lifecycle of one job: Assign → Verify → On Process → Review → Final Approve → Final Render → Done (VP-E2E-01); steps in `verify-production-plan.md` | Sale, Head CG, CG, Media Management |
| 4 | 04-01 | **Multi-assignee**: assign 2 CGs, both see the job, first Accept wins, the other is rejected (MA-E2E-01) | Sale, Head CG, CG, CG 2 |
| 5 | 04-02 | **Multi-assignee**: Feedback by one CG closes the Verify gate, the other CG's Accept is rejected (MA-E2E-02) | Sale, Head CG, CG, CG 2 |
| 6 | 04-03 | **Multi-assignee**: On Process is open to both, CG 2 submits the Prove first, CG's Submit Prove from the old page is rejected (MA-E2E-03) | Sale, Head CG, CG, CG 2 |
| 7 | 04-04 | **Multi-assignee**: walk to Final Render, CG renders first and the job is Done, CG 2's Render from the old page is rejected (MA-E2E-04) | Sale, Head CG, CG, CG 2, Media Management |
| 8 | 05-01 | **Ticket created by Media Management itself** (Created by Landlord), MM reviews/approves as Sale; **Landlord Feedback is only a comment** (no effect on the workflow): (A) then Approve → Final Render → Done (MM-E2E-01), (B) then Cancel on the Approve confirmation → nothing changes (MM-E2E-02) | Media Management, Head CG, CG |

## Multi-assignee scenarios (PB-2163, BTS media)
Media used (given by the team 28 Oct): **Media Group = Digital VGI**, **Media Category = DIGITAL**, **Media Type (Epicor/Salesforce) Name = QATEST-BTS** (mapped to Media Type "BTS On Station"), **Package = BTS MAX 2.0 Half B**.
`ensureBtsMapping` makes sure the Epicor/SF record exists (it creates it through Settings > Master Data > Media Type (Epicor/Salesforce) as Super Admin when missing). Earlier probes also created an Active "Transit" record mapped to BTS On Station (Transit VGI); it is not used any more.

Observed on UAT (28 Oct 2026):
- The Assign dialog of a BTS job says **"Multiple selection"** (other media stay single choice); selecting two shows "Selected 2 people: CG - QA 2, CG - QA"; the Assigned column lists both and the job is **Verify** for both CGs in Verify & Production.
- Accept needs a Work Type first (disabled until chosen); Work Types: Animate, Final File, AE/PR Project, Mockup (Sales Pitch), Other.
- **First click wins**, the later click from an old page is refused by the server with a modal "Something Went Wrong":
  - Accept after Accept / after Feedback: "This job's status has already changed (now: On Process | Revise (SALE)) — please refresh the page and try again".
  - Render after Render: "… (now: Done) …".
  - Submit Prove after the job is in Review: "Choose Feedback revision, Re-Edit or Skip supplement."
  - Nothing is done twice; History has one entry per action, by the person who pressed first.
- Feedback to Sales: "Note / Question for Sales *"; empty note → "Please enter a note or question before sending feedback".
- On Process is open to both CGs (a Submit Prove form for each); empty Submit Prove → "Please attach a file or enter a URL link before submitting"; success "Prove submitted successfully — New Prove version submitted · Job → Review".
- Formats exist for this media (Submit Prove and Render work). With the earlier Transit / Welcome media Submit Prove failed with "No Formats found for this job".

Not covered / open:
1. The disabled-button-with-tooltip behaviour of the manual checklist ("ดำเนินการโดย <ชื่อ> เมื่อ <เวลา>", items 7, 15) was not seen: the gate button disappears when the status changes, and after a reload the next gate is open. A state where a button stays on screen but disabled with that tooltip is still to be found (e.g. between Render preview and Confirm).
2. Re-assign during the job (E2–E4), 3+ co-assignees (E10), double click (E9) and real simultaneous clicks (E6) are not automated yet.
3. "Shared draft" (items 17–22): a link / note typed by one CG is **not** visible to the other CG after a reload in this build (attached files not checked).

## Media Management own ticket (file 05-01)
- Create Ticket as Media Management shows "Created by Media Management as: Landlord (default) / Plan B / Other"; Sales Person = Media Management - QA, so MM also does the Sale steps: Airtime Allocate, Review → Approve (no quotation → evidence file), which counts as the **customer approval** ("Customer approved by Media Management - QA").
- Landlord side = Media Management > job page: "Waiting for landlord approval", buttons **Feedback** and **Approve**. Feedback opens "Send Feedback" (Note *, Reference Link, Attach Files); sent → "Feedback Sent — Feedback sent · <JOB>". Rule confirmed by the team 28 Oct: Landlord Feedback is only a comment — the job stays **Final Approve** (CU Approved, LL Pending) and Approve is still available. (The manual checklist item E17 said an LL Feedback pulls the job back to Revise (CG); the tests follow the team's newer statement.)
- (A) Approve → "Approval Complete — CU+LL approval complete → Final Render"; CG renders → Done. (B) The Approve confirmation was cancelled: nothing changes. The two cases were taken as "Landlord approves" and "Landlord cancels the approval dialog" — tell me if "cancel approve" means something else.
