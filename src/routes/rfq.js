const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { parseCsvFromBuffer } = require('../lib/utils');


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });


const catalogPath = path.join(__dirname, '..', 'data', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));


function specCostFactor(spec = '') {
const s = spec.toLowerCase();
let factor = 1.0;
if (s.includes('ss304')) factor *= 1.15;
if (s.includes('copper')) factor *= 1.12;
if (s.includes('abs')) factor *= 0.95;
if (s.includes('aluminium') || s.includes('aluminum')) factor *= 1.05;
if (s.includes('brass')) factor *= 1.10;
return factor;
}


function volumeDiscount(qty) {
if (qty >= 50000) return 0.85;
if (qty >= 20000) return 0.88;
if (qty >= 10000) return 0.92;
if (qty >= 5000) return 0.96;
return 1.0;
}


function round2(n) { return Math.round(n * 100) / 100; }


function buildQuote(lines, opts) {
const margin = Math.min(Math.max(Number(opts.margin_target ?? 0.18), 0.01), 0.6);
const currency = opts.currency || 'USD';
const out = [];
let subtotal = 0;


for (const row of lines) {
const sku = String(row.sku || '').trim();
const qty = Number(row.quantity || row.qty || 0);
const spec = row.spec || '';
if (!sku || !qty) continue;


const cat = catalog[sku];
const base = (cat && cat.base_cost) || 1.0;
const unitCost = base * specCostFactor(spec) * volumeDiscount(qty);
const unitPrice = unitCost / (1 - margin);
const lineTotal = unitPrice * qty;
subtotal += lineTotal;


out.push({
sku,
description: (cat && cat.name) || 'Generic Item',
qty,
unit_cost: round2(unitCost),
unit_price: round2(unitPrice),
line_total: round2(lineTotal),
spec: spec || '',
assumptions: [
qty >= 10000 ? 'Volume discount applied' : 'Standard volume',
spec ? `Spec factor for: ${spec}` : 'No spec factor'
].join('; ')
});
}


const tax = subtotal * 0.05; // example 5%
const total = subtotal + tax;


return {
buyer_meta: {
company: opts.buyer_company || 'Unknown Co',
contact: opts.buyer_contact || 'Unknown',
incoterms: opts.incoterms || 'EXW'
},
currency,
margin_target: margin,
line_items: out,
totals: { subtotal: round2(subtotal), tax: round2(tax), grand_total: round2(total) },
generated_at: new Date().toISOString()
};
}


router.post('/quote', upload.single('rfq'), (req, res) => {
try {
const meta = req.body || {};
const rows = parseCsvFromBuffer(req.file.buffer);
const quote = buildQuote(rows, meta);
return res.json(quote);
} catch (e) {
return res.status(400).json({ error: 'Failed to parse RFQ CSV', detail: e.message });
}
});


router.get('/quote/sample', (req, res) => {
try {
const file = (req.query && req.query.file === 'large') ? 'rfq_large.csv' : 'rfq_sample.csv';
const samplePath = path.join(__dirname, '..', '..', 'samples', file);
const rows = parseCsvFromBuffer(fs.readFileSync(samplePath));
const quote = buildQuote(rows, req.query || {});
return res.json(quote);
} catch (e) {
return res.status(500).json({ error: 'Sample RFQ not found', detail: e.message });
}
});


module.exports = router;
