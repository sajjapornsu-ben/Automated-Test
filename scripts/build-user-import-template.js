// สร้างไฟล์ Excel แม่แบบสำหรับกรอกข้อมูล User ที่จะเพิ่มเข้า User Management
const ExcelJS = require('exceljs');
const path = require('path');

(async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Users');
  const headers = ['No.', 'ชื่อ', 'Email', 'Role', 'จำนวนกลุ่มที่อยู่', 'Media Group', 'Media Branding', 'Media Type', 'Package'];
  ws.addRow(headers);
  ws.addRow([1, 'ตัวอย่าง ทดสอบ', 'example.user@planbmedia.co.th', 'ตัวอย่าง: Sale', 1, 'Retail', '', '7-Eleven', '7-Eleven Plus']);
  ws.columns = [{ width: 6 }, { width: 24 }, { width: 34 }, { width: 18 }, { width: 18 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 28 }];
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  head.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  ws.getRow(2).font = { italic: true, color: { argb: 'FF808080' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  for (let r = 3; r <= 200; r++) ws.getRow(r).getCell(1).value = null;

  const note = wb.addWorksheet('วิธีกรอก');
  [
    ['หมายเหตุการกรอก'],
    ['แถวที่ 2 เป็นตัวอย่าง ลบหรือเขียนทับได้'],
    ['ชื่อ: ใส่ชื่อและนามสกุลคั่นด้วยเว้นวรรค (ระบบแยกเป็น First name / Last name)'],
    ['Email: ต้องไม่ซ้ำกับ User ที่มีอยู่แล้ว'],
    ['Role / จำนวนกลุ่มที่อยู่: ใส่ให้ตรงกับชื่อใน dropdown ของระบบ (ถ้าหลายกลุ่ม คั่นด้วย , )'],
    ['Media Group / Media Branding / Media Type / Package: ถ้ามีหลายค่า คั่นด้วย , และต้องสะกดตรงกับ Master Data'],
    ['ข้อมูลที่ยังต้องระบุเพิ่ม (ไม่มีในคอลัมน์): เบอร์โทร, รหัสผ่านเริ่มต้น, เปิด/ปิด Email Notification'],
  ].forEach((r) => note.addRow(r));
  note.getColumn(1).width = 110;
  note.getRow(1).font = { bold: true };

  const out = path.join(__dirname, '..', 'reports', 'User-Import-Template.xlsx');
  await wb.xlsx.writeFile(out);
  console.log(out);
})();
