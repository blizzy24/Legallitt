import {BadRequestException,ConflictException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import {z} from 'zod';
import {ConsultationIntakeSchema,ConsultationIntakeSaveSchema,ConsultationBookingSchema,ConsultationActionSchema,WeeklyAvailabilitySchema,
  consultationIntakeProblems,ConsultationServiceSchema,INDIA_JURISDICTIONS,type ConsultationServiceCode,type WeeklyInterval} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {writeConsultationCase} from '../cases/case-state-machine';
import {activeAt,newest} from '../payments/price-quotes';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {booking,bump,consultationCase,inHours,jsonValue,lockPeople,policy,requireSlot,role,workspace,requireLegacyCheckoutAllowed} from './consultation-rules';
import {consultationDocumentVisible} from './consultation-documents';

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma:PrismaService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
  async read(actor:CaseActor,id:string){
    const db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id),session=await booking(tx,id);
      const reports=await tx.consultationReport.findMany({where:{case_id:id,...(actor.role==='client'?{status:'approved'}:{})},orderBy:{version:'desc'}});
      const quotes=await tx.courtQuote.findMany({where:{case_id:id},orderBy:{version:'desc'}});
      const progress=await tx.courtProgress.findMany({where:{case_id:id},orderBy:{created_at:'desc'}});
      const paid=await tx.payment.findMany({where:{case_id:id,status:'captured'},include:{quote:true},orderBy:{created_at:'asc'}});
      const pending=work.current_report_id?await tx.consultationReport.findFirst({where:{id:work.current_report_id,status:'submitted'}}):null;
      const selected=session?.advocate_id?await tx.user.findUnique({where:{id:session.advocate_id},select:{id:true,full_name:true}}):null;
      const files=await tx.document.findMany({where:{case_id:id,status:{not:'deleted'}},orderBy:{created_at:'asc'}});
      const uploads=[];
      for(const d of files)if(await consultationDocumentVisible(tx,actor,record,d))uploads.push({id:d.id,owner_id:d.owner_id,kind:d.kind,filename:d.filename,mime_type:d.mime_type,page_count:d.page_count,size_bytes:d.size_bytes,status:d.status});
      return {case:record,revision:work.revision,session,selected_advocate:selected,quotes,progress,uploads,
        consultation_approved_at:work.consultation_approved_at,
        pending_review:pending?{kind:pending.kind,submitted_at:pending.submitted_at}:null,
        reports:reports.map(({reason,reviewed_by,...r})=>actor.role==='client'?r:{...r,reason,reviewed_by}),
        ...(actor.role!=='client'?{internal_notes:work.internal_notes,current_report_id:work.current_report_id}:{}),
        payments:paid.map(p=>({id:p.id,purpose:p.purpose,simulated:p.simulated,captured_at:p.captured_at,total_paise:p.total_paise,
          breakdown:(p.quote?.snapshot as {breakdown?:unknown})?.breakdown??null})),
        ...(actor.role!=='client'?{payouts:await tx.payout.findMany({where:{case_id:id}})}:{}),
      };
    });
  }
  async intake(actor:CaseActor,id:string,body:unknown){
    role(actor,'client');const input=parse(ConsultationIntakeSaveSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id);
      if(record.status!=='draft')throw new ConflictException('Submitted intake cannot be edited.');
      if(record.updated_at.toISOString()!==input.expected_updated_at)throw new ConflictException('This intake changed in another session. Reload the saved case; your unsaved entries are still on screen.');
      const v=input.intake;
      if(v.state&&!INDIA_JURISDICTIONS.some(s=>s.name===v.state&&(!v.district||s.districts.some(d=>d.name===v.district))))throw new BadRequestException('Choose a district from the selected state.');
      await workspace(tx,id);await bump(tx,id);
      return writeConsultationCase(tx,actor,id,{details:jsonValue(v),title:v.title||v.description.slice(0,120)||null,matter_type:v.matter_type||null},'consultation_intake_saved');
    });
  }
  async availability(actor:CaseActor,body?:unknown){
    role(actor,'advocate');const db=await this.prisma.getClient();
    if(body===undefined)return await db.advocateAvailability.findFirst({where:{advocate_id:actor.id},orderBy:{version:'desc'}})??{version:0,timezone:'Asia/Kolkata',intervals:[]};
    const input=parse(WeeklyAvailabilitySchema,body);
    return db.$transaction(async tx=>{
      await lockPeople(tx,[actor.id]);
      const old=await tx.advocateAvailability.findFirst({where:{advocate_id:actor.id},orderBy:{version:'desc'}});
      if((old?.version??0)!==input.expected_version)throw new ConflictException('Availability changed in another session. Reload before saving.');
      return tx.advocateAvailability.create({data:{advocate_id:actor.id,version:input.expected_version+1,timezone:'Asia/Kolkata',intervals:input.intervals}});
    });
  }
  async advocates(actor:CaseActor,query:unknown){
    role(actor,'client');parse(z.strictObject({service:ConsultationServiceSchema}),query);
    const db=await this.prisma.getClient();
    const rows=await db.user.findMany({where:{role:'advocate',status:'active',advocate_profiles_user_id_relations:{is:{verification:'approved'}}},
      select:{id:true,full_name:true,advocate_profiles_user_id_relations:{select:{city:true,state:true,years_experience:true,practice_areas:true,languages:true,bio:true,education:true}}},orderBy:{full_name:'asc'}});
    const hours=await db.advocateAvailability.findMany({distinct:['advocate_id'],orderBy:[{advocate_id:'asc'},{version:'desc'}]});
    return {items:rows.map(({advocate_profiles_user_id_relations:profile,...r})=>({...r,profile,has_availability:!!hours.find(h=>h.advocate_id===r.id&&(h.intervals as unknown[]).length)}))};
  }
  async slots(actor:CaseActor,advocateId:string,query:unknown){
    role(actor,'client');parse(z.uuid(),advocateId);
    const {date}=parse(z.strictObject({date:z.iso.date()}),query),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const {config}=await policy(tx),hours=await tx.advocateAvailability.findFirst({where:{advocate_id:advocateId},orderBy:{version:'desc'}});
      const start=new Date(`${date}T00:00:00+05:30`),end=new Date(start.getTime()+86400_000),now=new Date();
      const user=await tx.user.findFirst({where:{id:advocateId,role:'advocate',status:'active',advocate_profiles_user_id_relations:{is:{verification:'approved'}}}});
      if(!user)throw new NotFoundException('Advocate not found');
      const reservations=await tx.consultation.findMany({where:{AND:[{OR:[{advocate_id:advocateId},{client_id:actor.id}]},{OR:[{status:{in:['scheduled','in_progress']}},{status:'held',reserved_until:{gt:now}}]}],case_id_relation:{status:{notIn:['cancelled','refunded']}},scheduled_at:{gte:new Date(start.getTime()-86400_000),lt:end}}});
      const items:{scheduled_at:string;available:boolean}[]=[];
      for(let at=start.getTime();at<end.getTime();at+=config.duration_min*60_000){
        if(at<now.getTime()+config.minimum_notice_minutes*60_000||at>now.getTime()+config.booking_horizon_days*86400_000||!hours||!inHours(new Date(at),config.duration_min,hours.intervals as unknown as WeeklyInterval[]))continue;
        items.push({scheduled_at:new Date(at).toISOString(),available:!reservations.some(r=>r.scheduled_at.getTime()<at+config.duration_min*60_000&&r.scheduled_at.getTime()+r.duration_min*60_000>at)});
      }
      return {items,timezone:config.timezone,duration_min:config.duration_min,horizon_days:config.booking_horizon_days};
    });
  }
  async reserve(actor:CaseActor,id:string,body:unknown){
    role(actor,'client');const input=parse(ConsultationBookingSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id);await requireLegacyCheckoutAllowed(tx,record);const old=await booking(tx,id),{row,config}=await policy(tx,old?.policy_id);
      if(!['draft','payment_pending'].includes(record.status))throw new ConflictException('Use reschedule for an already paid consultation.');
      await lockPeople(tx,[actor.id,input.advocate_id]);
      const at=new Date(input.scheduled_at),hours=await requireSlot(tx,input.advocate_id,actor.id,at,config,id);
      const data={advocate_id:input.advocate_id,client_id:actor.id,policy_id:row.id,availability_id:hours.id,scheduled_at:at,duration_min:config.duration_min,
        mode:'chat',status:'held',reserved_until:new Date(Date.now()+config.hold_minutes*60_000)};
      const session=old?await tx.consultation.update({where:{id:old.id},data:{...data,revision:{increment:1}}}):await tx.consultation.create({data:{case_id:id,...data}});
      await workspace(tx,id);await bump(tx,id);
      return session;
    });
  }
  async submit(actor:CaseActor,id:string){
    role(actor,'client');const db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id);
      await requireLegacyCheckoutAllowed(tx,record);if(record.status==='payment_pending')return record;
      if(record.status!=='draft')throw new ConflictException('Case is already submitted.');
      const intake=parse(ConsultationIntakeSchema,record.details),issues=consultationIntakeProblems(record.service_code as ConsultationServiceCode,intake);
      if(issues.length)throw new BadRequestException(issues.join('\n'));
      const session=await booking(tx,id);
      if(!session||session.status!=='held'||!session.reserved_until||session.reserved_until<=new Date())throw new ConflictException('Choose an available advocate and time before continuing. Your slot hold expired.');
      const tariff=await tx.servicePricing.findFirst({where:{service_code:record.service_code,confirmed:true,variant:'consultation_30_minutes',tier:null,...activeAt(new Date())},orderBy:newest});
      if(!tariff?.fee_policy_id)throw new ConflictException('A confirmed consultation tariff is not available.');
      await writeConsultationCase(tx,actor,id,{status:'submitted',pricing_id:tariff.id},'consultation_submitted');
      return writeConsultationCase(tx,actor,id,{status:'payment_pending',sub_status:'consultation_checkout'},'consultation_payment_pending');
    });
  }
  async reschedule(actor:CaseActor,id:string,body:unknown){
    if(actor.role==='advocate')throw new ConflictException('Ask the client to choose another available time in the case.');
    const input=parse(z.strictObject({scheduled_at:z.iso.datetime(),expected_revision:z.number().int().nonnegative()}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id);await workspace(tx,id,input.expected_revision);
      const session=await booking(tx,id);
      if(!session||session.status!=='scheduled'||!session.advocate_id||session.started_at||['completed','cancelled','refunded'].includes(record.status))throw new ConflictException('Only an unstarted paid consultation can be rescheduled.');
      const {config}=await policy(tx,session.policy_id);await lockPeople(tx,[record.client_id,session.advocate_id]);
      const hours=await requireSlot(tx,session.advocate_id,record.client_id,new Date(input.scheduled_at),config,id);
      const updated=await tx.consultation.update({where:{id:session.id},data:{scheduled_at:new Date(input.scheduled_at),availability_id:hours.id,client_joined_at:null,revision:{increment:1}}});
      await bump(tx,id);await writeConsultationCase(tx,actor,id,{},'consultation_rescheduled',{scheduled_at:input.scheduled_at});
      for(const user_id of [record.client_id,session.advocate_id])await this.notifications.send(tx,{user_id,case_id:id,kind:'consultation_rescheduled',title:'Consultation rescheduled',body:`Your chat consultation is now ${new Date(input.scheduled_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST.`});
      return updated;
    });
  }
  async sessionAction(actor:CaseActor,id:string,action:'join'|'start'|'end',body:unknown){
    const input=parse(ConsultationActionSchema,body),db=await this.prisma.getClient();role(actor,action==='join'?'client':'advocate');
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id);await workspace(tx,id,input.expected_revision);
      const session=await booking(tx,id);
      if(!session||!record.advocate_id||!['assigned','advocate_accepted','in_progress'].includes(record.status))throw new ConflictException('Wait for the booked advocate to be assigned.');
      if(action==='join'){
        if(!['scheduled','in_progress'].includes(session.status))throw new ConflictException('This session is not available to join.');
        await tx.consultation.update({where:{id:session.id},data:{client_joined_at:new Date()}});
        await this.notifications.send(tx,{user_id:record.advocate_id,case_id:id,kind:'consultation_client_ready',title:'Client is ready for chat consultation'});
      }else if(action==='start'){
        if(session.status!=='scheduled'||!session.client_joined_at)throw new ConflictException('The client must join the chat before you start.');
        if(record.status==='assigned')await writeConsultationCase(tx,actor,id,{status:'advocate_accepted'},'consultation_accepted');
        await tx.consultation.update({where:{id:session.id},data:{status:'in_progress',started_at:new Date()}});
        await writeConsultationCase(tx,actor,id,{status:'in_progress',sub_status:'consultation_chat'},'consultation_started');
        await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'consultation_started',title:'Your chat consultation has started'});
      }else{
        if(session.status!=='in_progress')throw new ConflictException('Start the chat consultation before ending it.');
        const thread=await tx.messageThread.findFirst({where:{case_id:id,kind:'client_advocate'}});
        const messages=thread?await tx.message.findMany({where:{thread_id:thread.id,created_at:{gte:session.started_at!}},select:{sender_id:true}}):[];
        if(!messages.some(m=>m.sender_id===record.client_id)||!messages.some(m=>m.sender_id===record.advocate_id))throw new ConflictException('The consultation needs a chat exchange from both participants before it can end.');
        await tx.consultation.update({where:{id:session.id},data:{status:'completed',ended_at:new Date()}});
        await writeConsultationCase(tx,actor,id,{sub_status:'consultation_brief'},'consultation_ended');
        await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'consultation_ended',title:'Chat consultation ended',body:'Your advocate is preparing your consultation brief for admin review.'});
      }
      return bump(tx,id);
    });
  }
}
