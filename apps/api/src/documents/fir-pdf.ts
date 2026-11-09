import 'regenerator-runtime/runtime';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import {PDFDocument, type PDFFont} from 'pdf-lib';
import {FIR_FIELDS, type FirDraftContent} from '@legalitt/shared';
import {unsupportedCharacters} from './notice-pdf';

// The numbered sections follow design 218. Only entered values are printed.
export async function renderFirPdf(reference: string, content: FirDraftContent, documents: string[]) {
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const fonts = await Promise.all(['NotoSans-Regular.ttf','NotoSansDevanagari-Regular.ttf'].map(name =>
    pdf.embedFont(readFileSync(resolve(__dirname,'../../../assets/fonts',name)), {subset: true})));
  const lines: string[] = ['FIRST INFORMATION REPORT', 'FORM I — POLICE INFORMATION PROFORMA', reference];
  for (const [title, fields] of FIR_FIELDS) {
    const filled = fields.filter(key => content.fields[key]?.trim());
    if (filled.length) lines.push('', title, ...filled.map(key => `${key}: ${content.fields[key]}`));
  }
  if (content.legal_sections.length) lines.push('', 'Applicable Legal Sections', ...content.legal_sections);
  lines.push('', 'Statement of Facts', content.narrative);
  if (content.witnesses.length) lines.push('', 'Witnesses', ...content.witnesses);
  if (documents.length) lines.push('', 'Attached Documents', ...documents);
  if (unsupportedCharacters(lines.join('\n')).length) throw new Error('The PDF contains unsupported characters. Use supported Latin or Devanagari text before sending.');
  let page = pdf.addPage([595,842]), y = 798;
  const fontFor = (s: string) => fonts[/[ऀ-ॿ꣠-ꣿ᳐-᳿]/.test(s) ? 1 : 0];
  const runs = (s: string) => {
    const result: {text: string; font: PDFFont}[] = [];
    for (const part of new Intl.Segmenter('en',{granularity:'grapheme'}).segment(s)) {
      const font = fontFor(part.segment), last = result.at(-1);
      if (last?.font === font) last.text += part.segment; else result.push({text: part.segment,font});
    }
    return result;
  };
  const width = (s: string) => runs(s).reduce((n,r) => n+r.font.widthOfTextAtSize(r.text,11),0);
  const print = (s: string) => {
    if (y < 48) {page = pdf.addPage([595,842]); y = 798;}
    let x = 44;
    for (const run of runs(s)) {page.drawText(run.text,{x,y,font:run.font,size:11}); x += run.font.widthOfTextAtSize(run.text,11);}
    y -= 17;
  };
  for (const paragraph of lines.flatMap(line => line.split(/\r?\n/))) {
    let line = '';
    for (const part of new Intl.Segmenter('en',{granularity:'grapheme'}).segment(paragraph)) {
      if (width(line + part.segment) > 507) {print(line); line = '';}
      line += part.segment;
    }
    print(line);
  }
  return pdf.save();
}
