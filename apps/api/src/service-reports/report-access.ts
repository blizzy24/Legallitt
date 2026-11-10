import {ConflictException, NotFoundException} from '@nestjs/common';
import {
  REPORT_ADVOCATE_DOCUMENT_KINDS, REPORT_AWAITING_APPROVAL, REPORT_CHANGES_REQUESTED, REPORT_CLIENT_DOCUMENT_KINDS,
  REPORT_GENERATED_KINDS, REPORT_SERVICE_CONFIG, isReportService, type ChangeItem, type ReportDraftContent, type ReportState,
} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {DRAFT_KIND} from './report-lifecycle';

type EventRow = {type: string; created_at: Date; payload: unknown};
type CaseRow = {id: string; service_code: string; status: string; sub_status: string | null; client_id: string};

/** The released files are exactly those named by the release event. */
export function releasedDocumentIds(events: EventRow[]): string[] {
  const released = events.filter(e => e.type === 'service_report_released').at(-1);
  return ((released?.payload as {document_ids?: string[]} | undefined)?.document_ids) ?? [];
}

export function reportState(record: CaseRow, events: EventRow[],
  drafts: {id: string; kind: string; version: number; content: unknown; created_at: Date}[], actor: CaseActor): ReportState {
  const config = REPORT_SERVICE_CONFIG[record.service_code as keyof typeof REPORT_SERVICE_CONFIG];
  const own = drafts.filter(d => d.kind === DRAFT_KIND).sort((a, b) => a.version - b.version);
  const latest = own.at(-1);
  const submitted = events.filter(e => e.type === 'service_report_submitted').at(-1);
  const changes = events.filter(e => e.type === 'service_report_changes_requested').at(-1);
  const released = events.filter(e => e.type === 'service_report_released').at(-1);
  const sub = submitted?.payload as {draft_id: string; version: number; document_ids: string[]} | undefined;
  const stage: ReportState['stage'] = released ? 'released'
    : record.sub_status === REPORT_AWAITING_APPROVAL ? 'awaiting_admin_approval'
    : record.sub_status === REPORT_CHANGES_REQUESTED ? 'changes_requested'
    : latest ? 'preparing' : 'not_started';
  const rel = released?.payload as {document_ids: string[]; note?: string} | undefined;
  // A client never sees work in progress, change requests or unreleased versions.
  const client = actor.role === 'client';
  return {
    production: config.production, requires_admin_approval: config.requiresAdminApproval,
    stage: client && stage !== 'released' ? (record.status === 'in_progress' || record.status === 'advocate_accepted' ? 'preparing' : 'not_started') : stage,
    latest_draft: !client && latest ? {id: latest.id, version: latest.version, content: latest.content as ReportDraftContent, created_at: latest.created_at.toISOString()} : null,
    submission: !client && sub && submitted ? {...sub, submitted_at: submitted.created_at.toISOString()} : null,
    changes: !client && changes && record.sub_status === REPORT_CHANGES_REQUESTED
      ? {items: (changes.payload as {items: ChangeItem[]}).items, requested_at: changes.created_at.toISOString()} : null,
    released: rel && released ? {document_ids: rel.document_ids, note: rel.note ?? '', released_at: released.created_at.toISOString()} : null,
  };
}

/** Case-read filter: a client sees their own uploads and released files only. */
export function visibleReportDocuments<T extends {id: string; owner_id: string}>(record: CaseRow, documents: T[], events: EventRow[], actor: CaseActor) {
  if (actor.role !== 'client') return documents;
  const released = new Set(record.status === 'completed' ? releasedDocumentIds(events) : []);
  return documents.filter(d => d.owner_id === record.client_id || released.has(d.id));
}

type Breakdown = import('@legalitt/shared').QuoteBreakdown;
/** GET /cases/:id for report services. Same membership scope as every read. */
export function reportCaseView<C extends CaseRow & {details: unknown}, D extends {id: string; owner_id: string}, R extends object>(input: {
  actor: CaseActor; record: C; caseRecord: R; client: {full_name: string} | null;
  events: (EventRow & {from_status: string | null; to_status: string | null})[]; documents: D[];
  drafts: {id: string; kind: string; version: number; content: unknown; created_at: Date}[];
  payment: {simulated: boolean; quote: {snapshot: unknown} | null} | undefined;
  pricing: unknown; advocate: unknown; parties: unknown[];
}) {
  const {actor, record, events} = input;
  const breakdown = (input.payment?.quote?.snapshot as {breakdown?: Breakdown} | undefined)?.breakdown;
  const client = actor.role === 'client';
  return {
    ...input.caseRecord, parties: input.parties, pricing: input.pricing, advocate: input.advocate,
    // Clients follow the timeline through lifecycle moves and the release only.
    events: client ? events.filter(e => e.from_status !== e.to_status || e.type === 'service_report_released') : events,
    documents: visibleReportDocuments(record, input.documents, events, actor),
    drafts: [], reviews: [], shipments: [],
    client_name: input.client?.full_name ?? null,
    report: reportState(record, events, input.drafts, actor),
    client_fees: breakdown ? {...breakdown, breakdown_complete: true, simulated: input.payment!.simulated} : null,
    advocate_payout: !client && breakdown?.advocate_entitlement_paise ? {net_paise: breakdown.advocate_entitlement_paise} : null,
  };
}

/** Download guard used by DocumentService.url. */
export async function assertReportDocumentReadable(tx: Prisma.TransactionClient, actor: CaseActor, record: CaseRow, doc: {id: string; owner_id: string}) {
  if (!isReportService(record.service_code) || actor.role !== 'client' || doc.owner_id === record.client_id) return;
  const events = await tx.caseEvent.findMany({where: {case_id: record.id, type: 'service_report_released'}, select: {type: true, created_at: true, payload: true}});
  if (record.status !== 'completed' || !releasedDocumentIds(events).includes(doc.id)) throw new NotFoundException('Document not found');
}

/** Presign guard: who may add which kind of file at which stage. */
export function assertReportUploadAllowed(actor: CaseActor, record: CaseRow, kind: string) {
  if (!isReportService(record.service_code)) return;
  const code = record.service_code;
  if (actor.role === 'client') {
    if (!['draft', 'payment_pending'].includes(record.status)) throw new ConflictException('Documents are frozen once payment is made.');
    if (!REPORT_CLIENT_DOCUMENT_KINDS[code].includes(kind)) throw new ConflictException('This document type is not used by this service.');
    return;
  }
  if (actor.role === 'advocate') {
    if (!['advocate_accepted', 'in_progress'].includes(record.status) || record.sub_status === REPORT_AWAITING_APPROVAL)
      throw new ConflictException('Report files are frozen while awaiting admin review.');
    if (!REPORT_ADVOCATE_DOCUMENT_KINDS[code].includes(kind) && !(REPORT_GENERATED_KINDS as readonly string[]).includes(kind))
      throw new ConflictException('This document type is not used by this service.');
    return;
  }
  // Admin uploads are not part of these services' drawn flows.
  throw new ConflictException('Admin uploads are not part of this service.');
}

/** Delete guard: submitted, released and post-payment intake files are evidence. */
export async function assertReportDocumentDeletable(tx: Prisma.TransactionClient, record: CaseRow, doc: {id: string; owner_id: string}) {
  if (!isReportService(record.service_code)) return;
  if (doc.owner_id === record.client_id) {
    if (!['draft', 'payment_pending'].includes(record.status)) throw new ConflictException('Documents submitted with a paid request cannot be deleted.');
    return;
  }
  const events = await tx.caseEvent.findMany({where: {case_id: record.id, type: {in: ['service_report_submitted', 'service_report_released']}}, select: {payload: true}});
  if (events.some(e => ((e.payload as {document_ids?: string[]}).document_ids ?? []).includes(doc.id)))
    throw new ConflictException('A submitted report file cannot be deleted.');
}
