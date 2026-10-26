# Test Plan — Settings > User Group Management (Super Admin)

Page: `/settings/userGroupManagement` — cards (not a table). Tiles: Total User Groups / Active / Inactive / Total Users. Search (name, description), status filter, system chips (HOME, DASHBOARD, INVENTORY, SALE, MEDIA APPROVAL, PRODUCTION, CLAIM, REPORT, SETTING with counts), "Showing N of N groups". Each card: name, status, description, member count ("N users", click opens the members drawer), SYSTEM ACCESS badges (e.g. MEDIA APPROVAL 2/5), Edit, Delete.
Add/Edit drawer: name*, description, status (Active / Inactive), access = switch per system and submenu buttons under it.

## Tests (all pass)
| File | Tests |
|---|---|
| 01-01 (read only) | UG-READ-01 structure + tiles (Active+Inactive = Total, Σ members = Total Users); UG-SRCH-01 search; UG-FLT-01 system chips + status filter + Reset; UG-MEM-01 members drawer; UG-X-01 member count = ACTIVE users of that group in User Management |
| 02-01 (`RUN_UAT_SUBMIT_TESTS=1`) | UG-CRUD-01 name required, create with access, edit (name / description / menu), deactivate, delete (Cancel / confirm) |
| 03-01 (`RUN_UAT_SUBMIT_TESTS=1`) | UG-ASSIGN-01 QA group → QA user in it → sign in: sidebar = granted menus, ungranted pages redirect to /dashboard; edit access → menus change; inactive group (confirmation "will remove all N members", Cancel keeps it) → no menus; group with a member cannot be deleted ("Cannot delete group … still has 1 user(s)"); move user out → delete works |

## Observations
- Cards count ACTIVE members only: the QA group shows 0 users while User Management lists 1 inactive user in it (Total Users 70 vs 72 users).
- A role other than the QA group needs a Role and at least one Media Group + Media Category when creating a user.
- Saving shows a "… successfully" modal (OK) that sits above the drawer.
- Deactivating a group with members asks for confirmation; afterwards the members stay Active in User Management and can still sign in, but see no menu (no sidebar).
