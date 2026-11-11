import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {
  CANCELLATION_REASONS, CancellationDecisionSchema, CancellationInputSchema, cancellationMode, formatPaise,
  type AdminCancellationRow, type ApiCancellationRequest, type ApiRefund, type CaseCancellation,
} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {lockedCase, writeCaseCancelled} from '../cases/case-state-machine';
import type {CaseActor} from '../cases/case-access';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

type Tx = Prisma.TransactionClient;
const reasonLabel = (code?: string | null) => CANCELLATION_REASONS.find(r => r.code === code)?.label ?? null;
const requestView = (r: {id: string; mode: string; status: string; reason: string | null; note: string | null; status_at_request: string;
  refundable_paise: bigint; refund_amount_paise: bigint | null; decision_reason: string | null; requested_at: Date; decided_at: Date | null}): ApiCancellationRequest => ({
  id: r.id, mode: r.mode as ApiCancellationRequest['mode'], status: r.status as ApiCancellationRequest['status'],
  reason: r.reason, note: r.note, status_at_request: r.status_at_request, refundable_paise: r.refundable_paise.toString(),
  refund_amount_paise: r.refund_amount_paise?.toString() ?? null, decision_reason: r.decision_reason,
  requested_at: r.requested_at.toISOString(), decided_at: r.decided_at?.toISOString() ?? null,
});
const refundView = (r: {id: string; payment_id: string; amount_paise: bigint; reason: string; simulated: boolean; created_at: Date}): ApiRefund => ({
  id: r.id, payment_id: r.payment_id, amount_paise: r.amount_paise.toString(), reason: r.reason, simulated: r.simulated, created_at: r.created_at.toISOString(),
});

/** Captured client payments for this case, minus anything already refunded. */
async function refundable(tx: Tx, caseId: string, clientId: string) {
  const payments = await tx.payment.findMany({where: {case_id: caseId, payer_id: clientId, status: 'captured'}, orderBy: [{captured_at: 'asc'}, {id: 'asc'}]});
  const refunds = await tx.refund.findMany({where: {case_id: caseId}});
  const rows = payments.map(p => ({payment: p, remaining: p.total_paise - refunds.filter(r => r.payment_id === p.id).reduce((s, r) => s + r.amount_paise, 0n)}));
  return {rows, total: rows.reduce((s, r) => s + (r.remaining > 0n ? r.remaining : 0n), 0n)};
}

/** Simulated refund rows, allocated oldest payment first (D-13). */
async function recordRefunds(tx: Tx, caseId: string, clientId: string, amount: bigint, reason: string, requestId: string, decidedBy: string | null) {
  const {rows} = await refundable(tx, caseId, clientId);
  let left = amount;
  const out = [];
  for (const row of rows) {
    if (left <= 0n) break;
    const take = row.remaining < left ? row.remaining : left;
    if (take <= 0n) continue;
    out.push(await tx.refund.create({data: {case_id: caseId, payment_id: row.payment.id, cancellation_request_id: requestId,
      amount_paise: take, reason, decided_by: decidedBy, simulated: true}}));
    left -= take;
  }
  if (left > 0n) throw new ConflictException('The refund is larger than the amount paid.');
  return out;
}

@Injectable()
export class CancellationsService {
  constructor(private readonly prisma: PrismaService, @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}

  private async view(tx: Tx, record: {id: string; reference: string; service_code: string; status: string; client_id: string}): Promise<CaseCancellation> {
    const mode = cancellationMode(record.status as never);
    const [request, refunds, money] = await Promise.all([
      tx.cancellationRequest.findFirst({where: {case_id: record.id}, orderBy: [{requested_at: 'desc'}, {id: 'desc'}]}),
      tx.refund.findMany({where: {case_id: record.id}, orderBy: {created_at: 'asc'}}),
      refundable(tx, record.id, record.client_id),
    ]);
    const message = {
      unpaid: 'Nothing has been paid yet. Cancelling closes this request.',
      self_serve: `No advocate has started work yet. Cancelling is immediate and the full amount paid (${formatPaise(money.total.toString())}) is refunded.`,
      request: 'An advocate has started work. Your cancellation request goes to Legalitt, who decide the refund amount and tell you the reason.',
      closed: 'This work has been delivered or sent, so it can no longer be cancelled. Contact Support if something is wrong.',
      ended: 'This request has been cancelled.',
    }[mode];
    return {case_id: record.id, reference: record.reference, service_code: record.service_code, status: record.status as never, mode,
      refundable_paise: money.total.toString(), message, request: request ? requestView(request) : null, refunds: refunds.map(refundView)};
  }

  /** Client (own case) and admin only. An advocate gets the same 404 as a stranger:
   *  refund amounts and the client's reason are not theirs to see. */
  async read(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      if (actor.role === 'advocate') throw new NotFoundException('Case not found');
      return this.view(tx, await lockedCase(tx, actor, id));
    });
  }

  async cancel(actor: CaseActor, id: string, body: unknown) {
    const input = parse(CancellationInputSchema, body);
    if (actor.role === 'advocate') throw new NotFoundException('Case not found');
    if (actor.role !== 'client') throw new ForbiddenException('Only the client can cancel their request here');
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, id);
      const mode = cancellationMode(record.status as never);
      if (mode === 'closed') throw new ConflictException('This work has been delivered or sent, so it can no longer be cancelled. Contact Support if something is wrong.');
      if (mode === 'ended') throw new ConflictException('This request is already cancelled.');
      if (await tx.cancellationRequest.findFirst({where: {case_id: id, status: 'pending'}}))
        throw new ConflictException('Your cancellation request is already with Legalitt.');
      const money = await refundable(tx, id, record.client_id);
      const base = {case_id: id, client_id: actor.id, reason: input.reason ?? null, note: input.note || null,
        status_at_request: record.status, refundable_paise: money.total};
      if (mode === 'request') {
        await tx.cancellationRequest.create({data: {...base, mode: 'admin_review', status: 'pending'}});
        await tx.caseEvent.create({data: {case_id: id, type: 'cancellation_requested', actor_id: actor.id, actor_role: 'client',
          from_status: record.status, to_status: record.status, payload: {reason: input.reason ?? null}}});
        for (const admin of await tx.user.findMany({where: {role: 'admin', status: 'active'}, select: {id: true}}))
          await this.notifications.send(tx, {user_id: admin.id, case_id: id, kind: 'cancellation_requested', title: 'A client asked to cancel a case', body: record.reference});
        return this.view(tx, await tx.case.findUniqueOrThrow({where: {id}}));
      }
      // unpaid or self-serve: immediate.
      const request = await tx.cancellationRequest.create({data: {...base, mode: 'self_serve', status: 'completed',
        refund_amount_paise: money.total, decision_reason: money.total > 0n ? 'Cancelled before an advocate accepted: full refund.' : null, decided_at: new Date()}});
      const reason = 'Cancelled before an advocate accepted: full refund.';
      const refunds = money.total > 0n ? await recordRefunds(tx, id, record.client_id, money.total, reason, request.id, null) : [];
      await writeCaseCancelled(tx, actor, id, {refunded: refunds.length > 0, payload: {cancellation_request_id: request.id, mode: 'self_serve',
        reason: input.reason ?? null, refund_paise: money.total.toString(), refund_ids: refunds.map(r => r.id), simulated_refund: refunds.length > 0}});
      await this.notifyClosed(tx, record, money.total);
      return this.view(tx, await tx.case.findUniqueOrThrow({where: {id}}));
    });
  }

  private async notifyClosed(tx: Tx, record: {id: string; reference: string; client_id: string; advocate_id: string | null}, refund: bigint) {
    await this.notifications.send(tx, {user_id: record.client_id, case_id: record.id, kind: 'case_cancelled', title: 'Request cancelled',
      body: refund > 0n ? `${record.reference} · Refund of ${formatPaise(refund.toString())} recorded.` : record.reference});
    // D-14: the advocate is released; they learn the case ended, not the client's reason or refund.
    if (record.advocate_id) await this.notifications.send(tx, {user_id: record.advocate_id, case_id: record.id, kind: 'case_cancelled_advocate',
      title: 'A case assigned to you was cancelled', body: `${record.reference} · No further work is needed.`});
  }

  async queue(actor: CaseActor, query: {status?: string}) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');
    const status = query.status === 'decided' ? 'decided' : 'pending';
    const db = await this.prisma.getClient();
    const rows = await db.cancellationRequest.findMany({
      where: status === 'pending' ? {status: 'pending'} : {status: {in: ['approved', 'declined', 'completed']}},
      orderBy: status === 'pending' ? [{requested_at: 'asc'}, {id: 'asc'}] : [{decided_at: 'desc'}, {id: 'desc'}], take: 200});
    const cases = await db.case.findMany({where: {id: {in: rows.map(r => r.case_id)}}, select: {id: true, reference: true, service_code: true, status: true,
      client_id_relation: {select: {id: true, full_name: true}}, advocate_id_relation: {select: {id: true, full_name: true}}}});
    const refunds = await db.refund.findMany({where: {cancellation_request_id: {in: rows.map(r => r.id)}}, orderBy: {created_at: 'asc'}});
    const items: AdminCancellationRow[] = rows.flatMap(r => {
      const c = cases.find(x => x.id === r.case_id);
      if (!c) return [];
      return [{...requestView(r), case_id: c.id, reference: c.reference, service_code: c.service_code, case_status: c.status,
        client: {id: c.client_id_relation.id, name: c.client_id_relation.full_name},
        advocate: c.advocate_id_relation ? {id: c.advocate_id_relation.id, name: c.advocate_id_relation.full_name} : null,
        advocate_entitlement_paise: r.advocate_entitlement_paise?.toString() ?? null,
        refunds: refunds.filter(x => x.cancellation_request_id === r.id).map(refundView)}];
    });
    return {items, status};
  }

  async decide(actor: CaseActor, requestId: string, body: unknown) {
    if (actor.role !== 'admin') throw new ForbiddenException('Admin access required');
    const input = parse(CancellationDecisionSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const found = await tx.cancellationRequest.findUnique({where: {id: requestId}});
      if (!found) throw new NotFoundException('Cancellation request not found');
      const record = await lockedCase(tx, actor, found.case_id);
      const request = await tx.cancellationRequest.findUniqueOrThrow({where: {id: requestId}});
      if (request.status !== 'pending') throw new ConflictException('This request has already been decided. Reload the queue.');
      const now = new Date();
      if (input.decision === 'decline') {
        await tx.cancellationRequest.update({where: {id: requestId}, data: {status: 'declined', decision_reason: input.reason, decided_by: actor.id, decided_at: now}});
        await tx.caseEvent.create({data: {case_id: record.id, type: 'cancellation_declined', actor_id: actor.id, actor_role: 'admin',
          from_status: record.status, to_status: record.status, payload: {cancellation_request_id: requestId, reason: input.reason}}});
        await tx.adminAction.create({data: {admin_id: actor.id, action: 'decline_cancellation', subject_type: 'case', subject_id: record.id, payload: {cancellation_request_id: requestId, reason: input.reason}}});
        await this.notifications.send(tx, {user_id: record.client_id, case_id: record.id, kind: 'cancellation_declined', title: 'Cancellation request declined', body: `${record.reference} · ${input.reason}`});
        return this.view(tx, record);
      }
      if (input.refund_amount_paise === undefined) throw new BadRequestException('Enter the refund amount (0 for no refund).');
      const amount = BigInt(input.refund_amount_paise);
      const money = await refundable(tx, record.id, record.client_id);
      if (amount > money.total) throw new BadRequestException(`The refund cannot exceed the ${formatPaise(money.total.toString())} paid.`);
      const entitlement = input.advocate_entitlement_paise ? BigInt(input.advocate_entitlement_paise) : null;
      await tx.cancellationRequest.update({where: {id: requestId}, data: {status: 'approved', refund_amount_paise: amount, decision_reason: input.reason,
        advocate_entitlement_paise: entitlement, decided_by: actor.id, decided_at: now}});
      const refunds = amount > 0n ? await recordRefunds(tx, record.id, record.client_id, amount, input.reason, requestId, actor.id) : [];
      const full = amount > 0n && amount === money.total;
      await writeCaseCancelled(tx, actor, record.id, {refunded: full, payload: {cancellation_request_id: requestId, mode: 'admin_review',
        refund_paise: amount.toString(), partial: amount > 0n && !full, refund_ids: refunds.map(r => r.id), reason: input.reason,
        advocate_entitlement_paise: entitlement?.toString() ?? null, simulated_refund: refunds.length > 0}});
      await tx.adminAction.create({data: {admin_id: actor.id, action: 'approve_cancellation', subject_type: 'case', subject_id: record.id,
        payload: {cancellation_request_id: requestId, refund_paise: amount.toString(), reason: input.reason, advocate_entitlement_paise: entitlement?.toString() ?? null}}});
      await this.notifyClosed(tx, record, amount);
      return this.view(tx, await tx.case.findUniqueOrThrow({where: {id: record.id}}));
    });
  }
}
export {reasonLabel};
