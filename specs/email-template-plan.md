# Email Template (Setting > Email Template) — test plan

Page: `/settings/emailTemplate` — Super Admin. Specs in `Project/Media Control/EmailTemplate/`.
UAT facts (27 Oct 2026): 12 templates, all group **Media Approval**; the groups are Sale, Media Approval, Production, Claim, Inventory, System.

## How the page works
- List columns: Actions (Edit / Duplicate / Delete), Template (group + type), Sender Name, Subject, Description, Status switch. Counter "N templates".
- Search box: subject, sender or description. Filters: Group, Status, Reset.
- Create / Edit drawer: 1 Template Info (status switch, Template Group *, Template Type *, Description) · 2 Email Header (Sender Name *, Subject *) · 3 Recipients · 4 Mail Body * (rich text; variable chips such as `$ticket_no`).
- **A type can be used once per group.** Only Media Approval has types: the 12 in use plus **Revise Prove** and **Skip Prove** are free. Sale / Production / Claim / Inventory / System show "No Template Type available for this Group".
- Media Approval recipients are automatic ("go automatically to the people involved in each ticket"); other groups pick TO / CC / BCC.
- **Duplicate** creates an **Inactive** copy at once, with no dialog; the *type* is renamed "<type> (Copy)".
- Delete asks "Delete Email Template? / Delete template <type> (<group>)? / This action cannot be undone." → modal "Email Template Deleted".
- Create result modal: "Email Template Created / <type> saved successfully".

## Scenarios
| ID | File | What | Data |
|---|---|---|---|
| ET-LIST-01 | 01-01 | layout, 6 columns, row actions, row count = counter | read only |
| ET-SEARCH-01 | 01-01 | search subject / sender / description, no result, clear | read only |
| ET-FILTER-01 | 01-01 | Group + Status filters, Reset, Active + Inactive = total | read only |
| ET-FORM-01 | 01-01 | Create form sections, group list, types per group, recipients | read only |
| ET-FORM-02 | 01-01 | Edit form pre-filled, variable chips, Cancel saves nothing | read only |
| ET-VALID-01 | 01-01 | empty Save → "Missing Information — Please complete Group, Type, Sender, and Subject." | read only |
| ET-LIST-02 | 01-01 | Delete confirmation, Cancel keeps the template | read only |
| ET-CRUD-01 | 02-01 | create (Revise Prove, Inactive) → type taken → edit → row status switch → Duplicate → delete (Cancel / confirm) → type free again | creates / deletes "QA Test ..." |
| ET-VALID-02 | 02-01 | Mail Body marked required: saving without it must be refused | creates, then deletes "QA Test ..." |

`02-01` runs only with `RUN_UAT_SUBMIT_TESTS=1`, serially, from the terminal. Real templates are never edited, duplicated or deleted. Because "Revise Prove" is a real type, the QA template is created **Inactive** and is active for only a few seconds while the row switch is tested.

## Findings (27 Oct)
1. **ET-VALID-02 fails — defect:** Mail Body is marked `*` but a template without a body is saved ("Email Template Created"). Probably also affects Edit (not tested).
2. Wording: the duplicate-type error is Thai — "มี Template ประเภทนี้อยู่แล้วใน Group นี้ — ไม่สามารถสร้างซ้ำได้" (modal "Something Went Wrong"). Not in the three agreed wording defects; listed for the team.

## Not covered yet
- Creating templates in groups with types (none available on UAT) and the TO / CC / BCC recipient picking.
- Sending a real email from a template; editing the rich-text formatting; permissions of other roles on this page (Sale and CG2 can open Settings pages — see the UI wording notes).
