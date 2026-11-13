import {Inject,Injectable,NotFoundException,ConflictException} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {CourtServiceSchema,CourtPolicySchema,CourtIntakeSchema,courtStage,courtChat,type CourtData,type CourtService as CourtCode} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {caseScope,type CaseActor} from '../cases/case-access';
import {CaseRepository} from '../cases/case-repository';
import {createCourtRepresentationCase} from '../cases/case-state-machine';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {PAYMENTS,type PaymentsPort} from '../payments/payments.port';
import {courtCase,emptyCourtData,json,role,revision,requireValue,courtDocumentVisible,type Tx} from './court-rules';
import {CourtActions,CourtSettingsInput,type CourtAction} from './court-input';
import {runCourtAction} from './court-actions';
import {courtQuote,courtPay} from './court-payments';
import {calculateQuote} from '../payments/quote-math';

@Injectable()
export class CourtRepresentationService {
 constructor(readonly prisma:PrismaService,readonly cases:CaseRepository,@Inject(NOTIFICATIONS)readonly notifications:NotificationsPort,@Inject(PAYMENTS)readonly gateway:PaymentsPort){}
 async settings(service:string){const code=parse(CourtServiceSchema,service),db=await this.prisma.getClient();const policy=await db.courtPolicy.findFirst({where:{service_code:code,effective_from:{lte:new Date()}},orderBy:{version:'desc'}});if(!policy)throw new ConflictException('Court representation settings are not available. Please contact Support.');
  const prices=await db.servicePricing.findMany({where:{service_code:code,variant:'representation',effective_from:{lte:new Date()},effective_to:null},orderBy:{effective_from:'desc'}});
  const rates=await db.courtHearingRate.findMany({where:{service_code:code,effective_from:{lte:new Date()}},orderBy:{version:'desc'}});
  const commission=await db.commissionRate.findFirst({where:{service_code:code,confirmed:true,effective_from:{lte:new Date()},effective_to:null},orderBy:{effective_from:'desc'}});
  requireValue(commission,'Court commission settings are unavailable.');
  const tariffs=await Promise.all(['ordinary','urgent'].map(async tier=>{const price=prices.find(p=>p.tier===tier);if(!price?.fee_policy_id)return null;const fee=await db.feePolicy.findUniqueOrThrow({where:{id:price.fee_policy_id},include:{page_overage_policy:true}}),page=fee.page_overage_policy;return {...price,breakdown:calculateQuote({base:price.base_amount_paise,commissionBps:commission.rate_bps,gstBps:price.gst_bps,delivery:0n,pages:0,includedPages:page.included_pages,pagePrice:page.unit_amount_paise,pageGstBps:page.gst_bps})};}));
  return {version:policy.version,config:CourtPolicySchema.parse(policy.config),prices:tariffs.filter(Boolean),rates:['effective','passive'].map(kind=>rates.find(r=>r.kind===kind)??{kind,amount_paise:null})};
 }
 async updateSettings(actor:CaseActor,service:string,body:unknown){role(actor,'admin');const code=parse(CourtServiceSchema,service),b=parse(CourtSettingsInput,body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(731114001)::text`;const prior=await tx.courtPolicy.findFirst({where:{service_code:code},orderBy:{version:'desc'}});revision(prior?.version??0,b.expected_version);
   const row=await tx.courtPolicy.create({data:{service_code:code,version:b.expected_version+1,config:json(b.config),source_note:b.reason,created_by:actor.id}});
   for(const tier of ['ordinary','urgent'] as const){const old=await tx.servicePricing.findFirst({where:{service_code:code,variant:'representation',tier},orderBy:{effective_from:'desc'}});requireValue(old?.fee_policy_id,'Activate the court pricing seed before editing tariffs.');await tx.servicePricing.create({data:{service_code:code,variant:'representation',tier,base_amount_paise:BigInt(tier==='ordinary'?b.ordinary_base_paise:b.urgent_base_paise),gst_bps:old.gst_bps,fee_policy_id:old.fee_policy_id,confirmed:true,source_note:b.reason}});}
   for(const kind of ['effective','passive'] as const){const old=await tx.courtHearingRate.findFirst({where:{service_code:code,kind},orderBy:{version:'desc'}}),amount=kind==='effective'?b.effective_rate_paise:b.passive_rate_paise;await tx.courtHearingRate.create({data:{service_code:code,kind,version:(old?.version??0)+1,amount_paise:amount===null?null:BigInt(amount),created_by:actor.id}});}
   return {version:row.version};
  });
 }
 async create(actor:CaseActor,body:unknown){role(actor,'client');const b=parse(z.strictObject({service_code:CourtServiceSchema,tier:z.enum(['ordinary','urgent']).default('ordinary'),path:z.enum(['new','pending']).default('new')}),body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{const p=await tx.courtPolicy.findFirst({where:{service_code:b.service_code,effective_from:{lte:new Date()}},orderBy:{version:'desc'}});requireValue(p,'Court representation is not configured yet.');const config=CourtPolicySchema.parse(p.config);
   const rows=b.service_code==='district_court'?await tx.$queryRaw<{n:bigint}[]>`SELECT nextval('court_district_reference_seq') n`:await tx.$queryRaw<{n:bigint}[]>`SELECT nextval('court_high_reference_seq') n`;
   const reference=`${b.service_code==='district_court'?'DC':'HC'}-${new Date().getFullYear()}-${String(rows[0].n).padStart(5,'0')}`;
   const c=await createCourtRepresentationCase(tx,actor,{reference,service_code:b.service_code,tier:b.tier,details:json(CourtIntakeSchema.parse({path:b.path}))});
   await tx.courtWorkspace.create({data:{case_id:c.id,policy_id:p.id,data:json({...emptyCourtData(),review_limit:config.review_rounds})}});
   return c;
  });
 }
 async list(actor:CaseActor){const db=await this.prisma.getClient(),ids=await db.courtWorkspace.findMany({select:{case_id:true}}),cases=await db.case.findMany({where:{...caseScope(actor),id:{in:ids.map(x=>x.case_id)}},orderBy:{updated_at:'desc'},take:200});return {items:await Promise.all(cases.map(c=>this.read(actor,c.id)))};}
 async read(actor:CaseActor,id:string){const db=await this.prisma.getClient(),record=await this.cases.read(actor,id);const view=await db.$transaction(async tx=>{const {c,w,data,policy}=await courtCase(tx,actor,id),files=await tx.document.findMany({where:{case_id:id,status:{not:'deleted'}},orderBy:{created_at:'asc'}}),visible=[];
   for(const d of files)if(await courtDocumentVisible(tx,actor,c,d))visible.push(d);
   const credits=await tx.courtHearingCredit.findMany({where:{case_id:id}}),hearings=await tx.courtHearing.findMany({where:{case_id:id},orderBy:{at:'asc'}});
   const warnings:string[]=[];if(actor.role==='admin'){
    for(const kind of ['effective','passive']){const rate=await tx.courtHearingRate.findFirst({where:{service_code:c.service_code,kind,effective_from:{lte:new Date()}},orderBy:{version:'desc'}});if(rate?.amount_paise==null)warnings.push(`${kind==='effective'?'Effective':'Passive'} hearing rate is not set. No credit can be made for that type.`);}
    for(const fee of data.fees)if(fee.paid_at&&!fee.receipt_id&&Date.parse(fee.paid_at)+policy.receipt_alert_days*86400000<Date.now())warnings.push('Court/process fee receipt overdue: '+fee.heading);
    if(data.changes.some(x=>x.status==='contact'))warnings.push('Client requested a third advocate change. Our team must contact them.');
    if(data.deadline_at&&Date.parse(data.deadline_at)<Date.now()&&!data.accepted_at)warnings.push('First-action turnaround is overdue.');
    if(Date.now()-w.updated_at.getTime()>30*86400000&&!['completed','cancelled'].includes(data.phase))warnings.push('No case update for 30 days.');
    if(hearings.some(h=>!h.update&&h.at.getTime()+48*3600000<Date.now()))warnings.push('Hearing update overdue by more than 48 hours.');
   }
   const ownNotes=w.private_notes as Record<string,string>;
   const safeData: CourtData=actor.role==='advocate'?{...data,cancel_requested:undefined,changes:data.changes.filter(x=>x.status==='approved'||x.status==='reassigned').map(x=>({...x,decision_reason:undefined})),pickup:data.pickup?{...data.pickup,phone:''}:undefined}:data;
   return {revision:w.revision,policy,data:safeData,stage:courtStage(data.phase),documents:visible,hearings:hearings.map(({private_note,...h})=>{const credit=credits.find(x=>x.hearing_id===h.id);return {...h,...actor.role==='advocate'&&h.advocate_id===actor.id?{private_note,draft:(w.private_notes as Record<string,unknown>)['hearing:'+actor.id+':'+h.id]}:{},...actor.role==='admin'||h.advocate_id===actor.id?{classification:credit?.kind??null,amount_paise:credit?.amount_paise??null,classified_at:credit?.classified_at??null}:{}};}),...(actor.role==='advocate'?{private_note:ownNotes[actor.id]??''}:{}),...(actor.role!=='advocate'?{payments:await tx.payment.findMany({where:{case_id:id,status:'captured'},select:{id:true,purpose:true,total_paise:true,simulated:true,captured_at:true}})}:{}),chat:courtChat(data,policy,c.completed_at?.toISOString()),warnings,legacy:false};
  });return {...view,case:record};
 }
 async action(actor:CaseActor,id:string,name:string,body:unknown){if(!Object.hasOwn(CourtActions,name))throw new NotFoundException('Court action not found');const action=name as CourtAction,db=await this.prisma.getClient();await db.$transaction(tx=>runCourtAction(this,tx,actor,id,action,body),{timeout:20000});if(action==='advocate-decision'&&(body as {decision?:string}).decision==='decline')return {released:true};return this.read(actor,id);}
 async quote(actor:CaseActor,id:string,body:unknown){role(actor,'client');const b=parse(z.strictObject({purpose:z.enum(['deposit','balance','pickup','change','fee']),item_id:z.uuid().optional()}),body),db=await this.prisma.getClient();return db.$transaction(tx=>courtQuote(tx,actor,id,b));}
 async pay(actor:CaseActor,id:string,body:unknown){role(actor,'client');const b=parse(z.strictObject({quote_id:z.uuid(),idempotency_key:z.string().min(8).max(200),confirmed_test:z.literal(true)}),body),db=await this.prisma.getClient();return db.$transaction(tx=>courtPay(this,tx,actor,id,b),{timeout:20000});}
 async notify(tx:Tx,c:{id:string;client_id:string;advocate_id:string|null},who:'client'|'advocate'|'admin',title:string,body?:string){const users=who==='admin'?await tx.user.findMany({where:{role:'admin',status:'active'},select:{id:true}}):[{id:who==='client'?c.client_id:c.advocate_id}];for(const u of users)if(u.id)await this.notifications.send(tx,{user_id:u.id,case_id:c.id,kind:'court_action_needed',title,body});}
}
