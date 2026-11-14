import {ConflictException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {LegalAdviceConfigSchema,AdviceIntakeSchema,legalAdviceSlotAllowed} from '@legalitt/shared';
import {parse} from '../auth/auth.service';
import {PrismaService} from '../prisma.service';
import type {CaseActor} from '../cases/case-access';
import {writeConsultationCase} from '../cases/case-state-machine';
import {PAYMENTS,type PaymentsPort} from '../payments/payments.port';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {activeAt,newest,quoteDocuments,blockedQuote,type QuoteSnapshot} from '../payments/price-quotes';
import {calculateQuote} from '../payments/quote-math';
import {adviceLocked,adviceRole,adviceJson,adviceTariff} from './legal-advice-rules';
@Injectable()
export class LegalAdvicePayments {
 constructor(private readonly prisma:PrismaService,@Inject(PAYMENTS) private readonly gateway:PaymentsPort,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
 async quote(actor:CaseActor,id:string,body:unknown){
  adviceRole(actor,'client');const {purpose}=parse(z.strictObject({purpose:z.enum(['service_fee','written_advice'])}),body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{
   const {c,b,data,config}=await adviceLocked(tx,actor,id);
   if(purpose==='service_fee'&&b.phase!=='payment_pending'||purpose==='written_advice'&&(!['completed','summary_submitted'].includes(b.phase)||data.written?.status==='delivered'))throw new ConflictException('This payment is unavailable at the current step.');
   const tariff=purpose==='service_fee'?await tx.servicePricing.findUniqueOrThrow({where:{id:c.pricing_id!}}):await adviceTariff(tx,b.policy_id,config,b.tier_code,b.mode,true);
   const fee=await tx.feePolicy.findUniqueOrThrow({where:{id:tariff.fee_policy_id!},include:{page_overage_policy:true}}),commission=await tx.commissionRate.findFirst({where:{service_code:'legal_advice',confirmed:true,...activeAt(new Date())},orderBy:newest});
   if(!commission||fee.delivery_pricing_id||fee.base_represents!=='advocate_share'||fee.gst_basis!=='base_plus_platform')throw new ConflictException('The consultation fee policy needs review. Contact support.');
   const docs=await quoteDocuments(tx,id,true);if(docs.unresolved.length)return blockedQuote('document_pages_unresolved','Finish or remove the incomplete uploads before paying.',docs.unresolved);
   const page=fee.page_overage_policy;
   const breakdown=calculateQuote({base:tariff.base_amount_paise,commissionBps:commission.rate_bps,gstBps:tariff.gst_bps,delivery:0n,pages:purpose==='service_fee'?docs.pages:0,includedPages:page.included_pages,pagePrice:page.unit_amount_paise,pageGstBps:page.gst_bps});
   const quote=await tx.casePriceQuote.create({data:{case_id:id,purpose,pricing_id:tariff.id,fee_policy_id:fee.id,commission_rate_id:commission.id,page_overage_policy_id:page.id,document_fingerprint:docs.fingerprint,snapshot:adviceJson({breakdown,documents:docs.snapshot,rules:{policy_id:b.policy_id,revision:b.revision,mode:b.mode,tier:b.tier_code,advocate_id:b.chosen_advocate_id,scheduled_at:b.requested_at,tariff,fee,commission,page}})}});
   return {status:'ready',id:quote.id,breakdown,simulated:true};
  });
 }
 async pay(actor:CaseActor,id:string,body:unknown){
  adviceRole(actor,'client');const input=parse(z.strictObject({quote_id:z.uuid(),idempotency_key:z.string().min(1).max(200),confirmed_test:z.literal(true)}),body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{
   const {c,b,data,config}=await adviceLocked(tx,actor,id);
   const prior=await tx.payment.findUnique({where:{idempotency_key:input.idempotency_key}});if(prior){if(prior.case_id!==id||prior.payer_id!==actor.id||prior.quote_id!==input.quote_id)throw new ConflictException('Payment key already used.');return prior;}
   const q=await tx.casePriceQuote.findFirst({where:{id:input.quote_id,case_id:id,purpose:{in:['service_fee','written_advice']}}});if(!q)throw new NotFoundException('Quote not found');
   if(await tx.payment.findFirst({where:{case_id:id,purpose:q.purpose,status:'captured'}}))throw new ConflictException('This payment is already complete.');
   const snapshot=q.snapshot as unknown as QuoteSnapshot&{rules:{revision:number}},docs=await quoteDocuments(tx,id,true);
   if(snapshot.rules.revision!==b.revision||docs.unresolved.length||docs.fingerprint!==q.document_fingerprint)throw new ConflictException('Your booking or documents changed. Review the updated price.');
   if(q.purpose==='service_fee'&&b.phase!=='payment_pending'||q.purpose==='written_advice'&&!['completed','summary_submitted'].includes(b.phase))throw new ConflictException('This payment is not available.');
   if(q.purpose==='service_fee'&&(!b.requested_at||!legalAdviceSlotAllowed(b.requested_at.getTime(),config,Date.now())))throw new ConflictException('Your requested slot is too close or has passed. Choose a new time, review and pay. Nothing has been charged.');
   const total=BigInt(snapshot.breakdown.total_paise),gst=BigInt(snapshot.breakdown.gst_paise)+BigInt(snapshot.breakdown.page_overage_gst_paise);
   const capture=await this.gateway.capture({idempotencyKey:input.idempotency_key,totalPaise:total});
   const payment=await tx.payment.create({data:{case_id:id,payer_id:actor.id,purpose:q.purpose,quote_id:q.id,base_amount_paise:total-gst,gst_paise:gst,total_paise:total,status:'captured',simulated:capture.simulated,rzp_payment_id:capture.paymentId,idempotency_key:input.idempotency_key,captured_at:new Date()}});
   if(q.purpose==='service_fee'){
    const intake=AdviceIntakeSchema.parse(data.intake);
    await tx.legalAdviceInvitation.create({data:{case_id:id,advocate_id:b.chosen_advocate_id,assigned_by:actor.id,expires_at:new Date(Date.now()+config.acceptance_minutes*60000)}});
    await tx.legalAdviceBooking.update({where:{case_id:id},data:{phase:'pending_acceptance',pricing_snapshot:adviceJson(q.snapshot),revision:{increment:1},updated_at:new Date()}});
    await writeConsultationCase(tx,actor,id,{status:'paid',sub_status:'legal_advice_pending_acceptance',details:adviceJson(intake)},'legal_advice_paid',{payment_id:payment.id});
    await this.notifications.send(tx,{user_id:b.chosen_advocate_id,kind:'legal_advice_invited',title:'New consultation invitation',body:'Open Legal Advice requests to accept or propose a time.'});
   }else{
    data.written={status:'pending',due_at:new Date(Date.now()+config.written_advice_due_minutes*60000).toISOString()};
    await tx.legalAdviceBooking.update({where:{case_id:id},data:{session:adviceJson(data),revision:{increment:1},updated_at:new Date()}});
    await this.notifications.send(tx,{user_id:b.accepted_advocate_id!,case_id:id,kind:'legal_advice_written_due',title:'Written advice purchased',body:'Prepare and deliver the opinion within the displayed deadline.'});
   }
   await tx.legalAdviceEvent.create({data:{case_id:id,actor_id:actor.id,kind:'payment_captured',visibility:'public',data:{payment_id:payment.id,purpose:q.purpose,simulated:capture.simulated}}});
   return payment;
  },{timeout:30000});
 }
}
