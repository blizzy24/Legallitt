import { appendCaseEvent, lockedCase } from '../cases/case-state-machine';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma.service';
import { CaseStateMachine } from '../cases/case-state-machine';
import { type CaseActor } from '../cases/case-access';
import { parse } from '../auth/auth.service';
import { PAYMENTS, type PaymentsPort } from './payments.port';
import { NOTIFICATIONS, type NotificationsPort } from '../notifications/notifications.port';
import { createPriceQuote, quoteDocuments, type QuoteSnapshot } from './price-quotes';
const request = z.strictObject({case_id: z.uuid(), purpose: z.enum(['service_fee','courier']), quote_id: z.uuid().optional()});
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly state: CaseStateMachine,
    @Inject(PAYMENTS) private readonly gateway: PaymentsPort,
    @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}
  async quote(actor: CaseActor, body: unknown) {
    const {case_id} = parse(z.strictObject({case_id: z.uuid()}), body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const record = await lockedCase(tx, actor, case_id);
      if (!['legal_notice','fir_draft'].includes(record.service_code)) throw new NotFoundException('Case not found');
      if (actor.role !== 'client') throw new ForbiddenException('Only the client may request a payment quote');
      return createPriceQuote(tx, record);
    });
  }
  async intent(actor: CaseActor, body: unknown, key: unknown) {
    const input = parse(request, body);
    const idempotencyKey = parse(z.string().min(1).max(200), key);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      // Serialise both retries and distinct keys for the same case before capture.
      const record = await lockedCase(tx, actor, input.case_id);
      if (!['legal_notice','fir_draft'].includes(record.service_code) || (input.purpose === 'courier' && record.service_code !== 'legal_notice'))
        throw new NotFoundException('Case not found');
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
      if (input.purpose === 'service_fee') {
        let quoteId = input.quote_id;
        if (!quoteId) {
          const tariff = record.pricing_id ? await tx.servicePricing.findUnique({where: {id: record.pricing_id}}) : null;
          if (tariff?.fee_policy_id) throw new ConflictException('Review the price breakdown on Complete Payment before paying. Refresh the app if needed.');
          const legacy = await createPriceQuote(tx, record);
          if (legacy.status !== 'ready') throw new ConflictException(legacy.message);
          quoteId = legacy.id;
        }
        const quote = await tx.casePriceQuote.findFirst({where: {id: quoteId, case_id: record.id}});
        if (!quote || quote.pricing_id !== record.pricing_id)
          throw new ConflictException('This price quote is unavailable. Return to Complete Payment and review the breakdown.');
        const documents = await quoteDocuments(tx, record.id);
        if (documents.unresolved.length || documents.fingerprint !== quote.document_fingerprint)
          throw new ConflictException('Documents changed after this price was calculated. Return to Complete Payment, fix any unfinished uploads and review the updated breakdown before paying.');
        const b = (quote.snapshot as unknown as QuoteSnapshot).breakdown;
        const total = BigInt(b.total_paise), gst = BigInt(b.gst_paise) + BigInt(b.page_overage_gst_paise);
        const capture = await this.gateway.capture({idempotencyKey, totalPaise: total});
        const payment = await tx.payment.create({data: {case_id: record.id, payer_id: actor.id, purpose: input.purpose,
          quote_id: quote.id, base_amount_paise: total - gst, gst_paise: gst, total_paise: total,
          status: 'captured', rzp_payment_id: capture.paymentId, idempotency_key: idempotencyKey,
          simulated: capture.simulated, captured_at: now}});
        await this.state.paymentCaptured(tx, actor, record, payment.id, capture.source);
        await this.notifications.send(tx, {user_id: actor.id, case_id: record.id, kind: 'payment_captured', title: 'Payment Successful'});
        return payment;
      }
      const prices = await tx.servicePricing.findMany({where: {service_code: 'courier', effective_from: {lte: now}, OR: [{effective_to: null}, {effective_to: {gt: now}}]}, orderBy: [{effective_from: 'desc'}, {id: 'asc'}]});
      const base = prices.find(p => !p.tier && !p.variant);
      if (!base) throw new ConflictException('Case pricing is unavailable');
      const rows = [base];
      if (rows.some(p => !p)) throw new ConflictException('Case fee breakdown is unavailable');
      let basePaise = 0n, gstPaise = 0n;
      for (const p of rows) {
        basePaise += p!.base_amount_paise;
        // Integer paise only; half-up at the paise boundary, never whole rupees.
        gstPaise += (p!.base_amount_paise * BigInt(p!.gst_bps) + 5000n) / 10000n;
      }
      const capture = await this.gateway.capture({idempotencyKey, totalPaise: basePaise + gstPaise});
      const payment = await tx.payment.create({data: {case_id: record.id, payer_id: actor.id, purpose: input.purpose, base_amount_paise: basePaise, gst_paise: gstPaise, total_paise: basePaise + gstPaise, status: 'captured', rzp_payment_id: capture.paymentId, idempotency_key: idempotencyKey, simulated: capture.simulated, captured_at: now}});
      await appendCaseEvent(tx, {case_id: record.id, type: 'courier_payment_captured', actor_id: actor.id, actor_role: actor.role, source: capture.source, from_status: record.status, to_status: record.status, payload: {payment_id: payment.id}});
      // Title already drawn by Notice success (30/198), not invented notification copy.
      await this.notifications.send(tx, {user_id: actor.id, case_id: record.id, kind: 'payment_captured', title: 'Payment Successful'});
      return payment;
    }, {timeout: 15000});
  }
}
