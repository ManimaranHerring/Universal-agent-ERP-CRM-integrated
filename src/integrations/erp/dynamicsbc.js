// Dynamics 365 Business Central – minimal REST sample (sandbox/basic auth)
const fetch = global.fetch;
const base = process.env.D365BC_BASE_URL;
const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Basic ' + Buffer.from(`${process.env.D365BC_USERNAME}:${process.env.D365BC_PASSWORD}`).toString('base64') });


function mapQuote(quote){
// Map to salesQuote entity (simplified)
return {
"customerNumber": "10000",
"currencyCode": quote.currency,
"validToDate": quote.validity_date,
"salesLines": quote.line_items.map(li => ({
lineType: "Item",
itemId: li.sku,
description: li.description,
quantity: li.qty,
unitPrice: li.unit_price
}))
};
}


module.exports = {
async upsertQuote(quote){
const url = `${base}/companies(${process.env.D365BC_COMPANY_ID})/salesQuotes`;
const res = await fetch(url, { method:'POST', headers: headers(), body: JSON.stringify(mapQuote(quote)) });
if(!res.ok){ throw new Error(await res.text()); }
const data = await res.json();
return { provider: 'dynamicsbc', object: 'salesQuote', id: data.id };
},
async upsertItems(items){ /* map to items endpoint */ },
async upsertPO(po){ /* map to purchaseOrders endpoint */ }
};
