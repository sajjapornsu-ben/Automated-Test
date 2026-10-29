// CRUD Email Template ทดสอบ "QA Test ...": สร้าง (Media Approval / Revise Prove แบบ Inactive), ฟอร์มไม่ครบถูกบล็อก, Type ที่ใช้แล้วหายจากรายการ, แก้ไข, สลับสถานะในแถว, Duplicate, ลบ (Cancel ไม่ลบ / ยืนยันลบ) และ Type กลับมาให้เลือกอีกครั้ง
// spec: specs/email-template-plan.md (4) — Super Admin
// seed: seed.spec.ts
//
// เทสนี้สร้าง/แก้/ลบ template จริงบน UAT (Subject ขึ้นต้น "QA Test") ไม่แตะ template เดิม — รันด้วย RUN_UAT_SUBMIT_TESTS=1 จาก terminal เท่านั้น
// หมายเหตุ: Type "Revise Prove" เป็น Type จริงของระบบที่ยังไม่มี template — เทสสร้างเป็น Inactive และลบทิ้งท้ายเทส (ตอนทดสอบสลับ Active จะเปิดไว้ไม่กี่วินาที)

import { test, expect } from '@playwright/test';
import {
  loginSuperAdmin, openEmailTemplates, templateCount, rowBySubject, searchTemplates, drawer, domClick, dismissModal, saveButton, fillTemplate,
  uniqueSubject, deleteRow, purgeQaTemplates, dataRows,
} from './_helpers';

const TYPE = 'Revise Prove';

test.describe('Email Template — QA template CRUD', () => {
  test.describe.configure({ mode: 'serial' }); // both tests use the same free template type
  test.skip(!process.env.RUN_UAT_SUBMIT_TESTS, 'Creates/edits/deletes a real UAT template — set RUN_UAT_SUBMIT_TESTS=1 to run');

  test('ET-CRUD-01 create, validate, edit, toggle status, duplicate, delete', { tag: ['@happy', '@negative', '@regression'] }, async ({ page }) => {
    test.setTimeout(300000);
    await loginSuperAdmin(page);
    const subject = uniqueSubject();
    const edited = `${subject} E`;
    try {
      await purgeQaTemplates(page).catch(() => undefined);
      await openEmailTemplates(page);
      const before = await templateCount(page);

      // 1) the type must be free before the test starts
      const typeOptions = async () => {
        await domClick(page.getByRole('button', { name: 'Create Template' }));
        await fillTemplate(page, { group: 'Media Approval' });
        await domClick(drawer(page).getByRole('button', { name: /Template Type$/ }));
        const o = await page.getByRole('listbox').last().getByRole('option').allInnerTexts();
        await page.keyboard.press('Escape');
        await domClick(drawer(page).getByRole('button', { name: 'Cancel', exact: true }));
        await expect(drawer(page)).toBeHidden();
        return o;
      };
      expect(await typeOptions(), `"${TYPE}" is free to use`).toContain(TYPE);

      // 2) missing fields → refused (Group / Type / Sender / Subject)
      await domClick(page.getByRole('button', { name: 'Create Template' }));
      await fillTemplate(page, { active: false, group: 'Media Approval', type: TYPE, description: 'QA Test template — created by Playwright', sender: 'QA Test Sender' });
      await domClick(saveButton(page));
      expect(await dismissModal(page)).toMatch(/Missing Information.*Please complete Group, Type, Sender, and Subject/);
      await expect(drawer(page)).toBeVisible();
      expect(await templateCount(page)).toBe(before);

      // 3) create with a body
      await fillTemplate(page, { subject, body: 'QA Test body — Ticket $ticket_no' });
      await domClick(saveButton(page));
      const saved = await dismissModal(page);
      expect(saved).toMatch(/Email Template Created.*Revise Prove saved successfully/);
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await searchTemplates(page, subject);
      const row = rowBySubject(page, subject);
      await expect(row).toHaveCount(1);
      await expect(row).toContainText('Media Approval');
      await expect(row).toContainText(TYPE);
      await expect(row).toContainText('QA Test Sender');
      await expect(row).toContainText('Inactive');
      await searchTemplates(page, '');
      expect(await templateCount(page)).toBe(before + 1);

      // 4) the type is now taken
      expect(await typeOptions(), `"${TYPE}" is used`).not.toContain(TYPE);

      // 5) edit: subject, sender, description and body
      await searchTemplates(page, subject);
      await domClick(rowBySubject(page, subject).getByRole('button', { name: 'Edit' }));
      await expect(drawer(page).getByRole('textbox', { name: 'Subject *' })).toHaveValue(subject);
      await expect(drawer(page).getByRole('switch', { name: 'Toggle status' })).not.toBeChecked();
      await fillTemplate(page, { subject: edited, sender: 'QA Test Sender 2', description: 'QA Test edited' });
      await domClick(saveButton(page));
      await dismissModal(page);
      await expect(drawer(page)).toBeHidden({ timeout: 15000 });
      await searchTemplates(page, edited);
      const row2 = rowBySubject(page, edited);
      await expect(row2).toHaveCount(1);
      await expect(row2).toContainText('QA Test Sender 2');
      await expect(row2).toContainText('QA Test edited');
      await expect(rowBySubject(page, subject)).toHaveCount(0);

      // 6) status switch in the row: Inactive → Active → Inactive
      const sw = () => rowBySubject(page, edited).getByRole('switch', { name: 'Status toggle' });
      await expect(sw()).not.toBeChecked();
      await domClick(sw());
      await dismissModal(page, 3000);
      await expect(rowBySubject(page, edited)).toContainText('Active');
      await expect(sw()).toBeChecked();
      await domClick(sw());
      await dismissModal(page, 3000);
      await expect(rowBySubject(page, edited)).toContainText('Inactive');

      // 7) duplicate: an Inactive "(Copy)" appears
      await domClick(rowBySubject(page, edited).getByRole('button', { name: 'Duplicate' }));
      await dismissModal(page, 3000);
      await searchTemplates(page, edited);
      const copies = rowBySubject(page, edited);
      await expect(copies).toHaveCount(2);
      const copy = copies.filter({ hasText: '(Copy)' });
      await expect(copy).toHaveCount(1);
      await expect(copy).toContainText('Inactive');
      await deleteRow(page, copy);
      await expect(rowBySubject(page, edited)).toHaveCount(1);

      // 8) delete: Cancel keeps it, confirm removes it, the type is free again
      await domClick(rowBySubject(page, edited).getByRole('button', { name: 'Delete' }));
      await expect(page.getByText('Delete Email Template?').last()).toBeVisible();
      await domClick(page.getByRole('button', { name: 'Cancel', exact: true }).last());
      await expect(rowBySubject(page, edited)).toHaveCount(1);
      const asked = await deleteRow(page, rowBySubject(page, edited));
      expect(asked).toContain(TYPE);
      await searchTemplates(page, edited);
      await expect(dataRows(page)).toHaveCount(0);
      await searchTemplates(page, '');
      expect(await templateCount(page)).toBe(before);
      expect(await typeOptions(), `"${TYPE}" is free again`).toContain(TYPE);
    } finally {
      await purgeQaTemplates(page).catch(() => undefined);
    }
  });

  test('ET-VALID-02 Mail Body is marked required: a template without a body must be refused', { tag: ['@negative', '@regression'] }, async ({ page }) => {
    test.setTimeout(180000);
    await loginSuperAdmin(page);
    const subject = uniqueSubject();
    try {
      await purgeQaTemplates(page).catch(() => undefined);
      await openEmailTemplates(page);
      const before = await templateCount(page);
      await domClick(page.getByRole('button', { name: 'Create Template' }));
      await expect(drawer(page)).toContainText('Mail Body *');
      await fillTemplate(page, { active: false, group: 'Media Approval', type: TYPE, sender: 'QA Test Sender', subject }); // no body
      await domClick(saveButton(page));
      await dismissModal(page);
      // Defect (27 Oct): the form marks "Mail Body *" as required but saves ("Email Template Created") with an empty body.
      await expect(drawer(page), 'the drawer stays open — saving without a body is refused').toBeVisible();
      expect(await templateCount(page), 'nothing was saved').toBe(before);
    } finally {
      await purgeQaTemplates(page).catch(() => undefined);
    }
  });
});
