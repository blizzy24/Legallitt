import {createHash} from 'node:crypto';
import {ConflictException} from '@nestjs/common';
import {courtDueDate,type QuoteBreakdown} from '@legalitt/shared';
import type {CaseActor} from '../cases/case-access';
import {activeAt,newest,quoteDocuments,blockedQuote} from '../payments/price-quotes';
import {calculateQuote,halfUp} from '../payments/quote-math';
import {courtCase,json,live,requireValue,saveCourt,type Tx} from './court-rules';
import type {CourtRepresentationService} from './court.service';
type Purpose={purpose:'deposit'|'balance'|'pickup'|'change'|'fee';item_id?:string};
type Snapshot={breakdown:QuoteBreakdown;full:QuoteBreakdown|null;advance_paise:string;revision:number;purpose:Purpose;rules:unknown};
export async function courtQuote(tx:Tx,actor:CaseActor,id:string,b:Purpose){
 const {c,w,data,policy}=await courtCase(tx,actor,id);live(data);
 let due:bigint,full:QuoteBreakdown|null=null,gst=0n,advance=0n,rules:unknown={policy};
 const docs=await quoteDocuments(tx,id,true);
 if(['deposit','balance'].includes(b.purpose)&&docs.unresolved.length)return blockedQuote('document_pages_unresolved','Payment is blocked by unfinished uploads or unreadable PDFs. Finish or replace them in Documents before paying.',docs.unresolved);
 if(b.purpose==='deposit'||b.purpose==='balance'){
  requireValue(b.purpose==='deposit'?data.phase==='deposit'&&!data.deposit_id:data.phase==='balance'&&data.client_accepted_at&&!data.balance_id,'This service payment is not currently due.');
  const tariff=c.pricing_id?await tx.servicePricing.findUnique({where:{id:c.pricing_id}}):null;requireValue(tariff?.fee_policy_id,'The saved tariff is unavailable.');
  const fee=await tx.feePolicy.findUniqueOrThrow({where:{id:tariff.fee_policy_id},include:{page_overage_policy:true}});
  const deposit=data.deposit_id?await tx.payment.findUnique({where:{id:data.deposit_id},include:{quote:true}}):null;
  const original=deposit?.quote?.snapshot as unknown as Snapshot|undefined;
  const commissionId=(original?.rules as {commission?:{id:string}})?.commission?.id;
  const commission=commissionId?await tx.commissionRate.findUnique({where:{id:commissionId}}):await tx.commissionRate.findFirst({where:{service_code:c.service_code,confirmed:true,...activeAt(new Date())},orderBy:newest});requireValue(commission,'Commission settings are unavailable.');
  const page=fee.page_overage_policy;full=calculateQuote({base:tariff.base_amount_paise,commissionBps:commission.rate_bps,gstBps:tariff.gst_bps,delivery:0n,pages:docs.pages,includedPages:page.included_pages,pagePrice:page.unit_amount_paise,pageGstBps:page.gst_bps});
  const total=BigInt(full.total_paise),tax=BigInt(full.gst_paise)+BigInt(full.page_overage_gst_paise);
  if(b.purpose==='deposit'){due=BigInt(policy.deposit_paise);requireValue(due>0n&&due<=total,'Submission advance must be positive and no larger than the service total.');gst=halfUp(tax*due,total);}else{requireValue(deposit,'The submission payment could not be found.');advance=deposit.total_paise;due=total-advance;gst=tax-deposit.gst_paise;requireValue(due>0n&&gst>=0n,'The saved advance needs admin review before collecting a balance.');}
  rules={policy,tariff,fee,commission,page};
 }else if(b.purpose==='pickup'){requireValue(data.pickup?.method==='legalitt'&&data.pickup.status==='payment_pending'&&!data.pickup.payment_id,'There is no unpaid Legalitt pickup.');due=BigInt(policy.pickup_paise);}
 else if(b.purpose==='change'){const change=data.changes.find(x=>x.id===b.item_id);requireValue(change?.kind==='paid'&&change.status==='payment_pending'&&!change.payment_id,'This change request is not awaiting payment.');due=BigInt(policy.change_fee_paise);}
 else{const fee=data.fees.find(x=>x.id===b.item_id);requireValue(fee&&!fee.payment_id,'This fee request is unavailable or already paid.');due=BigInt(fee.amount_paise);}
 const breakdown:QuoteBreakdown={service_fee_paise:(due-gst).toString(),platform_fee_paise:'0',delivery_fee_paise:'0',taxable_subtotal_paise:(due-gst).toString(),gst_paise:gst.toString(),page_overage_paise:'0',page_overage_gst_paise:'0',total_pages:docs.pages,included_pages:0,charged_pages:0,page_unit_paise:'0',total_paise:due.toString(),advocate_entitlement_paise:'0',platform_revenue_paise:null};
 const fingerprint=['deposit','balance'].includes(b.purpose)?docs.fingerprint:createHash('sha256').update(JSON.stringify({revision:w.revision,purpose:b})).digest('hex');
 const quote=await tx.casePriceQuote.create({data:{case_id:id,pricing_id:c.pricing_id,purpose:'court_'+b.purpose+(b.item_id?':'+b.item_id:''),document_fingerprint:fingerprint,snapshot:json({breakdown,full,advance_paise:advance.toString(),revision:w.revision,purpose:b,rules} satisfies Snapshot)}});
 return {status:'ready' as const,id:quote.id,breakdown,full,advance_paise:advance.toString(),simulated:(process.env.PAYMENTS_MODE??'simulated')==='simulated',non_refundable:b.purpose==='change',pass_through:b.purpose==='fee'};
}
export async function courtPay(service:CourtRepresentationService,tx:Tx,actor:CaseActor,id:string,b:{quote_id:string;idempotency_key:string;confirmed_test:true}){
 const {c,w,data,policy}=await courtCase(tx,actor,id),prior=await tx.payment.findUnique({where:{idempotency_key:b.idempotency_key}});
 if(prior){requireValue(prior.case_id===id&&prior.payer_id===actor.id&&prior.quote_id===b.quote_id,'Idempotency key already used.');return prior;}
 live(data);requireValue((process.env.PAYMENTS_MODE??'simulated')==='simulated','Real payment capture is not enabled for this test checkout.');
 const quote=await tx.casePriceQuote.findFirst({where:{id:b.quote_id,case_id:id,purpose:{startsWith:'court_'}}});requireValue(quote,'Review the current payment breakdown first.');
 const snap=quote.snapshot as unknown as Snapshot;requireValue(snap.revision===w.revision,'The case changed. Review the current payment breakdown before paying.');
 requireValue(!await tx.payment.findFirst({where:{case_id:id,purpose:quote.purpose,status:'captured'}}),'This payment has already been recorded.');
 if(['deposit','balance'].includes(snap.purpose.purpose)){const docs=await quoteDocuments(tx,id,true);requireValue(!docs.unresolved.length&&docs.fingerprint===quote.document_fingerprint,'Documents changed. Review the new full payment breakdown.');}
 const total=BigInt(snap.breakdown.total_paise),gst=BigInt(snap.breakdown.gst_paise),capture=await service.gateway.capture({idempotencyKey:b.idempotency_key,totalPaise:total});
 requireValue(capture.simulated,'Expected a simulated payment adapter.');
 const payment=await tx.payment.create({data:{case_id:id,payer_id:actor.id,purpose:quote.purpose,quote_id:quote.id,base_amount_paise:total-gst,gst_paise:gst,total_paise:total,status:'captured',rzp_payment_id:capture.paymentId,idempotency_key:b.idempotency_key,simulated:true,captured_at:new Date()}});
 const {purpose,item_id}=snap.purpose,now=new Date().toISOString();
 if(purpose==='deposit'){data.deposit_id=payment.id;data.phase='verification';data.deadline_at=courtDueDate(new Date(),(c.tier==='urgent'?policy.urgent_days:policy.ordinary_days)[1],policy.working_weekdays);await service.notify(tx,c,'admin','Court submission paid: review and assign');}
 if(purpose==='balance'){data.balance_id=payment.id;data.phase='documents';await service.notify(tx,c,'advocate','Client paid the representation balance');}
 if(purpose==='pickup'){requireValue(data.pickup,'Pickup details are missing.');data.pickup.payment_id=payment.id;data.pickup.status='booking';data.pickup.events.push({at:now,detail:'Pickup paid. Legalitt will arrange the courier and add tracking.'});await service.notify(tx,c,'admin','Document pickup needs booking');}
 if(purpose==='change'){const item=data.changes.find(x=>x.id===item_id);requireValue(item,'Change request no longer exists.');item.payment_id=payment.id;item.status='requested';await service.notify(tx,c,'admin','Paid advocate change needs review');}
 if(purpose==='fee'){const fee=data.fees.find(x=>x.id===item_id);requireValue(fee,'Fee request no longer exists.');fee.payment_id=payment.id;fee.paid_at=now;await service.notify(tx,c,'advocate','Requested fee paid: upload the court receipt');}
 await saveCourt(tx,actor,c,data,'court_payment_captured',{}, {payment_id:payment.id,purpose:quote.purpose,simulated:true});await service.notify(tx,c,'client','Payment Successful','Test payment. No money moved.');return payment;
}
