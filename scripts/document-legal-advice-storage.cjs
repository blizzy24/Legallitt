const fs=require('node:fs');
const path='docs/LEGALITT-BACKEND-ARCHITECTURE.md';
const heading='### Legal Advice rebuild storage — 14 November 2026 (local, not deployed)';
const doc=fs.readFileSync(path,'utf8');
if(doc.includes(heading))throw Error('Storage inventory already recorded');
const sql=fs.readFileSync('apps/api/prisma/migrations/202611140002_legal_advice_rebuild/migration.sql','utf8');
fs.writeFileSync(path,doc+'\n\n'+heading+'\n\nNew-workflow bookings pin a policy version. Legacy consultations are untouched.\nInvitation acceptance locks the case, checks current eligibility and serializes\noverlapping advocate bookings. The partial unique index provides an additional\ndatabase guarantee of one winner. Pending invitations expose no client contacts\nor unrelated case contents. Session state must be reconciled against server time\nunder the booking lock before it is exposed or acted upon; the pure timer engine\nis implemented, but its persistent lifecycle integration remains pending.\n\n```sql\n'+sql+'```\n');
