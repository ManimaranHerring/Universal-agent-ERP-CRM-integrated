# Universal Agent Starter — Full Demo (with ERP & CRM hooks)


Two core agents + synthetic datasets and **plug‑in ERP/CRM connectors**:
- **RFQ → Quote Agent** — parses an RFQ CSV, applies pricing logic, returns a priced quote with totals and a CSV export. Can **push quote** to ERP/CRM via `/api/integrations/push-quote`.
- **AP 3‑Way Match Agent** — matches PO ↔ GRN ↔ Invoice, flags exceptions, and exports a CSV. Can **push exceptions** to CRM as cases via `/api/integrations/push-leads` (rename as needed).


This repo includes minimal connectors for **Odoo** (JSON‑RPC), **Dynamics 365 Business Central** (REST), **HubSpot** (Private App token), and **Salesforce** (OAuth Refresh Token). All other ERPs/CRMs can be added by copying the adapter pattern.


## Run locally
1) Install Node.js: https://nodejs.org
2) Copy `.env.example` to `.env` and fill whichever system you want to test.
3) In a terminal run:
