import {PDFDocument, rgb, type PDFPage} from 'pdf-lib';
import {FORENSIC_SECTIONS, forensicProblems, type Affidavit, type ForensicReport} from '@legalitt/shared';
import {PdfText, embedTextFonts, needsPage, unsupportedCharacters} from '../documents/pdf-text';

// Designs 226 ("Preliminary Forensic Examination Report", created by Legalitt)
// and 227 ("Affidavit of Forensic Examination — before the competent legal
// authority"). Plain neutral layout: only values the advocate entered or the
// case holds are printed; nothing is left blank for handwriting.

export type ForensicPdfInput = {
  reference: string; client: string; documentName: string; documentType: string | null;
  report: ForensicReport; affidavit: Affidavit; signedAt: string | null; generatedAt: Date;
};

function check(label: string, value: string) {
  const bad = unsupportedCharacters(value);
  if (bad.length) throw new Error(`${label}: unsupported characters (${bad.join(' ')}). Use supported Latin or Devanagari text.`);
}

async function layout(title: string, subtitle: string, reference: string, at: Date,
  body: (h: {heading(v: string): void; para(v: string, muted?: boolean): void; gap(n?: number): void}) => void) {
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
  });
  for (const [n, p] of pdf.getPages().entries())
    text.draw(p, text.runs(`Created by Legalitt · Page ${n + 1} of ${pdf.getPageCount()}`), left, 808, 8.5, muted);
  return pdf.save();
}

export async function renderForensicPdfs(input: ForensicPdfInput) {
  const problems = forensicProblems({report: input.report, affidavit: input.affidavit, signed_at: input.signedAt});
  if (problems.length) throw new Error(problems.map(p => p.message).join('\n'));
  for (const s of FORENSIC_SECTIONS) check(s.title, input.report[s.key]);
  for (const [i, p] of input.affidavit.paragraphs.entries()) check(`Affidavit statement ${i + 1}`, p);
  for (const [k, v] of Object.entries({Client: input.client, Document: input.documentName, Deponent: input.affidavit.deponent_name,
    'Office address': input.affidavit.office_address, Enrolment: input.affidavit.enrolment_number})) check(k, v);
  const day = (iso: Date) => iso.toLocaleDateString('en-GB', {timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric'});
  const report = await layout('Preliminary Forensic Examination Report', 'Advocate examination · physical & optical review', input.reference, input.generatedAt, h => {
    h.heading('Client Information');
    h.para(`Client: ${input.client}`); h.para('Case type: Document Forensic');
    h.heading('Submitted Document');
    h.para(input.documentType ? `${input.documentName} · ${input.documentType}` : input.documentName);
    for (const s of FORENSIC_SECTIONS) { h.heading(`${s.title} (${s.tag})`); h.para(input.report[s.key]); }
    h.gap();
    h.heading('Advocate Examination Notice');
    h.para('This forensic evaluation was prepared by the advocate named below on the basis of their direct physical and optical examination of the submitted document. It is not a laboratory (FSL) report.', true);
    h.para(`Prepared by ${input.affidavit.deponent_name}, Advocate (Enrolment ${input.affidavit.enrolment_number}) · ${day(input.generatedAt)}`);
  });
  const affidavit = await layout('Affidavit of Forensic Examination', 'Before the competent legal authority · proforma verification', input.reference, input.generatedAt, h => {
    const a = input.affidavit;
    h.para(`Deponent Identity: I, Adv. ${a.deponent_name}, Advocate enrolled with State Bar Council (Enr: ${a.enrolment_number})${a.age ? `, aged ${a.age} years` : ''}, having my office at ${a.office_address}, do hereby solemnly affirm and state on oath as under:`);
    h.gap(6);
    a.paragraphs.filter(p => p.trim()).forEach((p, i) => { h.para(`${i + 1}. ${p}`); h.gap(6); });
    h.gap(14);
    h.heading('Advocate Signature');
    h.para(`Electronically signed by declaration: Adv. ${a.deponent_name} (Enr: ${a.enrolment_number})`);
    h.para(`Signed: ${new Date(input.signedAt!).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})} IST`);
    h.para('The deponent confirmed this declaration in the Legalitt advocate app. No handwritten or digital-certificate signature is embedded in this file.', true);
  });
  return [
    {filename: 'Forensic_Report.pdf', kind: 'forensic_report', bytes: report},
    {filename: 'Affidavit.pdf', kind: 'forensic_affidavit', bytes: affidavit},
  ];
}
