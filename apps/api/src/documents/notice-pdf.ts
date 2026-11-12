// fontkit's Indic shaper is compiled against regenerator; load the runtime first.
import 'regenerator-runtime/runtime';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFPage, type PDFImage, type RGB,  } from 'pdf-lib';
import { DEFAULT_NOTICE_POLICY, noticeClosing, noticePdfProblem, noticeSenderIntroduction, type NoticeSenderPhrase, type NoticePolicy, type NoticeDraftContent } from '@legalitt/shared';
import { noticeLetterhead as t } from './notice-letterhead';
import {PdfText,embedTextFonts,needsPage,type Run,type Span,type Weight} from './pdf-text';
export {unsupportedCharacters} from './pdf-text';

export type NoticePdfInput = {
  reference: string; date: Date; place?: string | null;
  advocate?: {name?: string | null; qualifications?: string | null; enrolment?: string | null};
  sender?: NoticeSenderPhrase;
  recipient?: {name?: string | null; address?: string | null};
  subject?: string | null; demands?: string[]; serviceFeePaise?: bigint | string | null;
  compliancePeriodDays?: number | null; closingPolicy?: NoticePolicy;
  content: NoticeDraftContent;
};
const ASSETS = resolve(__dirname, '../../../assets');
const color = (hex: string) => rgb(...[1, 3, 5].map(i => parseInt(hex.slice(i,i+2),16)/255) as [number,number,number]);
const INK=color(t.ink), GOLD=color(t.gold), WHITE=color(t.white), BAND=color(t.band);
const X=(px:number)=>px*t.width/t.sourceWidth, Y=(px:number)=>px*t.height/t.sourceHeight;
const BODY=X(t.bodySize), LEAD=Y(t.leading), LEFT=X(t.left), RIGHT=X(t.right), BOTTOM=Y(852);
const paragraphs=(text:string)=>text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const dateText=(date:Date)=>date.toLocaleDateString('en-GB',{timeZone:'Asia/Kolkata'});
class Letter {
  page!:PDFPage;
  top=0;
  headerBottom=Y(t.headerHeight+t.headerRule);
  private readonly typography:PdfText;
  constructor(private readonly pdf:PDFDocument,fonts:Awaited<ReturnType<typeof embedTextFonts>>,
    private readonly wordmark:PDFImage,private readonly input:NoticePdfInput) {this.typography=new PdfText(pdf,fonts);}
  runs(text:string,weight:Weight='regular'){return this.typography.runs(text,weight);}
  width(runs:Run[],size=BODY){return this.typography.width(runs,size);}
  wrap(spans:Span[],max:number,size=BODY){return this.typography.wrap(spans,max,size);}
  draw(runs:Run[],x:number,top:number,size=BODY,ink=INK){this.typography.draw(this.page,runs,x,top,size,ink);}
  text(text:string,x:number,top:number,size=BODY,weight:Weight='regular',ink=INK){this.draw(this.runs(text,weight),x,top,size,ink);}
  line(x:number,top:number,x2:number,ink=INK,thickness=X(0.6)){
    this.page.drawLine({start:{x,y:t.height-top},end:{x:x2,y:t.height-top},thickness,color:ink});
  }
  rectangle(x:number,top:number,width:number,height:number,ink:RGB){this.page.drawRectangle({x,y:t.height-top-height,width,height,color:ink});}
  private header(){
    const adv=this.input.advocate;
    const names=this.wrap([{text:adv?.name??''}],X(281),X(16));
    const quals=this.wrap([{text:adv?.qualifications??''}],X(267),X(11));
    const enrol=this.wrap([{text:adv?.enrolment?`Enrollment No :- ${adv.enrolment}`:''}],X(267),X(11));
    const block=names.length*Y(21)+quals.length*Y(17)+enrol.length*Y(17)+Y(14);
    const h=Math.max(Y(t.headerHeight),block+Y(42));
    this.headerBottom=h+Y(t.headerRule);
    this.rectangle(0,0,t.width,h,BAND);this.rectangle(0,h,t.width,Y(t.headerRule),GOLD);
    // The logo mark is six vector hexagons; only the supplied wordmark is raster
    // artwork. All document lettering remains selectable Noto text.
    const cx=X(49),cy=Y(43),ring=X(16),r=X(7.5);
    for(let i=0;i<6;i++){
      const a=(-90+i*60)*Math.PI/180,hx=cx+ring*Math.cos(a),hy=cy+ring*Math.sin(a);
      const vertices=Array.from({length:6},(_,j)=>{const angle=(-90+j*60)*Math.PI/180;return `${hx+r*Math.cos(angle)},${hy+r*Math.sin(angle)}`;});
      this.page.drawSvgPath(`M${vertices.join(' L')} Z`,{x:0,y:t.height,color:GOLD});
    }
    this.page.drawImage(this.wordmark,{x:X(80),y:t.height-Y(29)-Y(34),width:X(123),height:Y(34)});
    this.text(t.firm,X(80),Y(67),X(9),'regular',GOLD);
    // Envelope/globe line art at the measured positions.
    this.page.drawRectangle({x:X(32),y:t.height-Y(104),width:X(14),height:Y(10),borderColor:GOLD,borderWidth:X(1)});
    this.page.drawLine({start:{x:X(32),y:t.height-Y(94)},end:{x:X(39),y:t.height-Y(100)},color:GOLD,thickness:X(1)});
    this.page.drawLine({start:{x:X(46),y:t.height-Y(94)},end:{x:X(39),y:t.height-Y(100)},color:GOLD,thickness:X(1)});
    this.page.drawCircle({x:X(39),y:t.height-Y(121),size:X(7),borderColor:GOLD,borderWidth:X(1)});
    this.page.drawEllipse({x:X(39),y:t.height-Y(121),xScale:X(3),yScale:Y(7),borderColor:GOLD,borderWidth:X(0.7)});
    this.line(X(32),Y(121),X(46),GOLD,X(0.7));
    this.text(t.email,X(52),Y(94),X(11),'regular',WHITE);
    this.text(t.website,X(52),Y(116),X(11),'regular',WHITE);
    this.page.drawLine({start:{x:X(328),y:t.height-Y(21)},end:{x:X(328),y:t.height-h+Y(16)},thickness:X(0.6),color:GOLD,opacity:0.5});
    let top=Math.max(Y(49),(h-block)/2);
    for(const [rows,size,lead,ink]of [[names,X(16),Y(21),WHITE],[quals,X(11),Y(17),WHITE],[enrol,X(11),Y(17),GOLD]] as const){
      if(!rows.length)continue;
      if(rows===quals && rows.length===1){
        const half=this.width(rows[0],size)/2+X(7),cy=top+size/2;
        for(const [start,end,tip]of [[X(391),X(492)-half,X(391)],[X(492)+half,X(597),X(597)]]){
          if(end>start){this.line(start,cy,end,GOLD,X(0.6));
            this.page.drawSvgPath(`M${tip},${cy-X(3)} L${tip+X(3)},${cy} L${tip},${cy+X(3)} L${tip-X(3)},${cy} Z`,{x:0,y:t.height,color:GOLD});}
        }
      }
      for(const row of rows){this.draw(row,X(492)-this.width(row,size)/2,top,size,ink);top+=lead;}
      top+=Y(5);
    }
  }
  private footer(){
    this.rectangle(0,Y(t.footerRuleTop),t.width,Y(6),GOLD);
    this.rectangle(0,Y(t.footerTop),t.width,t.height-Y(t.footerTop),BAND);
    const rows=this.wrap([{text:t.disclaimer}],X(586),X(6));
    let top=Y(898);for(const row of rows){this.draw(row,X(36),top,X(6),WHITE);top+=Y(8);}
  }
  newPage(){this.page=this.pdf.addPage([t.width,t.height]);this.header();this.footer();this.top=this.headerBottom+Y(24);}
  ensure(height:number){if(needsPage(this.top,height,BOTTOM))this.newPage();}
  gap(px:number){this.top+=Y(px);}
  paragraph(spans:string|Span[],indent=0,size=BODY,leading=LEAD){
    const rows=this.wrap(typeof spans==='string'?[{text:spans}]:spans,RIGHT-LEFT-indent,size);
    for(const row of rows){this.ensure(leading);this.draw(row,LEFT+indent,this.top,size);this.top+=leading;}
  }
  numbered(label:string,text:string){
    const indent=X(18),rows=this.wrap([{text}],RIGHT-LEFT-indent);
    this.ensure(LEAD);this.text(label,LEFT,this.top);
    for(const row of rows){this.ensure(LEAD);this.draw(row,LEFT+indent,this.top);this.top+=LEAD;}
    this.gap(3);
  }
  render(){
    const i=this.input;this.newPage();
    this.top=this.headerBottom+Y(t.titleTop-t.headerHeight-t.headerRule);
    const title=this.runs('LEGAL NOTICE','bold');this.draw(title,(t.width-this.width(title,X(t.titleSize)))/2,this.top,X(t.titleSize));
    this.line(X(179),this.top+Y(30),X(495),GOLD,X(1));
    this.top+=Y(49);
    // The drawn "/20__" is where an advocate writes the year by hand; the reference
    // already carries it (owner decision, 4 November 2026), so no suffix prints.
    const reference=`${t.referenceLabel} ${i.reference}`;
    const date=`Date: ${dateText(i.date)}`;
    this.paragraph(reference,0,X(14),Y(21));
    // Ordinary references fit alongside Date; unusually long references reflow.
    if(this.width(this.runs(reference),X(14))<X(423))this.text(date,X(455),this.top-Y(21),X(14));
    else this.paragraph(date,0,X(14),Y(21));
    this.gap(18);this.paragraph('To,',0,X(14),Y(21));
    const recipient=paragraphs(i.content.recipient);
    recipient.forEach(s=>this.paragraph(s,X(21)));
    this.gap(20);
    this.paragraph([{text:'Subject: ',weight:'bold'},{text:i.content.subject.trim()}]);this.gap(17);
    this.paragraph('Under instructions and authority from my client:');
    paragraphs(i.content.sender).forEach(line=>this.paragraph(line));
    this.paragraph('I hereby serve upon you this Legal Notice as under:');
    this.gap(8);
    paragraphs(i.content.facts).forEach((fact,n)=>this.numbered(`${n+1}.`,fact.replace(/^\d+[.)]\s+/,'')));
    this.gap(7);this.ensure(2*LEAD);
    this.paragraph('Therefore, Through this Legal Notice, I call upon you to:');this.gap(4);
    paragraphs(i.content.demand).forEach((d,n)=>{
      let k=n+1,label='';while(k){k--;label=String.fromCharCode(65+k%26)+label;k=Math.floor(k/26);}
      this.numbered(`${label}.`,d);
    });
    this.gap(16);
    const closing=noticeClosing(i.closingPolicy??DEFAULT_NOTICE_POLICY,i.compliancePeriodDays??null);
    if(closing.compliance){this.paragraph(closing.compliance);this.gap(7);}
    paragraphs(i.content.closing).forEach(line=>this.paragraph(line));
    this.gap(7);
    const fee=`₹${(Number(i.serviceFeePaise)/100).toLocaleString('en-IN',{maximumFractionDigits:0})}`;
    this.paragraph(`Further you are hereby called to pay ${fee} as the cost of this legal notice.`);
    this.gap(10);this.paragraph(t.copy);this.gap(12);
    this.ensure(Y(92));
    this.text('For',X(505),this.top,X(14));this.top+=Y(22);
    this.text(t.signFirm,X(422),this.top,X(14));this.top+=Y(20);
    this.paragraph(`Place : ${i.place!.trim()}`,0,X(14),Y(26));
    this.paragraph(`Date : ${dateText(i.date)}`,0,X(14),Y(26));
    this.line(X(460),this.top-Y(8),X(570)); // Blank: signed only by hand.
  }
}

export async function renderNoticePdf(input:NoticePdfInput):Promise<Uint8Array>{
  const problem=noticePdfProblem(input);
  if(problem)throw Object.assign(new Error(problem.message),problem);
  const pdf=await PDFDocument.create();
  pdf.setTitle(input.reference);pdf.setCreationDate(input.date);pdf.setModificationDate(input.date);
  const fonts=await embedTextFonts(pdf);
  const wordmark=await pdf.embedPng(readFileSync(resolve(ASSETS,'letterhead/legalitt-wordmark-white.png')));
  new Letter(pdf,fonts,wordmark,input).render();return pdf.save();
}
