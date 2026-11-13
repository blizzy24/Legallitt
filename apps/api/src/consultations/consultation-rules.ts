import {ConflictException,ForbiddenException,NotFoundException} from '@nestjs/common';
import {ConsultationPolicySchema,isConsultationService,type WeeklyInterval} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {lockedCase} from '../cases/case-state-machine';
import {activeAt,newest} from '../payments/price-quotes';

export const jsonValue=(v:unknown):Prisma.InputJsonValue=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x));
export function role(actor:CaseActor,required:CaseActor['role']){if(actor.role!==required)throw new ForbiddenException(`${required} action required`);}
export async function consultationCase(tx:Prisma.TransactionClient,actor:CaseActor,id:string){
  const record=await lockedCase(tx,actor,id);
  if(await tx.courtWorkspace.findUnique({where:{case_id:id}}))throw new ConflictException('Use the court representation workflow for this case.');
  if(!isConsultationService(record.service_code))throw new NotFoundException('Case not found');
  return record;
}
export async function workspace(tx:Prisma.TransactionClient,id:string,revision?:number){
  const row=await tx.consultationWorkspace.upsert({where:{case_id:id},create:{case_id:id},update:{}});
  if(revision!==undefined&&revision!==row.revision)throw new ConflictException('This case changed in another session. Reload the saved case before continuing. Your unsaved text is still on screen.');
  return row;
}
export const bump=(tx:Prisma.TransactionClient,id:string,data:Prisma.ConsultationWorkspaceUpdateInput={})=>tx.consultationWorkspace.update({where:{case_id:id},data:{...data,revision:{increment:1},updated_at:new Date()}});
export async function policy(tx:Prisma.TransactionClient,id?:string|null){
  const row=id?await tx.consultationPolicy.findUnique({where:{id}}):await tx.consultationPolicy.findFirst({where:activeAt(new Date()),orderBy:newest});
  if(!row)throw new ConflictException('Consultation scheduling is unavailable. Please contact support.');
  return {row,config:ConsultationPolicySchema.parse(row.config)};
}
export async function booking(tx:Prisma.TransactionClient,id:string){
  return tx.consultation.findFirst({where:{case_id:id},orderBy:[{scheduled_at:'desc'},{id:'asc'}]});
}
export async function lockPeople(tx:Prisma.TransactionClient,ids:string[]){
  // A deterministic lock order protects booking across different cases and services.
  for(const id of [...new Set(ids)].sort())await tx.$queryRaw`SELECT id FROM users WHERE id=${id}::uuid FOR UPDATE`;
}
export function inHours(at:Date,duration:number,intervals:WeeklyInterval[]){
  const local=new Date(at.getTime()+330*60_000),minute=local.getUTCHours()*60+local.getUTCMinutes();
  return local.getUTCSeconds()===0&&local.getUTCMilliseconds()===0&&intervals.some(i=>i.day===local.getUTCDay()&&minute>=minutes(i.start)&&minute+duration<=minutes(i.end)&&minute%30===0);
}
export const minutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
export async function requireSlot(tx:Prisma.TransactionClient,advocateId:string,clientId:string,at:Date,config:ReturnType<typeof ConsultationPolicySchema.parse>,excludeCase?:string){
  const now=new Date();
  if(at.getTime()<now.getTime()+config.minimum_notice_minutes*60_000||at.getTime()>now.getTime()+config.booking_horizon_days*86400_000)
    throw new ConflictException('That time is outside the booking window. Choose an available future time.');
  const advocate=await tx.user.findFirst({where:{id:advocateId,role:'advocate',status:'active',advocate_profiles_user_id_relations:{is:{verification:'approved'}}}});
  if(!advocate)throw new ConflictException('This advocate is not available for booking. Choose another advocate.');
  const hours=await tx.advocateAvailability.findFirst({where:{advocate_id:advocateId},orderBy:{version:'desc'}});
  if(!hours||!inHours(at,config.duration_min,hours.intervals as unknown as WeeklyInterval[]))throw new ConflictException('This slot is no longer in the advocate’s available hours. Choose another slot.');
  const candidates=await tx.consultation.findMany({where:{case_id:excludeCase?{not:excludeCase}:undefined,
    AND:[{OR:[{advocate_id:advocateId},{client_id:clientId}]},{OR:[{status:{in:['scheduled','in_progress']}},{status:'held',reserved_until:{gt:now}}]}],
    case_id_relation:{status:{notIn:['cancelled','refunded']}},scheduled_at:{gte:new Date(at.getTime()-86400_000),lt:new Date(at.getTime()+config.duration_min*60_000)}}});
  if(candidates.some(c=>c.scheduled_at.getTime()+c.duration_min*60_000>at.getTime()))throw new ConflictException('This time has just been booked or overlaps another consultation. Choose another slot.');
  return hours;
}
