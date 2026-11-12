import type {Prisma, Case, Document} from '../generated/prisma/client';
import type {CaseActor} from './case-access';

export async function noticeDocumentVisible(tx: Prisma.TransactionClient, actor: CaseActor, record: Case, document: Pick<Document, 'id' | 'kind' | 'owner_id'>) {
  if (record.service_code !== 'legal_notice' || actor.role !== 'client') return true;
  if (document.owner_id === actor.id) return true;
  if (document.kind !== 'legal_notice') {
    if (['notice_booking_receipt', 'notice_delivery_proof'].includes(document.kind)) return !!await tx.noticeDelivery.findFirst({where: {case_id: record.id, OR: [{receipt_document_id: document.id}, {proof_document_id: document.id}]}});
    return true;
  }
  if (document.id === record.notice_document_id) return true;
  const drafts = await tx.draft.findMany({where: {case_id: record.id, document_id: document.id}, select: {id: true}});
  if (!drafts.length) return false;
  const sent = await tx.caseEvent.findMany({where: {case_id: record.id, to_status: 'client_review'}, select: {payload: true}});
  return sent.some(e => drafts.some(d => d.id === (e.payload as {draft_id?: string}).draft_id));
}
export function noticeClientEvents<T extends {type: string; payload: unknown; to_status?: string | null}>(events: T[]) {
  return events.filter(e => !e.type.startsWith('notice_admin_') && !['draft_saved', 'notice_returned_to_admin', 'notice_draft_returned', 'notice_notice_check', 'notice_address_check'].includes(e.type))
    .map(e => e.to_status === 'advocate_declined' ? {...e, payload: {}} : e);
}
