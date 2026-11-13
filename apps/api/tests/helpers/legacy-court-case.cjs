// Historical court consultation fixture. New creation uses /courts after the
// representation policy is activated; this helper never changes a real case.
const assert=require('node:assert/strict');
exports.seedLegacyCourtCase=async(db,actor,service)=>{assert.ok(['district_court','high_court'].includes(service));return require('./dormant-case.cjs').seedDormantCase(db,actor,service);};
