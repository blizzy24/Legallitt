import {
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
} from "@legalitt/shared";
import { z } from "zod";
import { parse } from "../auth/auth.service";
import { PrismaService } from "../prisma.service";
import type { Prisma } from "../generated/prisma/client";
import { caseScope, type CaseActor } from "./case-access";

export const createCaseSchema = z.strictObject({
  service_code: z.literal("legal_notice"),
  tier: LegalNoticeTierSchema.optional(),
  details: LegalNoticeIntakeSchema.default({}),
});
export const updateCaseSchema = z
  .strictObject({
    tier: LegalNoticeTierSchema.optional(),
    details: LegalNoticeIntakeSchema.optional(),
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
          details: input.details,
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
      return tx.case.update({
        where: { id },
        data: {
          details,
          ...(input.tier ? { tier: input.tier } : {}),
          updated_at: new Date(),
        },
      });
    });
  }

  // Internal domain method, NOT a generic HTTP status endpoint. Later service
  // actions must use this method, never write status through their own Prisma calls.
  async transition(actor: CaseActor, id: string, to: CaseStatus) {
    const db = await this.prisma.getClient();
    return db.$transaction(async (tx) => {
      const record = await lockedCase(tx, actor, id);
      const from = record.status as CaseStatus;
      permit(actor, from, to);
      if (to === CaseStatus.submitted) {
        parse(LegalNoticeSubmissionSchema, record.details);
        parse(LegalNoticeTierSchema, record.tier);
      }
      const updated = await tx.case.update({
        where: { id },
        data: {
          status: to,
          updated_at: new Date(),
          ...(to === CaseStatus.completed ? { completed_at: new Date() } : {}),
        },
      });
      await tx.caseEvent.create({
        data: {
          case_id: id,
          type: "status_changed",
          actor_id: actor.id,
          actor_role: actor.role,
          from_status: from,
          to_status: to,
        },
      });
      return updated;
    });
  }
}
