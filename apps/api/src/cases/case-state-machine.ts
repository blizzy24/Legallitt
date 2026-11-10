import {ensureFirLifecycle,firCorrectionState} from './fir-lifecycle';
import { NOTIFICATIONS, type NotificationsPort } from '../notifications/notifications.port';
import { notifyCaseTransition } from '../notifications/case-notifications';
import { requireDemoMode } from '../auth/demo';
import {FIR_AWAITING_APPROVAL, FirSubmissionSchema, FirIntakeSchema, firIntakeDetails, INDIA_JURISDICTIONS, type FirIntake} from '@legalitt/shared';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import {
  CaseStatus,
  CreateCaseSchema,
  type ServiceCode,
  LegalNoticeIntakeSchema,
  LegalNoticeSubmissionSchema,
  NoticeIntakeFieldsSchema,
  NoticeReadySchema,
  LegalNoticeTierSchema,
  LegalNoticeMatterTypeSchema,
  noticeMatterType,
  noticeIssueType,
  NoticeDraftInputSchema,
  NoticePolicySchema,
  NoticeCommentSchema,
  NoticeDeclineSchema,
  IN_FLIGHT_SHIPMENT_STATUSES,
  DeliveryConfirmationSchema,
  NoticeSenderFieldsSchema,
  type LegalNoticeIntake,
  type NoticeSenderFields,
} from "@legalitt/shared";
import { z } from "zod";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import { Prisma, type PrismaClient } from "../generated/prisma/client";
import { caseScope, type CaseActor } from "./case-access";
import { caseReference } from './case-reference';
import {requireFirIdentity} from '../documents/fir-identity';

export const createCaseSchema = CreateCaseSchema;
export const updateCaseSchema = z
  .strictObject({
    ...NoticeIntakeFieldsSchema.shape,
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
  service?: ServiceCode,
) {
  const scope = caseScope(actor, service);
  const locked = await tx.$queryRaw<{id: string}[]>`SELECT id FROM cases
    WHERE id = ${id}::uuid
    AND (${service ?? null}::text IS NULL OR service_code = ${service ?? null})
    AND (${actor.role} = 'admin'
      OR (${actor.role} = 'client' AND client_id = ${actor.id}::uuid)
      OR (${actor.role} = 'advocate' AND advocate_id = ${actor.id}::uuid))
    FOR UPDATE`;
  if (!locked.length) throw new NotFoundException("Case not found");
  const record = await tx.case.findFirst({
    where: { AND: [scope, { id }] },
  });
  if (!record) throw new NotFoundException("Case not found");
  return record;
}

// Service-specific operations retain their old boundary while the spine opens.
export const lockedNoticeCase = (tx: Prisma.TransactionClient, actor: CaseActor, id: string) =>
  lockedCase(tx, actor, id, 'legal_notice');

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
  constructor(private readonly prisma: PrismaService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}

  async create(actor: CaseActor, body: unknown) {
    if (actor.role !== "client")
      throw new ForbiddenException("Only clients create cases");
    const input = parse(createCaseSchema, body);
    const notice = input.service_code === 'legal_notice' ? input : null;
    if (notice && notice.matter_type !== undefined && notice.details.issueType !== undefined && notice.matter_type !== noticeMatterType(notice.details.issueType))
      throw new BadRequestException('Matter type must match the selected issue');
    const matterType = notice ? notice.matter_type ?? noticeMatterType(notice.details.issueType) : null;
    const issueType = noticeIssueType(matterType);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      if (!await tx.service.findFirst({where: {code: input.service_code, active: true}}))
        throw new BadRequestException('Service is not available');
      const reference = await caseReference(tx, input.service_code);
      const record = await tx.case.create({
        data: {
          service_code: input.service_code,
          client_id: actor.id,
          reference,
          status: CaseStatus.draft,
          tier: notice?.tier,
          matter_type: matterType,
          details: {...notice?.details, ...(issueType ? {issueType} : {})},
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
      const record = await lockedNoticeCase(tx, actor, id);
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
      const subjectMatter = input.subject_matter === undefined ? record.subject_matter : input.subject_matter;
      const changedSource = matterType !== record.matter_type || subjectMatter !== record.subject_matter;
      // The new sender values have real columns. Synchronise the existing name
      // and contact snapshot under the case lock; never store these in JSON.
      if (input.sender || input.details?.client) {
        const sender = await tx.caseParty.findFirst({where: {case_id: id, kind: 'sender'}});
        const values = {name: details.client?.fullName ?? '', details: details.client ?? {},
          ...(input.sender?.age !== undefined ? {age: input.sender.age} : {}),
          ...(input.sender?.salutation !== undefined ? {salutation: input.sender.salutation} : {}),
          ...(input.sender?.relation !== undefined ? {relation: input.sender.relation} : {}),
          ...(input.sender?.relative_name !== undefined ? {relative_name: input.sender.relative_name || null} : {})};
        if (sender) await tx.caseParty.update({where: {id: sender.id}, data: values});
        else await tx.caseParty.create({data: {case_id: id, kind: 'sender', ...values}});
      }
      return tx.case.update({
        where: { id },
        data: {
          matter_type: matterType,
          subject_matter: subjectMatter,
          ...(changedSource ? {subject_line: null} : {}),
          ...(input.legal_demand !== undefined ? {legal_demand: input.legal_demand ?? Prisma.DbNull} : {}),
          details,
          ...(input.tier ? { tier: input.tier } : {}),
          updated_at: new Date(),
        },
      });
    });
  }

  // External AI runs outside the transaction. Discard an answer if the client
  // changed its inputs (or submitted) while that call was in flight.
  async recordIntakeAi(actor: CaseActor, id: string,
    inputs: {matter_type: string; subject_matter: string},
    result: {task: 'subject'; text: string; simulated: boolean} | {task: 'demands'; options: string[]; simulated: boolean}) {
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedNoticeCase(tx, actor, id);
      if (actor.role !== 'client') throw new ForbiddenException('Only the client edits intake');
      if (record.status !== 'draft') throw new ConflictException('Only draft intake can be edited');
      if (record.matter_type !== inputs.matter_type || record.subject_matter !== inputs.subject_matter)
        throw new ConflictException('The notice type or subject matter changed. Please try again.');
      if (result.task === 'subject') await tx.case.update({where: {id}, data: {subject_line: result.text, updated_at: new Date()}});
      await tx.caseEvent.create({data: {
        case_id: id, actor_id: actor.id, actor_role: actor.role,
        type: result.task === 'subject' ? 'subject_generated' : 'demand_options_generated',
        source: result.simulated ? 'simulated' : 'real',
        payload: result.task === 'subject' ? {subject_line: result.text} : {options: result.options},
      }});
      return result;
    });
  }

  async recordIntakeAiFailure(actor: CaseActor, id: string,
    failure: {task: 'subject' | 'demands'; code: string; provider?: string; model?: string; request_id?: string}) {
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      await lockedNoticeCase(tx, actor, id);
      if (actor.role !== 'client') throw new ForbiddenException('Only the client edits intake');
      // Audit the attempt even if intake changed while the provider was running.
      // No prompt, credential, party details, generated value or state change.
      return tx.caseEvent.create({data: {
        case_id: id, actor_id: actor.id, actor_role: actor.role,
        type: failure.task === 'subject' ? 'subject_generation_failed' : 'demand_options_generation_failed',
        source: 'real', payload: failure,
      }});
    });
  }

  private async advance(
    tx: Prisma.TransactionClient,
    actor: CaseActor,
    record: {
      id: string;
      status: string;
      service_code: string;
      details: unknown;
      tier: string | null;
      sub_status?: string | null;
    },
    to: CaseStatus,
    payload: Prisma.InputJsonObject = {},
    capturedPayment = false,
    source: 'real' | 'simulated' = 'real',
  ) {
    const from = record.status as CaseStatus;
    if (record.service_code === 'fir_draft' && record.sub_status === FIR_AWAITING_APPROVAL)
      throw new ConflictException('Use the FIR admin review actions for this submitted version.');
    if (capturedPayment) {
      if (
        from !== CaseStatus.payment_pending ||
        to !== CaseStatus.paid ||
        actor.role !== "client"
      )
        throw new ConflictException("Invalid captured payment transition");
    } else permit(actor, from, to);
    if (record.service_code !== 'legal_notice' && ![
      CaseStatus.assigning, CaseStatus.assigned, CaseStatus.advocate_accepted,
      CaseStatus.advocate_declined, CaseStatus.cancelled, CaseStatus.refunded,
      ...(record.service_code === 'fir_draft' ? [CaseStatus.submitted,CaseStatus.payment_pending,CaseStatus.paid] : []),
    ].includes(to)) throw new ConflictException('This service workflow is not available yet');
    if (to === CaseStatus.submitted && record.service_code === 'fir_draft') {
      parse(FirSubmissionSchema,firIntakeDetails(record.details,await tx.caseParty.findMany({where:{case_id:record.id}})));
      await requireFirIdentity(tx,record.id);
    }
    if (to === CaseStatus.submitted && record.service_code === 'legal_notice') {
      parse(LegalNoticeSubmissionSchema, record.details);
      parse(LegalNoticeTierSchema, record.tier);
      const intake = await tx.case.findUniqueOrThrow({where: {id: record.id},
        select: {subject_matter: true, subject_line: true, legal_demand: true}});
      parse(NoticeReadySchema, intake);
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
    await notifyCaseTransition(tx, this.notifications, updated);
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
      if (!['legal_notice','fir_draft'].includes(record.service_code)) throw new NotFoundException('Case not found');
      if (actor.role !== "client")
        throw new ForbiddenException("Only clients submit");
      if (record.status === "payment_pending") return record;
      if (record.status === "draft") {
        const now = new Date();
        const pricing = await tx.servicePricing.findFirst({where: {service_code: record.service_code, tier: record.tier, variant: null, ...(record.service_code === 'fir_draft' ? {confirmed:true} : {}), effective_from: {lte: now}, OR: [{effective_to: null}, {effective_to: {gt: now}}]}, orderBy: [{confirmed: 'desc'}, {effective_from: 'desc'}, {id: 'asc'}]});
        if (!pricing) throw new ConflictException('Case pricing is unavailable');
        await tx.case.update({where: {id}, data: {pricing_id: pricing.id}});
        record = await this.advance(tx, actor, record, CaseStatus.submitted);
      }
      return this.advance(tx, actor, record, CaseStatus.payment_pending);
    });
  }
  async paymentCaptured(tx: Prisma.TransactionClient, actor: CaseActor,
    record: {id: string; service_code: string; status: string; details: unknown; tier: string | null},
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
        select: { id: true, advocate_profiles_user_id_relations: { select: { city: true } } },
      });
      if (!advocate) throw new BadRequestException("Choose an active, approved advocate");
      // The notice prints the advocate's city as its Place. Without one the
      // advocate could never generate the draft, so the work is refused here.
      if (record.service_code === 'legal_notice' && !advocate.advocate_profiles_user_id_relations?.city?.trim())
        throw new BadRequestException("This advocate has no city on their profile. Add one before assigning work.");
      if (record.status === "paid" || record.status === "advocate_declined")
        record = await this.advance(tx, actor, record, CaseStatus.assigning);
      if (record.status !== "assigning")
        throw new ConflictException("Case is not awaiting assignment");
      record = await tx.case.update({ where: { id }, data: { advocate_id } });
      if(record.service_code==='fir_draft')await ensureFirLifecycle(tx,record);
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
      const record = await lockedNoticeCase(tx, actor, id);
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
      let record = await lockedNoticeCase(tx, actor, id);
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
      const service = await tx.service.findUniqueOrThrow({where: {code: 'legal_notice'}});
      const policy = parse(NoticePolicySchema, (service.config as {notice_policy?: unknown}).notice_policy ?? {});
      const days = input.compliance_period_days ?? record.compliance_period_days ?? policy.default_compliance_period_days;
      if (policy.criminal_clause === 'required' && !input.content.offences?.trim())
        throw new BadRequestException('Enter offences before generating this notice.');
      await tx.case.update({where: {id}, data: {compliance_period_days: days, updated_at: new Date()}});
      const draft = await tx.draft.create({
        data: {
          case_id: id,
          kind: input.kind,
          content: input.content,
          generated_by: input.generated_by,
          created_by: actor.id,
          version: (previous?.version ?? 0) + 1,
          compliance_period_days: days,
          closing_policy: policy,
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
          payload: { draft_id: draft.id, version: draft.version, compliance_period_days: days,
            previous_compliance_period_days: record.compliance_period_days, closing_policy: policy },
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
      const record = await lockedNoticeCase(tx, actor, id);
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
      const record = await lockedNoticeCase(tx, actor, id);
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
      let record = await lockedNoticeCase(tx, actor, id);
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
    const input = parse(DeliveryConfirmationSchema, body);
    const {pod_document_id} = input;
    const received_by = input.received_by || null;
    const delivered_at = input.delivered_at ? new Date(input.delivered_at) : new Date();
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedNoticeCase(tx, actor, id);
      if (record.status !== 'dispatched') throw new ConflictException('Only a dispatched case can be confirmed delivered');
      const proof = await tx.document.findFirst({
        where: { id: pod_document_id, case_id: id, status: "uploaded" },
      });
      if (!proof)
        throw new BadRequestException(
          "Upload proof of delivery for this case first",
        );
      if (proof.simulated !== (actor.source === 'simulated'))
        throw new BadRequestException('Proof of delivery must match the confirmation source. Upload a new proof for this confirmation.');
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
        { shipment_id: shipment.id, pod_document_id, received_by, delivered_at: delivered_at.toISOString() },
      );
      await tx.shipment.update({
        where: { id: shipment.id },
        data: {
          status: "delivered",
          delivered_at,
          received_by,
          simulated: actor.source === 'simulated',
          pod_document_id,
        },
      });
      await tx.adminAction.create({
        data: {
          admin_id: actor.id,
          action: "confirm_delivery",
          subject_type: "case",
          subject_id: id,
          payload: { shipment_id: shipment.id, pod_document_id, received_by, delivered_at: delivered_at.toISOString() },
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

// FIR uses the same sole case/event writer. Service orchestration handles the
// PDF, draft/review records and notifications inside these locked transactions.
export async function writeFirReviewState(tx:Prisma.TransactionClient,actor:CaseActor,id:string,data:Pick<Prisma.CaseUncheckedUpdateInput,'status'|'sub_status'|'advocate_id'|'completed_at'|'updated_at'>){
  await lockedCase(tx,actor,id,'fir_draft');
  if(actor.role!=='admin'&&(data.status!==undefined||data.advocate_id!==undefined||data.completed_at!==undefined))throw new ForbiddenException('Admin lifecycle action required');
  return tx.case.update({where:{id},data});
}
export async function writeFirIntake(tx: Prisma.TransactionClient,actor: CaseActor,id:string,input:FirIntake) {
  const record=await lockedCase(tx,actor,id,'fir_draft');
  if(actor.role!=='client')throw new ForbiddenException('Case client required');
  if(record.status!=='draft')throw new ConflictException('Submitted intake cannot be edited');
  const details=parse(FirIntakeSchema,input);
  if(details.intake_version===2){
    const old=(record.details??{}) as {jurisdiction?:FirIntake['jurisdiction']};
    const identity=(j?:FirIntake['jurisdiction'])=>JSON.stringify([j?.state_code,j?.state,j?.district_code,j?.district]);
    if(identity(details.jurisdiction)!==identity(old.jurisdiction)){
      const j=details.jurisdiction,state=INDIA_JURISDICTIONS.find(s=>s.code===j.state_code);
      if(j.state_code&&(!state||state.name!==j.state))throw new BadRequestException('Choose a state from the jurisdiction list');
      const district=state?.districts.find(d=>d.code===j.district_code);
      if(j.district_code&&(!district||district.name!==j.district))throw new BadRequestException('Choose a district in the selected state');
    }
    if(details.people.filter(p=>p.kind==='complainant').length>1)throw new BadRequestException('Only one primary complainant is supported');
    const supplied=details.people.flatMap(p=>p.id?[p.id]:[]);
    if(new Set(supplied).size!==supplied.length)throw new BadRequestException('Duplicate person identifier');
    const current=await tx.caseParty.findMany({where:{case_id:id,kind:{in:['complainant','accused','witness']}}});
    const retained:string[]=[];
    for(const [order,p]of details.people.entries()){
      const {id:partyId,kind,name,details:description,...values}=p;
      const data={kind,name,details:{...values,description,order}};
      if(partyId&&current.some(row=>row.id===partyId)){
        await tx.caseParty.update({where:{id:partyId},data});retained.push(partyId);
      }else{
        if(partyId&&await tx.caseParty.findUnique({where:{id:partyId}}))throw new BadRequestException('Invalid person identifier');
        const created=await tx.caseParty.create({data:{...data,case_id:id,...(partyId?{id:partyId}:{})}});retained.push(created.id);
      }
    }
    await tx.caseParty.deleteMany({where:{case_id:id,id:{in:current.filter(p=>!retained.includes(p.id)).map(p=>p.id)}}});
    const {people,...stored}=details;
    const updated=await tx.case.update({where:{id},data:{details:stored,matter_type:details.incident.type||null,updated_at:new Date(Math.max(Date.now(),record.updated_at.getTime()+1))}});
    return {...updated,details:firIntakeDetails(stored,await tx.caseParty.findMany({where:{case_id:id}}))};
  }
  return tx.case.update({where:{id},data:{details,matter_type:details.incident.type,updated_at:new Date()}});
}
export async function writeFirDraftSaved(tx: Prisma.TransactionClient,actor: CaseActor,id:string,draft:{id:string;version:number}) {
  const record=await lockedCase(tx,actor,id,'fir_draft');
  await ensureFirLifecycle(tx,record);
  if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
  if(!['advocate_accepted','in_progress','changes_requested'].includes(record.status)||record.sub_status===FIR_AWAITING_APPROVAL)
    throw new ConflictException('Draft cannot be edited while awaiting admin approval');
  const correction=await firCorrectionState(tx,id);
  const status=correction&&correction!=='advocate_revision_required'?'changes_requested':'in_progress';
  await tx.case.update({where:{id},data:{status,sub_status:correction,updated_at:new Date()}});
  return appendCaseEvent(tx,{case_id:id,type:'fir_draft_saved',actor_id:actor.id,actor_role:actor.role,from_status:record.status,to_status:status,payload:{draft_id:draft.id,version:draft.version}});
}
export async function writeFirSubmitted(tx: Prisma.TransactionClient,actor: CaseActor,id:string,payload:{draft_id:string;version:number;document_id:string}) {
  const record=await lockedCase(tx,actor,id,'fir_draft');
  if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
  if(record.status!=='in_progress'||record.sub_status===FIR_AWAITING_APPROVAL)throw new ConflictException('Only one draft may await admin approval');
  const latest=await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
  if(latest?.id!==payload.draft_id||latest.document_id!==payload.document_id)throw new ConflictException('Refresh to use the submitted version');
  const {life,assignment}=await ensureFirLifecycle(tx,record);if(!assignment)throw new ConflictException('Assignment required');
  if(await tx.firIdentityReturn.count({where:{case_id:id,state:{in:['replacement_required','review_pending']}}}))throw new ConflictException('Identity correction remains outstanding');
  const content=latest.content as {complainant:{identity_document_id:string}};
  const sub=await tx.firSubmission.create({data:{case_id:id,assignment_id:assignment.id,draft_id:latest.id,version:latest.version,document_id:payload.document_id,identity_document_id:content.complainant.identity_document_id,supersedes_submission_id:life.current_submission_id}});
  await tx.firLifecycle.update({where:{case_id:id},data:{current_submission_id:sub.id,revision:{increment:1}}});
  const updated=await tx.case.update({where:{id},data:{sub_status:FIR_AWAITING_APPROVAL,updated_at:new Date()}});
  await appendCaseEvent(tx,{case_id:id,type:'fir_draft_submitted',actor_id:actor.id,actor_role:actor.role,from_status:'in_progress',to_status:'in_progress',payload});
  return updated;
}
// Development seed (seed-demo.ts) only; never called by a request handler. New
// seeded cases are built through the real create/intake/submit/payment/assign
// path; these two helpers are the only seed-specific writes, kept in this owner.

/** Marks a case created through the real path as development seed data. */
export async function tagDevelopmentSeed(db: PrismaClient, caseId: string, seedKey: string) {
  requireDemoMode();
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'admin-seed:' + seedKey}))::text`;
    if (await tx.caseEvent.findFirst({where: {type: 'development_seed', payload: {path: ['seed_key'], equals: seedKey}}})) return;
    const record = await tx.case.findUniqueOrThrow({where: {id: caseId}, select: {status: true}});
    await appendCaseEvent(tx, {case_id: caseId, type: 'development_seed', source: 'simulated',
      from_status: record.status, to_status: record.status, payload: {actor: 'system', seed_key: seedKey}});
  });
}

export type DevelopmentSeedIntake = {
  tier: 'ordinary' | 'urgent';
  details: LegalNoticeIntake;
  subject_matter: string;
  subject_line: string;
  legal_demand: {selected: string[]; custom: string};
  sender: NoticeSenderFields;
};

/** One-time completion of seeded cases written past submit before the seed used
 * the real path. Validated by the same schemas submit applies; status unchanged;
 * recorded as development_seed_repaired. Cases that went through submit are left alone. */
export async function repairDevelopmentSeed(db: PrismaClient, input: {seedKey: string; intake: DevelopmentSeedIntake; pricingIdForTier: (tier: string) => Promise<string>}) {
  requireDemoMode();
  const details = parse(LegalNoticeSubmissionSchema, input.intake.details);
  parse(NoticeReadySchema, {subject_matter: input.intake.subject_matter, subject_line: input.intake.subject_line, legal_demand: input.intake.legal_demand});
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'admin-seed:' + input.seedKey}))::text`;
    const tag = await tx.caseEvent.findFirst({where: {type: 'development_seed', payload: {path: ['seed_key'], equals: input.seedKey}}});
    if (!tag) return 'absent' as const;
    const caseId = tag.case_id;
    if (await tx.caseEvent.findFirst({where: {case_id: caseId, type: 'development_seed_repaired'}})) return 'already' as const;
    if (await tx.caseEvent.findFirst({where: {case_id: caseId, to_status: CaseStatus.submitted}})) return 'valid' as const;
    const record = await tx.case.findUniqueOrThrow({where: {id: caseId}});
    // A case that already has a tier and pricing keeps them: only absent facts are supplied.
    const tier = record.tier ?? input.intake.tier;
    const pricingId = record.pricing_id ?? await input.pricingIdForTier(tier);
    if (!await tx.servicePricing.findFirst({where: {id: pricingId, service_code: 'legal_notice', tier}}))
      throw new ConflictException('Seed pricing does not match the case tier');
    const previous = parse(LegalNoticeIntakeSchema, record.details);
    const filled = [
      !record.subject_line && 'subject',
      !previous.client?.fullName?.trim() && 'sender_name', !previous.client?.address?.trim() && 'sender_address',
      !previous.noticee?.fullName?.trim() && 'recipient_name', !previous.noticee?.address?.trim() && 'recipient_address',
      !record.pricing_id && 'service_fee',
    ].filter(Boolean) as string[];
    const matterType = noticeMatterType(details.issueType);
    await tx.case.update({where: {id: caseId}, data: {
      details, matter_type: matterType, tier, pricing_id: pricingId,
      subject_matter: input.intake.subject_matter, subject_line: input.intake.subject_line,
      legal_demand: input.intake.legal_demand, updated_at: new Date(),
    }});
    const party = {name: details.client.fullName, details: details.client,
      ...developmentSeedSender(input.intake.sender)};
    const sender = await tx.caseParty.findFirst({where: {case_id: caseId, kind: 'sender'}});
    if (sender) await tx.caseParty.update({where: {id: sender.id}, data: party});
    else await tx.caseParty.create({data: {case_id: caseId, kind: 'sender', ...party}});
    await appendCaseEvent(tx, {case_id: caseId, type: 'development_seed_repaired', source: 'simulated',
      from_status: record.status, to_status: record.status,
      payload: {actor: 'system', seed_key: input.seedKey, filled, replaced_placeholders: true}});
    return 'repaired' as const;
  });
}

const developmentSeedSender = (sender: NoticeSenderFields) => ({age: sender.age ?? null,
  salutation: sender.salutation ?? null, relation: sender.relation ?? null, relative_name: sender.relative_name ?? null});

/** Brings a seeded case's sender introduction (age, salutation, relation, relative)
 * in line with the seed source after the intake gained fields its cases predate.
 * Any status; only the sender party changes; recorded as development_seed_sender_updated. */
export async function syncDevelopmentSeedSender(db: PrismaClient, seedKey: string, input: NoticeSenderFields) {
  requireDemoMode();
  const wanted = developmentSeedSender(parse(NoticeSenderFieldsSchema, input));
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'admin-seed:' + seedKey}))::text`;
    const tag = await tx.caseEvent.findFirst({where: {type: 'development_seed', payload: {path: ['seed_key'], equals: seedKey}}});
    if (!tag) return [];
    const sender = await tx.caseParty.findFirst({where: {case_id: tag.case_id, kind: 'sender'}});
    if (!sender) throw new ConflictException('Seeded case has no sender party');
    const changed = (Object.keys(wanted) as (keyof typeof wanted)[]).filter(key => sender[key] !== wanted[key]);
    if (!changed.length) return [];
    await tx.caseParty.update({where: {id: sender.id}, data: wanted});
    const record = await tx.case.findUniqueOrThrow({where: {id: tag.case_id}, select: {status: true}});
    await appendCaseEvent(tx, {case_id: tag.case_id, type: 'development_seed_sender_updated', source: 'simulated',
      from_status: record.status, to_status: record.status, payload: {actor: 'system', seed_key: seedKey, changed}});
    return changed;
  });
}
