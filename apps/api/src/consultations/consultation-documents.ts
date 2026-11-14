import {courtDocumentVisible} from '../courts/court-rules';
import type {Prisma,Case,Document} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {isConsultationService} from '@legalitt/shared';
import {adviceData} from './legal-advice-rules';
/** The case membership check remains the outer boundary. Publication is a second,
 * service-local gate; it never grants access to an unassigned advocate or outsider. */
export async function consultationDocumentVisible(tx:Prisma.TransactionClient,actor:CaseActor,record:Case,doc:Document){
  if(['district_court','high_court'].includes(record.service_code)){const visible=await courtDocumentVisible(tx,actor,record,doc);if(visible!==null)return visible;}
  if(!isConsultationService(record.service_code)||actor.role!=='client'||doc.owner_id===record.client_id)return true;
  const advice=record.service_code==='legal_advice'?await tx.legalAdviceBooking.findUnique({where:{case_id:record.id}}):null;
  if(advice){const data=adviceData(advice.session);return data.written?.document_id===doc.id||!!data.summary?.attachment_ids.includes(doc.id);}
  const reports=await tx.consultationReport.findMany({where:{case_id:record.id,status:'approved'}});
  if(reports.some(r=>r.document_id===doc.id||((r.content as {attachment_ids?:string[]}).attachment_ids??[]).includes(doc.id)))return true;
  if(doc.kind==='consultation_report')return false;
  if(await tx.courtProgress.findFirst({where:{case_id:record.id,document_ids:{has:doc.id}}}))return true;
  return !!await tx.message.findFirst({where:{document_id:doc.id,thread_id_relation:{case_id:record.id,kind:'client_advocate'}}});
}
