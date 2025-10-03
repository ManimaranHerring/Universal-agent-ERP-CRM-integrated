const express = require('express');
const router = express.Router();
const { erp, crm } = require('../integrations');


router.get('/ping', (req,res)=> res.json({ erp: process.env.ERP_PROVIDER||null, crm: process.env.CRM_PROVIDER||null }));


// Push a Quote (from RFQ agent) to ERP as a Quote/Sales Order
router.post('/push-quote', async (req,res)=>{
try{
const quote = req.body;
const out = await erp.upsertQuote(quote);
res.json({ ok:true, result: out });
}catch(e){ res.status(400).json({ ok:false, error: e.message }); }
});


// Push scored leads to CRM
router.post('/push-leads', async (req,res)=>{
try{
const leads = req.body.leads || [];
const out = await crm.pushLeads(leads);
res.json({ ok:true, results: out });
}catch(e){ res.status(400).json({ ok:false, error: e.message }); }
});


module.exports = router;
