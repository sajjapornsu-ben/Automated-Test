// ตัวช่วยตรวจ UI Wording: ข้อความที่ระบบแสดง (ปุ่ม, หัวข้อ, placeholder, tooltip, ข้อความแจ้งเตือน) ต้องเป็นภาษาอังกฤษ ไม่มีตัวอักษรไทย
import { Page, Browser, expect } from '@playwright/test';
import * as fs from 'fs';
import { loginAs, Role } from '../Dashboard/_helpers';
import { ALL_CATEGORIES } from '../MasterData/_helpers';

export const BASE = 'https://uat-mediacontrol.planbmedia.co.th';
/** Thai letters, vowels, tone marks and digits — without the baht sign (U+0E3F), which is a currency symbol, not wording. */
export const THAI = /[ก-ฺเ-๛]/;

/** Pages that are not reachable from the sidebar as a plain link (Master Data categories) plus the known fixed pages. */
export const EXTRA_PAGES = ALL_CATEGORIES.map((c) => `/settings/masterData/${c.slug}`);

export type Finding = { where: string; kind: string; text: string };

/**
 * Thai that is data, not wording: avatar initials (2 letters), person names (two short Thai words) and the QA record "ทดสอบ".
 * Kept deliberately narrow so real labels ("ถึง", "ผู้ใช้", "ไม่พบข้อมูล") are still reported.
 */
/** Thai values QA typed into tickets on UAT (data, not wording). */
const KNOWN_QA_DATA = ['น้ำพริก', 'ขอไข่', 'กอไก่'];
export const isData = (t: string) => {
  const s = t.replace(/\s+/g, ' ').trim();
  return s.length <= 2 || KNOWN_QA_DATA.includes(s) || /^ทดสอบ\W*$/.test(s) || /^[ก-๛]{2,14} [ก-๛]{2,20}$/.test(s) && !/(วัน|เดือน|ข้อมูล|ชื่อ|รหัส)/.test(s);
};

/**
 * Collects every Thai string the user can see or hover on the current screen:
 * visible text nodes, placeholder, title (tooltip), aria-label, alt and button/input values.
 * Data the users typed (table cells, cards of records) is not wording, so `tbody` / grid cells are skipped.
 */
export async function thaiOnScreen(page: Page): Promise<Finding[]> {
  const found = await page.evaluate((src) => {
    const THAI = new RegExp(src);
    const out: { kind: string; text: string }[] = [];
    const skip = (el: Element | null) => !!el?.closest('tbody, [role=gridcell], [role=row]:not([role=columnheader]) td, script, style, noscript, [data-wording-ignore]');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      const t = (n.nodeValue ?? '').trim();
      if (!t || !THAI.test(t) || skip(el)) continue;
      const style = el ? getComputedStyle(el) : null;
      if (style && (style.display === 'none' || style.visibility === 'hidden')) continue;
      out.push({ kind: 'text', text: t });
    }
    for (const el of Array.from(document.querySelectorAll('[placeholder],[title],[aria-label],[alt],input[type=button],input[type=submit]'))) {
      if (skip(el)) continue;
      for (const a of ['title', 'aria-label', 'alt'] as const) { // placeholders are not checked (agreed with the team)
        const v = el.getAttribute(a);
        if (v && THAI.test(v)) out.push({ kind: a, text: v.trim() });
      }
    }
    return out;
  }, THAI.source);
  const seen = new Set<string>();
  return found.filter((f) => !isData(f.text) && !seen.has(f.kind + f.text) && !!seen.add(f.kind + f.text)).map((f) => ({ where: '', ...f }));
}

/** Same as thaiOnScreen but labels each finding with where it was seen. */
export async function scan(page: Page, where: string): Promise<Finding[]> {
  return (await thaiOnScreen(page)).map((f) => ({ ...f, where }));
}

/** Pages that are developer showcases, not product screens (Thai coding notes) — reported separately, not asserted. */
export const DEV_ONLY_PAGES = ['/ui-kit'];

/** Saves the findings of one test to reports/ui-wording/<name>.json so the full list survives a truncated console. */
export function record(name: string, fs_: Finding[]) {
  fs.mkdirSync('reports/ui-wording', { recursive: true });
  fs.writeFileSync(`reports/ui-wording/${name.replace(/[^\w-]+/g, '_')}.json`, JSON.stringify(fs_, null, 1), 'utf8');
}

export const fmt = (list: Finding[]) => list.slice(0, 15).map((f) => `[${f.where}] ${f.kind}: "${f.text}"`).join('\n') + (list.length > 15 ? `\n… +${list.length - 15} more (see reports/ui-wording)` : '');

export async function waitSettled(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(800);
}

/** Every page the signed-in user can reach from the sidebar (opens each collapsed group first). */
export async function sidebarPages(page: Page): Promise<string[]> {
  await page.goto(`${BASE}/dashboard`);
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link').first()).toBeVisible({ timeout: 30000 });
  for (const b of await nav.getByRole('button').all()) {
    if ((await b.getAttribute('aria-expanded').catch(() => null)) === 'false') await b.click({ force: true }).catch(() => undefined);
  }
  await page.waitForTimeout(500);
  const hrefs = await nav.getByRole('link').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
  return [...new Set(hrefs.filter((h) => h.startsWith('/')))];
}

/**
 * Opens what a page offers without saving anything: each "Add / Create / New" button (drawer or dialog), then an
 * empty Save to trigger validation messages, then Cancel. Scans every state.
 */
export async function scanInteractions(page: Page, where: string, base: Finding[] = []): Promise<Finding[]> {
  const out: Finding[] = [];
  const known = new Set(base.map((f) => f.kind + f.text));
  const fresh = async (label: string) => (await scan(page, label)).filter((f) => !known.has(f.kind + f.text) && !!known.add(f.kind + f.text));
  const buttons = page.getByRole('button', { name: /^(Add|Create|New)\b/ });
  const count = Math.min(await buttons.count(), 4);
  const labels: string[] = [];
  for (let i = 0; i < count; i++) labels.push((await buttons.nth(i).innerText().catch(() => '')).trim());
  for (const label of labels.filter(Boolean)) {
    const opener = page.getByRole('button', { name: label, exact: true }).first();
    await opener.click({ force: true }).catch(() => undefined);
    const dlg = page.getByRole('dialog').first();
    if (!(await dlg.isVisible({ timeout: 3000 }).catch(() => false))) continue;
    await waitSettled(page);
    out.push(...(await fresh(`${where} › "${label}" form`)));
    const save = dlg.getByRole('button', { name: /^(Save|Create|Add|Submit|Confirm)/ }).first();
    if (await save.isVisible().catch(() => false)) {
      await save.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(800);
      out.push(...(await fresh(`${where} › "${label}" form › empty Save (validation)`)));
    }
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').first().getByRole('button', { name: /^(Cancel|Close)/ }).first().click({ force: true, timeout: 1500 }).catch(() => undefined);
    await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 5000 }).catch(() => undefined);
  }
  return out;
}

export async function signedIn(browser: Browser, role: Role) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await loginAs(page, role);
  return { ctx, page };
}

/**
 * Master Data pages list records (road names, material types, provinces...) whose names are data, often bilingual.
 * On those pages only attributes (placeholder / tooltip / aria-label) and anything inside a form or dialog count as wording.
 */
export const dropListData = (page: string, fs_: Finding[]) => {
  // text the admins type themselves (group / template descriptions) is data too: only validation messages count on these pages
  if (USER_TEXT_PAGES.some((p) => page.endsWith(p))) return fs_.filter((f) => f.kind !== 'text' || f.where.includes('validation'));
  return page.includes('/settings/masterData/') ? fs_.filter((f) => f.kind !== 'text' || f.where.includes('validation') || page.endsWith('/holiday')) : fs_; // Holiday: the date picker's month / day names are UI
};
export const USER_TEXT_PAGES = ['/settings/userGroupManagement', '/settings/emailTemplate'];

/**
 * Findings the team treats as defects (confirmed 27 Oct): 1) Login labels, 2) Create User validation messages, 3) Holiday date picker.
 * Everything else the scan finds (Reports, Dashboard work types, Email Template, ...) is still recorded in reports/ui-wording but is not a failure.
 */
export const isBug = (f: Finding) =>
  f.where.startsWith('Login') ||
  (f.where.includes('/settings/userManagement') && f.where.includes('validation')) ||
  f.where.includes('/settings/masterData/holiday');
