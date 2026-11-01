import { requireDemoMode } from '../auth/demo';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CaseStatus,
  LegalNoticeIntakeSchema,
  LegalNoticeSubmissionSchema,
  LegalNoticeTierSchema,
  LegalNoticeMatterTypeSchema,
  noticeMatterType,
  noticeIssueType,
  NoticeDraftInputSchema,
  NoticeCommentSchema,
  NoticeDeclineSchema,
  IN_FLIGHT_SHIPMENT_STATUSES,
} from "@legalitt/shared";
import { z } from "zod";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import type { Prisma, PrismaClient } from "../generated/prisma/client";
import { caseScope, type CaseActor } from "./case-access";

export const createCaseSchema = z.strictObject({
  service_code: z.literal("legal_notice"),
  tier: LegalNoticeTierSchema.optional(),
  details: LegalNoticeIntakeSchema.default({}),
  matter_type: LegalNoticeMatterTypeSchema.nullable().optional(),
});
export const updateCaseSchema = z
  .strictObject({
    tier: LegalNoticeTierSchema.optional(),
    details: LegalNoticeIntakeSchema.optional(),
    matter_type: LegalNoticeMatterTypeSchema.nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0);

export const clientCancellationStates: readonly CaseStatus[] = [
  CaseStatus.draft,
  CaseStatus.submitted,
  CaseStatus.payment_pending,
  CaseStatus.assigning,
  CaseStatus.assigned,
  CaseStatus.advocate_declined,
];
export const adminCancellationStates: readonly CaseStatus[] = [
  ...clientCancellationStates,
  CaseStatus.paid,
  CaseStatus.advocate_accepted,
  CaseStatus.in_progress,
  CaseStatus.client_review,
  CaseStatus.changes_requested,
  CaseStatus.approved,
];
// Exhaustive keys ensure adding a lifecycle state requires an explicit decision.
export const transitions: Record<CaseStatus, readonly CaseStatus[]> = {
  draft: [CaseStatus.submitted, CaseStatus.cancelled],
  submitted: [CaseStatus.payment_pending, CaseStatus.cancelled],
  payment_pending: [CaseStatus.paid, CaseStatus.cancelled],
  paid: [CaseStatus.assigning, CaseStatus.cancelled],
  assigning: [CaseStatus.assigned, CaseStatus.cancelled],
  assigned: [
    CaseStatus.advocate_accepted,
    CaseStatus.advocate_declined,
    CaseStatus.cancelled,
  ],
  advocate_accepted: [CaseStatus.in_progress, CaseStatus.cancelled],
  advocate_declined: [CaseStatus.assigning, CaseStatus.cancelled],
  in_progress: [CaseStatus.client_review, CaseStatus.cancelled],
  client_review: [
    CaseStatus.changes_requested,
    CaseStatus.approved,
    CaseStatus.cancelled,
  ],
  changes_requested: [CaseStatus.in_progress, CaseStatus.cancelled],
  approved: [CaseStatus.dispatching, CaseStatus.cancelled],
  dispatching: [CaseStatus.dispatched],
  dispatched: [CaseStatus.completed],
  completed: [CaseStatus.refunded],
  cancelled: [CaseStatus.refunded],
  refunded: [],
};

// Shared by draft edits and transitions, so a concurrent submit cannot race an
// intake edit. Authorisation is part of the locking query, not a controller check.
export async function lockedCase(
  tx: Prisma.TransactionClient,
  actor: CaseActor,
  id: string,
) {
  await tx.$queryRaw`SELECT id FROM cases
    WHERE id = ${id}::uuid AND service_code = 'legal_notice'
    AND (${actor.role} = 'admin'
      OR (${actor.role} = 'client' AND client_id = ${actor.id}::uuid)
      OR (${actor.role} = 'advocate' AND advocate_id = ${actor.id}::uuid))
    FOR UPDATE`;
  const record = await tx.case.findFirst({
    where: { AND: [caseScope(actor), { id }] },
  });
  if (!record) throw new NotFoundException("Case not found");
  return record;
}

function permit(actor: CaseActor, from: CaseStatus, to: CaseStatus) {
  if (!transitions[from].includes(to))
    throw new ConflictException("Invalid case transition");
  if (to === CaseStatus.cancelled) {
    if (actor.role === "admin" && adminCancellationStates.includes(from))
      return;
    if (actor.role === "client" && clientCancellationStates.includes(from))
      return;
  } else if (to === CaseStatus.refunded) {
    if (actor.role === "admin") return;
  } else if (
    [
      CaseStatus.submitted,
      CaseStatus.payment_pending,
      CaseStatus.approved,
      CaseStatus.changes_requested,
    ].includes(to)
  ) {
    if (actor.role === "client") return;
  } else if (
    [
      CaseStatus.advocate_accepted,
      CaseStatus.advocate_declined,
      CaseStatus.in_progress,
      CaseStatus.client_review,
      CaseStatus.dispatching,
      CaseStatus.dispatched,
    ].includes(to)
  ) {
    // §2.8: sending for client review always requires an explicit advocate action.
    if (actor.role === "advocate") return;
  } else if (actor.role === "admin") return;
  throw new ForbiddenException("Role cannot perform this transition");
}

@Injectable()
export class CaseStateMachine {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: CaseActor, body: unknown) {
    if (actor.role !== "client")
      throw new ForbiddenException("Only clients create cases");
    const input = parse(createCaseSchema, body);
    if (input.matter_type !== undefined && input.details.issueType !== undefined && input.matter_type !== noticeMatterType(input.details.issueType))
      throw new BadRequestException('Matter type must match the selected issue');
    const matterType = input.matter_type ?? noticeMatterType(input.details.issueType);
    const issueType = noticeIssueType(matterType);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const [sequence] = await tx.$queryRaw<{ value: bigint }[]>`
        SELECT nextval('legal_notice_reference_seq') AS value`;
      const reference = `LN-${new Date().getUTCFullYear()}-${sequence.value.toString().padStart(4, "0")}`;
      const record = await tx.case.create({
        data: {
          service_code: "legal_notice",
          client_id: actor.id,
          reference,
          status: CaseStatus.draft,
          tier: input.tier,
          matter_type: matterType,
          details: {...input.details, ...(issueType ? {issueType} : {})},
        },
      });
      await tx.caseEvent.create({
        data: {
          case_id: record.id,
          type: "case_created",
          actor_id: actor.id,
          actor_role: actor.role,
          from_status: null,
          to_status: CaseStatus.draft,
        },
      });
      return record;
    });
  }

  async updateDraft(actor: CaseActor, id: string, body: unknown) {
    const input = parse(updateCaseSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      if (actor.role !== "client")
        throw new ForbiddenException("Only the client edits intake");
      if (record.status !== CaseStatus.draft)
        throw new ConflictException("Only draft intake can be edited");
      // PATCH merges entered fields without silently deleting earlier wizard steps.
      const previous = parse(LegalNoticeIntakeSchema, record.details);
      const details = input.details
        ? parse(LegalNoticeIntakeSchema, {
            ...previous,
            ...input.details,
            ...(input.details.client
              ? { client: { ...previous.client, ...input.details.client } }
              : {}),
            ...(input.details.noticee
              ? { noticee: { ...previous.noticee, ...input.details.noticee } }
              : {}),
          })
        : previous;
      if (input.matter_type !== undefined && input.details?.issueType !== undefined && input.matter_type !== noticeMatterType(input.details.issueType))
        throw new BadRequestException('Matter type must match the selected issue');
      const matterType = input.matter_type !== undefined ? input.matter_type :
        input.details?.issueType !== undefined ? noticeMatterType(input.details.issueType) : record.matter_type;
      const issueType = noticeIssueType(parse(LegalNoticeMatterTypeSchema.nullable(), matterType));
      if (issueType) details.issueType = issueType;
      else delete details.issueType;
      return tx.case.update({
        where: { id },
        data: {
          matter_type: matterType,
          details,
          ...(input.tier ? { tier: input.tier } : {}),
          updated_at: new Date(),
        },
      });
    });
  }

  private async advance(
    tx: Prisma.TransactionClient,
    actor: CaseActor,
    record: {
      id: string;
      status: string;
      details: unknown;
      tier: string | null;
    },
    to: CaseStatus,
    payload: Prisma.InputJsonObject = {},
    capturedPayment = false,
    source: 'real' | 'simulated' = 'real',
  ) {
    const from = record.status as CaseStatus;
    if (capturedPayment) {
      if (
        from !== CaseStatus.payment_pending ||
        to !== CaseStatus.paid ||
        actor.role !== "client"
      )
        throw new ConflictException("Invalid captured payment transition");
    } else permit(actor, from, to);
    if (to === CaseStatus.submitted) {
      parse(LegalNoticeSubmissionSchema, record.details);
      parse(LegalNoticeTierSchema, record.tier);
    }
    const updated = await tx.case.update({
      where: { id: record.id },
      data: {
        status: to,
        updated_at: new Date(),
        ...(to === CaseStatus.completed ? { completed_at: new Date() } : {}),
      },
    });
    await tx.caseEvent.create({
      data: {
        case_id: record.id,
        type: capturedPayment ? "payment_captured" : "status_changed",
        source: actor.source ?? source,
        actor_id: actor.trigger === "system" ? null : actor.id,
        actor_role: actor.trigger === "system" ? null : actor.role,
        from_status: from,
        to_status: to,
        payload: actor.trigger === "system" ? {...payload, actor: "system"} : payload,
      },
    });
    return updated;
  }
  // Every operational action shares this transaction-local status/event writer.
  async transition(actor: CaseActor, id: string, to: CaseStatus) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) =>
      this.advance(tx, actor, await lockedCase(tx, actor, id), to),
    );
  }
  async submitForPayment(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      let record = await lockedCase(tx, actor, id);
      if (actor.role !== "client")
        throw new ForbiddenException("Only clients submit");
      if (record.status === "payment_pending") return record;
      if (record.status === "draft") {
        const now = new Date();
        const pricing = await tx.servicePricing.findFirst({where: {service_code: 'legal_notice', tier: record.tier, variant: null, effective_from: {lte: now}, OR: [{effective_to: null}, {effective_to: {gt: now}}]}, orderBy: [{effective_from: 'desc'}, {id: 'asc'}]});
        if (!pricing) throw new ConflictException('Case pricing is unavailable');
        await tx.case.update({where: {id}, data: {pricing_id: pricing.id}});
        record = await this.advance(tx, actor, record, CaseStatus.submitted);
      }
      return this.advance(tx, actor, record, CaseStatus.payment_pending);
    });
  }
  async paymentCaptured(tx: Prisma.TransactionClient, actor: CaseActor,
    record: {id: string; status: string; details: unknown; tier: string | null},
    paymentId: string, source: 'real' | 'simulated') {
    const payment = await tx.payment.findFirst({where: {id: paymentId, case_id: record.id, payer_id: actor.id, purpose: 'service_fee', status: 'captured'}});
    if (!payment) throw new ConflictException('A captured service payment is required');
    return this.advance(tx, actor, record, CaseStatus.paid, {payment_id: paymentId}, true, source);
  }
  async assign(actor: CaseActor, id: string, body: unknown) {
    if (actor.role !== "admin") throw new ForbiddenException("Admin required");
    const { advocate_id } = parse(
      z.strictObject({ advocate_id: z.uuid() }),
      body,
    );
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      let record = await lockedCase(tx, actor, id);
      // Initial assignment only. A declined case retaining its former advocate
      // needs a separately approved reassignment flow, not this action.
      if (record.advocate_id) throw new ConflictException("Case already has an advocate");
      const advocate = await tx.user.findFirst({
        where: { id: advocate_id, role: "advocate", status: "active",
          advocate_profiles_user_id_relations: {is: {verification: "approved"}} },
      });
      if (!advocate) throw new BadRequestException("Choose an active, approved advocate");
      if (record.status === "paid" || record.status === "advocate_declined")
        record = await this.advance(tx, actor, record, CaseStatus.assigning);
      if (record.status !== "assigning")
        throw new ConflictException("Case is not awaiting assignment");
      record = await tx.case.update({ where: { id }, data: { advocate_id } });
      const updated = await this.advance(
        tx,
        actor,
        record,
        CaseStatus.assigned,
        { advocate_id },
      );
      await tx.adminAction.create({
        data: {
          admin_id: actor.id,
          action: "assign_advocate",
          subject_type: "case",
          subject_id: id,
          payload: { advocate_id },
        },
      });
      return updated;
    });
  }
  // The advocate begins (or, after a review, resumes) drafting. Repeating it once
  // drafting has begun is harmless, so a double tap is not an error.
  async startDrafting(actor: CaseActor, id: string) {
    if (actor.role !== "advocate")
      throw new ForbiddenException("Assigned advocate required");
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      if (record.status === CaseStatus.in_progress) return record;
      return this.advance(tx, actor, record, CaseStatus.in_progress);
    });
  }
  async decline(actor: CaseActor, id: string, body: unknown) {
    const input = parse(NoticeDeclineSchema, body ?? {});
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) =>
      this.advance(
        tx,
        actor,
        await lockedCase(tx, actor, id),
        CaseStatus.advocate_declined,
        {reason: input.reason ?? null},
      ),
    );
  }
  async saveNoticeDraft(actor: CaseActor, id: string, body: unknown) {
    const input = parse(NoticeDraftInputSchema, body);
    if (actor.role !== "advocate")
      throw new ForbiddenException("Assigned advocate required");
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      let record = await lockedCase(tx, actor, id);
      if (
        record.status === "advocate_accepted" ||
        record.status === "changes_requested"
      )
        record = await this.advance(tx, actor, record, CaseStatus.in_progress);
      if (record.status !== "in_progress")
        throw new ConflictException("Draft cannot be edited in this state");
      const previous = await tx.draft.findFirst({
        where: { case_id: id, kind: "legal_notice" },
        orderBy: { version: "desc" },
      });
      const draft = await tx.draft.create({
        data: {
          case_id: id,
          kind: input.kind,
          content: input.content,
          generated_by: input.generated_by,
          created_by: actor.id,
          version: (previous?.version ?? 0) + 1,
        },
      });
      await tx.caseEvent.create({
        data: {
          case_id: id,
          type: "draft_saved",
          source: actor.source ?? "real",
          actor_id: actor.id,
          actor_role: actor.role,
          from_status: record.status,
          to_status: record.status,
          payload: { draft_id: draft.id, version: draft.version },
        },
      });
      return draft;
    });
  }
  private async latestDraft(
    tx: Prisma.TransactionClient,
    id: string,
    draftId: string,
  ) {
    const latest = await tx.draft.findFirst({
      where: { case_id: id, kind: "legal_notice" },
      orderBy: { version: "desc" },
    });
    if (!latest || latest.id !== draftId)
      throw new ConflictException("Refresh to use the latest draft");
    return latest;
  }
  async sendNoticeDraft(actor: CaseActor, id: string, draftId: string) {
    if (actor.role !== "advocate")
      throw new ForbiddenException("Assigned advocate required");
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      const draft = await this.latestDraft(tx, id, draftId);
      const content = parse(
        NoticeDraftInputSchema.shape.content,
        draft.content,
      );
      if (!Object.values(content).some((v) => v.trim()))
        throw new BadRequestException("Enter the draft before sending it");
      return this.advance(tx, actor, record, CaseStatus.client_review, {
        draft_id: draftId,
        version: draft.version,
      });
    });
  }
  async reviewNoticeDraft(
    actor: CaseActor,
    id: string,
    draftId: string,
    decision: "approved" | "changes_requested",
    body: unknown,
    // The final notice rendered for this approval, timestamped before the move
    // so the document's record and the review row agree.
    approval?: { approvedAt: Date; noticeDocumentId: string },
  ) {
    if (actor.role !== "client")
      throw new ForbiddenException("Case client required");
    const comment =
      decision === "changes_requested"
        ? parse(NoticeCommentSchema, body).comment
        : (parse(z.strictObject({}), body), null);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      await this.latestDraft(tx, id, draftId);
      let updated = await this.advance(
        tx,
        actor,
        record,
        decision === "approved"
          ? CaseStatus.approved
          : CaseStatus.changes_requested,
        { draft_id: draftId, ...(approval ? { notice_document_id: approval.noticeDocumentId } : {}) },
      );
      if (approval)
        updated = await tx.case.update({ where: { id }, data: { notice_document_id: approval.noticeDocumentId } });
      await tx.draftReview.create({
        data: { draft_id: draftId, reviewer_id: actor.id, decision, comment, ...(approval ? { created_at: approval.approvedAt } : {}) },
      });
      return updated;
    });
  }
  async dispatch(actor: CaseActor, id: string, body: unknown) {
    if (actor.role !== "advocate")
      throw new ForbiddenException("Assigned advocate required");
    parse(z.strictObject({}), body);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      let record = await lockedCase(tx, actor, id);
      if (record.status === "approved")
        record = await this.advance(tx, actor, record, CaseStatus.dispatching);
      if (record.status !== "dispatching")
        throw new ConflictException(
          "Only an approved notice may be dispatched",
        );
      const shipment = await tx.shipment.findFirst({where: {case_id: id, direction: 'to_recipient', status: 'booked'}, orderBy: {booked_at: 'desc'}});
      if (!shipment || !shipment.carrier?.trim() || !shipment.waybill?.trim() || !shipment.dispatch_date)
        throw new BadRequestException('Save complete courier details before confirming dispatch');
      await tx.shipment.update({where: {id: shipment.id}, data: {status: 'dispatched', dispatched_at: new Date()}});
      return this.advance(tx, actor, record, CaseStatus.dispatched, {
        shipment_id: shipment.id,
        carrier: shipment.carrier,
        waybill: shipment.waybill,
      });
    });
  }
  async deliver(actor: CaseActor, id: string, body: unknown) {
    if (actor.role !== "admin") throw new ForbiddenException("Admin required");
    const { pod_document_id } = parse(
      z.strictObject({ pod_document_id: z.uuid() }),
      body,
    );
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      const proof = await tx.document.findFirst({
        where: { id: pod_document_id, case_id: id, status: "uploaded" },
      });
      if (!proof)
        throw new BadRequestException(
          "Upload proof of delivery for this case first",
        );
      const shipment = await tx.shipment.findFirst({
        where: { case_id: id, direction: "to_recipient", status: { in: [...IN_FLIGHT_SHIPMENT_STATUSES] } },
        orderBy: { booked_at: "desc" },
      });
      if (!shipment)
        throw new ConflictException("Dispatched shipment not found");
      const updated = await this.advance(
        tx,
        actor,
        record,
        CaseStatus.completed,
        { shipment_id: shipment.id, pod_document_id },
      );
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: "delivered",
          delivered_at: new Date(),
          pod_document_id,
        },
      });
      await tx.adminAction.create({
        data: {
          admin_id: actor.id,
          action: "confirm_delivery",
          subject_type: "case",
          subject_id: id,
          payload: { shipment_id: shipment.id, pod_document_id },
        },
      });
      // Completion is recorded; releasing money belongs to the payments phase.
      return updated;
    });
  }
}

/** Append-only non-lifecycle events share the case event writer. */
export function appendCaseEvent(tx: Prisma.TransactionClient, data: Prisma.CaseEventUncheckedCreateInput) {
  return tx.caseEvent.create({data});
}

// Explicit dev-seed entry point; never called by a request handler. Keep all
// case/event writes in this owner, including authorised development fixtures.
export async function seedDevelopmentNotice(db: PrismaClient, input: {
  seedKey: string; clientId: string; advocateId?: string; status: 'in_progress' | 'assigning'; sparse?: boolean; pricingId: string;
}) {
  requireDemoMode();
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'admin-seed:' + input.seedKey}))::text`;
    if (await tx.caseEvent.findFirst({where: {type: 'development_seed', payload: {path: ['seed_key'], equals: input.seedKey}}})) return;
    const [seq] = await tx.$queryRaw<{value: bigint}[]>`SELECT nextval('legal_notice_reference_seq') AS value`;
    const record = await tx.case.create({data: {
      reference: `LN-${new Date().getUTCFullYear()}-${seq.value.toString().padStart(4, '0')}`,
      service_code: 'legal_notice', client_id: input.clientId, advocate_id: input.advocateId, status: input.status,
      ...(input.sparse ? {} : {tier: 'ordinary', pricing_id: input.pricingId, matter_type: 'tenant_issue',
        details: {client: {fullName: 'Demo client'}, noticee: {fullName: 'Demo noticee', email: 'demo-noticee@legalitt.invalid'}, issueType: 'tenant-issue'}}),
    }});
    await appendCaseEvent(tx, {case_id: record.id, type: 'development_seed', source: 'simulated', to_status: input.status,
      payload: {actor: 'system', seed_key: input.seedKey}});
  });
}
