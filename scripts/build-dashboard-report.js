// สร้างไฟล์ Excel สรุปรายการเทสและผลเทสของ Dashboard จาก reports/dashboard-results.json
// ใช้: node scripts/build-dashboard-report.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const input = path.join(__dirname, '..', 'reports', 'dashboard-results.json');
const output = path.join(__dirname, '..', 'reports', 'dashboard-test-summary.xlsx');
const json = JSON.parse(fs.readFileSync(input, 'utf8'));

const strip = (s) => String(s ?? '').replace(/\u001b\[[0-9;]*m/g, '');
const rows = [];

function walk(suite, titles) {
  const t = suite.title && !/\.spec\.ts$/.test(suite.title) ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const last = results[results.length - 1] ?? {};
      const err = strip(last.error?.message ?? last.errors?.[0]?.message ?? '').split('\n').find((l) => l.trim()) ?? '';
      const status = test.status === 'expected' ? 'Passed' : test.status === 'skipped' ? 'Skipped' : test.status === 'flaky' ? 'Flaky' : 'Failed';
      const expectedFail = (test.annotations ?? []).some((a) => a.type === 'fail');
      rows.push({
        file: path.basename(spec.file),
        section: path.basename(spec.file).slice(0, 2),
        group: t.join(' › '),
        title: spec.title,
        tags: (spec.tags ?? []).map((x) => '@' + x).join(' '),
        status,
        kind: expectedFail ? 'Known gap (test.fail)' : 'Normal',
        seconds: Math.round((last.duration ?? 0) / 100) / 10,
        retries: Math.max(results.length - 1, 0),
        error: status === 'Failed' ? err.slice(0, 300) : '',
      });
    }
  }
  for (const s of suite.suites ?? []) walk(s, t);
}
for (const s of json.suites) walk(s, []);
rows.sort((a, b) => a.file.localeCompare(b.file) || a.title.localeCompare(b.title));

const wb = new ExcelJS.Workbook();
const count = (f) => rows.filter(f).length;

// --- Summary sheet
const sum = wb.addWorksheet('Summary');
sum.columns = [{ width: 34 }, { width: 14 }];
sum.addRow(['Media Approval Dashboard — test summary']).font = { bold: true, size: 14 };
sum.addRow(['Run date', new Date(json.stats?.startTime ?? Date.now()).toLocaleString('en-GB')]);
sum.addRow([]);
sum.addRow(['Total tests', rows.length]);
sum.addRow(['Passed', count((r) => r.status === 'Passed')]);
sum.addRow(['  of which known gaps (expected to fail)', count((r) => r.status === 'Passed' && r.kind !== 'Normal')]);
sum.addRow(['Failed', count((r) => r.status === 'Failed')]);
sum.addRow(['Flaky', count((r) => r.status === 'Flaky')]);
sum.addRow(['Skipped', count((r) => r.status === 'Skipped')]);
sum.addRow([]);
const head = sum.addRow(['Section (file prefix)', 'Tests', 'Passed', 'Failed', 'Skipped']);
head.font = { bold: true };
const sections = [...new Set(rows.map((r) => r.section))];
for (const s of sections) {
  const g = rows.filter((r) => r.section === s);
  sum.addRow([s, g.length, g.filter((r) => r.status === 'Passed').length, g.filter((r) => r.status === 'Failed').length, g.filter((r) => r.status === 'Skipped').length]);
}
sum.getColumn(1).width = 44;
[2, 3, 4, 5].forEach((c) => (sum.getColumn(c).width = 12));

// --- Detail sheet
const ws = wb.addWorksheet('Test results');
ws.columns = [
  { header: 'No.', key: 'no', width: 6 },
  { header: 'File', key: 'file', width: 58 },
  { header: 'Group', key: 'group', width: 40 },
  { header: 'Test', key: 'title', width: 70 },
  { header: 'Tags', key: 'tags', width: 22 },
  { header: 'Type', key: 'kind', width: 22 },
  { header: 'Result', key: 'status', width: 10 },
  { header: 'Seconds', key: 'seconds', width: 9 },
  { header: 'Retries', key: 'retries', width: 8 },
  { header: 'Error (first line)', key: 'error', width: 70 },
];
rows.forEach((r, i) => ws.addRow({ no: i + 1, ...r }));
ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
ws.views = [{ state: 'frozen', ySplit: 1 }];
ws.autoFilter = { from: 'A1', to: 'J1' };
const colour = { Passed: 'FFD1FAE5', Failed: 'FFFEE2E2', Skipped: 'FFFEF9C3', Flaky: 'FFFFEDD5' };
ws.eachRow((row, n) => {
  if (n === 1) return;
  row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colour[row.getCell('status').value] } };
});

wb.xlsx.writeFile(output).then(() => console.log('written', output, rows.length, 'tests'));
