// เครื่องมือ (ไม่ใช่เทส): สร้างรายงาน reports/visibility-defects.md ระบุ Job No / Package / CG ที่ไม่ตรงกฎการมองเห็นของ Head CG และ Media Management เพื่อส่งให้ dev
// รันด้วย: EVIDENCE=1 npx playwright test "Dashboard/99-" --project=chromium
// seed: seed.spec.ts

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import { loginAs, DISPLAY_NAME } from './_helpers';
import { fetchAll } from './_report-helpers';
import { openList, footerTotal, userGrantedPackages, userTeamMembers } from './_cross-helpers';

async function listJobs(page: Page, key: 'assignTicket' | 'mediaManagement'): Promise<string[]> {
  await openList(page, key);
  await page.getByRole('combobox').last().selectOption('100').catch(() => undefined);
  await page.waitForTimeout(2000);
  const total = await footerTotal(page);
  const out: string[] = [];
  for (let i = 0; i < 20 && out.length < total; i++) {
    for (const t of await page.locator('tbody tr').allInnerTexts()) {
      const m = t.match(/JOB-[0-9A-Za-z-]+/);
      if (m && !out.includes(m[0])) out.push(m[0]);
    }
    if (out.length >= total) break;
    await page.getByRole('button', { name: 'Next' }).click().catch(() => undefined);
    await page.waitForTimeout(1500);
  }
  return out;
}

test('visibility evidence for developers', async ({ browser }) => {
  test.skip(!process.env.EVIDENCE, 'Report generator — set EVIDENCE=1 to run');
  test.setTimeout(580000);
  const mk = async (role: Parameters<typeof loginAs>[1]) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await loginAs(p, role);
    return p;
  };
  const A = await mk('superAdmin');
  const admin = (await fetchAll(A, 'sla')).rows;
  const air = (await fetchAll(A, 'airtime')).rows;
  const pkg = new Map<string, string>(air.map((r) => [r.jobCode as string, r.salePackageName as string]));
  const byCode = new Map<string, any>(admin.map((r) => [r.jobCode as string, r]));
  const headPk = (await userGrantedPackages(A, process.env.HEAD_CG_EMAIL!)).granted;
  const team = new Set([DISPLAY_NAME.headCg!, ...(await userTeamMembers(A, process.env.HEAD_CG_EMAIL!))]);
  const mmPk = (await userGrantedPackages(A, process.env.MEDIA_MANAGEMENT_EMAIL!)).granted;
  expect(headPk.size, 'Head CG packages read').toBeGreaterThan(0);
  expect(mmPk.size, 'Media Management packages read').toBeGreaterThan(0);
  const names = (r: any) => String(r?.graphic ?? '').split(',').map((s) => s.trim()).filter((s) => s && s !== '-');
  const row = (j: string) => {
    const r = byCode.get(j);
    return `| ${j} | ${pkg.get(j) ?? '?'} | ${r?.status ?? '?'} | ${r?.graphic ?? '-'} | ${r?.media ?? ''} |`;
  };
  const header = '| Job No | Sale Package | Status | CG assigned | Media |\n|---|---|---|---|---|\n';

  // ---- Head CG: Assign Ticket rows beyond the rule
  const H = await mk('headCg');
  const headList = await listJobs(H, 'assignTicket');
  const allowedH = new Set(admin.filter((r) => headPk.has(pkg.get(r.jobCode)!) && (!names(r).length || names(r).some((n) => team.has(n))) && r.status !== 'Draft').map((r) => r.jobCode as string));
  const extraH = headList.filter((j) => !allowedH.has(j));
  const missingH = [...allowedH].filter((j) => !headList.includes(j));
  let md = `# Evidence for developers — job visibility (checked ${new Date().toISOString().slice(0, 10)} on UAT)\n\n`;
  md += `## 1) Head CG (Head CG - QA) — Assign Ticket shows jobs outside the team\nRule (SA): Head CG sees the jobs of the whole team, split by the Packages they are responsible for.\nTeam: ${[...team].join(', ')}. Packages ticked in Media access: ${headPk.size}.\n\nAssign Ticket lists ${headList.length} jobs; the rule gives ${allowedH.size}. **${extraH.length} jobs are shown that the rule excludes:**\n\n${header}`;
  md += extraH.map(row).join('\n') + '\n';
  if (missingH.length) md += `\nJobs the rule includes but Assign Ticket does not show (${missingH.length}):\n\n${header}${missingH.map(row).join('\n')}\n`;
  const byCg: Record<string, number> = {};
  for (const j of extraH) for (const n of names(byCode.get(j))) byCg[n] = (byCg[n] ?? 0) + 1;
  const byPk: Record<string, number> = {};
  for (const j of extraH) byPk[pkg.get(j) ?? '?'] = (byPk[pkg.get(j) ?? '?'] ?? 0) + 1;
  md += `\nExtra jobs by assigned CG: ${JSON.stringify(byCg)}\nExtra jobs by Sale Package: ${JSON.stringify(byPk)}\n`;

  // ---- Media Management
  const M = await mk('mediaManagement');
  const mmSla = new Set((await fetchAll(M, 'sla')).rows.map((r) => r.jobCode as string));
  const mmList = await listJobs(M, 'mediaManagement');
  await openList(M, 'mediaTicket');
  await M.getByRole('combobox').last().selectOption('100').catch(() => undefined);
  await M.waitForTimeout(1500);
  const own = new Set<string>();
  for (const t of await M.locator('tbody tr').allInnerTexts()) {
    const m = t.match(/TK-[0-9A-Za-z-]+/);
    if (m) own.add(m[0]);
  }
  const wantM = admin.filter((r) => mmPk.has(pkg.get(r.jobCode)!) || own.has(r.ticketCode));
  const wantLive = wantM.filter((r) => r.status !== 'Draft');
  const missSla = wantM.filter((r) => !mmSla.has(r.jobCode));
  const missList = wantLive.filter((r) => !mmList.includes(r.jobCode));
  const extraList = mmList.filter((j) => !wantLive.some((r) => r.jobCode === j));
  md += `\n## 2) Media Management\nRule (SA): overview by the Packages they belong to + the tickets they created (Create Ticket).\nPackages ticked: ${mmPk.size}. Own tickets (${own.size}): ${[...own].join(', ')}.\n\nRule gives ${wantM.length} jobs (${wantLive.length} without Draft).\n\n### 2a) Dashboard and Export SLA show ${mmSla.size} jobs — **${missSla.length} jobs are missing**\n\n${header}${missSla.map((r) => row(r.jobCode)).join('\n')}\n`;
  const bm: Record<string, number> = {};
  for (const r of missSla) for (const n of names(r).length ? names(r) : ['(unassigned)']) bm[n] = (bm[n] ?? 0) + 1;
  md += `\nMissing jobs by assigned CG: ${JSON.stringify(bm)}\n`;
  md += `\n### 2b) Media Management page lists ${mmList.length} jobs; the rule says ${wantLive.length} (without Draft)\nJobs the rule includes but the page does not show (${missList.length}):\n\n${header}${missList.map((r) => row(r.jobCode)).join('\n')}\n`;
  if (extraList.length) md += `\nJobs the page shows but the rule does not include (${extraList.length}):\n\n${header}${extraList.map(row).join('\n')}\n`;
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/visibility-defects.md', md, 'utf8');
  console.log(`head extra ${extraH.length} missing ${missingH.length} | mm missing in sla ${missSla.length}, missing in list ${missList.length}, extra in list ${extraList.length}`);
});
