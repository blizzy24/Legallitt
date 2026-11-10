import {BadRequestException,ConflictException,Inject,Injectable} from '@nestjs/common';
import {z} from 'zod';
import {ConsultationReportSaveSchema,ConsultationReportReviewSchema,ConsultationActionSchema,ConsultationIntakeSchema,CourtProgressSchema,ConsultationReviewSchema,type ConsultationServiceCode} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {writeConsultationCase} from '../cases/case-state-machine';
import {DocumentService} from '../documents/document.service';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {booking,bump,consultationCase,jsonValue,role,workspace} from './consultation-rules';
import {renderConsultationReport} from './consultation-report-pdf';
import type {Prisma} from '../generated/prisma/client';
import type {QuoteSnapshot} from '../payments/price-quotes';

@Injectable()
export class ConsultationReports {
  constructor(private readonly prisma:PrismaService,private readonly documents:DocumentService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
  async notes(actor:CaseActor,id:string,body:unknown){
    role(actor,'advocate');const input=parse(z.strictObject({expected_revision:z.number().int().nonnegative(),notes:z.string().max(30000)}),body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{const record=await consultationCase(tx,actor,id);await workspace(tx,id,input.expected_revision);
      if(['completed','cancelled','refunded'].includes(record.status))throw new ConflictException('This case is closed.');
      return bump(tx,id,{internal_notes:input.notes});});
  }
  async save(actor:CaseActor,id:string,body:unknown){
    role(actor,'advocate');const input=parse(ConsultationReportSaveSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id,input.expected_revision),session=await booking(tx,id);
      if(!['in_progress','changes_requested'].includes(record.status)||record.sub_status==='awaiting_admin_approval')throw new ConflictException('A submitted brief must be reviewed before another version can be saved.');
      if(input.kind==='consultation'?(session?.status!=='completed'||!!work.consultation_approved_at):(!work.consultation_approved_at||record.service_code==='legal_advice'||!await tx.courtQuote.findFirst({where:{case_id:id,status:'paid'}})))throw new ConflictException('This report is not available at this stage.');
      await this.attachments(tx,id,input.content.attachment_ids);
      const old=await tx.consultationReport.findFirst({where:{case_id:id},orderBy:{version:'desc'}});
      const report=await tx.consultationReport.create({data:{case_id:id,kind:input.kind,version:(old?.version??0)+1,advocate_id:actor.id,content:jsonValue(input.content),filing_snapshot:jsonValue(record.details),supersedes_id:old?.id}});
      await bump(tx,id,{current_report_id:report.id});
      await writeConsultationCase(tx,actor,id,{status:'in_progress',sub_status:input.kind==='consultation'?'consultation_brief':'court_completion_brief'},'consultation_report_saved');
      return report;
    });
  }
  private async attachments(tx:Prisma.TransactionClient,id:string,ids:string[]){
    const docs=await tx.document.findMany({where:{case_id:id,id:{in:ids},status:'uploaded',kind:{not:'consultation_report'}}});
    if(docs.length!==ids.length)throw new ConflictException('An attachment is missing or unfinished. Review the case documents before sending.');return docs;
  }
  async submit(actor:CaseActor,id:string,reportId:string,body:unknown){
    role(actor,'advocate');const input=parse(ConsultationActionSchema,body),db=await this.prisma.getClient();
    const loaded=await db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id,input.expected_revision);
      const report=await tx.consultationReport.findFirst({where:{id:reportId,case_id:id,advocate_id:actor.id,status:'draft'}});
      if(!report||work.current_report_id!==reportId||record.status!=='in_progress'||record.sub_status==='awaiting_admin_approval')throw new ConflictException('Save and send the current report version.');
      const attachments=await this.attachments(tx,id,(report.content as {attachment_ids:string[]}).attachment_ids);
      const advocate=await tx.user.findUniqueOrThrow({where:{id:actor.id},select:{full_name:true}});
      return {record,report,attachments,advocate};
    });
    let bytes:Uint8Array;
    try{bytes=await renderConsultationReport({reference:loaded.record.reference,service:loaded.record.service_code as ConsultationServiceCode,version:loaded.report.version,kind:loaded.report.kind,created_at:loaded.report.created_at,intake:ConsultationIntakeSchema.parse(loaded.report.filing_snapshot),advocate:loaded.advocate.full_name,content:loaded.report.content,attachments:loaded.attachments});}
    catch(e){throw new BadRequestException(e instanceof Error?e.message:'The report could not be generated.');}
    const ticket=await this.documents.presign(actor,{case_id:id,kind:'consultation_report',filename:`${loaded.record.reference}_Brief_v${loaded.report.version}.pdf`,mime:'application/pdf'},{consultationReport:true});
    const form=new FormData();for(const [key,value]of Object.entries(ticket.upload.fields))form.append(key,value);
    form.append('file',new Blob([Buffer.from(bytes)],{type:'application/pdf'}),ticket.document.filename);
    const response=await fetch(ticket.upload.url,{method:'POST',body:form});
    if(!response.ok)throw new ConflictException('PDF upload failed. Retry sending this version.');
    await this.documents.complete(actor,ticket.document.id);
    // A losing concurrent submission remains private and unlinked. No published
    // document is overwritten and no client-visible version is silently replaced.
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id,input.expected_revision);
      const report=await tx.consultationReport.findUniqueOrThrow({where:{id:reportId}});
      if(work.current_report_id!==report.id||report.status!=='draft'||record.sub_status==='awaiting_admin_approval')throw new ConflictException('The case changed while generating. Reload before sending.');
      await this.attachments(tx,id,(report.content as {attachment_ids:string[]}).attachment_ids);
      await tx.consultationReport.update({where:{id:reportId},data:{status:'submitted',document_id:ticket.document.id,submitted_at:new Date()}});
      await bump(tx,id);await writeConsultationCase(tx,actor,id,{sub_status:'awaiting_admin_approval'},'consultation_report_submitted');
      for(const u of await tx.user.findMany({where:{role:'admin',status:'active'}}))await this.notifications.send(tx,{user_id:u.id,case_id:id,kind:'consultation_report_review',title:'Consultation service report awaiting approval',body:record.reference});
      await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'consultation_report_waiting',title:'Your report is being reviewed',body:'An admin is checking the report before it is released to you.'});
      return {document_id:ticket.document.id};
    });
  }
  async review(actor:CaseActor,id:string,body:unknown){
    role(actor,'admin');const input=parse(ConsultationReportReviewSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id),work=await workspace(tx,id,input.expected_revision);
      const report=await tx.consultationReport.findFirst({where:{id:input.report_id,case_id:id,status:'submitted'}});
      if(!report||work.current_report_id!==report.id||record.sub_status!=='awaiting_admin_approval'||!report.document_id)throw new ConflictException('This submission is no longer awaiting review. Reload the current version.');
      await this.attachments(tx,id,(report.content as {attachment_ids:string[]}).attachment_ids);
      await tx.consultationReport.update({where:{id:report.id},data:{status:input.decision,reviewed_at:new Date(),reviewed_by:actor.id,reason:input.decision==='returned'?input.reason:null}});
      const complete=input.decision==='approved'&&(record.service_code==='legal_advice'||report.kind==='completion');
      await bump(tx,id,input.decision==='approved'&&report.kind==='consultation'?{consultation_approved_at:new Date()}:{});
      await writeConsultationCase(tx,actor,id,{status:input.decision==='returned'?'changes_requested':complete?'completed':'in_progress',sub_status:input.decision==='returned'?'admin_report_correction':complete?'completed':'court_quote',...(complete?{completed_at:new Date()}:{})},input.decision==='returned'?'consultation_report_correction':'consultation_report_approved');
      await tx.adminAction.create({data:{admin_id:actor.id,action:`consultation_report_${input.decision}`,subject_type:'case',subject_id:id,payload:{report_id:report.id,version:report.version}}});
      if(input.decision==='returned'){
        await this.notifications.send(tx,{user_id:report.advocate_id,case_id:id,kind:'consultation_report_correction',title:`Report v${report.version} needs correction`,body:'Open the case to read the admin’s reason.'});
        await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'consultation_report_waiting',title:'Your report is still being prepared',body:'Your advocate and our review team are working on the report. You can contact them in the case chat.'});
      }else{
        await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'consultation_report_ready',title:complete?'Your case is complete':'Your consultation brief is ready',body:complete?'Download the approved report from your case.':'Your advocate can now send a separate quote for court representation.'});
        if(complete)await this.entitlement(tx,record.id,record.advocate_id!);
      }
      return {approved:input.decision==='approved',completed:complete,document_id:input.decision==='approved'?report.document_id:null};
    });
  }
  private async entitlement(tx:Prisma.TransactionClient,id:string,advocateId:string){
    for(const p of await tx.payment.findMany({where:{case_id:id,status:'captured'},include:{quote:true}})){
      if(!p.quote||await tx.payout.findFirst({where:{payment_id:p.id}}))continue;
      const b=(p.quote.snapshot as unknown as QuoteSnapshot).breakdown;
      const commission=p.quote.commission_rate_id?await tx.commissionRate.findUnique({where:{id:p.quote.commission_rate_id}}):null;
      if(!commission||b.advocate_entitlement_paise===null)throw new ConflictException('Captured payment policy is incomplete.');
      await tx.payout.create({data:{case_id:id,advocate_id:advocateId,payment_id:p.id,gross_paise:BigInt(b.service_fee_paise)+BigInt(b.platform_fee_paise),commission_rate_bps:commission.rate_bps,commission_paise:BigInt(b.platform_fee_paise),net_paise:BigInt(b.advocate_entitlement_paise),status:'pending'}});
    }
  }
  async progress(actor:CaseActor,id:string,body:unknown){
    role(actor,'advocate');const input=parse(CourtProgressSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const record=await consultationCase(tx,actor,id);await workspace(tx,id,input.expected_revision);
      if(record.service_code==='legal_advice'||record.status!=='in_progress'||record.sub_status==='awaiting_admin_approval'||!await tx.courtQuote.findFirst({where:{case_id:id,status:'paid'}}))throw new ConflictException('Paid representation is required before recording court progress.');
      await this.attachments(tx,id,input.document_ids);
      const row=await tx.courtProgress.create({data:{case_id:id,advocate_id:actor.id,stage:input.stage,update:input.update,court:input.court,case_number:input.case_number,next_hearing:input.next_hearing?new Date(input.next_hearing):null,document_ids:input.document_ids}});
      await bump(tx,id);await writeConsultationCase(tx,actor,id,{sub_status:`court_${input.stage}`},'court_progress_recorded',{stage:input.stage,progress_id:row.id});
      await this.notifications.send(tx,{user_id:record.client_id,case_id:id,kind:'court_progress',title:'Your advocate updated your court case',body:input.update.slice(0,250)});return row;
    });
  }
  async rate(actor:CaseActor,id:string,body:unknown){
    role(actor,'client');const input=parse(ConsultationReviewSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{await consultationCase(tx,actor,id);const session=await booking(tx,id);
      if(session?.status!=='completed')throw new ConflictException('Complete the consultation before reviewing it.');
      return tx.consultation.update({where:{id:session.id},data:input});});
  }
}
