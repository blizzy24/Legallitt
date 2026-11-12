// A draft case for a service in HIDDEN_SERVICES (Q79/Q113). The API refuses to
// create these, but their code and existing data stay; tests that cover that
// dormant code seed the row the way CaseStateMachine.create would have written it.
const {caseReference} = require('../../dist/src/cases/case-reference');

async function seedDormantCase(db, owner, service_code) {
  return db.$transaction(async tx => {
    const reference = await caseReference(tx, service_code);
    const record = await tx.case.create({data: {service_code, client_id: owner.id, reference, status: 'draft', details: {}}});
    await tx.caseEvent.create({data: {case_id: record.id, type: 'case_created', actor_id: owner.id, actor_role: owner.role,
      from_status: null, to_status: 'draft'}});
    return record;
  });
}

/** Runs `fn` as if the hidden service were offered again, to cover its dormant
 *  workflow; the switch is restored afterwards. tests/hidden-services.cjs proves the live refusal. */
async function asIfOffered(service_code, fn) {
  const hidden = require('@legalitt/shared').HIDDEN_SERVICES, at = hidden.indexOf(service_code);
  if (at < 0) return fn();
  hidden.splice(at, 1);
  try { return await fn(); } finally { hidden.splice(at, 0, service_code); }
}

module.exports = {seedDormantCase, asIfOffered};
