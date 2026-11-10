import {ConflictException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {ConsultationPaymentSchema,CourtQuoteInputSchema,type PaymentQuote} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {writeConsultationCase} from '../cases/case-state-machine';
import {PAYMENTS,type PaymentsPort} from '../payments/payments.port';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {activeAt,newest,quoteDocuments,blockedQuote,type QuoteSnapshot} from '../payments/price-quotes';
import {calculateQuote} from '../payments/quote-math';
import {booking,bump,consultationCase,jsonValue,lockPeople,policy,requireSlot,role,workspace} from './consultation-rules';
import type {Case,Prisma} from '../generated/prisma/client';

@Injectable()
export class ConsultationPayments {
  constructor(private readonly prisma:PrismaService,@Inject(PAYMENTS) private readonly gateway:PaymentsPort,
    @Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
  async offer(actor:CaseActor,id:string,body:unknown){
    role(actor,'advocate');const input=parse(CourtQuoteInputSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id,input.expected_revision);
      if(record.service_code==='legal_advice'||!work.consultation_approved_at||!['court_quote','court_quote_offered'].includes(record.sub_status??''))throw new ConflictException('The consultation brief must be approved before quoting court representation.');
      const old=await tx.courtQuote.findFirst({where:{case_id:id},orderBy:{version:'desc'}});
      if(old?.payment_id)throw new ConflictException('A paid representation quote cannot be changed.');
      const fee=await tx.feePolicy.findFirst({where:{service_code:record.service_code,confirmed:true,...activeAt(new Date())},orderBy:newest});
      const commission=await tx.commissionRate.findFirst({where:{service_code:record.service_code,confirmed:true,...activeAt(new Date())},orderBy:newest});
      const tariff=record.pricing_id?await tx.servicePricing.findUnique({where:{id:record.pricing_id}}):null;
      if(!fee||!commission||!tariff)throw new ConflictException('Confirmed fee and commission policies are required.');
      const session=await booking(tx,id),{config}=await policy(tx,session?.policy_id);
      if(old)await tx.courtQuote.update({where:{id:old.id},data:{status:'superseded'}});
      const quote=await tx.courtQuote.create({data:{case_id:id,advocate_id:actor.id,version:(old?.version??0)+1,base_amount_paise:BigInt(input.base_amount_paise),scope:input.scope,exclusions:input.exclusions,
        fee_policy_id:fee.id,commission_rate_id:commission.id,gst_bps:tariff.gst_bps,supersedes_id:old?.id,expires_at:new Date(Date.now()+config.quote_valid_days*86400_000)}});
      await bump(tx,id,{current_court_quote_id:quote.id});
      await writeConsultationCase(tx,actor,id,{sub_status:'court_quote_offered'},'court_quote_offered',{quote_id:quote.id,version:quote.version});
      await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'court_quote_offered',title:'Your representation quote is ready',body:'Review the scope, exclusions and full fee breakdown before accepting and paying.'});
      return quote;
    });
  }
  async quote(actor:CaseActor,id:string,body:unknown){
    role(actor,'client');const input=parse(z.strictObject({purpose:z.enum(['service_fee','representation']),court_quote_id:z.uuid().optional()}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>this.buildQuote(tx,await consultationCase(tx,actor,id),input.purpose,input.court_quote_id));
  }
  private async buildQuote(tx:Prisma.TransactionClient,record:Case,purpose:'service_fee'|'representation',courtQuoteId?:string):Promise<PaymentQuote>{
    const work=await workspace(tx,record.id),court=purpose==='representation'&&courtQuoteId?await tx.courtQuote.findFirst({where:{id:courtQuoteId,case_id:record.id}}):null;
    const session=purpose==='service_fee'?await booking(tx,record.id):null;
    if(purpose==='service_fee'&&(!session||session.status!=='held'||!session.reserved_until||session.reserved_until<=new Date()))
      return blockedQuote('booking_expired','Your appointment hold expired. Choose an available advocate and time again, then review payment. Nothing has been charged.');
    if(purpose==='service_fee'?record.status!=='payment_pending':record.sub_status!=='court_quote_offered'||!court||court.id!==work.current_court_quote_id||court.status!=='offered'||court.expires_at<=new Date())
      return blockedQuote('quote_unavailable','This price is no longer available. Reload your case and review the current booking or representation quote.');
    const docs=await quoteDocuments(tx,record.id,true);
    if(docs.unresolved.length)return blockedQuote('document_pages_unresolved','Payment is blocked because an upload or PDF page count is incomplete. Finish or remove the listed upload in Documents, then retry.',docs.unresolved);
    const tariff=record.pricing_id?await tx.servicePricing.findUnique({where:{id:record.pricing_id}}):null;
    const feeId=court?.fee_policy_id??tariff?.fee_policy_id;
    const fee=feeId?await tx.feePolicy.findUnique({where:{id:feeId},include:{page_overage_policy:true}}):null;
    const previous=await tx.casePriceQuote.findFirst({where:{case_id:record.id,purpose,court_quote_id:court?.id??null},orderBy:{created_at:'desc'}});
    const commissionId=court?.commission_rate_id??previous?.commission_rate_id;
    const commission=commissionId?await tx.commissionRate.findUnique({where:{id:commissionId}}):await tx.commissionRate.findFirst({where:{service_code:record.service_code,confirmed:true,...activeAt(new Date())},orderBy:newest});
    if(!fee||!commission||!tariff)return blockedQuote('pricing_unavailable','The confirmed price breakdown is unavailable. Contact support before paying.');
    if(fee.base_represents!=='advocate_share'||fee.platform_calculation!=='commission_gross_up'||fee.gst_basis!=='base_plus_platform'||fee.rounding!=='half_up_paise'||fee.delivery_pricing_id)
      return blockedQuote('policy_unavailable','The service fee rules need review. Contact support before paying.');
    if(previous?.document_fingerprint===docs.fingerprint&&(!session||(previous.snapshot as {rules?:{booking_revision?:number}}).rules?.booking_revision===session.revision))return {status:'ready',id:previous.id,breakdown:(previous.snapshot as unknown as QuoteSnapshot).breakdown};
    const page=fee.page_overage_policy;
    const paid=await tx.payment.findMany({where:{case_id:record.id,status:'captured'},include:{quote:true}});
    const alreadyCharged=paid.reduce((sum,p)=>sum+((p.quote?.snapshot as unknown as QuoteSnapshot)?.breakdown.charged_pages??0),0);
    const breakdown=calculateQuote({base:court?.base_amount_paise??tariff.base_amount_paise,commissionBps:commission.rate_bps,gstBps:court?.gst_bps??tariff.gst_bps,delivery:0n,
      pages:docs.pages,includedPages:page.included_pages+alreadyCharged,pagePrice:page.unit_amount_paise,pageGstBps:page.gst_bps});
    const quote=await tx.casePriceQuote.create({data:{case_id:record.id,purpose,pricing_id:court?null:tariff.id,court_quote_id:court?.id,commission_rate_id:commission.id,fee_policy_id:fee.id,page_overage_policy_id:page.id,document_fingerprint:docs.fingerprint,
      snapshot:jsonValue({breakdown,documents:docs.snapshot,rules:{fee,commission,page,tariff:court?null:tariff,court_quote:court,already_charged_pages:alreadyCharged,booking_revision:session?.revision,booking:session?{advocate_id:session.advocate_id,scheduled_at:session.scheduled_at,duration_min:session.duration_min}:null}})}});
    return {status:'ready',id:quote.id,breakdown};
  }
  async pay(actor:CaseActor,id:string,body:unknown,key:unknown){
    role(actor,'client');const input=parse(ConsultationPaymentSchema,body),idempotencyKey=parse(z.string().min(1).max(200),key),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id);
      const prior=await tx.payment.findUnique({where:{idempotency_key:idempotencyKey}});
      if(prior){if(prior.case_id!==id||prior.payer_id!==actor.id||prior.purpose!==input.purpose||prior.quote_id!==input.quote_id)throw new ConflictException('Idempotency key already used');return prior;}
      if(await tx.payment.findFirst({where:{case_id:id,purpose:input.purpose,status:'captured'}}))throw new ConflictException('This payment has already been captured.');
      const quote=await tx.casePriceQuote.findFirst({where:{id:input.quote_id,case_id:id,purpose:input.purpose}});
      if(!quote)throw new NotFoundException('Payment quote not found');
      const docs=await quoteDocuments(tx,id,true);
      if(docs.unresolved.length||docs.fingerprint!==quote.document_fingerprint)throw new ConflictException('Documents changed. Review the updated fee breakdown before paying.');
      if(input.purpose==='service_fee'){
        const session=await booking(tx,id);
        if(record.status!=='payment_pending'||!session?.advocate_id||session.status!=='held'||!session.reserved_until||session.reserved_until<=new Date()||quote.pricing_id!==record.pricing_id||(quote.snapshot as {rules?:{booking_revision?:number}}).rules?.booking_revision!==session.revision)
          throw new ConflictException('Your slot hold has expired or booking changed. Choose an available slot and review payment again.');
        const {config}=await policy(tx,session.policy_id);await lockPeople(tx,[actor.id,session.advocate_id]);
        await requireSlot(tx,session.advocate_id,actor.id,session.scheduled_at,config,id);
        await tx.consultation.update({where:{id:session.id},data:{status:'scheduled',reserved_until:null}});
      }else{
        const court=input.court_quote_id?await tx.courtQuote.findFirst({where:{id:input.court_quote_id,case_id:id}}):null;
        if(record.service_code==='legal_advice'||record.sub_status!=='court_quote_offered'||!court||court.id!==work.current_court_quote_id||quote.court_quote_id!==court.id||court.status!=='offered'||court.expires_at<=new Date())
          throw new ConflictException('This representation quote changed or expired. Review the current quote before accepting.');
      }
      const b=(quote.snapshot as unknown as QuoteSnapshot).breakdown,total=BigInt(b.total_paise),gst=BigInt(b.gst_paise)+BigInt(b.page_overage_gst_paise);
      const capture=await this.gateway.capture({idempotencyKey,totalPaise:total});
      const payment=await tx.payment.create({data:{case_id:id,payer_id:actor.id,purpose:input.purpose,quote_id:quote.id,base_amount_paise:total-gst,gst_paise:gst,total_paise:total,status:'captured',rzp_payment_id:capture.paymentId,idempotency_key:idempotencyKey,simulated:capture.simulated,captured_at:new Date()}});
      if(input.purpose==='representation')await tx.courtQuote.update({where:{id:input.court_quote_id!},data:{status:'paid',accepted_at:new Date(),payment_id:payment.id}});
      await bump(tx,id);
      await writeConsultationCase(tx,actor,id,{status:input.purpose==='service_fee'?'paid':'in_progress',sub_status:input.purpose==='service_fee'?'consultation_scheduled':'court_preparation'},'consultation_payment_captured',{payment_id:payment.id,purpose:input.purpose,simulated:capture.simulated});
      await this.notifications.send(tx,{user_id:actor.id,case_id:id,kind:'payment_captured',title:'Payment Successful'});
      const recipients=input.purpose==='service_fee'?await tx.user.findMany({where:{role:'admin',status:'active'},select:{id:true}}):[{id:record.advocate_id!}];
      for(const u of recipients)await this.notifications.send(tx,{user_id:u.id,case_id:id,kind:'consultation_action_needed',title:input.purpose==='service_fee'?'Paid consultation needs assignment':'Representation quote accepted and paid',body:record.reference});
      return payment;
    },{timeout:15000});
  }
}
