# Test Plan — Settings > User Management (Super Admin)

Page: `/settings/userManagement`. Role under test: Super Admin.

## Observed
- Summary tiles: Total Users, Active, Inactive, Head CG (counts users with the Head CG **role**: Head CG + Head CG & Media Management groups).
- Search box "Search by name, email, phone..." — splits the text into words (e-mail at "@" and "."), so other users sharing a word can appear; the user searched for is always in the result. Digit strings match phone numbers (98765 matches 098-765-4321).
- Filters: status, department, user group, Reset. Per page: Auto / 10 / 25 / 50 / 100. Export Excel (users_<date>.xlsx, sheet Users, 8 columns).
- Table: Actions (Edit / Delete), Name, Department, Media Group (chips + "Show all N Media Groups"), User Group, Email, Phone ("—" when empty), Status, Updated Date.
- Create User drawer: First/Last name*, Nickname, Department, Email*, Phone, User Group*, Role, Media access tree (Group > Category > Type > Panel Package), "log in with Email + Password only" → Password* (min 8) and Confirm Password*, Status, Email Notification. Validation messages are Thai ("กรุณากรอก ...").

## Done (read-only, 11 tests pass)
| File | Tests |
|---|---|
| 01-01 | UM-READ-01 structure, UM-READ-02 Total = Active + Inactive = footer, UM-READ-03 filter options |
| 01-02 | UM-SRCH-01 search (name / email / phone / no match / clear), UM-FLT-01 status filter vs tiles, UM-FLT-02 user group filter (Head CG tile = Head CG + Head CG & Media Management), UM-FLT-03 department + combined filters + Reset |
| 01-03 | UM-PAG-01 pagination, UM-MG-01 "Show all N Media Groups", UM-EXP-01 export = table, UM-EXP-02 export respects the status filter |

## Done — Create User validation and the QA user lifecycle (authorised by the team)
Only throwaway users `QA Test User <digits>` / `qa.test.<digits>@example.com` (user group QA, Email Notification off, password from `.env`: `QA_USER_PASSWORD`, `QA_USER_NEW_PASSWORD`) are touched; every action first asserts that exactly one row matches the QA e-mail. Existing users are never edited or deleted. Leftovers are purged in `finally`.

| File | Test | Covers |
|---|---|---|
| 02-01 | UM-VAL-01 (no account created) | empty Save → Thai messages for First name, Last name, Email, User Group, Password, Confirm Password; invalid e-mail; password < 8 characters; mismatch |
| 03-01 | UM-CRUD-01 (`RUN_UAT_SUBMIT_TESTS=1`) | create → row + Total/Active +1; duplicate e-mail rejected ("Email already registered", drawer stays open); edit nickname/phone; delete (Cancel keeps / Delete Permanently removes); counters back; deleted account cannot sign in |
| 03-01 | UM-AUTH-01 | the new account signs in; wrong password → "Invalid username or password"; change password: short and mismatching values blocked, old password rejected, new password accepted |
| 03-01 | UM-AUTH-02 | deactivate → row Inactive, Active -1 / Inactive +1, login blocked with "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อ Admin"; reactivate → login works again |

Observations: a QA-group user lands on `/ui-kit` and sees only SETTING > UI Kit; the delete dialog names the user including the nickname; the failure message on the login page is a modal "Failed … OK".
