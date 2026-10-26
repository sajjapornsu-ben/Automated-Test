// ตัวช่วยสำหรับทดสอบ Setting > Master Data (Super Admin)
import { Page, Locator, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';

export const BASE = 'https://uat-mediacontrol.planbmedia.co.th/settings/masterData';
export const QA_PREFIX = 'QA Test';

export const loginSuperAdmin = (page: Page) => loginAs(page, 'superAdmin');

export type Category = {
  slug: string;
  card: string; // card title on the landing page
  title: string; // page heading
  create: string; // create button label
  search: string; // search placeholder
};

/** All 24 Master Data categories, in landing-page order. */
export const ALL_CATEGORIES: Category[] = [
  { slug: 'media', card: 'Media', title: 'Media Management', create: 'Create Group', search: 'Search all levels — Group / Category / Type / Segment / Code...' },
  { slug: 'mediaTypeEpicorSf', card: 'Media Type (Epicor/Salesforce)', title: 'Media Type (Epicor/Salesforce) Management', create: 'Add Media Type (Epicor/SF)', search: 'Search Media Type (Epicor/SF)...' },
  { slug: 'mediaBranding', card: 'Media Branding', title: 'Media Branding Management', create: 'Create Media Branding', search: 'Search Branding' },
  { slug: 'province', card: 'Province', title: 'Province Management', create: 'Add Province', search: 'Search all levels — Province/District/Subdistrict name/postal code...' },
  { slug: 'salePackage', card: 'Sale Package', title: 'Sale Package Management', create: 'Create Sale Package', search: 'Search Sale Package — Code, Name' },
  { slug: 'department', card: 'Department', title: 'Department Management', create: 'Create Department', search: 'Search departments...' },
  { slug: 'holiday', card: 'Holiday', title: 'Holiday Management', create: 'Create Holiday', search: 'Search Holiday' },
  { slug: 'productOwner', card: 'Product Owner', title: 'Product Owner Management', create: 'Add Product Owner', search: 'Search Code/Name' },
  { slug: 'status', card: 'System Status', title: 'System Status Management', create: 'Add Status', search: 'Search Status...' },
  { slug: 'zone', card: 'Zone', title: 'Zone Management', create: 'Add Minor Zone', search: 'Search Zone...' },
  { slug: 'area', card: 'Area', title: 'Area Management', create: 'Add Area', search: 'Search Area...' },
  { slug: 'screenType', card: 'Screen Type', title: 'Screen Type Management', create: 'Create Screen Type', search: 'Search Screen Type...' },
  { slug: 'road', card: 'Road', title: 'Road Management', create: 'Add Road', search: 'Search road name or code...' },
  { slug: 'trafficLight', card: 'Traffic Light', title: 'Traffic Light Name Management', create: 'Create Traffic Light', search: 'Search Traffic Light...' },
  { slug: 'format', card: 'Format', title: 'Format Management', create: 'Create Format', search: 'Search Format...' },
  { slug: 'formatName', card: 'Format Name', title: 'Format Name Management', create: 'Create Format Name', search: 'Search Format Name...' },
  { slug: 'formatRatio', card: 'Resolution', title: 'Resolution Management', create: 'Create Resolution', search: 'Search ratio, e.g. 1024x768...' },
  { slug: 'venueType', card: 'Venue Type', title: 'Venue Type Management', create: 'Create Venue Type', search: 'Search Venue Type...' },
  { slug: 'busModelLine', card: 'Bus Model & Line', title: 'Bus Model & Line Management', create: 'Add Bus Model', search: 'Search...' },
  { slug: 'materialType', card: 'Material Type', title: 'Material Type Management', create: 'Create Material Type', search: 'Search Material Type...' },
  { slug: 'signageType', card: 'Signage Type', title: 'Signage Type Management', create: 'Create Signage Type', search: 'Search Signage Type...' },
  { slug: 'position', card: 'Position', title: 'Position Management', create: 'Create Position', search: 'Search Position...' },
  { slug: 'structureType', card: 'Structure Type', title: 'Structure Type Management', create: 'Create Structure Type', search: 'Search Structure Type...' },
  { slug: 'customizationTier', card: 'Customization Tier', title: 'Customization Tier Management', create: 'Create Customization Tier', search: 'Search Customization Tier...' },
];

/** Plain "name + status" table categories (template A) — CRUD is identical for all of them. */
export const SIMPLE_SLUGS = [
  'mediaBranding', 'area', 'screenType', 'format', 'formatName', 'venueType',
  'materialType', 'signageType', 'position', 'structureType', 'customizationTier', 'trafficLight',
];
export const byslug = (slug: string) => ALL_CATEGORIES.find((c) => c.slug === slug)!;

export async function openCategory(page: Page, cat: Category | string) {
  const c = typeof cat === 'string' ? byslug(cat) : cat;
  await page.goto(`${BASE}/${c.slug}`);
  await expect(page.getByRole('heading', { name: c.title, exact: true }).first()).toBeVisible({ timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => undefined);
}

export const searchBox = (page: Page, cat: Category) => page.getByPlaceholder(cat.search).first();

export async function searchFor(page: Page, cat: Category, term: string) {
  await searchBox(page, cat).fill(term);
  await page.waitForTimeout(1200); // the list reloads after a debounce
}

export const tableRows = (page: Page) => page.locator('tbody tr');
export const rowByText = (page: Page, text: string) => tableRows(page).filter({ hasText: text });

/** Row buttons are 28px icon buttons that react-aria exposes with unstable hit-testing — force the click. */
export async function rowAction(row: Locator, name: 'Edit' | 'Delete' | 'Active toggle') {
  const target = name === 'Active toggle' ? row.getByRole('switch', { name }) : row.getByRole('button', { name });
  await target.click({ force: true });
}

export const drawer = (page: Page) => page.getByRole('dialog').first();
export const uniqueName = (label: string) => `${QA_PREFIX} ${label} ${Date.now().toString().slice(-8)}`;

/** Total from the footer "Showing 1 to 5 of 14 items" (or "Showing 1 to 4 of 4 items"); 0 when there is no table footer. */
export async function footerTotal(page: Page): Promise<number> {
  const label = page.getByText(/Showing \d+ to \d+ of \d+ items/).first();
  await label.waitFor({ timeout: 6000 }).catch(() => undefined);
  if ((await label.count()) === 0) return 0;
  return Number((await label.innerText()).match(/of (\d+) items/)![1]);
}

/** Fills the first text input of the open create/edit drawer, saves, and waits for the drawer to close. */
export async function createSimple(page: Page, cat: Category, name: string) {
  await page.getByRole('button', { name: cat.create, exact: true }).click();
  const d = drawer(page);
  await d.locator('input').first().fill(name);
  await d.getByRole('button', { name: 'Save' }).click();
  await expect(d).toBeHidden({ timeout: 15000 });
}

/** Deletes one record through the confirm dialog (search must already show it). */
export async function deleteRow(page: Page, row: Locator) {
  await rowActionUntil(row, 'Delete', confirmDeleteTitle(page));
  await confirmDeleteButton(page).click();
  await dismissSavedModal(page);
  await expect(confirmDeleteTitle(page)).toBeHidden({ timeout: 15000 });
}

/** Removes every leftover "QA Test …" record of a category (used for clean-up). Bounded, so a stuck row cannot hang the run. */
export async function purgeQa(page: Page, cat: Category) {
  await openCategory(page, cat);
if (cat.slug === 'department') { await page.getByRole('button', { name: 'List' }).click({ force: true }); await page.waitForTimeout(1000); } // the grid view has no table rows
  await searchFor(page, cat, QA_PREFIX);
  for (let i = 0; i < 10; i++) {
    const row = rowByText(page, QA_PREFIX).first();
    if ((await row.count()) === 0) break;
    try {
      await deleteRow(page, row);
    } catch {
      break;
    }
    await page.waitForTimeout(800);
  }
}

/** Categories shown as a table with at least one record (used by the generic search / filter tests). */
export const TABLE_SLUGS = [
  'mediaBranding', 'salePackage', 'productOwner', 'status', 'zone', 'area', 'screenType', 'road', 'format', 'formatName',
  'formatRatio', 'venueType', 'busModelLine', 'materialType', 'signageType', 'position', 'structureType', 'customizationTier',
];

/**
 * A searchable text from the table: the first data cell (the record name / code) of the first row that has a real value.
 * Some seed rows have "-" as their name; Resolution has no name, so it is searched as "WIDTHxHEIGHT".
 */
export async function sampleSearchTerm(page: Page, slug = ''): Promise<string> {
  const rows = tableRows(page);
  const n = Math.min(await rows.count(), 10);
  for (let i = 0; i < n; i++) {
    const cells = (await rows.nth(i).locator('td').allInnerTexts()).map((c) => c.replace(/\s+/g, ' ').trim());
    if (slug === 'formatRatio') return `${cells[1]}x${cells[2]}`;
    if (slug === 'road' && cells[2]) return cells[2]; // column 1 is the row number
    if (cells[1] && cells[1] !== '-') return cells[1];
  }
  return '';
}

/** Status column text (the last cell of every row). */
export const statusCells = (page: Page) => tableRows(page).locator('td:last-child');

/** Opens the status filter dropdown and picks an option ("All Status" / "Active" / "Inactive"). */
export async function pickStatus(page: Page, option: string) {
  const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: /status/i }) }).last();
  await group.click();
  await page.getByRole('listbox').first().getByRole('option', { name: new RegExp(`^${option}$`, 'i') }).first().click();
  await page.waitForTimeout(1200);
}

/** Clicks a row action until its expected result appears — the table re-renders right after a search, which can swallow a click. */
export async function rowActionUntil(row: Locator, name: 'Edit' | 'Delete' | 'Active toggle', result: Locator, timeout = 4000) {
  await expect(async () => {
    await rowAction(row, name);
    await expect(result).toBeVisible({ timeout });
  }).toPass({ timeout: 25000 });
}

/** The TOTAL tile at the top of a category page (falls back to the table footer when the page has no tiles). */
export async function totalTile(page: Page): Promise<number> {
  const m = (await page.locator('main').first().innerText()).replace(/\s+/g, ' ').match(/TOTAL (\d+)/);
  return m ? Number(m[1]) : footerTotal(page); // some pages (e.g. Media Branding) have no summary tiles
}

/** The delete confirmation ("Confirm Delete …" / "Confirm delete …") — its wording and confirm button differ between categories. */
export const confirmDeleteTitle = (page: Page) => page.getByText(/cannot be undone|Confirm [Dd]elete|Are you sure|Delete .*?$/).first();
export const confirmDeleteButton = (page: Page) => page.getByRole('button', { name: /^(Confirm Delete|Delete)$/ }).last();

/** Sale Package shows a "… Saved — OK" modal after Save (other categories use a toast); dismiss it when it appears. */
export async function dismissSavedModal(page: Page) {
  await page.getByRole('button', { name: 'OK', exact: true }).click({ timeout: 2500 }).catch(() => undefined);
}

/**
 * Flips the Active switch in a table row. A real mouse click does not land on it in headless Chromium
 * (the switch is 32x18 and Playwright's hit test fails), while the app itself handles a DOM click correctly.
 */
export async function toggleRowActive(row: Locator) {
  await row.getByRole('switch', { name: 'Active toggle' }).evaluate((e) => (e as HTMLElement).click());
}
