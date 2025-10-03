const providers = {
hubspot: require('./hubspot'),
salesforce: require('./salesforce'),
};


function getCrm(){
const key = (process.env.CRM_PROVIDER || '').toLowerCase();
const impl = providers[key];
if (!impl) return { async pushLeads(){ throw new Error('CRM provider not configured'); }, async logEmail(){ } };
return impl;
}


module.exports = getCrm();
