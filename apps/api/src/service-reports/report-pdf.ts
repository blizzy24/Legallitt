import {PDFDocument, rgb, type PDFPage} from 'pdf-lib';
import {FORENSIC_SECTIONS, forensicProblems, propertyReportProblems, PropertySearchIntakeSchema, PROPERTY_TYPES, SEARCH_DURATIONS, labelOf, type PropertyReport,type ReportSignature,type Affidavit, type ForensicReport} from '@legalitt/shared';
import {PdfText, embedTextFonts, needsPage, unsupportedCharacters} from '../documents/pdf-text';

// Designs 226 ("Preliminary Forensic Examination Report", created by Legalitt)
// and 227 ("Affidavit of Forensic Examination — before the competent legal
// authority"). Plain neutral layout: only values the advocate entered or the
// case holds are printed; nothing is left blank for handwriting.

export type ForensicPdfInput = {
  reference: string; client: string; documentName: string; documentType: string | null;
  report: ForensicReport; affidavit: Affidavit; signature?:ReportSignature; signedAt: string | null; generatedAt: Date;
};

function check(label: string, value: string) {
  const bad = unsupportedCharacters(value);
  if (bad.length) throw new Error(`${label}: unsupported characters (${bad.join(' ')}). Use supported Latin or Devanagari text.`);
}

async function layout(title: string, subtitle: string, reference: string, at: Date,
  body: (h: {heading(v: string): void; para(v: string, muted?: boolean): void; gap(n?: number): void;signature(v:ReportSignature):void}) => void) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${reference} — ${title}`); pdf.setCreationDate(at); pdf.setModificationDate(at);
  const text = new PdfText(pdf, await embedTextFonts(pdf));
  const ink = rgb(.12, .12, .12), muted = rgb(.38, .38, .38), left = 50, right = 545, bottom = 785;
  let page!: PDFPage, top = 0;
  const newPage = () => {
    page = pdf.addPage([595, 842]); top = 40;
    text.draw(page, text.runs(title.toUpperCase(), 'bold'), left, top, 14, ink); top += 22;
    text.draw(page, text.runs(subtitle), left, top, 10, muted); top += 16;
    text.draw(page, text.runs(`Request ID: ${reference}`), left, top, 9, muted); top += 18;
    page.drawLine({start: {x: left, y: 842 - top}, end: {x: right, y: 842 - top}, thickness: .7, color: muted}); top += 16;
  };
  const draw = (value: string, size: number, weight: 'regular' | 'bold', color = ink) => {
    for (const row of text.wrap([{text: value, weight}], right - left, size)) {
      if (needsPage(top, size + 6, bottom)) newPage();
      text.draw(page, row, left, top, size, color); top += size + 6;
    }
  };
  newPage();
  body({
    heading: v => { if (needsPage(top, 50, bottom)) newPage(); top += 4; draw(v, 12, 'bold'); top += 2; },
    para: (v, m) => { for (const line of v.split(/\r?\n/)) line.trim() ? draw(line.trim(), 10.5, 'regular', m ? muted : ink) : (top += 6); },
    gap: (n = 10) => { top += n; },
    signature: strokes=>{if(needsPage(top,90,bottom))newPage();for(const stroke of strokes)for(let i=1;i<stroke.length;i++)page.drawLine({start:{x:left+stroke[i-1].x*260,y:842-top-stroke[i-1].y*80},end:{x:left+stroke[i].x*260,y:842-top-stroke[i].y*80},thickness:1.2,color:ink});top+=95;},
  });
  for (const [n, p] of pdf.getPages().entries())
    text.draw(p, text.runs(`Created by Legalitt · Page ${n + 1} of ${pdf.getPageCount()}`), left, 808, 8.5, muted);
  return pdf.save();
}

export async function renderForensicPdfs(input: ForensicPdfInput) {
  const problems = forensicProblems({report: input.report, affidavit: input.affidavit, signature:input.signature,signed_at: input.signedAt});
  if (problems.length) throw new Error(problems.map(p => p.message).join('\n'));
  for (const s of FORENSIC_SECTIONS) check(s.title, input.report[s.key]);
  for (const [i, p] of input.affidavit.paragraphs.entries()) check(`Affidavit statement ${i + 1}`, p);
  for (const [k, v] of Object.entries({Client: input.client, Document: input.documentName, Deponent: input.affidavit.deponent_name,
    'Office address': input.affidavit.office_address, Enrolment: input.affidavit.enrolment_number})) check(k, v);
  const day = (iso: Date) => iso.toLocaleDateString('en-GB', {timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric'});
  const report = await layout('Preliminary Forensic Examination Report', 'Advocate examination · scope and methods stated below', input.reference, input.generatedAt, h => {
    h.heading('Client Information');
    h.para(`Client: ${input.client}`); h.para('Case type: Document Forensic');
    h.heading('Submitted Document');
    h.para(input.documentType ? `${input.documentName} · ${input.documentType}` : input.documentName);
    for (const s of FORENSIC_SECTIONS) { h.heading(`${s.title} (${s.tag})`); h.para(input.report[s.key]); }
    h.gap();
    h.heading('Advocate Examination Notice');
    h.para('This preliminary evaluation was prepared by the advocate named below using the materials and methods stated in this report. An uploaded copy does not establish examination of the original. This is not a laboratory (FSL) report.', true);
    h.para(`Prepared by ${input.affidavit.deponent_name}, Advocate (Enrolment ${input.affidavit.enrolment_number}) · ${day(input.generatedAt)}`);
  });
  const affidavit = await layout('Affidavit of Forensic Examination', 'Before the competent legal authority · proforma verification', input.reference, input.generatedAt, h => {
    const a = input.affidavit;
    h.para(`Deponent Identity: I, Adv. ${a.deponent_name}, Advocate enrolled with State Bar Council (Enr: ${a.enrolment_number})${a.age ? `, aged ${a.age} years` : ''}, having my office at ${a.office_address}, do hereby solemnly affirm and state on oath as under:`);
    h.gap(6);
    a.paragraphs.filter(p => p.trim()).forEach((p, i) => { h.para(`${i + 1}. ${p}`); h.gap(6); });
    h.gap(14);
    h.heading('Advocate Signature');
    h.signature(input.signature!);
    h.para(`Declaration confirmed in app by Adv. ${a.deponent_name} (Enr: ${a.enrolment_number})`);
    h.para(`Signed: ${new Date(input.signedAt!).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST`);
    h.para('This is a proforma for formal execution before the appropriate authority. The signature was drawn in the Legalitt app; it is not a digital-certificate signature, notarisation or administration of an oath.', true);
  });
  return [
    {filename: 'Forensic_Report.pdf', kind: 'forensic_report', bytes: report},
    {filename: 'Affidavit.pdf', kind: 'forensic_affidavit', bytes: affidavit},
  ];
}

export async function renderPropertyPdf(input:{reference:string;intake:unknown;report:PropertyReport;generatedAt:Date}){
 const issues=propertyReportProblems(input.report);if(issues.length)throw new Error(issues.map(i=>i.message).join('\n'));
 const f=PropertySearchIntakeSchema.parse(input.intake),r=input.report;
 for(const value of [JSON.stringify(f),JSON.stringify(r)])check('Property report',value);
 return layout('Property Search Report','Advocate research · client filing identified below',input.reference,input.generatedAt,h=>{
   const value=(label:string,v:string|null|undefined)=>{if(v?.trim())h.para(`${label}: ${v}`);};
   h.heading('1. Client Details — From client’s filing');value('Name',f.contact.fullName);value('Mobile',f.contact.mobile);value('Email',f.contact.email);
   h.heading('2. Property Details — From client’s filing');value('Type',labelOf(PROPERTY_TYPES,f.property_type));value('Address',f.property_address);value('State',f.jurisdiction.state);value('District',f.jurisdiction.district);value('Ward',f.jurisdiction.ward);value('Tehsil / village',f.jurisdiction.tehsil);value('Colony',f.jurisdiction.colony);value('Survey / plot / khata number',f.survey_number);value('Requested search duration',labelOf(SEARCH_DURATIONS,f.search_duration));value('Purpose / requirement',f.requirement);
   h.heading('3. Owner Details');h.para(r.owner_details);
   h.heading('4. Documents Checked');for(const [i,d]of r.documents_checked.entries())h.para(`${i+1}. ${d.description}${d.reference?` — ${d.reference}`:''}`);
   h.heading('5. Search Details');value('Search date',r.search_date);value('Search period',r.search_period);value('Records inspected',r.records_inspected);value('Place / registry office',r.registry_office);value('Additional search notes',r.search_notes);
   h.heading('6. Ownership History');h.para(r.ownership_history);h.heading('7. Search Findings');h.para(r.findings);h.heading('8. Search Conclusion');h.para(r.conclusion);
   h.gap();h.para('Prepared from the client’s filing and the advocate’s recorded research. The advocate must verify and sign the final report before uploading it for delivery.',true);
 });
}
