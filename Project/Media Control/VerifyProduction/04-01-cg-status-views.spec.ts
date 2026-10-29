// Verify & Production — CG หน้า detail ตามสถานะ (ดูอย่างเดียว ไม่กดส่งจริง): On Process (ฟอร์ม Submit Prove + ตรวจว่าส่งเปล่าไม่ได้), Revise (CG) (Redo this Job / Items to Revise / Items to Complete: การ์ด Prove N → N+1 และปุ่มส่งตามชนิด), Final Approve (Approval Result ตรงกับคอลัมน์ Approve), Done (Rendered Files ครบ และงานถูกปิด)
// spec: specs/verify-production-plan.md (4) — CG (cg1); หยิบ job แรกที่เป็นสถานะนั้นของ CG (ถ้าไม่มี job สถานะนั้นตอนรันจะข้ามพร้อมเหตุผล)
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { openVpList, readAllRows, openJob, ACTION_BUTTONS, VpRow } from './_helpers';

let rows: VpRow[] = [];

test.describe('Verify & Production — CG job detail by status', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'cg1');
    await openVpList(page);
    rows = await readAllRows(page);
  });

  test('VP-CG-08 On Process: Submit Prove form, empty submit is refused', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    test.setTimeout(240000);
    const r = rows.find((x) => x.status === 'On Process');
    test.skip(!r, 'no On Process job for this CG right now');
    await openJob(page, r!);

    await expect(page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible();
    await expect(page.getByText('Upload Prove for review')).toBeVisible();
    await expect(page.getByText('URL LINK *')).toBeVisible();
    await expect(page.getByText('At least one is required — URL Link or attach a file below')).toBeVisible();
    await expect(page.getByPlaceholder('https://drive.google.com/...')).toBeVisible();
    await expect(page.getByText('PNG, JPG, PSD, AI, PDF up to 50 MB')).toBeVisible();
    await expect(page.getByText('Production Note')).toBeVisible();
    const submit = page.getByRole('button', { name: 'Submit Prove', exact: true });
    await expect(submit).toBeEnabled();
    // On Process is past Accept: no Accept / Feedback buttons
    await expect(page.getByRole('button', { name: 'Accept', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Feedback', exact: true })).toHaveCount(0);

    // nothing attached → refused with a message, the job stays On Process
    await submit.click({ force: true });
    await expect(page.getByText('Please attach a file or enter a URL link before submitting')).toBeVisible();
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Submit Prove' })).toBeVisible();
    await page.reload();
    await expect(page.locator('main')).toContainText('On Process');
  });

  test('VP-CG-09 Revise (CG): Items to Revise / Redo this Job card and its submit button', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    test.setTimeout(480000);
    const list = rows.filter((x) => x.status === 'Revise (CG)').slice(0, 4);
    test.skip(list.length === 0, 'no Revise (CG) job for this CG right now');
    const seen: string[] = [];
    for (const r of list) {
      await openJob(page, r);
      // the card is one of three kinds, each with its own submit button
      const kinds = [
        { heading: /^Redo this Job · Re-Edit \(\d+ formats?\)$/, button: 'Submit Re-Edit Prove', hint: 'Sale re-opened this finished job' },
        { heading: /^Items to Revise · Feedback \(\d+ formats?\)$/, button: 'Submit Feedback Prove', hint: 'Deliver the revision for this Feedback' },
        { heading: /^Items to Complete · Skip \(\d+ formats?\)$/, button: 'Submit Skip Prove', hint: '' },
      ];
      const headings = (await page.getByRole('heading').allInnerTexts()).map((t) => t.trim());
      const kind = kinds.find((k) => headings.some((h) => k.heading.test(h)));
      expect(kind, `${r.job}: a revise card among headings ${JSON.stringify(headings)}`).toBeTruthy();
      seen.push(`${r.job}: ${kind!.button}`);
      // "Prove N → Prove N+1": the delivery becomes the next round
      const m = (await page.locator('main').innerText()).match(/Prove (\d+) → Prove (\d+)/);
      expect(m, `${r.job}: "Prove N → Prove N+1"`).toBeTruthy();
      expect(Number(m![2])).toBe(Number(m![1]) + 1);
      if (kind!.hint) await expect(page.locator('main')).toContainText(new RegExp(kind!.hint, 'i'));
      await expect(page.getByText('Send every Format listed in this card')).toBeVisible();
      await expect(page.getByPlaceholder('https://drive.google.com/...')).toBeVisible();
      const submit = page.getByRole('button', { name: kind!.button, exact: true });
      await expect(submit).toBeEnabled();
      // empty submit is refused
      await submit.click({ force: true });
      await expect(page.getByText('Attach at least one file or a URL link')).toBeVisible();
      await expect(page.locator('main')).toContainText('Revise (CG)');
    }
    expect(seen.length).toBeGreaterThan(0);
  });

  test('VP-CG-10 Final Approve: Approval Result matches the Approve column and shows Media Allocate', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(300000);
    const list = rows.filter((x) => x.status === 'Final Approve').slice(0, 3);
    test.skip(list.length === 0, 'no Final Approve job for this CG right now');
    for (const r of list) {
      await openJob(page, r);
      const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      const approval = text.slice(text.indexOf('APPROVAL RESULT'));
      expect(text, `${r.job}: Approval Result section`).toContain('APPROVAL RESULT');
      const cu = approval.match(/CUSTOMER APPROVAL (Approved by .+? \d{2}\/\d{2}\/\d{4}|Pending[^A-Z]*)/);
      const ll = approval.match(/LANDLORD APPROVAL (Approved by .+? \d{2}\/\d{2}\/\d{4}|Pending[^A-Z]*)/);
      expect(cu, `${r.job}: customer approval state`).toBeTruthy();
      expect(ll, `${r.job}: landlord approval state`).toBeTruthy();
      const cuApproved = cu![1].startsWith('Approved');
      const llApproved = ll![1].startsWith('Approved');
      // the Approve column of the list says the same
      expect(r.approve, `${r.job}: list Approve column`).toContain(cuApproved ? 'CU Approved' : 'CU Pending');
      expect(r.approve).toContain(llApproved ? 'LL Approved' : 'LL Pending');
      // Final Approve = still waiting for at least one party
      expect(cuApproved && llApproved, `${r.job}: both approved would be Final Render, not Final Approve`).toBe(false);
      await expect(page.getByText('Waiting for approval from both parties')).toBeVisible();
      // Media Allocate
      expect(approval).toMatch(/MEDIA ALLOCATE Durations \d+\.\d{2} seconds Number Spot\/Loop \d+ times On-Air \d{2}\/\d{2}\/\d{4}–\d{2}\/\d{2}\/\d{4}/);
    }
  });

  test('VP-CG-11 Done: both approvals, Rendered Files complete, job closed', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    test.setTimeout(300000);
    const list = rows.filter((x) => x.status === 'Done').slice(0, 3);
    test.skip(list.length === 0, 'no Done job for this CG right now');
    for (const r of list) {
      await openJob(page, r);
      const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
      expect(r.approve, `${r.job}: list Approve column`).toContain('CU Approved');
      expect(r.approve).toContain('LL Approved');
      expect(text).toMatch(/CUSTOMER APPROVAL Approved by .+? \d{2}\/\d{2}\/\d{4}/);
      expect(text).toMatch(/LANDLORD APPROVAL Approved by .+? \d{2}\/\d{2}\/\d{4}/);
      // Rendered Files (N formats) Confirmed: N file names, rendered date, no more edits
      const rf = text.match(/Rendered Files \((\d+) formats?\) Confirmed FORMAT NAME FILE NAME RENDER (.+?) Rendered on (\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/);
      expect(rf, `${r.job}: Rendered Files section`).toBeTruthy();
      const n = Number(rf![1]);
      expect(n, `${r.job}: formats rendered`).toBeGreaterThan(0);
      // every format has a file name: "<FORMAT> <file name>" pairs
      const pairs = rf![2].trim().split(/\s+(?=\S+ \S+_\S+|\S+ \d{10,})/);
      expect(pairs.length, `${r.job}: ${n} formats listed with a file name each`).toBe(n);
      await expect(page.getByText('This job is closed — no further edits are allowed')).toBeVisible();
      // closed: nothing to submit
      const buttons = (await page.getByRole('button').allInnerTexts()).map((t) => t.trim().replace(/\s+/g, ' '));
      expect(buttons.filter((b) => ACTION_BUTTONS.test(b)), `${r.job}: action buttons on a closed job`).toEqual([]);
    }
  });
});
