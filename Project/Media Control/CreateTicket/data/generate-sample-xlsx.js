// One-off script to generate the sample data-driven test fixture. Not part of the test suite —
// run manually with `node generate-sample-xlsx.js` if the .xlsx ever needs regenerating/editing.
const XLSX = require('xlsx');
const path = require('path');

const rows = [
  {
    Client: 'Auto Add 1',
    Product: 'Auto Add 1',
    Package: '7-Eleven Plus (QATEST)', // the only Sale Package reachable on UAT (Retail > DIGITAL > QATEST) - see _helpers.ts
    DurationMinutes: 1,
    DurationSeconds: 15,
    MaterialLink: 'https://example.com/sheet-a-material.jpg',
    BriefLink: 'https://example.com/sheet-a-brief.pdf',
  },
  {
    Client: 'Auto Add 2',
    Product: 'Auto Add 2',
    Package: '7-Eleven Plus (QATEST)',
    DurationMinutes: 2,
    DurationSeconds: 20,
    MaterialLink: 'https://example.com/sheet-b-material.jpg',
    BriefLink: 'https://example.com/sheet-b-brief.pdf',
  },
];

const sheet = XLSX.utils.json_to_sheet(rows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, sheet, 'Cases');
XLSX.writeFile(workbook, path.join(__dirname, 'create-ticket-cases.xlsx'));
console.log('Wrote create-ticket-cases.xlsx with', rows.length, 'rows');
