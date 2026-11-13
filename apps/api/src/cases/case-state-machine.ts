import {ensureFirLifecycle,firCorrectionState} from './fir-lifecycle';
import {ensureNoticeLifecycle} from './notice-lifecycle';
import {currentNoticeFiling,NoticeFilingSchema, NoticeFilingSubmissionSchema, NoticeClientChangesSchema, type NoticeFiling} from '@legalitt/shared';
import {isConsultationService,isServiceOffered,serviceNotOfferedMessage} from '@legalitt/shared';
import { NOTIFICATIONS, type NotificationsPort } from '../notifications/notifications.port';
import { notifyCaseTransition } from '../notifications/case-notifications';
import { requireDemoMode } from '../auth/demo';
import {FIR_AWAITING_APPROVAL, FIR_CLIENT_CHANGES, FirSubmissionSchema, FirIntakeSchema, firIntakeDetails, INDIA_JURISDICTIONS, type FirIntake} from '@legalitt/shared';
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
import {isReportService,REPORT_AWAITING_APPROVAL,REPORT_CHANGES_REQUESTED,type ChangeItem,type ReportServiceCode} from '@legalitt/shared';
import {assertReportSubmittable} from '../service-reports/report-submission';
import {ensureReportWorkflow,reportCorrectionAllowed} from '../service-reports/report-workflow';

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
    // Q79/Q113: a hidden service keeps its code and existing cases, but takes no new ones.
    if (!isServiceOffered(input.service_code))
      throw new BadRequestException(serviceNotOfferedMessage(input.service_code));
    const notice = input.service_code === 'legal_notice' ? input : null;
    if (notice && notice.matter_type !== undefined && notice.details.issueType !== undefined && notice.matter_type !== noticeMatterType(notice.details.issueType))
      throw new BadRequestException('Matter type must match the selected issue');
    const matterType = notice ? notice.matter_type ?? noticeMatterType(notice.details.issueType) : null;
    const issueType = noticeIssueType(matterType);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      if (!await tx.service.findFirst({where: {code: input.service_code, active: true}}))
        throw new BadRequestException('Service is not available');
      if (['district_court','high_court'].includes(input.service_code) &&
          await tx.courtPolicy.findFirst({where:{service_code:input.service_code,effective_from:{lte:new Date()}}}))
        throw new ConflictException('Start court representation from the current court service screen. Existing consultation cases remain available in My Cases.');
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
          ...(input.sender?{details:{fatherName:input.sender.father_name,motherName:input.sender.mother_name,husbandName:input.sender.husband_name}}:{}),
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
    if (['district_court', 'high_court'].includes(record.service_code) &&
        await tx.courtWorkspace.findUnique({where: {case_id: record.id}}))
      throw new ConflictException('Use the court representation actions for this case.');
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
      ...(isReportService(record.service_code) ? [CaseStatus.submitted,CaseStatus.payment_pending,CaseStatus.paid,CaseStatus.in_progress] : []),
    ].includes(to)) throw new ConflictException('This service workflow is not available yet');
    if (to === CaseStatus.submitted) await assertReportSubmittable(tx, record);
    if (to === CaseStatus.submitted && record.service_code === 'fir_draft') {
      parse(FirSubmissionSchema,firIntakeDetails(record.details,await tx.caseParty.findMany({where:{case_id:record.id}})));
      // Flow C6: Primary Documents is the one required slot. No identity document (Q114).
      if(!await tx.document.count({where:{case_id:record.id,kind:'fir_primary',status:'uploaded'}}))throw new BadRequestException('Upload at least one primary document (agreement, notice, receipt or stamp paper).');
    }
    if (to === CaseStatus.submitted && record.service_code === 'legal_notice') {
      const modern = (record.details as {intake_version?: number}).intake_version === 2;
      if (modern) {
        const filing = parse(NoticeFilingSubmissionSchema, currentNoticeFiling(record.details));
        const documents = await tx.document.findMany({where: {case_id: record.id, status: 'uploaded'}});
        if (!documents.some(d => d.kind === 'id_proof')) throw new BadRequestException('Upload the requested masked identity document. This is not KYC verification.');
        if(filing.identity_kind==='masked_aadhaar'&&documents.filter(d=>d.kind==='id_proof').length<2)throw new BadRequestException('Upload both the front and back of your masked Aadhaar.');
        if (!documents.some(d => d.kind.startsWith('notice_support') || ['notice_cheque', 'notice_return_memo'].includes(d.kind))) throw new BadRequestException('Upload at least one supporting document.');
        if (filing.issueType === 'cheque-bounce' && (!documents.some(d => d.kind === 'notice_cheque') || !documents.some(d => d.kind === 'notice_return_memo'))) throw new BadRequestException('Upload the cheque copy and bank return memo.');
        await ensureNoticeLifecycle(tx, record);
      } else parse(LegalNoticeSubmissionSchema, record.details);
      parse(LegalNoticeTierSchema, record.tier);
      const intake = await tx.case.findUniqueOrThrow({where: {id: record.id},
        select: {subject_matter: true, subject_line: true, legal_demand: true}});
      if (!modern) parse(NoticeReadySchema, intake);
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
      if (!['legal_notice','fir_draft'].includes(record.service_code) && !isReportService(record.service_code)) throw new NotFoundException('Case not found');
      if (actor.role !== "client")
        throw new ForbiddenException("Only clients submit");
      // A hidden service (Court Marriage, Q79/Q113) takes no new submissions, even from an older draft.
      if (record.status === "draft" && !isServiceOffered(record.service_code))
        throw new BadRequestException(serviceNotOfferedMessage(record.service_code as ServiceCode));
      if (record.status === "payment_pending") return record;
      if (record.status === "draft") {
        const now = new Date();
        // Report services use only versioned provisional tariffs with a fee policy (§2.5a).
        const pricing = await tx.servicePricing.findFirst({where: {service_code: record.service_code, tier: record.tier, variant: null, ...(record.service_code === 'fir_draft' ? {confirmed:true} : {}), ...(isReportService(record.service_code) ? {fee_policy_id: {not: null}} : {}), effective_from: {lte: now}, OR: [{effective_to: null}, {effective_to: {gt: now}}]}, orderBy: [{confirmed: 'desc'}, {effective_from: 'desc'}, {id: 'asc'}]});
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
    const updated=await this.advance(tx, actor, record, CaseStatus.paid, {payment_id: paymentId}, true, source);
    if(record.service_code==='legal_notice')await ensureNoticeLifecycle(tx,record);
    if(['property_search','document_forensic'].includes(record.service_code))await ensureReportWorkflow(tx,updated);
    return updated;
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
      if(record.service_code==='property_search'){
        const workflow=await ensureReportWorkflow(tx,record);
        if(!workflow.data.verification||workflow.data.tasks?.some(t=>t.status!=='resolved'))throw new ConflictException('Verify the property request and resolve outstanding details before assignment.');
      }
      // needs a separately approved reassignment flow, not this action.
      // FIR declines recorded before the reason-based rejection kept the advocate
      // on the case; returning it to admin means the admin can assign again (flow §3.2).
      if (['fir_draft','legal_notice','property_search','document_forensic'].includes(record.service_code) && record.status === 'advocate_declined' && record.advocate_id) {
        await tx.caseAssignment.updateMany({where: {case_id: id, ended_at: null}, data: {ended_at: new Date(), end_reason: 'advocate_declined'}});
        record = await tx.case.update({where: {id}, data: {advocate_id: null}});
      }
      if (record.advocate_id) throw new ConflictException("Case already has an advocate");
      if (isConsultationService(record.service_code)) {
        const booked = await tx.consultation.findFirst({where:{case_id:id,status:'scheduled'}});
        if (!booked || booked.advocate_id !== advocate_id) throw new ConflictException('Assign the advocate selected in the paid consultation booking.');
      }
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
      if(['fir_draft','legal_notice','property_search','document_forensic'].includes(record.service_code)){
        // Recorded as this admin's assignment, now; never inferred from an earlier 'assigned' event.
        if(!await tx.caseAssignment.findFirst({where:{case_id:id,ended_at:null}}))await tx.caseAssignment.create({data:{case_id:id,advocate_id,assigned_by:actor.id}});
        if(record.service_code==='fir_draft')await ensureFirLifecycle(tx,record);
      }
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
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      // FIR rejection needs a reason and returns the case to admin (POST /fir/:id/reject).
      if (record.service_code === 'fir_draft') throw new ConflictException('Reject this FIR request with a reason.');
      if (record.service_code === 'legal_notice' && !input.reason?.trim()) throw new BadRequestException('Enter a reason for declining this request.');
      const updated = await this.advance(
        tx,
        actor,
        record,
        CaseStatus.advocate_declined,
        {reason: input.reason ?? null},
      );
      if (record.service_code === 'legal_notice') {
        await tx.caseAssignment.updateMany({where: {case_id: id, ended_at: null}, data: {ended_at: new Date(), end_reason: input.reason}});
        return tx.case.update({where: {id}, data: {advocate_id: null}});
      }
      return updated;
    });
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
      if (input.base_version !== undefined && input.base_version !== (previous?.version ?? 0)) throw new ConflictException('A newer draft exists. Refresh before saving.');
      const policy = parse(NoticePolicySchema, (service.config as {notice_policy?: unknown}).notice_policy ?? {});
      const days = input.compliance_period_days ?? record.compliance_period_days ?? policy.default_compliance_period_days;
      const {offences: _retired, ...authoredContent} = input.content;
      await tx.case.update({where: {id}, data: {compliance_period_days: days, updated_at: new Date()}});
      const draft = await tx.draft.create({
        data: {
          case_id: id,
          kind: input.kind,
          content: authoredContent,
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
  async sendNoticeDraft(actor: CaseActor, id: string, draftId: string,review?:{base_version?:number;review_checks?:{names:true;amount:true;demand_days:true};message?:string},documentId?:string) {
    if (actor.role !== "advocate")
      throw new ForbiddenException("Assigned advocate required");
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedNoticeCase(tx, actor, id);
      let draft = await this.latestDraft(tx, id, draftId);
      if(review?.base_version!==undefined&&review.base_version!==draft.version)throw new ConflictException('Review the latest draft version before sending.');
      if(documentId){
        if(record.status!=='in_progress')throw new ConflictException('This draft is no longer open for sending.');
        if(!await tx.document.findFirst({where:{id:documentId,case_id:id,owner_id:actor.id,kind:'legal_notice',status:'uploaded'}}))throw new BadRequestException('The generated draft PDF is unavailable.');
        draft=await tx.draft.update({where:{id:draftId},data:{document_id:documentId}});
      }
      const content = parse(
        NoticeDraftInputSchema.shape.content,
        draft.content,
      );
      if (!Object.values(content).some((v) => v.trim()))
        throw new BadRequestException("Enter the draft before sending it");
      if (record.sub_status === 'notice_admin_advocate_correction') {
        const life = await ensureNoticeLifecycle(tx, record);
        if (!draft.document_id) throw new ConflictException('Generate the corrected PDF before sending.');
        await tx.noticeLifecycle.update({where: {case_id: id}, data: {approved_draft_id: draftId, approved_document_id: draft.document_id, notice_checked_at: null, test_esigned_at: null, revision: {increment: 1}}});
        return writeNoticeFlowState(tx, actor, id, {status: 'approved', sub_status: 'notice_advocate_signature'}, 'notice_correction_ready_to_sign', {draft_id: draftId, version: draft.version});
      }
      const updated=await this.advance(tx, actor, record, CaseStatus.client_review, {
        draft_id: draftId,
        version: draft.version,
        ...(review?.review_checks?{review_checks:review.review_checks}:{}),
      });
      if(review?.message){const thread=await tx.messageThread.findFirst({where:{case_id:id,kind:'client_advocate'}})??await tx.messageThread.create({data:{case_id:id,kind:'client_advocate'}});await tx.message.create({data:{thread_id:thread.id,sender_id:actor.id,body:review.message}});}
      return updated;
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
    const changes = decision === 'changes_requested' ? parse(NoticeClientChangesSchema, body) : null;
    const comment =
      decision === "changes_requested"
        ? changes!.comment
        : (parse(z.strictObject({}), body), null);
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedNoticeCase(tx, actor, id);
      await this.latestDraft(tx, id, draftId);
      if (changes?.attachment_document_id && !await tx.document.findFirst({where: {id: changes.attachment_document_id, case_id: id, owner_id: actor.id, status: 'uploaded'}})) throw new BadRequestException('Attach an uploaded file from this case.');
      let updated = await this.advance(
        tx,
        actor,
        record,
        decision === "approved"
          ? CaseStatus.approved
          : CaseStatus.changes_requested,
        { draft_id: draftId, ...(approval ? { notice_document_id: approval.noticeDocumentId } : {}) },
      );
      if (approval) {
        await ensureNoticeLifecycle(tx, record);
        await tx.noticeLifecycle.update({where: {case_id: id}, data: {approved_draft_id: draftId, approved_document_id: approval.noticeDocumentId, test_esigned_at:null,revision: {increment: 1}}});
        updated = await tx.case.update({ where: { id }, data: { notice_document_id: approval.noticeDocumentId, sub_status: 'notice_advocate_signature' } });
      }
      await tx.draftReview.create({
        data: { draft_id: draftId, reviewer_id: actor.id, reviewer_role: 'client', decision, comment, sections: changes?.sections ?? [], attachment_document_id: changes?.attachment_document_id ?? null, ...(approval ? { created_at: approval.approvedAt } : {}) },
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
      if (await tx.noticeLifecycle.findUnique({where: {case_id: id}})) throw new ConflictException('Legalitt admin dispatches this notice. Open its dispatch status.');
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
      if (await tx.noticeLifecycle.findUnique({where: {case_id: id}})) throw new ConflictException('Confirm each selected method through the Legal Notice delivery panel.');
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

/** Service orchestration holds the case lock and validates the current revision.
 * Only these role/edge pairs can write the Legal Notice admin lifecycle. */
export async function writeNoticeFlowState(tx: Prisma.TransactionClient, actor: CaseActor, id: string,
  change: {status: import('../generated/prisma/client').Case['status']; sub_status: string | null; notice_document_id?: string}, type: string, payload: Prisma.InputJsonObject = {}) {
  const before = await lockedNoticeCase(tx, actor, id);
  const same = change.status === before.status;
  const allowed = actor.role === 'admin' && (
    (same && ['approved', 'dispatching', 'dispatched'].includes(before.status)) ||
    (['approved', 'dispatching'].includes(before.status) && ['changes_requested', 'dispatched'].includes(change.status)) ||
    (before.status === 'dispatched' && change.status === 'completed')) ||
    actor.role === 'advocate' && ((same&&before.status==='approved'&&((['notice_advocate_signature','notice_advocate_ready_to_submit'].includes(before.sub_status??'')&&change.sub_status==='notice_advocate_ready_to_submit')||(before.sub_status==='notice_advocate_ready_to_submit'&&['notice_admin_address_check','notice_admin_notice_check'].includes(change.sub_status??'')))) || (before.status === 'in_progress' && before.sub_status === 'notice_admin_advocate_correction' && change.status === 'approved') ||
      (same && ['approved', 'dispatching'].includes(before.status) && before.sub_status === 'notice_admin_awaiting_test_esign' && change.sub_status === 'notice_admin_ready_for_dispatch'));
  if (!allowed) throw new ConflictException('This notice has moved on. Refresh before continuing.');
  const updated = await tx.case.update({where: {id}, data: {...change, updated_at: new Date(), ...(change.status === 'completed' ? {completed_at: new Date()} : {})}});
  await appendCaseEvent(tx, {case_id: id, type, actor_id: actor.id, actor_role: actor.role, source: actor.source ?? 'real', from_status: before.status, to_status: change.status, payload});
  return updated;
}

export async function writeNoticeFiling(tx: Prisma.TransactionClient, actor: CaseActor, id: string, value: NoticeFiling) {
  const before = await lockedNoticeCase(tx, actor, id);
  if (actor.role !== 'client') throw new ForbiddenException('Only the client edits intake.');
  if (before.status !== 'draft') throw new ConflictException('This filing has already been submitted.');
  const filing = parse(NoticeFilingSchema, value);
  await tx.noticeLifecycle.updateMany({where:{case_id:id,handed_to_admin_at:null},data:{contacts:filing.noticee,revision:{increment:1}}});
  const party = await tx.caseParty.findFirst({where: {case_id: id, kind: 'sender'}});
  const values = {name: filing.client.fullName ?? '', details: filing.client};
  if (party) await tx.caseParty.update({where: {id: party.id}, data: values});
  else await tx.caseParty.create({data: {case_id: id, kind: 'sender', ...values}});
  return tx.case.update({where: {id}, data: {details: {...filing,client:{...((before.details as {client?:object}).client??{}),...filing.client}}, subject_matter: filing.narrative ?? null, matter_type: noticeMatterType(filing.issueType), updated_at: new Date()}});
}

/** Consultation orchestration validates action, role and revision under this same
 * lock. Keep private notes/review reasons in their own tables, never in events. */
/** D-12/D-13/D-14: the only writer of cancellation outcomes. Any service, any
 *  in-flight sub-status (FIR/report reviews included) is closed here, with
 *  case_events rows in the caller's locked transaction. The cancellation service
 *  decides eligibility; this writer only refuses states nobody may cancel. */
export async function writeCaseCancelled(tx:Prisma.TransactionClient,actor:CaseActor,id:string,
  input:{refunded:boolean;payload:Prisma.InputJsonObject}) {
  const before=await lockedCase(tx,actor,id);
  if(['dispatching','dispatched','completed','cancelled','refunded'].includes(before.status))throw new ConflictException('This case can no longer be cancelled.');
  if(actor.role==='advocate')throw new ForbiddenException('Advocates cannot cancel cases');
  const now=new Date();
  await tx.case.update({where:{id},data:{status:'cancelled',sub_status:null,updated_at:now}});
  await appendCaseEvent(tx,{case_id:id,type:'case_cancelled',actor_id:actor.id,actor_role:actor.role,from_status:before.status,to_status:'cancelled',payload:input.payload});
  if(!input.refunded)return tx.case.findUniqueOrThrow({where:{id}});
  const updated=await tx.case.update({where:{id},data:{status:'refunded',updated_at:new Date(now.getTime()+1)}});
  await appendCaseEvent(tx,{case_id:id,type:'refund_recorded',actor_id:actor.id,actor_role:actor.role,source:'simulated',from_status:'cancelled',to_status:'refunded',payload:input.payload});
  return updated;
}

export async function writeConsultationCase(tx:Prisma.TransactionClient,actor:CaseActor,id:string,
  data:Pick<Prisma.CaseUncheckedUpdateInput,'status'|'sub_status'|'title'|'details'|'matter_type'|'pricing_id'|'completed_at'>,
  type:string,payload:Prisma.InputJsonObject={}) {
  const before=await lockedCase(tx,actor,id);
  if(!isConsultationService(before.service_code))throw new NotFoundException('Case not found');
  const updated=await tx.case.update({where:{id},data:{...data,updated_at:new Date()}});
  await appendCaseEvent(tx,{case_id:id,type,actor_id:actor.id,actor_role:actor.role,from_status:before.status,to_status:updated.status,payload});
  return updated;
}

/** Court representation owns its versioned workspace, but case/event mutations
 * remain here with the other service writers. Callers hold the same case lock. */
export async function createCourtRepresentationCase(tx:Prisma.TransactionClient,actor:CaseActor,
 data:{reference:string;service_code:'district_court'|'high_court';tier:string;details:Prisma.InputJsonValue}){
 if(actor.role!=='client')throw new ForbiddenException('Only clients create cases');
 if(!await tx.service.findFirst({where:{code:data.service_code,active:true}}))throw new BadRequestException('Service is not available');
 const record=await tx.case.create({data:{...data,client_id:actor.id,sub_status:'court_draft'}});
 await appendCaseEvent(tx,{case_id:record.id,type:'court_request_created',actor_id:actor.id,actor_role:actor.role,to_status:'draft',payload:{workflow_version:3}});
 return record;
}
export async function writeCourtRepresentationCase(tx:Prisma.TransactionClient,actor:CaseActor,id:string,data:Prisma.CaseUncheckedUpdateInput,type:string,payload:Prisma.InputJsonObject={}){
 const before=await lockedCase(tx,actor,id);
 if(!['district_court','high_court'].includes(before.service_code)||!await tx.courtWorkspace.findUnique({where:{case_id:id}}))throw new NotFoundException('Court representation case not found');
 const updated=await tx.case.update({where:{id},data:{...data,updated_at:new Date()}});
 await appendCaseEvent(tx,{case_id:id,type,actor_id:actor.id,actor_role:actor.role,from_status:before.status,to_status:updated.status,payload});
 return updated;
}

// FIR uses the same sole case/event writer. Service orchestration handles the
// PDF, draft/review records and notifications inside these locked transactions.
export async function writeFirReviewState(tx:Prisma.TransactionClient,actor:CaseActor,id:string,data:Pick<Prisma.CaseUncheckedUpdateInput,'status'|'sub_status'|'advocate_id'|'completed_at'|'updated_at'>){
  await lockedCase(tx,actor,id,'fir_draft');
  if(actor.role!=='admin'&&(data.status!==undefined||data.advocate_id!==undefined||data.completed_at!==undefined))throw new ForbiddenException('Admin lifecycle action required');
  return tx.case.update({where:{id},data});
}
// docs/flows/FIR-DRAFT-FLOW.md transitions that sit outside the admin review
// writer. Each (role, from, to) pair is listed explicitly; nothing else passes.
// There is no police-submission step (Q119, Q120): client approval completes the case.
const FIR_FLOW_MOVES: {role: CaseActor['role']; from: string; to: string}[] = [
  {role: 'admin', from: 'in_progress', to: 'client_review'},        // admin approves → sent to client
  {role: 'client', from: 'client_review', to: 'completed'},         // client approves → completed
  {role: 'client', from: 'client_review', to: 'changes_requested'}, // client asks for changes
  {role: 'advocate', from: 'assigned', to: 'advocate_declined'},    // advocate rejects → returns to admin
];
export async function writeFirFlowTransition(tx:Prisma.TransactionClient,actor:CaseActor,id:string,
  move:{to:string;sub_status:string|null;advocate_id?:null},type:string,payload:Prisma.InputJsonObject={}){
  const before=await lockedCase(tx,actor,id,'fir_draft');
  if(!FIR_FLOW_MOVES.some(m=>m.role===actor.role&&m.from===before.status&&m.to===move.to))throw new ConflictException('This FIR request has moved on. Reload and try again.');
  const now=new Date();
  const updated=await tx.case.update({where:{id},data:{status:move.to as CaseStatus,sub_status:move.sub_status,updated_at:now,
    ...(move.to==='completed'?{completed_at:now}:{}),...(move.advocate_id===null?{advocate_id:null}:{})}});
  await appendCaseEvent(tx,{case_id:id,type,actor_id:actor.id,actor_role:actor.role,from_status:before.status,to_status:move.to as CaseStatus,payload});
  return updated;
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
  // A revision answering the client's change request keeps that marker until it is sent (C10).
  const sub=correction??(record.sub_status===FIR_CLIENT_CHANGES?FIR_CLIENT_CHANGES:null);
  await tx.case.update({where:{id},data:{status,sub_status:sub,updated_at:new Date()}});
  return appendCaseEvent(tx,{case_id:id,type:'fir_draft_saved',actor_id:actor.id,actor_role:actor.role,from_status:record.status,to_status:status,payload:{draft_id:draft.id,version:draft.version}});
}
export async function writeFirSubmitted(tx: Prisma.TransactionClient,actor: CaseActor,id:string,payload:{draft_id:string;version:number;document_id:string}) {
  const record=await lockedCase(tx,actor,id,'fir_draft');
  if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
  if(record.status!=='in_progress'||record.sub_status===FIR_AWAITING_APPROVAL)throw new ConflictException('Only one draft may await admin approval');
  const latest=await tx.draft.findFirst({where:{case_id:id,kind:'fir_proforma'},orderBy:{version:'desc'}});
  if(latest?.id!==payload.draft_id||latest.document_id!==payload.document_id)throw new ConflictException('Refresh to use the submitted version');
  const {life,assignment}=await ensureFirLifecycle(tx,record);if(!assignment)throw new ConflictException('Assignment required');
  // Q114: no identity document is submitted or reviewed; an older outstanding identity return blocks nothing.
  const sub=await tx.firSubmission.create({data:{case_id:id,assignment_id:assignment.id,draft_id:latest.id,version:latest.version,document_id:payload.document_id,identity_document_id:null,supersedes_submission_id:life.current_submission_id}});
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

const developmentSeedSender = (sender: NoticeSenderFields) => ({
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

// Report-service state writers share this canonical ownership boundary.
export async function writeNoticeReassignment(tx:Prisma.TransactionClient,actor:CaseActor,id:string,advocateId:string,reason:string,revision:number){
  if(actor.role!=='admin')throw new ForbiddenException('Admin reassignment required');
  const c=await lockedNoticeCase(tx,actor,id),life=await ensureNoticeLifecycle(tx,c);
  if(life.revision!==revision)throw new ConflictException('This case changed. Refresh before reassigning.');
  if(life.handed_to_admin_at||!life.deadline_at||life.deadline_at>new Date()||!['assigned','advocate_accepted','in_progress','changes_requested'].includes(c.status))throw new ConflictException('Reassignment here is available only for overdue advocate work before client approval.');
  if(c.advocate_id===advocateId)throw new BadRequestException('Choose a different advocate.');
  const advocate=await tx.user.findFirst({where:{id:advocateId,role:'advocate',status:'active',advocate_profiles_user_id_relations:{is:{verification:'approved'}}},include:{advocate_profiles_user_id_relations:true}});
  if(!advocate?.advocate_profiles_user_id_relations?.city?.trim())throw new BadRequestException('Choose an active approved advocate with a city on their profile.');
  await tx.caseAssignment.updateMany({where:{case_id:id,ended_at:null},data:{ended_at:new Date(),end_reason:reason}});
  await tx.caseAssignment.create({data:{case_id:id,advocate_id:advocateId,assigned_by:actor.id}});
  const updated=await tx.case.update({where:{id},data:{advocate_id:advocateId,status:'assigned',sub_status:null,updated_at:new Date()}});
  await tx.noticeLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
  await appendCaseEvent(tx,{case_id:id,actor_id:actor.id,actor_role:'admin',type:'notice_admin_reassigned',from_status:c.status,to_status:'assigned',payload:{previous_advocate_id:c.advocate_id,advocate_id:advocateId,reason}});
  return {record:updated,previous_advocate_id:c.advocate_id};
}

type ReportSubmission = {draft_id: string; version: number; document_ids: string[]};

/** Overdue report reassignment retains every author's work and assignment history. */
export async function writeReportReassignment(tx:Prisma.TransactionClient,actor:CaseActor,id:string,advocateId:string,reason:string){
 if(actor.role!=='admin')throw new ForbiddenException('Admin required');const c=await lockedCase(tx,actor,id);
 if(!['property_search','document_forensic'].includes(c.service_code)||!['assigned','advocate_accepted','in_progress'].includes(c.status)||c.sub_status==='awaiting_admin_approval')throw new ConflictException('This report cannot be reassigned now.');
 const now=new Date();await tx.caseAssignment.updateMany({where:{case_id:id,ended_at:null},data:{ended_at:now,end_reason:reason}});await tx.caseAssignment.create({data:{case_id:id,advocate_id:advocateId,assigned_by:actor.id}});
 return tx.case.update({where:{id},data:{advocate_id:advocateId,status:'assigned',sub_status:null,updated_at:now}});
}

/** Requested client corrections preserve the original paid filing and tariff. */
export async function writeReportCorrection(tx:Prisma.TransactionClient,actor:CaseActor,id:string,details:Prisma.InputJsonObject,taskId:string){
 const c=await lockedCase(tx,actor,id);
 if(actor.role!=='client'||!['property_search','document_forensic'].includes(c.service_code))throw new ForbiddenException('Case client required');
 if(['draft','submitted','payment_pending','completed','cancelled','refunded'].includes(c.status))throw new ConflictException('This request is not awaiting a paid intake correction');
 const workflow=await tx.reportWorkflow.findUnique({where:{case_id:id}});
 const tasks=(workflow?.data as {tasks?:{id:string;kind:string;status:string}[]}|undefined)?.tasks;
 if(!tasks?.some(t=>t.id===taskId&&t.kind==='details'&&t.status==='requested'))throw new ConflictException('No matching request for corrected details');
 const updated=await tx.case.update({where:{id},data:{details,updated_at:new Date(Math.max(Date.now(),c.updated_at.getTime()+1))}});
 await appendCaseEvent(tx,{case_id:id,type:'report_intake_corrected',actor_id:actor.id,actor_role:'client',from_status:c.status,to_status:c.status,payload:{task_id:taskId,previous_details:c.details}});
 return updated;
}

export async function writeReportSaved(tx: Prisma.TransactionClient, actor: CaseActor, id: string, service: ReportServiceCode,
  draft: {id: string; version: number}) {
  const record = await lockedCase(tx, actor, id, service);
  if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
  if (record.status !== 'in_progress' && !await reportCorrectionAllowed(tx,record) || record.sub_status === REPORT_AWAITING_APPROVAL)
    throw new ConflictException('The submitted report is frozen while awaiting admin review.');
  return appendCaseEvent(tx, {case_id: id, type: 'service_report_saved', actor_id: actor.id, actor_role: actor.role,
    from_status: record.status, to_status: record.status, payload: {draft_id: draft.id, version: draft.version}});
}

export async function writeReportSubmitted(tx: Prisma.TransactionClient, actor: CaseActor, id: string, service: ReportServiceCode,
  payload: ReportSubmission) {
  const record = await lockedCase(tx, actor, id, service);
  if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
  if (record.status !== 'in_progress' && !await reportCorrectionAllowed(tx,record) || record.sub_status === REPORT_AWAITING_APPROVAL)
    throw new ConflictException('Only one report version may await admin review.');
  const updated = await tx.case.update({where: {id}, data: {status:'in_progress',sub_status: REPORT_AWAITING_APPROVAL, updated_at: new Date()}});
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
  payload: ReportSubmission & {note: string}, now: Date, viaApproval: boolean) {
  const record = await lockedCase(tx, actor, id, service);
  if (viaApproval) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin approval required');
    if (record.status !== 'in_progress' || record.sub_status !== REPORT_AWAITING_APPROVAL)
      throw new ConflictException('This case is not awaiting admin review');
    await appendCaseEvent(tx, {case_id: id, type: 'service_report_approved', actor_id: actor.id, actor_role: 'admin',
      from_status: 'in_progress', to_status: 'approved', payload: {draft_id: payload.draft_id, version: payload.version, document_ids: payload.document_ids}});
  } else {
    if (actor.role !== 'advocate') throw new ForbiddenException('Assigned advocate required');
    if (record.status !== 'in_progress' && !await reportCorrectionAllowed(tx,record) || record.sub_status) throw new ConflictException('This report cannot be sent in the current state');
  }
  const correction=!!record.completed_at;
  const updated = await tx.case.update({where: {id}, data: {status: 'completed', sub_status: null, completed_at: correction?record.completed_at:now, updated_at: now}});
  if(correction){const w=await ensureReportWorkflow(tx,record);await tx.reportWorkflow.update({where:{case_id:id},data:{revision:{increment:1},data:{...w.data,correction_open:false} as Prisma.InputJsonObject}});}
  await appendCaseEvent(tx, {case_id: id, type: 'service_report_released', actor_id: actor.id, actor_role: actor.role,
    from_status: correction?'completed':viaApproval ? 'approved' : 'in_progress', to_status: 'completed', created_at: now,
    payload: {draft_id: payload.draft_id, version: payload.version, document_ids: payload.document_ids, note: payload.note}});
  return updated;
}

export async function writeReportIntake(tx:Prisma.TransactionClient,actor:CaseActor,id:string,data:Pick<Prisma.CaseUncheckedUpdateInput,'details'|'tier'|'matter_type'>){
 const record=await lockedCase(tx,actor,id);
 if(!isReportService(record.service_code))throw new NotFoundException('Case not found');
 if(actor.role!=='client')throw new ForbiddenException('Case client required');
 if(record.status!=='draft')throw new ConflictException('Submitted requests cannot be edited');
 return tx.case.update({where:{id},data:{...data,updated_at:new Date(Math.max(Date.now(),record.updated_at.getTime()+1))}});
}
