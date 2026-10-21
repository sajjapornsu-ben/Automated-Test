import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// The app keeps its whole session in two httpOnly cookies (access_token, refresh_token) — no localStorage /
// sessionStorage — so caching the cookies per account is enough to skip the login screen.
const BASE = 'https://uat-mediacontrol.planbmedia.co.th';
const CACHE_DIR = path.join(process.cwd(), '.auth');
const SAFETY_MARGIN_S = 300; // refuse cookies that expire within 5 minutes

type Cookies = Awaited<ReturnType<ReturnType<Page['context']>['cookies']>>;

function readFresh(file: string): Cookies | null {
  try {
    const cookies: Cookies = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const access = cookies.find((c) => c.name === 'access_token');
    if (!access || access.expires < Date.now() / 1000 + SAFETY_MARGIN_S) return null;
    return cookies;
  } catch {
    return null;
  }
}

function save(file: string, cookies: Cookies) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  // Write to a temp file first so parallel workers never read a half-written file.
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cookies));
  fs.renameSync(tmp, file);
}

async function formLogin(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // Navigating right after login can race the app's own post-login redirect.
  await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
}

/**
 * Logs `page` in as the given account. The first call per account (or after the cached session expires)
 * goes through the real login form and stores the session cookies in `.auth/<key>.json`; later calls —
 * from any test or worker — restore those cookies instead, which skips the login screen entirely.
 * Set NO_AUTH_CACHE=1 to always use the real form.
 */
export async function loginWithCache(page: Page, key: string, email: string, password: string) {
  const file = path.join(CACHE_DIR, `${key}.json`);

  if (!process.env.NO_AUTH_CACHE) {
    const cached = readFresh(file);
    if (cached) {
      await page.context().addCookies(cached);
      await page.goto(`${BASE}/dashboard`);
      const stillLoggedIn = await page
        .getByRole('button', { name: 'Log Out' })
        .waitFor({ timeout: 10000 })
        .then(() => true, () => false);
      if (stillLoggedIn) return;
      // Server rejected the cached session (revoked / expired early): drop it and log in for real.
      await page.context().clearCookies();
      fs.rmSync(file, { force: true });
    }
  }

  await formLogin(page, email, password);
  if (!process.env.NO_AUTH_CACHE) save(file, await page.context().cookies());
}
