# Test Plan — Settings > Master Data (Super Admin)

**Page:** `/settings/masterData` (landing) and `/settings/masterData/<slug>` (24 categories). Role under test: Super Admin (`SUPER_ADMIN_*` in `.env`).
**Status:** survey done (read-only, 23 Oct 2026 UAT). Nothing has been created or deleted yet.

## 1. Landing page
- Card per category (name, description, record count), "Showing 24 categories", search box "Search Master Data — e.g. Media, Province, Sale Package", Reset.
- Each card links to its page (slug below).

## 2. The 24 categories (observed)

| # | Category | Slug | Page type | Columns / structure | Create button | Search placeholder | Records |
|---|---|---|---|---|---|---|---|
| 1 | Media | media | 5-level tree (Group → Category → Type → Segment → Code) | cards + Edit | Create Group / Add | Search all levels… | 9 groups |
| 2 | Media Type (Epicor/Salesforce) | mediaTypeEpicorSf | table with filters (media type, status) | maps system Media Type to Epicor/SF | Add Media Type (Epicor/SF) | Search Media Type (Epicor/SF)… | **0** |
| 3 | Media Branding | mediaBranding | table | Name, Updated, Status | Create Media Branding | Search Branding | 10 |
| 4 | Province | province | region tabs + 4-level tree | Region → Province → District → Subdistrict | Add Province / Add | Search all levels… | 77 |
| 5 | Sale Package | salePackage | table | Code, Name, Type, Media Types, Updated, Status (+ Manage Media Types) | Create Sale Package | Search Sale Package — Code, Name | 54 |
| 6 | Department | department | grid / list | cards (+ Manage Users) | Create Department | Search departments… | 11 |
| 7 | Holiday | holiday | list / calendar, year + type filters | Edit / Delete | Create Holiday | Search Holiday | 1 |
| 8 | Product Owner | productOwner | table | Code, Name, Updated, Status | Add Product Owner | Search Code/Name | 40 |
| 9 | System Status | status | table + type tabs (Product / Booking / Take Down) | Name, Type, Updated, Status | Add Status | Search Status… | 4 |
| 10 | Zone | zone | table + Major/Minor tabs | Name, Major Zone, Type, Updated, Status | Add Minor Zone | Search Zone… | 50 (16 major, 34 minor) |
| 11 | Area | area | table | Name, Updated, Status | Add Area | Search Area… | 10 |
| 12 | Screen Type | screenType | table | Name, Updated, Status | Create Screen Type | Search Screen Type… | 14 |
| 13 | Road | road | table + stats | #, Road (TH), Road (EN), Code, Status | Add Road | Search road name or code… | 1 |
| 14 | Traffic Light | trafficLight | table | — (empty) | Create Traffic Light | Search Traffic Light… | 0 |
| 15 | Format | format | table | Name, Updated, Status | Create Format | Search Format… | 23 |
| 16 | Format Name | formatName | table | Name, Updated, Status | Create Format Name | Search Format Name… | 178 |
| 17 | Resolution | formatRatio | table | Width, Height, Preview, Updated, Status | Create Resolution | Search ratio, e.g. 1024x768… | 306 |
| 18 | Venue Type | venueType | table | Name, Updated, Status | Create Venue Type | Search Venue Type… | 5 |
| 19 | Bus Model & Line | busModelLine | table + Bus Model / Bus Line tabs | Name, Used by bus line, Updated, Status | Add Bus Model | Search… | 13 models / 27 lines |
| 20 | Material Type | materialType | table | Name, Updated, Status | Create Material Type | Search Material Type… | 10 |
| 21 | Signage Type | signageType | table | Name, Updated, Status | Create Signage Type | Search Signage Type… | 8 |
| 22 | Position | position | table | Name, Updated, Status | Create Position | Search Position… | 6 |
| 23 | Structure Type | structureType | table | Name, Updated, Status | Create Structure Type | Search Structure Type… | 15 |
| 24 | Customization Tier | customizationTier | table | Tier name, Updated, Status | Create Customization Tier | Search Customization Tier… | 6 |

Template groups for test design:
- **A. Simple name+status table (11):** Media Branding, Area, Screen Type, Format, Format Name, Venue Type, Material Type, Signage Type, Position, Structure Type, Customization Tier (+ Traffic Light, same shape but empty).
- **B. Table with extra fields (6):** Product Owner (code), System Status (type), Zone (major zone / type), Road (TH/EN/code), Resolution (width × height), Bus Model & Line (model + line).
- **C. Special layouts (6):** Media tree, Province tree, Sale Package (+ Manage Media Types), Department (grid/list + users), Holiday (list/calendar), Media Type (Epicor/SF) mapping.

## 3. Scenarios (per category; generated from templates)

**Landing:** 24 cards present with name + count; count on card equals the "Showing …" total on the category page; card opens the right page; search narrows cards and shows empty state for no match; Reset clears it.

**Read / Search / Filter (every category):**
1. Page title, description and Create button visible; table headers match the survey.
2. Search by an existing name returns only matching rows; no match → empty state; clearing search restores the list; case-insensitive.
3. Status filter (Active / Inactive) narrows rows; Reset returns to all.
4. Pagination / per-page keeps the total consistent.

**Create (QA-prefixed records only):** open form → required-field validation blocks submit → create `QA Test <timestamp>` → appears in the list and in search → counter on landing increments.
**Edit:** change the name of the QA record → saved, Updated Date changes, search finds new name.
**Status toggle:** set Inactive/Active on the QA record → status filter shows it accordingly.
**Delete:** delete only the QA record → confirm dialog (cancel keeps it, confirm removes it) → gone from list and count back to baseline.
**Duplicates:** creating the same name twice is rejected (if the app enforces it — observe first).

**Special categories:** Media tree (create/edit/delete a QA Group; expand levels; search across levels), Province (QA district/subdistrict under an existing province; region tabs), Sale Package (create with type + Manage Media Types), Department (grid/list switch, Manage Users dialog opens), Holiday (list/calendar switch, year/type filter, create/delete QA holiday), Media Type (Epicor/SF) (create mapping — currently empty on UAT, which also blocks Create Ticket).

## 4. Safety rules
- All create/edit/delete tests run only with `RUN_UAT_SUBMIT_TESTS=1`, from the terminal.
- Tests touch **only** records whose name starts with `QA Test` and clean up in `afterEach`; no existing master record is edited or deleted.
- Cascading deletes (Province, Media tree, Department with users, Sale Package) are limited to QA-created leaves.
- Credentials only through `.env`.
- Read-only tests (landing, search, filters, pagination) run by default.

## 5. Open questions
See the questions sent with this plan (scope of CRUD on shared UAT data, special categories, Epicor/SF seed record).

## 6. Progress (26 Oct 2026)

Decisions from the team: CRUD only on `QA Test …` records, deep levels create their own data, the Media Type (Epicor/Salesforce) record for Create Ticket is kept permanently.

| Files | Scope | Result |
|---|---|---|
| 01-01, 01-02 | Landing: 24 cards, every card opens its page, card search / Reset | 3 tests pass |
| 02-01 | All 24 pages show heading, Create button, search box | pass |
| 02-02, 02-03 | Search (match, case, no match, clear) and status filter + TOTAL = ACTIVE + INACTIVE for the 18 table categories | 36 tests pass |
| 03-01 | CRUD for 12 simple categories (Media Branding, Area, Screen Type, Format, Format Name, Venue Type, Material Type, Signage Type, Position, Structure Type, Customization Tier, Traffic Light) | 12 pass (`RUN_UAT_SUBMIT_TESTS=1`) |
| 03-02 | CRUD for Product Owner, System Status, Zone, Road, Bus Model, Department, Sale Package | 7 pass (`RUN_UAT_SUBMIT_TESTS=1`) |
| not yet | Media tree, Province tree, Holiday, Resolution, Media Type (Epicor/SF) | pending |

Observations on UAT:
- Retested by the team: the row-level "Active toggle" works (not a bug). Playwright's real mouse click cannot hit the 32x18 switch, so the test uses a DOM click. Bus Model's drawer switch saves immediately.
- Sale Package keeps showing a deleted record until the page is reloaded.
- Sale Package shows a "Saved/Deleted — OK" modal; the other categories use a toast.
- Media tree (Media Group / Category / …) has no delete in the UI, so QA records created there stay: `QA Test Group Alpha` (QAT) and `QA Test Category` (QAC) exist now.
- Delete confirmation wording and button label differ per category ("Delete" / "Confirm Delete").
- Format and Format Name contain seed rows whose name is "-".

## 7. Progress update (26 Oct 2026, later)

Skipped on request: Resolution, Media Type (Epicor/Salesforce).

| Files | Scope | Result |
|---|---|---|
| 04-01 | Holiday: validation, create (Dec 2029, so SLA is not affected), search, edit, List/Calendar switch, delete | pass |
| 04-02 | Province: empty Save blocked; province → district → subdistrict created and deleted bottom-up in one session | 2 pass |
| 04-03 | **DEFECT** MD-PROV-03: a new province is not returned by GET /api/provinces | fails (expected) |
| 04-04 | Media tree: tiles = columns + search, edit group (code read-only, rename + restore) | 2 pass |
| 04-04 | MD-MEDIA-03: category of the QA group is listed once the group is selected and the search is cleared (earlier reported as a defect by mistake: the search text also filters the Category column) | pass |

Suspected defect (Province only): a province without subdistricts disappears from the list after a page reload. The Media tree behaves correctly (rechecked by the team and by the test).
- Province: Add Province -> counter 77 becomes 78 -> reload -> back to 77 and the province cannot be found, so no district can be added and it cannot be deleted from the UI. GET /api/provinces returns one row per subdistrict (7,436 rows), so a province without subdistricts is never returned. Creating the same name again answers 400 (name already exists).

Test data left on UAT that cannot be deleted from the UI:
- Media: group QA Test Group Alpha (QAT) and category QA Test Category (QAC).
- Province (invisible after reload): "QA Test จังหวัด" and "QA Test จว <digits>" created while exploring (about 3), one of them with a district. Tests 04-02 / 04-03 clean up in the same session and do not add more.
