const { parse } = require('csv-parse/sync');


function parseCsvFromBuffer(buf) {
const raw = buf.toString('utf-8');
return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}


function jsonToCsv(rows) {
if (!rows || rows.length === 0) return '';
const headers = Object.keys(rows[0]);
const lines = [headers.join(',')];
for (const row of rows) {
const vals = headers.map(h => String(row[h] ?? '').replaceAll('"', '""'));
lines.push(vals.map(v => (v.includes(',') ? `"${v}"` : v)).join(','));
}
return lines.join('\n');
}


module.exports = { parseCsvFromBuffer, jsonToCsv };
