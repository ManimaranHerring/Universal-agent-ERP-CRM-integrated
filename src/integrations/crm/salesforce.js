// Salesforce – OAuth 2.0 refresh token flow (no SDK)
const fetch = global.fetch;


async function getAccessToken(){
const url = `${process.env.SF_INSTANCE_URL}/services/oauth2/token`;
const params = new URLSearchParams({
grant_type: 'refresh_token',
client_id: process.env.SF_CLIENT_ID,
client_secret: process.env.SF_CLIENT_SECRET,
refresh_token: process.env.SF_REFRESH_TOKEN
});
const res = await fetch(url, { method:'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' }, body: params.toString() });
const data = await res.json();
if(!res.ok) throw new Error(JSON.stringify(data));
return data.access_token;
}


module.exports = {
async pushLeads(leads){
const token = await getAccessToken();
const results = [];
for(const lead of leads){
const body = { LastName: lead.last_name || 'Contact', Company: lead.company || 'Company', Email: lead.email, LeadSource: 'UniversalAgent', Rating: (lead.score||0) > 80 ? 'Hot' : 'Warm' };
const res = await fetch(`${process.env.SF_INSTANCE_URL}/services/data/v57.0/sobjects/Lead`, { method:'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
const data = await res.json();
results.push({ ok: res.ok, id: data.id, email: lead.email, detail: res.ok ? undefined : data });
}
return results;
},
async logEmail(){ /* create Task or EmailMessage */ }
};
