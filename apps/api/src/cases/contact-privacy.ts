import {Injectable,type NestInterceptor,type ExecutionContext,type CallHandler} from '@nestjs/common';
import {mergeMap} from 'rxjs/operators';
import {redactPrivatePhones,currentNoticeFiling,withoutNoticeAge} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import type {CaseActor} from './case-access';

export async function counterpartPhones(db:Prisma.TransactionClient,actor:CaseActor,caseId?:string){
 if(!['client','advocate'].includes(actor.role))return [];
 const rows=await db.case.findMany({where:{...(caseId?{id:caseId}:{}),...(actor.role==='client'?{client_id:actor.id}:{OR:[{advocate_id:actor.id},{assignments:{some:{advocate_id:actor.id}}}]})},select:{details:true,assignments:{select:{advocate_id:true}},client_id_relation:{select:{phone:true}},advocate_id_relation:{select:{phone:true}},case_parties_case_id_relations:{where:{kind:{in:['sender','complainant']}},select:{details:true}}}});
 const former=actor.role==='client'?await db.user.findMany({where:{id:{in:[...new Set(rows.flatMap(c=>c.assignments.map(a=>a.advocate_id)))]}},select:{phone:true}}):[];
 return [...former.map(u=>u.phone),...rows.flatMap(c=>{if(actor.role==='client')return [c.advocate_id_relation?.phone];const d=c.details as {client?:{mobile?:string};contact?:{mobile?:string}};return [c.client_id_relation.phone,d.client?.mobile,d.contact?.mobile,...c.case_parties_case_id_relations.map(p=>(p.details as {phone?:string})?.phone)];})];
}
export function noticeAgeProjection<T>(value:T):T{
 const visit=(v:unknown):unknown=>{if(v===null||v instanceof Date||typeof v!=='object')return v;if(Array.isArray(v))return v.map(visit);const o={...v as Record<string,unknown>};if(o.service_code==='legal_notice'){if(o.details)o.details=currentNoticeFiling(o.details);if(Array.isArray(o.parties))o.parties=o.parties.map(p=>p.kind==='sender'?{...p,age:undefined}:p);if(Array.isArray(o.drafts))o.drafts=o.drafts.map(d=>({...d,content:{...d.content,...typeof d.content?.sender==='string'?{sender:withoutNoticeAge(d.content.sender)}:{}}}));}return Object.fromEntries(Object.entries(o).map(([k,x])=>[k,visit(x)]));};return visit(value) as T;
}
/** One output boundary covers mutation responses, inbox previews, workflow
 * payloads and legacy event bodies as well as case reads. Admin/support retain
 * their existing visibility. Raw storage and price snapshots are not rewritten. */
@Injectable()
export class ContactPrivacyInterceptor implements NestInterceptor {
 constructor(private readonly prisma:PrismaService){}
 intercept(context:ExecutionContext,next:CallHandler){const actor=context.switchToHttp().getRequest().user as CaseActor|undefined;return next.handle().pipe(mergeMap(async value=>{if(!actor)return value;const visible=noticeAgeProjection(value);if(actor.role==='admin')return visible;const db=await this.prisma.getClient();return redactPrivatePhones(visible,await counterpartPhones(db,actor));}));}
}
