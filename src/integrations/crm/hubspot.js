// HubSpot – Private App token
const fetch = global.fetch;
const base = 'https://api.hubapi.com';
const auth = () => ({ 'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' });


module.exports = {
async pushLeads(leads){
// Upsert contacts by email
const results = [];
for(const lead of leads){
const body = { properties: { email: lead.email, company: lead.company, firstname: lead.first_name || '', lastname: lead.last_name || '', hubspot_owner_id: lead.owner_id, lifecyclestage: 'opportunity', lead_score: String(lead.score||'') } };
const res = await fetch(`${base}/crm/v3/objects/contacts`, { method:'POST', headers: auth(), body: JSON.stringify(body) });
const data = await res.json();
results.push({ ok: res.ok, id: data.id, email: lead.email, detail: res.ok ? undefined : data });
}
return results;
},
async logEmail(lead, meta){ /* create engagement note/email – left minimal */ }
};
