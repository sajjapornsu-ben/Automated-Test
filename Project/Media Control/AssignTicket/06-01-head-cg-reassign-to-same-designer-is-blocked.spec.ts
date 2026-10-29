// Assign Ticket — Head CG: Reassign ให้ผู้รับงานคนเดิมต้องกดไม่ได้ (ปุ่ม Reassign ปิดอยู่ตอนที่เลือกคนเดิม เปิดเมื่อเลือกคนอื่น และกลับมาปิดเมื่อเลือกคนเดิมอีกครั้ง) — ไม่กดยืนยัน ไม่เปลี่ยนข้อมูล
// spec: specs/assign-ticket-plan.md (3, finding 4) — Head CG (HEAD_CG_EMAIL)
// seed: seed.spec.ts
//
// เขียนรอไว้: ตอนนี้ dialog เลือกผู้รับงานคนเดิมไว้ให้และปุ่ม Reassign กดได้ (แจ้ง dev แล้วให้แก้) — เมื่อ dev แก้แล้วให้ลบ test.fixme ออก

import { test, expect } from '@playwright/test';
import { loginAs } from '../Dashboard/_helpers';
import { openAssignList, dataRows, readRow, openRowDialog, readDesigners, dialog, assignButton, closeDialog, domClick, chooseDesigner } from './_helpers';

test.describe('Assign Ticket — Reassign to the same designer', () => {
  test('AT-HC-13 Reassign is disabled while the current designer is selected', { tag: ['@negative', '@regression'] }, async ({ page }) => {
    test.fixme(true, 'Waiting for dev: today the Reassign dialog preselects the current designer and the Reassign button is enabled, so a job can be "reassigned" to the same person');
    test.setTimeout(240000);
    await loginAs(page, 'headCg');
    await openAssignList(page);

    const row = dataRows(page).filter({ has: page.locator('[title="Reassign"]') }).first();
    const r = await readRow(row);
    const current = r.assigned.split(' head:')[0].trim();
    await openRowDialog(page, row, 'Reassign');
    const d = dialog(page);

    // the current designer must not be a valid target: either not preselected, or Reassign stays disabled for them
    const designers = await readDesigners(page);
    const other = designers.find((x) => x.name !== current);
    expect(other, 'another designer to compare with').toBeTruthy();
    if ((await d.getByRole('button', { pressed: true }).filter({ hasText: /active/ }).count()) > 0) {
      await expect(d).toContainText(`Selected: ${current}`);
      await expect(assignButton(page), 'Reassign with the current designer selected').toBeDisabled();
    }

    // a different designer enables it
    await chooseDesigner(page, other!.name);
    await expect(assignButton(page)).toBeEnabled();

    // choosing the current designer again disables it again
    await chooseDesigner(page, current);
    await expect(assignButton(page), 'Reassign with the current designer selected').toBeDisabled();

    await closeDialog(page); // nothing is confirmed
  });
});
