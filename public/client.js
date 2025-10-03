async function postForm(url, formData) {
const res = await fetch(url, { method: 'POST', body: formData });
if (!res.ok) throw new Error(await res.text());
return res.json();
}


function renderTable(container, rows) {
if (!rows || rows.length === 0) {
container.innerHTML = '<p>No rows.</p>';
return;
}
const headers = Object.keys(rows[0]);
const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
const tbody = `<tbody>${rows.map(r => `<tr>${headers.map(h => `<td>${(r[h] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
container.innerHTML = `<table class="table">${thead}${tbody}</table>`;
}


function downloadCsv(filename, rows) {
if (!rows || rows.length === 0) return;
const headers = Object.keys(rows[0]);
const lines = [headers.join(',')];
for (const row of rows) {
const vals = headers.map(h => String(row[h] ?? '').replaceAll('"','""'));
lines.push(vals.map(v => (v.includes(',') ? `"${v}"` : v)).join(','));
}
const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = filename;
a.click();
}


// RFQ → Quote
const rfqForm = document.getElementById('rfqForm');
const rfqOut = document.getElementById('rfqOutput');
const rfqSampleBtn = document.getElementById('rfqSample');
const rfqLargeBtn = document.getElementById('rfqLarge');


rfqForm.addEventListener('submit', async (e) => {
e.preventDefault();
rfqOut.innerHTML = 'Processing…';
const fd = new FormData(rfqForm);
try {
const data = await postForm('/api/rfq/quote', fd);
rfqOut.innerHTML = `
<p><b>Buyer:</b> ${data.buyer_meta.company} (${data.buyer_meta.contact}) · <b>Currency:</b> ${data.currency}</p>
<p><b>Totals:</b> Subtotal ${data.totals.subtotal} · Tax ${data.totals.tax} · Grand ${data.totals.grand_total}</p>
<div id="rfqTable"></div>
<button id="dlQuote">Download Quote CSV</button>
<pre>${JSON.stringify(data, null, 2)}</pre>
`;
renderTable(document.getElementById('rfqTable'), data.line_items);
document.getElementById('dlQuote').onclick = () => downloadCsv('quote.csv', data.line_items);
} catch (err) {
rfqOut.innerHTML = `<p style="color:#b91c1c">Error: ${err.message}</p>`;
}
});


rfqSampleBtn.addEventListener('click', async () => {
rfqOut.innerHTML = 'Loading small sample…';
const params = new URLSearchParams(new FormData(rfqForm));
const res = await fetch(`/api/rfq/quote/sample?${params.toString()}`);
const data = await res.json();
rfqOut.innerHTML = `
<p><b>Buyer:</b> ${data.buyer_meta.company} (${data.buyer_meta.contact}) · <b>Currency:</b> ${data.currency}</p>
<p><b>Totals:</b> Subtotal ${data.totals.subtotal} · Tax ${data.totals.tax} · Grand ${data.totals.grand_total}</p>
<div id="rfqTable"></div>
<button id="dlQuote">Download Quote CSV</button>
<pre>${JSON.stringify(data, null, 2)}</pre>
`;
renderTable(document.getElementById('rfqTable'), data.line_items);
document.getElementById('dlQuote').onclick = () => downloadCsv('quote.csv', data.line_items);
});


rfqLargeBtn.addEventListener('click', async () => {
rfqOut.innerHTML = 'Loading large dataset…';
const params = new URLSearchParams(new FormData(rfqForm));
params.set('file','large');
const res = await fetch(`/api/rfq/quote/sample?${params.toString()}`);
const data = await res.json();
rfqOut.innerHTML = `
<p><b>Buyer:</b> ${data.buyer_meta.company} (${data.buyer_meta.contact}) · <b>Currency:</b> ${data.currency}</p>
<p><b>Totals:</b> Subtotal ${data.totals.subtotal} · Tax ${data.totals.tax} · Grand ${data.totals.grand_total}</p>
<div id="rfqTable"></div>
<button id="dlQuote">Download Quote CSV</button>
<pre>${JSON.stringify(data, null, 2)}</pre>
`;
renderTable(document.getElementById('rfqTable'), data.line_items);
document.getElementById('dlQuote').onclick = () => downloadCsv('quote.csv', data.line_items);
});


// AP 3‑Way Match
const apForm = document.getElementById('apForm');
const apOut = document.getElementById('apOutput');
const apSampleBtn = document.getElementById('apSample');
const apLargeBtn = document.getElementById('apLarge');


apForm.addEventListener('submit', async (e) => {
e.preventDefault();
apOut.innerHTML = 'Matching…';
const fd = new FormData(apForm);
try {
const data = await postForm('/api/ap/match', fd);
apOut.innerHTML = `
<p><b>Matched PO lines:</b> ${data.matches_count}</p>
<div id="apTable"></div>
<button id="dlExc">Download Exceptions CSV</button>
<pre>${JSON.stringify(data, null, 2)}</pre>
`;
renderTable(document.getElementById('apTable'), data.exceptions);
document.getElementById('dlExc').onclick = () => downloadCsv('exceptions.csv', data.exceptions);
} catch (err) {
apOut.innerHTML = `<p style="color:#b91c1c">Error: ${err.message}</p>`;
}
});


apSampleBtn.addEventListener('click', async () => {
apOut.innerHTML = 'Loading small sample…';
const res = await fetch('/api/ap/match/sample');
const data = await res.json();
apOut.innerHTML = `
<p><b>Matched PO lines:</b> ${data.matches_count}</p>
<div id="apTable"></div>
<button id="dlExc">Download Exceptions CSV</button>
<pre>${JSON.stringify(data, null, 2)}</pre>
`;
renderTable(document.getElementById('apTable'), data.exceptions);
document.getElementById('dlExc').onclick = () => downloadCsv('exceptions.csv', data.exceptions);
});


apLargeBtn.addEventListener('click', async () => {
apOut.innerHTML = 'Loading large dataset…';
const res = await fetch('/api/ap/match/sample?size=large');
const data = await res.json();
apOut.innerHTML = `
<p><b>Matched PO lines:</b> ${data.matches_count}</p>
<div id="apTable"></div>
<button id="dlExc">Download Exceptions CSV</button>
<pre>${JSON.stringify(data, null, 2)}</pre>
`;
renderTable(document.getElementById('apTable'), data.exceptions);
document.getElementById('dlExc').onclick = () => downloadCsv('exceptions.csv', data.exceptions);
});
