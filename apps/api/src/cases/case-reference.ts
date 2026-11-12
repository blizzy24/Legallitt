import type { ServiceCode } from '@legalitt/shared';
import type { Prisma } from '../generated/prisma/client';

export async function caseReference(tx: Prisma.TransactionClient, service: ServiceCode) {
  // The sequence name is a bound value, never interpolated SQL. Preserve LN IDs
  // exactly. FIR requests are FIR-YYYY-NNNN (docs/flows/FIR-DRAFT-FLOW.md §4); the
  // sequence continues, so earlier FIR_DRAFT-… references stay valid and unique.
  // Current report flows name PSR and DF explicitly. Old references are retained.
  const [sequence] = await tx.$queryRaw<{value: bigint}[]>`
    SELECT nextval(${service + '_reference_seq'}::regclass) AS value`;
  const prefix = service === 'legal_notice' ? 'LN' : service === 'fir_draft' ? 'FIR' : service==='property_search'?'PSR':service==='document_forensic'?'DF':service.toUpperCase();
  return `${prefix}-${new Date().getUTCFullYear()}-${sequence.value.toString().padStart(service==='property_search'||service==='document_forensic'?5:4, '0')}`;
}
