# Export Report — test-case mapping (PB-2114 / 2115 / 2116 / 2117)

Source: `export-report-test-cases.md` (CMN / SLA-U / SLA / TRX / AIR / BIL-U / BIL). Specs live in
`Project/Media Control/Dashboard/`. Test titles start with the doc ID; tags `@happy @edge @negative @security @regression`.
Run: `npx playwright test "Dashboard/"`.

## 1. ID → file

| Doc ID | Covered by | Notes |
|---|---|---|
| CMN tabs / default state | 12-01, 12-02 | report types are **tabs**, not a dropdown |
| CMN filters persist across tabs | 19-01 | |
| CMN double-click export | 19-02 | one download only |
| CMN Sale blocked / anonymous | 19-03 (403), 19-04 (401) | API level |
| CMN CG sees only own jobs | 18-08, 24-01 | |
| CMN role scope ⊆ Super Admin | 24-01 | Head CG, Media Mgmt, CG1, CG2 |
| CMN CG cannot widen via `graphicUserId` | 24-01 | |
| SLA-U02..U05 feedback 24h rule | 20-01 | black-box on live data |
| SLA-U01/U08, SLA-H13 "-" for unassigned / not accepted | 20-02 | |
| SLA-H01 columns | 13-01 | |
| SLA-H02 newest first | 20-03 | |
| SLA-H03 record count = rows on all pages | 20-04 | |
| SLA-H04/H05 filters | 13-02..13-04, 20-05 | status + media AND |
| SLA-H06 reset filters | 20-11 | |
| SLA-H07/E03 inclusive By Created Date, From = To | 20-06 | |
| SLA-H08/H09 open-ended From / To | 20-07 | |
| SLA-H10/H11/E06 export = table, all pages | 13-06, 20-08 | 300+ rows, row-by-row |
| SLA-H14 DD/MM/YYYY | 20-09 | |
| SLA-N01/E04 From > To | 20-10 | "Invalid date range", no request, Export Failed |
| SLA-N03/N04 export 500 / abort | 20-12 | filters kept |
| SLA export with 0 rows | 17-01 | silent no-op (see discrepancies) |
| TRX-H01 / AIR-H01/H02 split vs join by Format | 21-01 | |
| TRX-H02/E01/E02, AIR-H03 search, case, spaces | 21-02 | count == API |
| TRX-E03 `%` literal | 21-03 | `test.fail` — app treats `%` as wildcard |
| TRX-H04, AIR-H04 Sales / Total (Sec) | 22-01 | rounding tolerance |
| TRX/AIR-H05/H06 export = table, 26 columns | 21-04, 14-05, 15-03 | Job Type compared as "non-empty" only |
| TRX/AIR-N01, N03 From > To, export 500 | 21-05 | |
| TRX/AIR approve-status filters | 14-04, 15-02 | |
| BIL-U01..U09 arithmetic | 23-01 | quota 3, rate 7000, Σ = Grand Total |
| BIL-H01..H06 workbook + reconcile + format | 23-02, 16-03, 16-04 | bold header, frozen pane, active sheet |
| BIL-H07/H08 filters on both sheets | 23-03 | |
| BIL-E06 Cancelled not counted | 23-03 | |
| BIL-N01, N03 From > To, export 500 | 23-04 | |

## 2. Not automated (and why)

| ID(s) | Reason |
|---|---|
| SLA-U17/U18 progress SLA, holiday, working-day rules | needs controllable timestamps/holiday calendar; no test data hook. Rules are only checked indirectly (20-01 covers the 24h feedback rule). |
| SLA clock time-travel (badge recalculates as time passes) | `page.clock` can fake the browser clock but the badge is recomputed from server data on load; unverified → `fixme` candidate |
| BIL-U10 workbook version/legacy cases | "unit" case without app source; no second build available |
| 5,000-row export | UAT has ~650 rows; API cap `maxExportRows` = 50,000 is readable but cannot be reached |
| Admin Rate / Quota edits | would mutate shared UAT configuration |
| BIL-E14 audit log of exports | no Audit Log page found for exports |
| CMN-E02 | depends on a state the UAT data cannot produce |
| Package-ownership scope (R02–R04) | needs accounts with a restricted Media access list in known data |
| AIR-E08 landlord "Rejected" | no Rejected landlord data exists |
| TRX-H03/E05 Quote search | no row has a Quote No. in UAT |
| E07 On-Air out of range | no data outside the range |
| AIR badge colours | no stable `data-testid`; colour classes are Tailwind utilities (see wishlist) |
| `*-U*` "unit" cases (SLA-U*, BIL-U*) | there is no app source; implemented as black-box invariants on live data instead |

## 3. Doc vs live-app discrepancies

1. Report type is a **tab list** (SLA / Transaction / Airtime / Billing), not a dropdown.
2. Empty cells show a hyphen `-`, not an en dash `–`.
3. Success feedback is a **modal** "Export Successful", not a toast; output is Excel only (no CSV — see 18-06).
4. Billing dates are `DD/MM/YYYY` (spec: `DD/M/YY`).
5. `%` / `_` in search act as SQL wildcards (21-03, expected-fail).
6. Export error modal shows the server message ("boom"), not the Thai generic text from the doc.
7. Exporting a non-Billing report with 0 rows does nothing visible (17-01); the doc expects a message.
8. CG's Graphic dropdown is not locked to the user (18-05).
9. **Transaction/Airtime table shows Job Type as a Thai label** ("ไฟล์สำเร็จ (Final File)", "เสนอขาย") but the file holds the raw English value ("Final File", "Mockup") — table ≠ file (found by 21-04).
10. Media filter lists some media names twice (e.g. "BTS On Station").
11. After a date is chosen, the picker button's accessible name changes from "From DD/MM/YYYY" to "19/10/2026 Clear date" (affects locators).
12. Cells in the file can carry trailing spaces ("Client ") that the table collapses.

## 4. `data-testid` wishlist

- `report-tab-{sla|transaction|airtime|billing}`, `report-export-button`, `report-search`, `report-filter-{status|media|graphic|sale-approve|landlord-approve}`
- `report-date-from`, `report-date-to`, `report-date-clear-{from|to}`, `report-date-error`
- `report-record-count`, `report-pager`, `report-per-page`
- `sla-badge-feedback`, `sla-badge-progress` with `data-state="on-track|at-risk|late|…"` (so colours need not be read from classes)
- `export-dialog` with `data-state="success|failed|error"`, `export-dialog-message`
- `billing-grand-total`
