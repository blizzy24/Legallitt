import {firContactMasked,maskFirContact} from '@legalitt/shared';
import {FIR_EVENT_LABELS,FIR_STATUS_LABELS,firTeamEventLabel} from './fir-event-labels';
import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { CaseStatusSchema, NoticePolicySchema, ServiceCodeSchema, firIntakeDetails, type ServiceCode } from "@legalitt/shared";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import { caseScope, type CaseActor } from "./case-access";
import { caseClientFees } from './client-fees';
import {firApproval} from './fir-approval';
import {isConsultationService} from '@legalitt/shared';
import {consultationDocumentVisible} from '../consultations/consultation-documents';
import {isReportService,isFlowReportService,reportStage,type ReportWorkflowData} from '@legalitt/shared';
import {reportCaseView} from '../service-reports/report-access';

const cursorSchema = z.strictObject({
  id: z.uuid(),
  created_at: z.iso.datetime(),
});
export const caseListSchema = z.strictObject({
  service_code: ServiceCodeSchema.optional(),
  status: CaseStatusSchema.optional(),
  role: z.enum(["client", "advocate", "admin"]).optional(),
  cursor: z.string().max(1024).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const eventListSchema = z.strictObject({
  cursor: z
    .string()
    .regex(/^[1-9]\d{0,18}$/)
    .refine((v) => BigInt(v) <= 9223372036854775807n)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function decodeCursor(value: string) {
  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(value, "base64url").toString());
  } catch {
    decoded = null;
  }
  return parse(cursorSchema, decoded);
}

// FIR (docs/flows/FIR-DRAFT-FLOW.md C10): the client never sees the admin step,
// internal reviews, an advocate's rejection or reminders, and gets no payloads.
// A later advocate does not see why an earlier advocate left the case.
const FIR_CLIENT_HIDDEN_EVENTS = ['fir_admin_returned','fir_identity_reviewed','fir_advocate_reassigned','fir_draft_saved','fir_draft_submitted','fir_draft_approved','fir_advocate_rejected','fir_client_reminded','fir_client_viewed'];
const FIR_ADVOCATE_PRIVATE_EVENTS = ['fir_advocate_rejected','fir_advocate_reassigned'];
function firEventsFor<T extends {type: string; payload: unknown}>(role: string, events: T[]): T[] {
  if (role === 'client') return events.filter(e => !FIR_CLIENT_HIDDEN_EVENTS.includes(e.type)).map(e => ({...e, payload: {}}));
  if (role === 'advocate') return events.map(e => FIR_ADVOCATE_PRIVATE_EVENTS.includes(e.type) ? {...e, payload: {}} : e);
  return events;
}
/** Q114: identity files stored on older FIR cases are never listed for the client or advocate (admin only). */
const firVisibleDocuments = <T extends {kind: string}>(role: string, documents: T[]) =>
  role === 'admin' ? documents : documents.filter(d => d.kind !== 'id_proof');

@Injectable()
export class CaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async read(actor: CaseActor, id: string, serviceCode?: ServiceCode) {
    const db = await this.prisma.getClient();
    const record = await db.case.findFirst({
      where: { AND: [caseScope(actor, serviceCode), { id }] },
      include: {
        case_parties_case_id_relations: true,
        pricing_id_relation: {select: {base_amount_paise: true, gst_bps: true}},
        payments_case_id_relations: {where: {purpose:'service_fee',status:'captured'},
          orderBy: {captured_at:'desc'},take:1,
          select: {base_amount_paise:true,gst_paise:true,total_paise:true,simulated:true,captured_at:true,quote:{select:{snapshot:true}}}},
        service_code_relation: {select: {config: true}},
        // The advocate's drawn facts (design 437) travel with the case; the id
        // alone would leave the card empty.
        advocate_id_relation:{select:{id:true,full_name:true,advocate_profiles_user_id_relations:{select:{
          years_experience:true,practice_areas:true,bar_council_number:true,enrolment_year:true,rating_avg:true,rating_count:true,
          verification:true,verified_at:true,city:true,state:true,photo_key:true,bio:true,courts:true,languages:true,education:true}}}},
        case_events_case_id_relations: { orderBy: { id: "asc" } },
        documents_case_id_relations: {
          where: { status: "uploaded" },
          orderBy: [{ created_at: "asc" }, { id: "asc" }],
        },
        shipments_case_id_relations: true,
        drafts_case_id_relations: {
          include: {
            draft_reviews_draft_id_relations: {
              orderBy: { created_at: "asc" },
            },
          },
          orderBy: { version: "asc" },
        },
      },
    });
    // Same response for a missing case and an inaccessible case.
    if (!record) throw new NotFoundException("Case not found");
    const {
      case_parties_case_id_relations: parties,
      pricing_id_relation: pricing,
      payments_case_id_relations: payments,
      service_code_relation: service,
      advocate_id_relation: advocate,
      case_events_case_id_relations: events,
      documents_case_id_relations: documents,
      drafts_case_id_relations: allDrafts,
      shipments_case_id_relations: shipments,
      ...caseRecord
    } = record;
    // A client's first access to any draft version requires the advocate's
    // explicit send event. Unsaved/unsent revisions never leak through GET.
    const sent = new Set(
      events
        .filter(
          (e) =>
            e.to_status === "client_review" && e.from_status !== e.to_status,
        )
        .map((e) => (e.payload as { draft_id?: string }).draft_id),
    );
    const approval = record.service_code === 'fir_draft' ? firApproval(events) : null;
    // FIR: the client sees each version only once the admin approved and sent it (flow C11).
    const firReleased = new Set(events.filter(e => e.type === 'fir_draft_approved').map(e => (e.payload as {draft_id?: string}).draft_id));
    const drafts = allDrafts.filter(
      (d) => actor.role !== "client" || (record.service_code === 'fir_draft' ? firReleased.has(d.id) && !['cancelled','refunded'].includes(record.status) : sent.has(d.id)),
    );
    const reviews = drafts.flatMap((d) => d.draft_reviews_draft_id_relations);
    const {advocate_profiles_user_id_relations: profile = null, ...advocateUser} = advocate ?? {};
    if (record.service_code === 'fir_draft') {
      const captured = payments[0];
      const snapshot = captured?.quote?.snapshot as unknown as {breakdown: import('@legalitt/shared').QuoteBreakdown} | undefined;
      // A2: until the assigned advocate accepts, the client's mobile and email are masked,
      // and earlier draft versions (which print them) are withheld.
      if (firContactMasked(actor.role, record.status)) {
        const shown = firVisibleDocuments(actor.role, documents).filter(d => d.kind !== 'fir_draft');
        return {...caseRecord,details:maskFirContact(firIntakeDetails(record.details,parties)),
          parties:parties.map(p=>p.kind==='complainant'?{...p,details:maskFirContact({people:[{...(p.details as object),kind:'complainant'}]}).people![0]}:p),
          pricing,advocate:advocate?{...advocateUser,profile}:null,events:firEventsFor(actor.role,events),drafts:[],reviews:[],shipments,approval:null,documents:shown,
          client_fees:snapshot?{...snapshot.breakdown,breakdown_complete:true,simulated:captured.simulated}:null};
      }
      return {...caseRecord,details:firIntakeDetails(record.details,parties),parties,pricing,advocate:advocate?{...advocateUser,profile}:null,
        events:firEventsFor(actor.role,events), drafts, reviews:actor.role==='client'?reviews.filter(r=>r.reviewer_id===actor.id):reviews, shipments, approval:actor.role==='client'&&!approval?.approved_at?null:approval,
        // The client sees their own uploads and the drafts released to them; no police
        // receipt (the police step is gone, Q119, Q120) and no identity file (Q114).
        documents: actor.role==='client'?firVisibleDocuments(actor.role,documents).filter(d=>d.owner_id===record.client_id || drafts.some(x=>x.document_id===d.id)):firVisibleDocuments(actor.role,documents),
        client_fees:snapshot?{...snapshot.breakdown,breakdown_complete:true,simulated:captured.simulated}:null};
    }
    if(isConsultationService(record.service_code)){
      const visible=await Promise.all(documents.map(async d=>await consultationDocumentVisible(db,actor,record,d)?d:null));
      return {...caseRecord,parties,pricing,advocate:advocate?{...advocateUser,profile}:null,events,documents:visible.filter(Boolean),drafts:[],reviews:[],shipments};
    }
    if (isReportService(record.service_code)) {
      // An interrupted upload blocks pricing. Its owner must be able to find
      // and remove it; other case members still see completed uploads only.
      const pending = await db.document.findMany({where:{case_id:record.id,owner_id:actor.id,status:'pending'},orderBy:[{created_at:'asc'},{id:'asc'}]});
      return reportCaseView({actor, record, caseRecord, events, documents:[...documents,...pending], drafts: allDrafts, payment: payments[0], pricing, parties,
        advocate: advocate ? {...advocateUser, profile} : null,
        client: await db.user.findUnique({where: {id: record.client_id}, select: {full_name: true,phone:true,email:true}})});
    }
    if (record.service_code !== 'legal_notice')
      return { ...caseRecord, parties, pricing, advocate: advocate ? {...advocateUser, profile} : advocate, events, documents, drafts, reviews, shipments };
    const notice_policy = parse(NoticePolicySchema, (service.config as {notice_policy?: unknown}).notice_policy ?? {});
    const capturedAt = payments[0]?.captured_at;
    const feeVersions = capturedAt && !payments[0]?.quote ? await db.servicePricing.findMany({where:{service_code:'legal_notice',confirmed:false,
      variant:{in:['platform_fee','delivery_fee']},effective_from:{lte:capturedAt},
      OR:[{effective_to:null},{effective_to:{gt:capturedAt}}]},orderBy:[{effective_from:'desc'},{id:'asc'}]}) : [];
    const client_fees = caseClientFees(pricing, payments[0], feeVersions);
    const breakdown = (payments[0]?.quote?.snapshot as unknown as {breakdown?: import('@legalitt/shared').QuoteBreakdown} | undefined)?.breakdown;
    const advocate_payout = breakdown?.advocate_entitlement_paise == null ? null : {
      service_share_paise: breakdown.service_fee_paise, delivery_reimbursement_paise: (BigInt(breakdown.advocate_entitlement_paise)-BigInt(breakdown.service_fee_paise)).toString(),
      net_paise: breakdown.advocate_entitlement_paise,
    };
    const visibleDocuments = (await Promise.all(documents.map(async d => await noticeDocumentVisible(db, actor, record, d) ? d : null))).filter(Boolean);
    const pendingNoticeDocuments=await db.document.findMany({where:{case_id:record.id,owner_id:actor.id,status:'pending'},orderBy:[{created_at:'asc'},{id:'asc'}]});
    const visibleDrafts = drafts.map(({draft_reviews_draft_id_relations, ...draft}) => ({...draft, draft_reviews_draft_id_relations: actor.role === 'client' ? draft_reviews_draft_id_relations.filter(r => r.reviewer_id === actor.id) : draft_reviews_draft_id_relations}));
    return { ...caseRecord, notice_policy, parties, pricing, client_fees, advocate_payout, advocate: advocate ? {...advocateUser, profile} : advocate,
      events: actor.role === 'client' ? noticeClientEvents(events) : events, documents: [...visibleDocuments,...pendingNoticeDocuments], drafts: visibleDrafts,
      reviews: actor.role === 'client' ? reviews.filter(r => r.reviewer_id === actor.id) : reviews, shipments };
  }

  async list(actor: CaseActor, query: unknown) {
    const input = parse(caseListSchema, query);
    const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
    const db = await this.prisma.getClient();
    // role is a view filter only. A caller cannot assume another identity/role.
    const rows = await db.case.findMany({
      where: {
        AND: [
          caseScope(actor, input.service_code),
          ...(input.role && input.role !== actor.role
            ? [{ id: { in: [] } }]
            : []),
          ...(input.status ? [{ status: input.status }] : []),
          ...(cursor
            ? [
                {
                  OR: [
                    { created_at: { gt: new Date(cursor.created_at) } },
                    {
                      created_at: new Date(cursor.created_at),
                      id: { gt: cursor.id },
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      orderBy: [{ created_at: "asc" }, { id: "asc" }],
      include: { advocate_id_relation: { select: { id: true, full_name: true } },client_id_relation:{select:{full_name:true}},report_workflow:{select:{data:true}} },
      take: input.limit + 1,
    });
    // A1 (design 214): the advocate's FIR card shows their share and the latest note.
    const firIds = actor.role === 'advocate' ? rows.filter(r => r.service_code === 'fir_draft').map(r => r.id) : [];
    const firCards = new Map<string, {share_paise: string | null; note: string | null}>();
    if (firIds.length) {
      const paid = await db.payment.findMany({where: {case_id: {in: firIds}, purpose: 'service_fee', status: 'captured'}, select: {case_id: true, quote: {select: {snapshot: true}}}});
      const latest = await db.caseEvent.findMany({where: {case_id: {in: firIds}, case_id_relation: {is: caseScope(actor)},
        OR: [{type: {in: Object.keys(FIR_EVENT_LABELS)}}, {type: 'status_changed', to_status: {in: Object.keys(FIR_STATUS_LABELS) as never}}]},
        orderBy: [{case_id: 'asc'}, {id: 'desc'}], distinct: ['case_id']});
      for (const id of firIds) {
        const snapshot = paid.find(p => p.case_id === id)?.quote?.snapshot as {breakdown?: {advocate_entitlement_paise?: string | null}} | undefined;
        const event = latest.find(e => e.case_id === id);
        firCards.set(id, {share_paise: snapshot?.breakdown?.advocate_entitlement_paise ?? null, note: event ? firTeamEventLabel(event, false) : null});
      }
    }
    const items = rows.slice(0, input.limit).map(({ advocate_id_relation: advocate,client_id_relation:client,report_workflow:workflow, ...record }) => ({ ...record,
      ...(isFlowReportService(record.service_code)?{report_card:{stage:reportStage(record,(workflow?.data??{}) as ReportWorkflowData),deadline_at:(workflow?.data as ReportWorkflowData|null)?.deadline_at??null,client_name:client.full_name}}:{}),
      ...(isFlowReportService(record.service_code)&&actor.role==='advocate'&&record.status==='assigned'&&(record.details as {contact?:object}).contact?{details:{...(record.details as object),contact:{...(record.details as {contact:object}).contact,mobile:undefined,email:undefined}}}:{}),
      // A2: the assigned advocate's list masks the client's mobile and email until they accept.
      ...(record.service_code === 'fir_draft' && firContactMasked(actor.role, record.status) ? {details: maskFirContact(record.details)} : {}),
      advocate, ...(firCards.has(record.id) ? {fir_card: firCards.get(record.id)} : {}) }));
    const last = items.at(-1);
    return {
      items,
      next_cursor:
        rows.length > input.limit && last
          ? Buffer.from(
              JSON.stringify({
                id: last.id,
                created_at: last.created_at.toISOString(),
              }),
            ).toString("base64url")
          : null,
    };
  }

  async events(actor: CaseActor, id: string, query: unknown) {
    const input = parse(eventListSchema, query);
    const db = await this.prisma.getClient();
    // Relation filtering keeps authorisation in the data query even if the case
    // is reassigned between checking existence and reading its events.
    if (
      !(await db.case.findFirst({
        where: { AND: [caseScope(actor), { id }] },
        select: { id: true },
      }))
    )
      throw new NotFoundException("Case not found");
    const rows = await db.caseEvent.findMany({
      where: {
        case_id: id,
        case_id_relation: { is: caseScope(actor) },
        ...(input.cursor ? { id: { gt: BigInt(input.cursor) } } : {}),
      },
      orderBy: { id: "asc" },
      take: input.limit + 1,
    });
    const caseRow=await db.case.findUniqueOrThrow({where:{id},select:{service_code:true}});
    const clientFir=actor.role==='client'&&caseRow.service_code==='fir_draft';
    const page=rows.slice(0,input.limit);
    const clientReport=actor.role==='client'&&isReportService(caseRow.service_code);
    const items=clientFir?firEventsFor('client',page):actor.role==='advocate'&&caseRow.service_code==='fir_draft'?firEventsFor('advocate',page):
      clientReport?page.filter(e=>e.from_status!==e.to_status||['service_report_released','report_document_uploaded'].includes(e.type)).map(e=>e.type==='service_report_released'?e:{...e,payload:{}}):actor.role==='client'&&caseRow.service_code==='legal_notice'?noticeClientEvents(page):page;
    return {
      items,
      next_cursor:
        rows.length > input.limit ? page.at(-1)!.id.toString() : null,
    };
  }
}
import {noticeDocumentVisible, noticeClientEvents} from './notice-access';
