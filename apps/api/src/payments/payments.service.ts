import { appendCaseEvent, lockedCase } from '../cases/case-state-machine';
import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../prisma.service';
import { CaseStateMachine } from '../cases/case-state-machine';
import { type CaseActor } from '../cases/case-access';
import { parse } from '../auth/auth.service';
import { PAYMENTS, type PaymentsPort } from './payments.port';
import { NOTIFICATIONS, type NotificationsPort } from '../notifications/notifications.port';
import { isReportService } from '@legalitt/shared';
import { createPriceQuote, quoteDocuments, type QuoteSnapshot } from './price-quotes';
import {ensureNoticeLifecycle,NoticeWorkflowPolicySchema,requireNoticeRevision} from '../cases/notice-lifecycle';
const checkoutId=z.string().regex(/^[1-9]\d{0,18}$/).transform(v=>BigInt(v));
const request = z.strictObject({case_id: z.uuid(), purpose: z.enum(['service_fee','courier']), quote_id: z.uuid().optional(), checkout_id: checkoutId.optional()});
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
      if (!['legal_notice','fir_draft'].includes(record.service_code) && !isReportService(record.service_code)) throw new NotFoundException('Case not found');
      if (actor.role !== 'client') throw new ForbiddenException('Only the client may request a payment quote');
      const quote=await createPriceQuote(tx, record);
      return {...quote,simulated:(process.env.PAYMENTS_MODE??'simulated')==='simulated'};
    });
  }
  async intent(actor: CaseActor, body: unknown, key: unknown) {
    const input = parse(request, body);
    const idempotencyKey = parse(z.string().min(1).max(200), key);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      // Serialise both retries and distinct keys for the same case before capture.
      const record = await lockedCase(tx, actor, input.case_id);
      if ((!['legal_notice','fir_draft'].includes(record.service_code) && !isReportService(record.service_code)) || (input.purpose === 'courier' && record.service_code !== 'legal_notice'))
        throw new NotFoundException('Case not found');
      if ((input.purpose === 'service_fee' && (actor.role !== 'client' || actor.id !== record.client_id)) ||
          (input.purpose === 'courier' && (actor.role !== 'advocate' || actor.id !== record.advocate_id)))
        throw new ForbiddenException('Only the payer may make this payment');
      const prior = await tx.payment.findUnique({where: {idempotency_key: idempotencyKey}});
      if (prior) {
        if (prior.case_id !== record.id || prior.payer_id !== actor.id || prior.purpose !== input.purpose) throw new ConflictException('Idempotency key already used');
        return prior;
      }
      if(input.purpose==='courier'&&await tx.noticeLifecycle.findUnique({where:{case_id:record.id}}))throw new ConflictException('Legalitt manages delivery for this notice. There is no advocate courier payment.');
      if(input.checkout_id){
        const checkout=await tx.caseEvent.findFirst({where:{id:input.checkout_id,case_id:record.id,type:'payment_checkout_created',actor_id:actor.id}});
        const details=checkout?.payload as {quote_id?:string;expires_at?:string}|undefined;
        if(!details?.expires_at||details.quote_id!==input.quote_id||new Date(details.expires_at)<=new Date())throw new ConflictException('This payment session expired. Generate a new QR before paying.');
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
  /** Checkout rows are immutable case events. Their database timestamp/expiry,
   * quote and idempotency key survive reloads; browser timers cannot extend them. */
  async checkout(actor:CaseActor,body:unknown){
    const input=parse(z.strictObject({case_id:z.uuid(),quote_id:z.uuid()}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await lockedCase(tx,actor,input.case_id);
      if(actor.role!=='client')throw new ForbiddenException('Only the client can open checkout.');
      if(record.status!=='payment_pending')throw new ConflictException('This case is not awaiting payment.');
      const quote=await tx.casePriceQuote.findFirst({where:{id:input.quote_id,case_id:record.id}});
      if(!quote)throw new NotFoundException('Price quote not found');
      const previous=await tx.caseEvent.findFirst({where:{case_id:record.id,actor_id:actor.id,type:'payment_checkout_created'},orderBy:{created_at:'desc'}});
      const data=previous?.payload as {quote_id?:string;expires_at?:string}|undefined;
      if(previous&&data?.quote_id===quote.id&&data.expires_at&&new Date(data.expires_at)>new Date())return this.checkoutView(previous,quote.snapshot);
      const event=await appendCaseEvent(tx,{case_id:record.id,actor_id:actor.id,actor_role:actor.role,type:'payment_checkout_created',source:'real',payload:{quote_id:quote.id,expires_at:new Date(Date.now()+600000).toISOString()}});
      return this.checkoutView(event,quote.snapshot);
    });
  }
  private checkoutView(event:{id:bigint;payload:unknown},snapshot:unknown,payment?:{status:string;id:string;simulated:boolean}|null){
    const data=event.payload as {quote_id:string;expires_at:string};
    return {id:event.id,...data,server_time:new Date().toISOString(),total_paise:(snapshot as QuoteSnapshot).breakdown.total_paise,status:payment?.status??(new Date(data.expires_at)<=new Date()?'expired':'waiting'),payment_id:payment?.id??null,simulated:payment?.simulated??(process.env.PAYMENTS_MODE??'simulated')==='simulated',test_actions:process.env.ENVIRONMENT==='dev'||process.env.NODE_ENV==='test'};
  }
  async checkoutStatus(actor:CaseActor,id:string){
    const db=await this.prisma.getClient();return db.$transaction(async tx=>{
      const event=await tx.caseEvent.findFirst({where:{id:parse(checkoutId,id),type:'payment_checkout_created',actor_id:actor.id}});
      if(!event)throw new NotFoundException('Payment session not found');await lockedCase(tx,actor,event.case_id);
      const data=event.payload as {quote_id:string},quote=await tx.casePriceQuote.findUniqueOrThrow({where:{id:data.quote_id}});
      const payment=await tx.payment.findFirst({where:{case_id:event.case_id,payer_id:actor.id,purpose:'service_fee',status:'captured'}});
      return this.checkoutView(event,quote.snapshot,payment);
    });
  }
  async simulateCheckout(actor:CaseActor,id:string){
    if(process.env.ENVIRONMENT!=='dev'&&process.env.NODE_ENV!=='test')throw new ForbiddenException('Test payments are available only in development.');
    if((process.env.PAYMENTS_MODE??'simulated')!=='simulated')throw new ForbiddenException('The test action requires a simulated payment adapter.');
    const db=await this.prisma.getClient(),event=await db.caseEvent.findFirst({where:{id:parse(checkoutId,id),type:'payment_checkout_created',actor_id:actor.id}});
    if(!event)throw new NotFoundException('Payment session not found');
    const data=event.payload as {quote_id:string};
    return this.intent(actor,{case_id:event.case_id,purpose:'service_fee',quote_id:data.quote_id,checkout_id:event.id.toString()},`checkout:${event.id}`);
  }
  async noticeCourierRetry(actor:CaseActor,body:unknown){
    const input=parse(z.strictObject({case_id:z.uuid(),attempt_id:z.uuid(),revision:z.number().int().nonnegative(),confirmed:z.literal(true)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedCase(tx,actor,input.case_id);if(c.service_code!=='legal_notice'||actor.role!=='client')throw new ForbiddenException('Only this notice’s client can pay for redelivery.');
      const life=await ensureNoticeLifecycle(tx,c),key=`notice-courier-retry:${input.attempt_id}`;
      const prior=await tx.payment.findUnique({where:{idempotency_key:key}});if(prior&&prior.case_id===c.id&&prior.payer_id===actor.id)return prior;
      requireNoticeRevision(life.revision,input.revision);
      const last=await tx.noticeDelivery.findFirst({where:{case_id:c.id,method:'courier'},orderBy:{attempt:'desc'}});
      if(c.status!=='dispatched'||last?.id!==input.attempt_id||last.status!=='failed')throw new ConflictException('There is no failed courier attempt awaiting payment.');
      const total=BigInt(NoticeWorkflowPolicySchema.parse(life.policy.config).retry_courier_paise),capture=await this.gateway.capture({idempotencyKey:key,totalPaise:total});
      const payment=await tx.payment.create({data:{case_id:c.id,payer_id:actor.id,purpose:'notice_courier_retry',base_amount_paise:total,gst_paise:0n,total_paise:total,status:'captured',rzp_payment_id:capture.paymentId,idempotency_key:key,simulated:capture.simulated,captured_at:new Date()}});
      await tx.noticeLifecycle.update({where:{case_id:c.id},data:{revision:{increment:1}}});
      await appendCaseEvent(tx,{case_id:c.id,actor_id:actor.id,actor_role:actor.role,type:'notice_redelivery_paid',source:capture.source,payload:{attempt_id:last.id,payment_id:payment.id,policy_id:life.policy_id,total_paise:total.toString(),gst_paise:'0'}});
      await this.notifications.send(tx,{user_id:actor.id,case_id:c.id,kind:'payment_captured',title:'Redelivery payment received',body:'Legalitt can arrange another courier attempt after verifying your address.'});return payment;
    },{timeout:15000});
  }
}
