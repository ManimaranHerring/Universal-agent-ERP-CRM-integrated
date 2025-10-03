const providers = {
odoo: require('./odoo'),
dynamicsbc: require('./dynamicsbc'),
};


function getErp() {
const key = (process.env.ERP_PROVIDER || '').toLowerCase();
const impl = providers[key];
if (!impl) return { async upsertQuote(){ throw new Error('ERP provider not configured'); }, async upsertItems(){}, async upsertPO(){}};
return impl;
}


module.exports = getErp();
