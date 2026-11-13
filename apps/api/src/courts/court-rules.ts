import {ConflictException,ForbiddenException,NotFoundException,BadRequestException} from '@nestjs/common';
import {CourtPolicySchema,isCourtService,type CourtData,type CourtPolicy,type CourtIntake,COURT_CASE_TYPES,INDIA_JURISDICTIONS} from '@legalitt/shared';
import type {Prisma,Case} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {lockedCase,writeCourtRepresentationCase} from '../cases/case-state-machine';
export type Tx=Prisma.TransactionClient;
export const json=(v:unknown):Prisma.InputJsonValue=>JSON.parse(JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x));
export const role=(actor:CaseActor,wanted:CaseActor['role'])=>{if(actor.role!==wanted)throw new ForbiddenException(`${wanted} action required`);};
export function requireValue(ok:unknown,message:string):asserts ok{if(!ok)throw new ConflictException(message);}
export async function courtCase(tx:Tx,actor:CaseActor,id:string){
 const c=await lockedCase(tx,actor,id);if(!isCourtService(c.service_code))throw new NotFoundException('Case not found');
 const w=await tx.courtWorkspace.findUnique({where:{case_id:id}});if(!w)throw new NotFoundException('This case uses the existing consultation workflow.');
 const p=await tx.courtPolicy.findUniqueOrThrow({where:{id:w.policy_id}});
 return {c,w,data:w.data as unknown as CourtData,policy:CourtPolicySchema.parse(p.config)};
}
export function revision(current:number,expected:number){if(current!==expected)throw new ConflictException('This case changed in another session. Reload its saved state before trying again. Your unsaved text remains on screen.');}
export function live(data:CourtData){requireValue(!['cancelled','completed'].includes(data.phase),'This case is closed. Contact Support.');}
export async function documents(tx:Tx,c:Case,ids:string[],owner?:string){
 if(new Set(ids).size!==ids.length)throw new BadRequestException('Do not repeat documents.');
 const rows=await tx.document.findMany({where:{case_id:c.id,id:{in:ids},status:'uploaded',...(owner?{owner_id:owner}:{})}});
 if(rows.length!==ids.length)throw new BadRequestException('Choose completed uploads from this case.');return rows;
}
export async function saveCourt(tx:Tx,actor:CaseActor,c:Case,data:CourtData,type:string,patch:Prisma.CaseUncheckedUpdateInput={},payload:Prisma.InputJsonObject={}){
 const status:Record<CourtData['phase'],Case['status']>={draft:'draft',deposit:'payment_pending',verification:'paid',assignment:'assigned',discussion:'advocate_accepted',decision:'advocate_accepted',balance:'advocate_accepted',documents:'in_progress',preparation:'in_progress',filed:'in_progress',hearings:'in_progress',completion_review:'approved',completed:'completed',cancelled:'cancelled'};
 await tx.courtWorkspace.update({where:{case_id:c.id},data:{data:json(data),revision:{increment:1},updated_at:new Date()}});
 return writeCourtRepresentationCase(tx,actor,c.id,{status:status[data.phase],sub_status:'court_'+data.phase,...patch},type,payload);
}
export function intakeProblems(code:string,v:CourtIntake,policy:CourtPolicy){
 const out:string[]=[];if(!v.full_name)out.push('Enter your name.');if(!v.title)out.push('Enter the case title.');if(!v.other_party)out.push('Enter the other party’s name.');
 if(!isCourtService(code)||!COURT_CASE_TYPES[code].includes(v.case_type))out.push('Choose a case type.');if(v.narrative.length<10)out.push('Describe what happened.');
 if(code==='district_court'&&!INDIA_JURISDICTIONS.some(s=>s.name===v.state&&s.districts.some(d=>d.name===v.district)))out.push('Choose a state and its district.');
 if(code==='district_court'&&!v.city)out.push('Enter the city for your district court request.');
 if(code==='high_court'&&(!policy.high_courts.includes(v.high_court)||!v.bench&&!v.bench_unknown))out.push('Choose an available High Court and enter the bench, or say you do not know it.');
 if(v.path==='pending'&&(!v.case_number||!v.existing_court||!v.case_status))out.push('Complete the pending case number, court and current status.');
 if(!v.identity_kind)out.push('Choose the identity document type.');if(!v.information_correct||!v.terms_accepted)out.push('Confirm your information and accept the submission terms.');return out;
}
export const emptyCourtData=():CourtData=>({phase:'draft',checklist:[],preparation_tasks:[],reviews:[],review_limit:0,fees:[],changes:[],public_documents:[]});
export async function courtDocumentVisible(tx:Tx,actor:CaseActor,c:Case,d:{id:string;owner_id:string}){
 const w=await tx.courtWorkspace.findUnique({where:{case_id:c.id}});if(!w)return null;
 if(actor.role==='admin'||d.owner_id===actor.id)return true;
 if(actor.role==='advocate')return d.owner_id===c.client_id||(w.data as unknown as CourtData).public_documents.includes(d.id);
 return (w.data as unknown as CourtData).public_documents.includes(d.id);
}
