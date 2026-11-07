import { appendCaseEvent, lockedNoticeCase } from '../cases/case-state-machine';
import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma.service';
import { CaseStateMachine } from '../cases/case-state-machine';
import { type CaseActor } from '../cases/case-access';
import { parse } from '../auth/auth.service';
import { PAYMENTS, type PaymentsPort } from './payments.port';
import { NOTIFICATIONS, type NotificationsPort } from '../notifications/notifications.port';
const request = z.strictObject({case_id: z.uuid(), purpose: z.enum(['service_fee','courier'])});
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly state: CaseStateMachine,
    @Inject(PAYMENTS) private readonly gateway: PaymentsPort,
    @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  async intent(actor: CaseActor, body: unknown, key: unknown) {
    const input = parse(request, body);
    const idempotencyKey = parse(z.string().min(1).max(200), key);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      // Serialise both retries and distinct keys for the same case before capture.
      const record = await lockedNoticeCase(tx, actor, input.case_id);
      if ((input.purpose === 'service_fee' && (actor.role !== 'client' || actor.id !== record.client_id)) ||
          (input.purpose === 'courier' && (actor.role !== 'advocate' || actor.id !== record.advocate_id)))
        throw new ForbiddenException('Only the payer may make this payment');
      const prior = await tx.payment.findUnique({where: {idempotency_key: idempotencyKey}});
      if (prior) {
        if (prior.case_id !== record.id || prior.payer_id !== actor.id || prior.purpose !== input.purpose) throw new ConflictException('Idempotency key already used');
        return prior;
      }
      if (input.purpose === 'service_fee' ? record.status !== 'payment_pending' : !['approved','dispatching'].includes(record.status))
        throw new ConflictException('Payment is not available at this case stage');
      const captured = await tx.payment.findFirst({where: {case_id: record.id, purpose: input.purpose, status: 'captured'}});
      if (captured) throw new ConflictException('This payment has already been captured');
      const now = new Date();
      const prices = await tx.servicePricing.findMany({where: {service_code: input.purpose === 'courier' ? 'courier' : 'legal_notice', effective_from: {lte: now}, OR: [{effective_to: null}, {effective_to: {gt: now}}]}, orderBy: [{effective_from: 'desc'}, {id: 'asc'}]});
      const base = input.purpose === 'courier' ? prices.find(p => !p.tier && !p.variant) : prices.find(p => p.id === record.pricing_id);
      if (!base) throw new ConflictException('Case pricing is unavailable');
      const rows = input.purpose === 'courier' ? [base] : [base, ...['platform_fee','delivery_fee'].map(variant => prices.find(p => p.variant === variant))];
      if (rows.some(p => !p)) throw new ConflictException('Case fee breakdown is unavailable');
      let basePaise = 0n, gstPaise = 0n;
      for (const p of rows) {
        basePaise += p!.base_amount_paise;
        // Integer paise only; half-up at the paise boundary, never whole rupees.
        gstPaise += (p!.base_amount_paise * BigInt(p!.gst_bps) + 5000n) / 10000n;
      }
      const capture = await this.gateway.capture({idempotencyKey, totalPaise: basePaise + gstPaise});
      const payment = await tx.payment.create({data: {case_id: record.id, payer_id: actor.id, purpose: input.purpose, base_amount_paise: basePaise, gst_paise: gstPaise, total_paise: basePaise + gstPaise, status: 'captured', rzp_payment_id: capture.paymentId, idempotency_key: idempotencyKey, simulated: capture.simulated, captured_at: now}});
      if (input.purpose === 'service_fee') await this.state.paymentCaptured(tx, actor, record, payment.id, capture.source);
      else await appendCaseEvent(tx, {case_id: record.id, type: 'courier_payment_captured', actor_id: actor.id, actor_role: actor.role, source: capture.source, from_status: record.status, to_status: record.status, payload: {payment_id: payment.id}});
      // Title already drawn by Notice success (30/198), not invented notification copy.
      await this.notifications.send(tx, {user_id: actor.id, case_id: record.id, kind: 'payment_captured', title: 'Payment Successful'});
      return payment;
    }, {timeout: 15000});
  }
}
