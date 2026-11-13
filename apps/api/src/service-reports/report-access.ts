import {ConflictException, NotFoundException} from '@nestjs/common';
import {
  REPORT_ADVOCATE_DOCUMENT_KINDS, REPORT_AWAITING_APPROVAL, REPORT_CHANGES_REQUESTED, REPORT_CLIENT_DOCUMENT_KINDS,
  REPORT_GENERATED_KINDS, REPORT_SERVICE_CONFIG, isReportService, type ChangeItem, type ReportDraftContent, type ReportState,
} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {DRAFT_KIND} from './report-lifecycle';
import {reportCorrectionAllowed} from './report-workflow';

type EventRow = {type: string; created_at: Date; payload: unknown};
type CaseRow = {id: string; service_code: string; status: string; sub_status: string | null; client_id: string};

/** The released files are exactly those named by the release event. */
export function releasedDocumentIds(events: EventRow[]): string[] {
  const released = events.filter(e => e.type === 'service_report_released').at(-1);
  return ((released?.payload as {document_ids?: string[]} | undefined)?.document_ids) ?? [];
}

export function reportState(record: CaseRow, events: EventRow[],
  drafts: {id: string; kind: string; version: number; content: unknown; created_at: Date;created_by?:string|null}[], actor: CaseActor): ReportState {
  const config = REPORT_SERVICE_CONFIG[record.service_code as keyof typeof REPORT_SERVICE_CONFIG];
  const own = drafts.filter(d => d.kind === DRAFT_KIND).sort((a, b) => a.version - b.version);
  const authored=(d:typeof own[number])=>{const content=structuredClone(d.content) as ReportDraftContent;if(actor.role==='advocate'&&d.created_by&&d.created_by!==actor.id){if(content.production==='forensic'){content.signed_at=null;delete content.signature;delete content.typed_signature;}if(content.production==='property')content.report.personally_checked=false;}return content;};
  const latest = own.at(-1);
  const property=own.filter(d=>(d.content as {production?:string}).production==='property').at(-1);
  const submitted = events.filter(e => e.type === 'service_report_submitted').at(-1);
  const changes = events.filter(e => e.type === 'service_report_changes_requested').at(-1);
  const released = events.filter(e => e.type === 'service_report_released').at(-1);
  const sub = submitted?.payload as {draft_id: string; version: number; document_ids: string[]} | undefined;
  const stage: ReportState['stage'] = released ? 'released'
    : record.sub_status === REPORT_AWAITING_APPROVAL ? 'awaiting_admin_approval'
    : record.sub_status === REPORT_CHANGES_REQUESTED ? 'changes_requested'
    : latest ? 'preparing' : 'not_started';
  const rel = released?.payload as {document_ids: string[]; note?: string} | undefined;
  const approved=own.find(d=>d.id===(released?.payload as {draft_id?:string}|undefined)?.draft_id)?.content as ReportDraftContent|undefined;
  // A client never sees work in progress, change requests or unreleased versions.
  const client = actor.role === 'client';
  return {
    production: config.production, requires_admin_approval: config.requiresAdminApproval,
    property_draft:!client&&property?{id:property.id,version:property.version,report:(authored(property) as Extract<ReportDraftContent,{production:'property'}>).report}:null,
    stage: client && stage !== 'released' ? (record.status === 'in_progress' || record.status === 'advocate_accepted' ? 'preparing' : 'not_started') : stage,
    latest_draft: !client && latest ? {id: latest.id, version: latest.version, content: authored(latest), created_at: latest.created_at.toISOString()} : null,
    submission: !client && sub && submitted ? {...sub, submitted_at: submitted.created_at.toISOString()} : null,
    changes: !client && changes && record.sub_status === REPORT_CHANGES_REQUESTED
      ? {items: (changes.payload as {items: ChangeItem[]}).items, requested_at: changes.created_at.toISOString()} : null,
    released: rel && released ? {document_ids: rel.document_ids, note: rel.note ?? '', released_at: released.created_at.toISOString()} : null,
    summary:released&&approved?.production==='forensic'?{overall_status:approved.report.overall_status,risk_level:approved.report.risk_level,authenticity:approved.report.authenticity,reviewed_at:released.created_at.toISOString()}:null,
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
  actor: CaseActor; record: C; caseRecord: R; client: {full_name: string;phone?:string|null;email?:string|null} | null;
  events: (EventRow & {from_status: string | null; to_status: string | null})[]; documents: D[];
  drafts: {id: string; kind: string; version: number; content: unknown; created_at: Date;created_by?:string|null}[];
  payment: {simulated: boolean; quote: {snapshot: unknown} | null} | undefined;
  pricing: unknown; advocate: unknown; parties: unknown[];
}) {
  const {actor, record, events} = input;
  const breakdown = (input.payment?.quote?.snapshot as {breakdown?: Breakdown} | undefined)?.breakdown;
  const client = actor.role === 'client';
  return {
    ...input.caseRecord,
    ...(actor.role==='advocate'&&record.status==='assigned'&&(record.details as {contact?:object}).contact?{details:{...(record.details as object),contact:{...(record.details as {contact:object}).contact,mobile:undefined,email:undefined}}}:{}),
    parties: input.parties, pricing: actor.role==='advocate'?null:input.pricing, advocate: input.advocate,
    // Clients follow the timeline through lifecycle moves and the release only.
    events: client ? events.filter(e => e.from_status !== e.to_status || ['service_report_released','report_document_uploaded'].includes(e.type)).map(e=>e.type==='service_report_released'?e:{...e,payload:{}}) : events,
    documents: visibleReportDocuments(record, input.documents, events, actor),
    drafts: [], reviews: [], shipments: [],
    client_name: input.client?.full_name ?? null,
    // Membership was checked by CaseRepository. Contact is deliberately absent
    // until this assigned advocate accepts, just like the intake contact fields.
    client_contact: actor.role==='advocate'&&['property_search','document_forensic'].includes(record.service_code)&&['advocate_accepted','in_progress','completed'].includes(record.status)
      ? {phone:input.client?.phone??null,email:input.client?.email??null}:null,
    report: reportState(record, events, input.drafts, actor),
    client_fees: actor.role!=='advocate'&&breakdown ? {service_fee_paise:breakdown.service_fee_paise,platform_fee_paise:breakdown.platform_fee_paise,delivery_fee_paise:breakdown.delivery_fee_paise,gst_paise:breakdown.gst_paise,page_overage_paise:breakdown.page_overage_paise,total_paise:breakdown.total_paise,breakdown_complete: true, simulated: input.payment!.simulated} : null,
    advocate_payout: !client && breakdown?.advocate_entitlement_paise ? {net_paise: breakdown.advocate_entitlement_paise} : null,
  };
}

/** Download guard used by DocumentService.url. */
export async function assertReportDocumentReadable(tx: Prisma.TransactionClient, actor: CaseActor, record: CaseRow, doc: {id: string; owner_id: string}) {
  if (!isReportService(record.service_code) || actor.role !== 'client' || doc.owner_id === record.client_id) return;
  const events = await tx.caseEvent.findMany({where: {case_id: record.id, type: 'service_report_released'}, orderBy:{id:'asc'}, select: {type: true, created_at: true, payload: true}});
  if (record.status !== 'completed' || !releasedDocumentIds(events).includes(doc.id)) throw new NotFoundException('Document not found');
}

/** Presign guard: who may add which kind of file at which stage. */
export async function assertReportUploadAllowed(tx:Prisma.TransactionClient,actor: CaseActor, record: CaseRow, kind: string, generated=false) {
  if (!isReportService(record.service_code)) return;
  const code = record.service_code;
  if (actor.role === 'client') {
    if (!['draft', 'payment_pending'].includes(record.status)) {
      const workflow=await tx.reportWorkflow.findUnique({where:{case_id:record.id}});
      const tasks=(workflow?.data as {tasks?:{kind:string;document_kind:string;status:string}[]}|undefined)?.tasks;
      if(['completed','cancelled','refunded'].includes(record.status)||!tasks?.some(t=>t.kind==='document'&&t.document_kind===kind&&t.status==='requested'))throw new ConflictException('Upload after payment is available only for a document requested by your advocate or admin.');
    }
    if (!REPORT_CLIENT_DOCUMENT_KINDS[code].includes(kind)) throw new ConflictException('This document type is not used by this service.');
    return;
  }
  if (actor.role === 'advocate') {
    const complete=record.status==='completed'?await tx.case.findUniqueOrThrow({where:{id:record.id}}):null;
    if (!['advocate_accepted', 'in_progress'].includes(record.status) && !(complete&&await reportCorrectionAllowed(tx,complete)) || record.sub_status === REPORT_AWAITING_APPROVAL)
      throw new ConflictException('Report files are frozen while awaiting admin review.');
    if (!REPORT_ADVOCATE_DOCUMENT_KINDS[code].includes(kind) && !(generated && code==='document_forensic' && (REPORT_GENERATED_KINDS as readonly string[]).includes(kind)))
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
