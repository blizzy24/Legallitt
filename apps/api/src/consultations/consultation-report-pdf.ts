import {PDFDocument,rgb,type PDFPage} from 'pdf-lib';
import {ConsultationReportContentSchema,consultationServiceName,type ConsultationServiceCode,type ConsultationIntake} from '@legalitt/shared';
import {PdfText,embedTextFonts,needsPage,unsupportedCharacters} from '../documents/pdf-text';

export async function renderConsultationReport(input:{reference:string;service:ConsultationServiceCode;version:number;kind:string;created_at:Date;intake:ConsultationIntake;advocate:string;content:unknown;attachments:{filename:string}[]}){
  const c=ConsultationReportContentSchema.parse(input.content);
  const sections=[
    ['From client’s filing',`${input.intake.full_name}\n${input.intake.matter_type}\n${input.intake.title}\n${input.intake.description}`],
    ['Key points discussed',c.key_points],['Next steps',c.next_steps],['Outcome',c.outcome],
    ...(input.attachments.length?[['Attachments',input.attachments.map((a,i)=>`${i+1}. ${a.filename}`).join('\n')]]:[]),
  ];
  for(const value of [input.advocate,...sections.flat()])if(unsupportedCharacters(value).length)throw new Error('The brief contains unsupported characters. Use Latin or Devanagari text before generating the PDF.');
  const pdf=await PDFDocument.create();pdf.setTitle(`${input.reference} — ${input.kind==='completion'?'Completion summary':'Consultation brief'}`);
  pdf.setCreationDate(input.created_at);pdf.setModificationDate(input.created_at);
  const text=new PdfText(pdf,await embedTextFonts(pdf)),ink=rgb(.12,.12,.12),muted=rgb(.4,.4,.4);
  let page:PDFPage,top=0;
  const newPage=()=>{page=pdf.addPage([595,842]);top=40;text.draw(page,text.runs(consultationServiceName(input.service),'bold'),44,top,14,ink);top+=25;
    text.draw(page,text.runs(`${input.reference} • Version ${input.version}`),44,top,9,muted);top+=30;};
  const draw=(value:string,bold=false)=>{for(const line of text.wrap([{text:value,weight:bold?'bold':'regular'}],507,bold?12:10)){
    if(needsPage(top,20,790))newPage();text.draw(page,line,44,top,bold?12:10,ink);top+=16;
  }};
  newPage();draw(input.kind==='completion'?'Completion summary':'Consultation brief',true);draw(`Prepared by ${input.advocate}`);top+=15;
  for(const [heading,value]of sections){if(needsPage(top,65,790))newPage();draw(heading,true);top+=6;draw(value);top+=18;}
  for(const [n,p]of pdf.getPages().entries())text.draw(p,text.runs(`Page ${n+1} of ${pdf.getPageCount()}`),44,812,9,muted);
  return pdf.save();
}
