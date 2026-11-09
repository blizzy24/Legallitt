import { Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { CaseStatusSchema, NoticePolicySchema, ServiceCodeSchema, type ServiceCode } from "@legalitt/shared";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import { caseScope, type CaseActor } from "./case-access";
import { caseClientFees } from './client-fees';
import {firApproval} from './fir-approval';

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
    const drafts = allDrafts.filter(
      (d) => actor.role !== "client" || (record.service_code === 'fir_draft' ? !!approval?.approved_at && approval.draft_id === d.id && record.status === 'completed' : sent.has(d.id)),
    );
    const reviews = drafts.flatMap((d) => d.draft_reviews_draft_id_relations);
    const {advocate_profiles_user_id_relations: profile = null, ...advocateUser} = advocate ?? {};
    if (record.service_code === 'fir_draft') {
      const captured = payments[0];
      const snapshot = captured?.quote?.snapshot as unknown as {breakdown: import('@legalitt/shared').QuoteBreakdown} | undefined;
      return {...caseRecord,parties,pricing,advocate:advocate?{...advocateUser,profile}:null,
        events, drafts, reviews, shipments, approval:actor.role==='client'&&!approval?.approved_at?null:approval,
        documents: actor.role==='client'?documents.filter(d=>d.owner_id===record.client_id || !!approval?.approved_at&&d.id===approval.document_id):documents,
        client_fees:snapshot?{...snapshot.breakdown,breakdown_complete:true,simulated:captured.simulated}:null};
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
      service_share_paise: breakdown.service_fee_paise, delivery_reimbursement_paise: breakdown.delivery_fee_paise,
      net_paise: breakdown.advocate_entitlement_paise,
    };
    return { ...caseRecord, notice_policy, parties, pricing, client_fees, advocate_payout, advocate: advocate ? {...advocateUser, profile} : advocate, events, documents, drafts, reviews, shipments };
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
      include: { advocate_id_relation: { select: { id: true, full_name: true } } },
      take: input.limit + 1,
    });
    const items = rows.slice(0, input.limit).map(({ advocate_id_relation: advocate, ...record }) => ({ ...record, advocate }));
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
    const items = rows.slice(0, input.limit);
    return {
      items,
      next_cursor:
        rows.length > input.limit ? items.at(-1)!.id.toString() : null,
    };
  }
}
