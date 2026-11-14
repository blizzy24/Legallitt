import {ConflictException,NotFoundException,ForbiddenException} from '@nestjs/common';
import {LegalAdviceConfigSchema,AdviceIntakeSchema,type AdviceData,type LegalAdviceConfig} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {activeAt,newest} from '../payments/price-quotes';
export const adviceJson=(value:unknown):Prisma.InputJsonValue=>JSON.parse(JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v));
export const adviceData=(value:unknown):AdviceData=>value as AdviceData;
export function adviceChatWritable(b:{accepted_at:Date|null;confirmed_at:Date|null;phase:string;mode:string},data:AdviceData,config:LegalAdviceConfig,now=Date.now()){
 if(!b.accepted_at||!b.confirmed_at||['cancelled','refunded'].includes(b.phase))return false;
 if(data.chat_reopened_until&&Date.parse(data.chat_reopened_until)>now)return true;
 if(now<b.confirmed_at.getTime()-config.join_before_minutes*60000||now>=b.confirmed_at.getTime()+config.chat_valid_minutes*60000)return false;
 return b.mode==='chat'||!['completed','interrupted'].includes(data.room.state);
}
export function adviceRole(actor:CaseActor,role:CaseActor['role']){if(actor.role!==role)throw new ForbiddenException(`${role} action required`);}
export async function adviceLocked(tx:Prisma.TransactionClient,actor:CaseActor,id:string){
 if(!['client','advocate','admin'].includes(actor.role))throw new ForbiddenException('Role not permitted');
 await tx.$queryRaw`SELECT id FROM cases WHERE id=${id}::uuid FOR UPDATE`;
 const c=await tx.case.findFirst({where:{id,service_code:'legal_advice',...(actor.role==='client'?{client_id:actor.id}:actor.role==='advocate'?{advocate_id:actor.id}:{})}});
 const b=c?await tx.legalAdviceBooking.findUnique({where:{case_id:id}}):null;
 if(!c||!b)throw new NotFoundException('Consultation not found');
 const row=await tx.legalAdvicePolicy.findUniqueOrThrow({where:{id:b.policy_id}});
 return {c,b,config:LegalAdviceConfigSchema.parse(row.config),data:adviceData(b.session)};
}
export function emptyAdviceData():AdviceData{return {intake:AdviceIntakeSchema.parse({}),room:{state:'waiting',elapsed_ms:0},alerts:[]};}
export async function adviceTariff(tx:Prisma.TransactionClient,policyId:string,config:LegalAdviceConfig,tier:string,mode:string,written=false){
 const base=written?config.written_advice_base_paise:config.tariffs.find(t=>t.tier_code===tier&&t.mode===mode)?.base_paise;
 if(base==null)throw new ConflictException('The selected experience tier has no price for this mode. Choose another advocate or contact support.');
 const source=`legal_advice_policy:${policyId}:${written?'written':tier+':'+mode}`;
 const existing=await tx.servicePricing.findFirst({where:{service_code:'legal_advice',source_note:source}});if(existing)return existing;
 const fee=await tx.feePolicy.findFirst({where:{service_code:'legal_advice',confirmed:true,...activeAt(new Date())},orderBy:newest});
 const tax=await tx.servicePricing.findFirst({where:{service_code:'legal_advice',confirmed:true,...activeAt(new Date())},orderBy:newest});
 if(!fee||!tax)throw new ConflictException('Legal Advice fee and GST policy must be configured before booking.');
 return tx.servicePricing.create({data:{service_code:'legal_advice',tier:written?null:tier,variant:written?'written_advice':`consultation_${mode}`,base_amount_paise:BigInt(base),gst_bps:tax.gst_bps,fee_policy_id:fee.id,confirmed:true,source_note:source}});
}
