// หน้า Email Template (อ่านอย่างเดียว ไม่บันทึกข้อมูล): หัวตาราง/จำนวน, ค้นหา (Subject / Sender / Description), ตัวกรอง Group + Status + Reset, เปิดฟอร์ม Create/Edit ดูช่องและตัวแปร, Template Type ของแต่ละ Group, และข้อความเมื่อกด Save ฟอร์มว่าง
// spec: specs/email-template-plan.md (1-3) — Super Admin
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openEmailTemplates, templateCount, dataRows, searchTemplates, pickFilter, drawer, domClick, dismissModal, saveButton, fillTemplate, rowBySubject,
} from './_helpers';

const GROUPS = ['Sale', 'Media Approval', 'Production', 'Claim', 'Inventory', 'System'];

test.describe('Email Template — list, search, filters and forms (read only)', () => {
  test.beforeEach(async ({ page }) => {
    await loginSuperAdmin(page);
    await openEmailTemplates(page);
  });

  test('ET-LIST-01 page layout, columns and row actions', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await expect(page.getByText('Manage notification email templates by group and type')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Template' })).toBeVisible();
    for (const h of ['Actions', 'Template', 'Sender Name', 'Subject', 'Description', 'Status']) {
      await expect(page.getByRole('columnheader', { name: h, exact: true })).toBeVisible();
    }
    const total = await templateCount(page);
    expect(total).toBeGreaterThan(0);
    await expect(dataRows(page)).toHaveCount(total);
    // every row has Edit / Duplicate / Delete and a status switch
    const first = dataRows(page).first();
    for (const b of ['Edit', 'Duplicate', 'Delete']) await expect(first.getByRole('button', { name: b, exact: true })).toBeVisible();
    await expect(first.getByRole('switch', { name: 'Status toggle' })).toBeVisible();
  });

  test('ET-SEARCH-01 search by subject, sender and description; no result; clear', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    const total = await templateCount(page);
    await searchTemplates(page, 'Cancel Job');
    const hit = await templateCount(page);
    expect(hit).toBeGreaterThan(0);
    expect(hit).toBeLessThan(total);
    for (const t of await dataRows(page).allInnerTexts()) expect(t.toLowerCase()).toContain('cancel job');

    await searchTemplates(page, 'Media Control System'); // sender name
    expect(await templateCount(page)).toBe(total);
    await searchTemplates(page, 'CS Support'); // description (Thai text that contains the English role name)
    expect(await templateCount(page)).toBeGreaterThan(0);

    await searchTemplates(page, 'zzzz-no-such-template');
    expect(await templateCount(page)).toBe(0);
    await expect(dataRows(page)).toHaveCount(0);

    await searchTemplates(page, '');
    expect(await templateCount(page)).toBe(total);
  });

  test('ET-FILTER-01 filter by Group and Status, Reset', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const total = await templateCount(page);
    await pickFilter(page, 'Group', 'Media Approval');
    expect(await templateCount(page)).toBe(total); // all current templates are Media Approval
    for (const t of await dataRows(page).allInnerTexts()) expect(t).toContain('Media Approval');
    await pickFilter(page, 'Group', 'Sale');
    expect(await templateCount(page)).toBe(0);

    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForTimeout(700);
    expect(await templateCount(page)).toBe(total);

    await pickFilter(page, 'Status', 'Inactive');
    const inactive = await templateCount(page);
    for (const t of await dataRows(page).allInnerTexts()) expect(t).toContain('Inactive');
    await pickFilter(page, 'Status', 'Active');
    const active = await templateCount(page);
    for (const t of await dataRows(page).allInnerTexts()) expect(t).toMatch(/Active\s*$/);
    expect(active + inactive).toBe(total);

    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForTimeout(700);
    expect(await templateCount(page)).toBe(total);
  });

  test('ET-FORM-01 Create form: sections, groups, template types per group, recipients', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    await domClick(page.getByRole('button', { name: 'Create Template' }));
    const d = drawer(page);
    await expect(d.getByRole('heading', { name: 'Create Template' })).toBeVisible();
    for (const s of ['Template Info', 'Email Header', 'Recipients', 'Mail Body']) await expect(d).toContainText(s);
    await expect(d.getByRole('switch', { name: 'Toggle status' })).toBeChecked(); // new templates default to Active
    await expect(d.getByRole('textbox', { name: 'Sender Name *' })).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Subject *' })).toBeVisible();
    await expect(d.getByRole('application', { name: 'Rich Text Editor' })).toBeVisible();

    // the group list, and which groups have template types left to use
    await domClick(d.getByRole('button', { name: /Template Group$/ }));
    expect(await page.getByRole('listbox').last().getByRole('option').allInnerTexts()).toEqual(GROUPS);
    await domClick(page.getByRole('option', { name: 'Sale', exact: true }).first());
    await domClick(d.getByRole('button', { name: /Template Type$/ }));
    await expect(page.getByRole('option', { name: /No Template Type available/ })).toBeVisible();
    await page.keyboard.press('Escape');
    // Sale has its own recipient boxes (TO / CC / BCC)
    for (const box of ['TO', 'CC', 'BCC']) await expect(d.getByRole('switch', { name: `Use recipients in ${box}` })).toBeVisible();

    // Media Approval: the 12 existing types are taken, so only unused ones are offered; recipients are automatic
    await fillTemplate(page, { group: 'Media Approval' });
    await expect(d).toContainText('go automatically to the people involved in each ticket');
    await domClick(d.getByRole('button', { name: /Template Type$/ }));
    const types = await page.getByRole('listbox').last().getByRole('option').allInnerTexts();
    expect(types.length).toBeGreaterThan(0);
    for (const used of ['Create Ticket', 'Assign Job', 'Accept Job', 'Cancel Job']) expect(types).not.toContain(used);
    await page.keyboard.press('Escape');

    await domClick(d.getByRole('button', { name: 'Cancel', exact: true }));
    await expect(d).toBeHidden();
  });

  test('ET-FORM-02 Edit form is pre-filled and exposes the variables; Cancel changes nothing', { tag: ['@happy', '@regression'] }, async ({ page }) => {
    const row = dataRows(page).filter({ hasText: 'Cancel Job' }).first();
    const before = (await row.innerText()).replace(/\s+/g, ' ');
    await domClick(row.getByRole('button', { name: 'Edit' }));
    const d = drawer(page);
    await expect(d.getByRole('heading', { name: 'Edit Template' })).toBeVisible();
    await expect(d.getByRole('textbox', { name: 'Sender Name *' })).toHaveValue('Media Control System :: Media Approval');
    await expect(d.getByRole('textbox', { name: 'Subject *' })).toHaveValue(/Cancel Job Ticket/);
    for (const v of ['$ticket_no', '$job_no', '$cancel_reason', '$cancel_remark', '$link']) await expect(d.getByRole('button', { name: v, exact: true })).toBeVisible();
    // the variable chip inserts into the Subject (the field used last) — edit then Cancel must not save
    await d.getByRole('textbox', { name: 'Subject *' }).fill('QA Test should not be saved');
    await domClick(d.getByRole('button', { name: 'Cancel', exact: true }));
    await expect(d).toBeHidden();
    expect((await dataRows(page).filter({ hasText: 'Cancel Job' }).first().innerText()).replace(/\s+/g, ' ')).toBe(before);
    await expect(rowBySubject(page, 'QA Test should not be saved')).toHaveCount(0);
  });

  test('ET-VALID-01 saving an empty Create form is refused with a message', { tag: ['@negative', '@regression'] }, async ({ page }) => {
    const before = await templateCount(page);
    await domClick(page.getByRole('button', { name: 'Create Template' }));
    await domClick(saveButton(page));
    await expect(page.getByText('Missing Information')).toBeVisible();
    await expect(page.getByText('Please complete Group, Type, Sender, and Subject.')).toBeVisible();
    await dismissModal(page);
    await expect(drawer(page)).toBeVisible(); // still open, nothing saved
    await domClick(drawer(page).getByRole('button', { name: 'Cancel', exact: true }));
    await expect(drawer(page)).toBeHidden();
    expect(await templateCount(page)).toBe(before);
  });

  test('ET-LIST-02 Delete asks for confirmation and Cancel keeps the template', { tag: ['@negative', '@regression'] }, async ({ page }) => {
    const before = await templateCount(page);
    const row = dataRows(page).first();
    await domClick(row.getByRole('button', { name: 'Delete' }));
    await expect(page.getByText('Delete Email Template?')).toBeVisible();
    await expect(page.getByText(/^Delete template .*\(Media Approval\)\?/)).toBeVisible();
    await expect(page.getByText('This action cannot be undone.')).toBeVisible();
    await domClick(page.getByRole('button', { name: 'Cancel', exact: true }).last());
    await expect(page.getByText('Delete Email Template?')).toBeHidden();
    expect(await templateCount(page)).toBe(before);
  });
});
