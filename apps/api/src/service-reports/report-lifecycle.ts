import {ConflictException, ForbiddenException} from '@nestjs/common';
import {REPORT_AWAITING_APPROVAL, REPORT_CHANGES_REQUESTED, type ChangeItem, type ReportServiceCode} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import {appendCaseEvent, lockedCase} from '../cases/case-state-machine';
import type {CaseActor} from '../cases/case-access';

// Report-service sub-states and completion. Like the FIR writers in
// case-state-machine.ts, these are the only code that writes these cases'
// sub_status/completion, always together with a case_events row in the caller's
// locked transaction. Generic lifecycle moves still go through CaseStateMachine.

export const DRAFT_KIND = 'service_report';
type Submission = {draft_id: string; version: number; document_ids: string[]};

export async function writeReportSaved(tx: Prisma.TransactionClient, actor: CaseActor, id: string, service: ReportServiceCode,
  draft: {id: string; version: number}) {
  const record = await lockedCase(tx, actor, id, service);
  if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
  if (record.status !== 'in_progress' || record.sub_status === REPORT_AWAITING_APPROVAL)
    throw new ConflictException('The submitted report is frozen while awaiting admin review.');
  return appendCaseEvent(tx, {case_id: id, type: 'service_report_saved', actor_id: actor.id, actor_role: actor.role,
    from_status: record.status, to_status: record.status, payload: {draft_id: draft.id, version: draft.version}});
}

export async function writeReportSubmitted(tx: Prisma.TransactionClient, actor: CaseActor, id: string, service: ReportServiceCode,
  payload: Submission) {
  const record = await lockedCase(tx, actor, id, service);
  if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
  if (record.status !== 'in_progress' || record.sub_status === REPORT_AWAITING_APPROVAL)
    throw new ConflictException('Only one report version may await admin review.');
  const updated = await tx.case.update({where: {id}, data: {sub_status: REPORT_AWAITING_APPROVAL, updated_at: new Date()}});
  await appendCaseEvent(tx, {case_id: id, type: 'service_report_submitted', actor_id: actor.id, actor_role: actor.role,
    from_status: 'in_progress', to_status: 'in_progress', payload});
  return updated;
}

export async function writeReportChangesRequested(tx: Prisma.TransactionClient, actor: CaseActor, id: string, service: ReportServiceCode,
  payload: {draft_id: string; version: number; items: ChangeItem[]}) {
  const record = await lockedCase(tx, actor, id, service);
  if (actor.role !== 'admin') throw new ForbiddenException('Admin review required');
  if (record.status !== 'in_progress' || record.sub_status !== REPORT_AWAITING_APPROVAL)
    throw new ConflictException('This case is not awaiting admin review');
  const updated = await tx.case.update({where: {id}, data: {sub_status: REPORT_CHANGES_REQUESTED, updated_at: new Date()}});
  await appendCaseEvent(tx, {case_id: id, type: 'service_report_changes_requested', actor_id: actor.id, actor_role: 'admin',
    from_status: 'in_progress', to_status: 'in_progress', payload});
  return updated;
}

/** Releases the exact submitted files to the client and closes the case in one
 *  transaction. Reached by admin approval, or directly by the advocate's send
 *  where the service has no admin gate (design 211). */
export async function writeReportReleased(tx: Prisma.TransactionClient, actor: CaseActor, id: string, service: ReportServiceCode,
  payload: Submission & {note: string}, now: Date, viaApproval: boolean) {
  const record = await lockedCase(tx, actor, id, service);
  if (viaApproval) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin approval required');
    if (record.status !== 'in_progress' || record.sub_status !== REPORT_AWAITING_APPROVAL)
      throw new ConflictException('This case is not awaiting admin review');
    await appendCaseEvent(tx, {case_id: id, type: 'service_report_approved', actor_id: actor.id, actor_role: 'admin',
      from_status: 'in_progress', to_status: 'approved', payload: {draft_id: payload.draft_id, version: payload.version, document_ids: payload.document_ids}});
  } else {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    if (record.status !== 'in_progress' || record.sub_status) throw new ConflictException('This report cannot be sent in the current state');
  }
  const updated = await tx.case.update({where: {id}, data: {status: 'completed', sub_status: null, completed_at: now, updated_at: now}});
  await appendCaseEvent(tx, {case_id: id, type: 'service_report_released', actor_id: actor.id, actor_role: actor.role,
    from_status: viaApproval ? 'approved' : 'in_progress', to_status: 'completed', created_at: now,
    payload: {draft_id: payload.draft_id, version: payload.version, document_ids: payload.document_ids, note: payload.note}});
  return updated;
}
