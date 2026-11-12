import {PDFDocument,rgb,type PDFPage} from 'pdf-lib';
import {FirDraftContentSchema,firDraftProblems,firDraftStation,firPdfSections,type FirDraftContent} from '@legalitt/shared';
import {PdfText,embedTextFonts,needsPage,unsupportedCharacters} from './pdf-text';

// Design447's eight numbered sections, with neutral jurisdiction branding.
// Only the three typed station-use fields are left for handwriting. No identity
// document is printed or listed (Q114).
export async function renderFirPdf(reference:string,input:FirDraftContent){
 const content=FirDraftContentSchema.parse(input),problems=firDraftProblems(content);
 if(problems.length)throw new Error(problems.map(p=>p.message).join('\n'));
 const sections=firPdfSections(content);
 for(const section of sections)for(const line of section.lines){
  const unsupported=unsupportedCharacters(line.value);
  if(unsupported.length)throw new Error(`${section.title}${line.label?` — ${line.label}`:''}: unsupported characters (${unsupported.join(' ')}). Use supported Latin or Devanagari text before generating the PDF.`);
 }
 const pdf=await PDFDocument.create();pdf.setTitle(`${reference} — FIR proforma`);
 // The same frozen version previews and sends reproducibly.
 const date=new Date(content.filing_snapshot.captured_at);pdf.setCreationDate(date);pdf.setModificationDate(date);
 const text=new PdfText(pdf,await embedTextFonts(pdf));
 let page:PDFPage,top=0;
 const ink=rgb(.12,.12,.12),muted=rgb(.35,.35,.35),left=44,right=551,bottom=790;
 const draw=(value:string,size=10,weight:'regular'|'bold'='regular',color=ink)=>{
  for(const row of text.wrap([{text:value,weight}],right-left,size)){
   ensure(size+6);text.draw(page,row,left,top,size,color);top+=size+6;
  }
 };
 // Flow A5 [DECIDE]: the heading names who it is for, never a police office as its author.
 // The station is the advocate's edit when there is one (flow A5 §1); an edited
 // "District & State" box replaces the filed state.
 const j=content.police_filing.jurisdiction.value,place=content.overrides?.district_state??j.state;
 const heading=`FIR DRAFT — prepared for submission at ${[firDraftStation(content),place].map(v=>v.trim()).filter(Boolean).join(', ')}`;
 const newPage=()=>{
  page=pdf.addPage([595,842]);top=35;
  for(const row of text.wrap([{text:heading,weight:'bold'}],right-left,13)){text.draw(page,row,left,top,13,ink);top+=18;}top+=5;
  // The proforma's own name, as on the editor (flow A5): never a police office as author.
  text.draw(page,text.runs('FIRST INFORMATION REPORT','bold'),left,top,11,ink);top+=16;
  text.draw(page,text.runs('FORM I — POLICE INFORMATION PROFORMA'),left,top,10,ink);top+=19;
  text.draw(page,text.runs(reference),left,top,9,muted);top+=23;
  page.drawLine({start:{x:left,y:842-top},end:{x:right,y:842-top},thickness:.7,color:muted});top+=14;
 };
 const ensure=(height:number)=>{if(needsPage(top,height,bottom))newPage();};
 newPage();
 for(const [index,section]of sections.entries()){
  ensure(60);draw(section.title,12,'bold');top+=6;
  for(const line of section.lines)draw(line.label?`${line.label}: ${line.value}`:line.value);
  if(index===0){
   ensure(126);top+=6;draw('For completion at the police station',10,'bold',muted);
   for(const label of ['FIR number','Date / time received at the station','Receiving officer’s signature']){
    draw(label,9,'regular',muted);top+=10;
    page!.drawLine({start:{x:left,y:842-top},end:{x:right,y:842-top},thickness:.5,color:muted});top+=10;
   }
  }
  top+=14;
 }
 for(const [n,p]of pdf.getPages().entries())text.draw(p,text.runs(`Page ${n+1} of ${pdf.getPageCount()}`),left,810,9,muted);
 return pdf.save();
}
