import {BadRequestException,ConflictException,Inject,Injectable} from '@nestjs/common';
import {z} from 'zod';
import {PDFDocument,rgb} from 'pdf-lib';
import {parse} from '../auth/auth.service';
import {PrismaService} from '../prisma.service';
import type {CaseActor} from '../cases/case-access';
import {DocumentService} from '../documents/document.service';
import {PdfText,embedTextFonts,needsPage,unsupportedCharacters} from '../documents/pdf-text';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {adviceJson,adviceLocked,adviceRole} from './legal-advice-rules';
const Content=z.strictObject({title:z.string().trim().min(3).max(200),background:z.string().trim().min(10).max(20000),opinion:z.string().trim().min(10).max(30000),action_plan:z.string().trim().min(3).max(20000)});
const Draft=Content.extend({title:z.string().max(200),background:z.string().max(20000),opinion:z.string().max(30000),action_plan:z.string().max(20000)});
export async function renderAdvicePdf(reference:string,advocate:{name:string;enrolment?:string|null;city?:string|null},value:unknown){
 const c=Content.parse(value),pdf=await PDFDocument.create(),text=new PdfText(pdf,await embedTextFonts(pdf));let page=pdf.addPage([595,842]),top=42;
 const draw=(s:string,bold=false)=>{if(unsupportedCharacters(s).length)throw new BadRequestException('Use supported Latin or Devanagari characters.');for(const line of text.wrap([{text:s,weight:bold?'bold':'regular'}],507,bold?13:11)){if(needsPage(top,24,790)){page=pdf.addPage([595,842]);top=44;}text.draw(page,line,44,top,bold?13:11,rgb(.12,.12,.12));top+=18;}};
 draw(advocate.name,true);if(advocate.enrolment)draw('Bar enrolment: '+advocate.enrolment);if(advocate.city)draw(advocate.city);top+=12;
 draw('Written Legal Advice & Action Plan',true);draw(reference);draw(c.title,true);top+=14;
 for(const [heading,body] of [['Background',c.background],['Legal opinion',c.opinion],['Action plan',c.action_plan]]){draw(heading,true);draw(body);top+=18;}
 for(const [i,p]of pdf.getPages().entries())text.draw(p,text.runs(`Page ${i+1} of ${pdf.getPageCount()}`),44,812,9,rgb(.4,.4,.4));
 pdf.setTitle(reference+' — Written Legal Advice');return pdf.save();
}
@Injectable()
export class LegalAdviceWritten {
 constructor(private readonly prisma:PrismaService,private readonly documents:DocumentService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
 async save(actor:CaseActor,id:string,body:unknown){
  adviceRole(actor,'advocate');const input=parse(z.strictObject({expected_revision:z.number().int().nonnegative(),content:Draft}),body),db=await this.prisma.getClient();
  await db.$transaction(async tx=>{const {b,data}=await adviceLocked(tx,actor,id);if(b.revision!==input.expected_revision||data.written?.status!=='pending')throw new ConflictException('Save the current pending written advice task.');data.written.content=JSON.stringify(input.content);await tx.legalAdviceBooking.update({where:{case_id:id},data:{session:adviceJson(data),revision:{increment:1}}});});return {saved:true};
 }
 async deliver(actor:CaseActor,id:string,body:unknown){
  adviceRole(actor,'advocate');const {expected_revision}=parse(z.strictObject({expected_revision:z.number().int().nonnegative()}),body),db=await this.prisma.getClient();
  const loaded=await db.$transaction(async tx=>{const value=await adviceLocked(tx,actor,id);if(value.b.revision!==expected_revision||value.data.written?.status!=='pending'||!value.data.written.content)throw new ConflictException('Save the current written advice before delivering.');const user=await tx.user.findUniqueOrThrow({where:{id:actor.id},include:{advocate_profiles_user_id_relations:true}});return {...value,user};});
  const profile=loaded.user.advocate_profiles_user_id_relations;
  const content=parse(Content,JSON.parse(loaded.data.written!.content!));
  const bytes=await renderAdvicePdf(loaded.c.reference,{name:loaded.user.full_name,city:profile?.city,enrolment:profile?.bar_council_number},content);
  const ticket=await this.documents.presign(actor,{case_id:id,kind:'consultation_report',filename:'Written-Legal-Advice.pdf',mime:'application/pdf'},{consultationReport:true});
  const form=new FormData();for(const [k,v]of Object.entries(ticket.upload.fields))form.append(k,v);form.append('file',new Blob([Buffer.from(bytes)],{type:'application/pdf'}),'Written-Legal-Advice.pdf');
  if(!(await fetch(ticket.upload.url,{method:'POST',body:form})).ok)throw new ConflictException('PDF upload failed. Retry delivery.');await this.documents.complete(actor,ticket.document.id);
  await db.$transaction(async tx=>{const {b,data,c}=await adviceLocked(tx,actor,id);if(b.revision!==expected_revision||data.written?.status!=='pending')throw new ConflictException('The task changed while generating the PDF. Reload.');data.written={...data.written,status:'delivered',document_id:ticket.document.id,delivered_at:new Date().toISOString()};await tx.legalAdviceBooking.update({where:{case_id:id},data:{session:adviceJson(data),revision:{increment:1}}});await tx.legalAdviceEvent.create({data:{case_id:id,actor_id:actor.id,kind:'written_advice_delivered',visibility:'public',data:{document_id:ticket.document.id}}});await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'written_advice_delivered',title:'Your written legal advice is ready'});});return {document_id:ticket.document.id};
 }
}
