# UI Wording plan — every screen must be in English

Specs: `Project/Media Control/UiWording/01-01-ui-wording-is-english.spec.ts` (helpers in `_helpers.ts`). Nothing is saved on UAT.

| ID | Scope | What is checked |
|---|---|---|
| UI-WORD-01 | Login page (not signed in) | labels, buttons, "Missing Information" modal (empty submit), "Invalid username or password" modal (made-up account) |
| UI-WORD-02 | Super Admin: every sidebar page + 24 Master Data pages | page text, tooltip (title), aria-label; every Add / Create / New form (drawer or dialog) opened, then empty Save to read the validation messages, then closed |
| UI-WORD-03 | Sale, Media Management, Head CG, CG1, CG2 | the same, for the pages in each role's own sidebar |

A screen passes when no Thai letter (U+0E01–U+0E5B) is visible. The baht sign is allowed.

## Not counted as wording (data)
- table bodies; avatar initials; Thai person names; the QA record "ทดสอบ" and a few Thai QA ticket values
- Master Data pages: record names (roads, material types, provinces...). Only tooltips, validation messages and the Holiday date picker are checked there
- `/ui-kit` is a developer showcase page (Thai coding notes) — skipped

## Output
Full lists per role: `reports/ui-wording/<role>.json` (`login`, `superAdmin`, `sale`, `mediaManagement`, `headCg`, `cg1`, `cg2`).

## Not covered yet
Messages that only appear after a real save / delete (success, "Cannot delete…", confirm dialogs) need UAT data changes; the Master Data, User Management and User Group specs already assert many of them in English. Ask before adding a wording sweep that mutates data.

## Agreed exclusions (27 Oct)
- Placeholders are not checked.
- Text typed in by admins is data: User Group descriptions and Email Template descriptions (only validation messages are checked on those two pages).

## What counts as a defect (27 Oct)
Only three: 1) Login labels "อีเมล" / "รหัสผ่าน", 2) Create User validation messages (User Management), 3) Holiday date picker months / days in Thai.
Other Thai text found (Reports, Dashboard work types, tooltips...) is still listed in `reports/ui-wording/*.json` but does not fail the tests.
