const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { parseCsvFromBuffer } = require('../lib/utils');


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });


const QTY_TOL = 0.005; // 0.5%
const PRICE_TOL = 0.01; // 1%


function key(po, line) { return `${po}|${line}`; }


function near(a, b, tol) {
if (a === undefined || b === undefined) return false;
const denom = Math.max(1, Math.abs(a));
return Math.abs(a - b) / denom <= tol;
}


function match(poRows, grnRows, invRows) {
const poMap = new Map();
const grnMap = new Map();
const invMap = new Map();


for (const r of poRows) poMap.set(key(r.po_number, r.line_id), r);
for (const r of grnRows) grnMap.set(key(r.po_number, r.line_id), r);
for (const r of invRows) invMap.set(key(r.po_number, r.line_id), r);


const exceptions = [];
let matches = 0;


// Evaluate PO lines
for (const [k, po] of poMap.entries()) {
const grn = grnMap.get(k);
const inv = invMap.get(k);


const poQty = Number(po.qty);
const poPrice = Number(po.unit_price);
const grnQty = grn ? Number(grn.qty_received) : undefined;
const invQty = inv ? Number(inv.qty_invoiced) : undefined;
const invPrice = inv ? Number(inv.unit_price_invoiced) : undefined;


let status = 'MATCH';
const issues = [];


if (!grn) { status = 'MISSING_GRN'; issues.push('No goods receipt for PO line'); }
if (!inv) { status = status === 'MATCH' ? 'MISSING_INVOICE' : status + '+MISSING_INVOICE'; issues.push('No invoice for PO line'); }


if (grn && inv) {
if (!near(poQty, grnQty, QTY_TOL) || !near(poQty, invQty, QTY_TOL) || !near(grnQty, invQty, QTY_TOL)) {
status = 'QTY_MISMATCH';
issues.push(`Qtys differ PO:${poQty} GRN:${grnQty ?? 'N/A'} INV:${invQty ?? 'N/A'}`);
}
if (!near(poPrice, invPrice, PRICE_TOL)) {
status = status === 'MATCH' ? 'PRICE_MISMATCH' : status + '+PRICE_MISMATCH';
issues.push(`Prices differ PO:${poPrice} INV:${invPrice ?? 'N/A'}`);
}
}


if (status === 'MATCH') {
matches += 1;
} else {
exceptions.push({
po_number: po.po_number,
line_id: po.line_id,
sku: po.sku,
status,
issue: issues.join(' | ')
});
}
}


// Invoices that don't exist on PO
for (const [k, inv] of invMap.entries()) {
if (!poMap.has(k)) {
exceptions.push({
po_number: inv.po_number,
line_id: inv.line_id,
sku: inv.sku || '',
status: 'EXTRA_INVOICE',
issue: 'Invoice line does not exist on PO'
});
}
}


return { matches_count: matches, exceptions };
}


router.post('/match', upload.fields([{ name: 'po' }, { name: 'grn' }, { name: 'invoice' }]), (req, res) => {
try {
const poRows = parseCsvFromBuffer(req.files.po[0].buffer);
const grnRows = parseCsvFromBuffer(req.files.grn[0].buffer);
const invRows = parseCsvFromBuffer(req.files.invoice[0].buffer);
return res.json(match(poRows, grnRows, invRows));
} catch (e) {
return res.status(400).json({ error: 'Failed to process CSVs', detail: e.message });
}
});


router.get('/match/sample', (req, res) => {
try {
const base = path.join(__dirname, '..', '..', 'samples');
const size = (req.query && req.query.size === 'large') ? 'large' : 'sample';
const poRows = parseCsvFromBuffer(fs.readFileSync(path.join(base, `po_${size}.csv`)));
const grnRows = parseCsvFromBuffer(fs.readFileSync(path.join(base, `grn_${size}.csv`)));
const invRows = parseCsvFromBuffer(fs.readFileSync(path.join(base, `invoice_${size}.csv`)));
return res.json(match(poRows, grnRows, invRows));
} catch (e) {
return res.status(500).json({ error: 'Sample files not found', detail: e.message });
}
});


module.exports = router;
