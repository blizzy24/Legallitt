import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { NoticeDraftContent } from '@legalitt/shared';

// The notice as a document. No design draws the inside of a notice (266 is the
// editor, 189 a different letter), so this is a plain, conventional layout:
// sender block, date and place, recipient block, subject line, numbered body,
// closing. Every word is the advocate's; only the typography is ours. The
// section names drawn on 266 are the only headings (architecture §8, question 23).
export type NoticePdfInput = {
  reference: string;
  date: Date;
  place?: string | null;
  content: NoticeDraftContent;
  /** The final notice carries the recorded approval as design 192 describes it. */
  approval?: { clientName: string; approvedAt: Date };
};

const PAGE = { width: 595.28, height: 841.89 }; // A4
const MARGIN = 56, BODY = 11, LEAD = 16, SMALL = 9, INDENT = 22, GAP = 10;
const INK = rgb(0.1, 0.1, 0.1), MUTED = rgb(0.45, 0.45, 0.45);

const lines = (text: string) => text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const longDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const clock = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
// The standard fonts encode WinAnsi only. The rupee sign is spelled out; any
// other character outside the encoding is replaced rather than dropped.
function encodable(text: string, font: PDFFont) {
  return [...text.replace(/₹/g, 'Rs. ')].map(ch => { try { font.encodeText(ch); return ch; } catch { return '?'; } }).join('');
}

class Writer {
  private page!: PDFPage;
  private y = 0;
  private readonly pages: PDFPage[] = [];
  constructor(private readonly pdf: PDFDocument, readonly regular: PDFFont, readonly bold: PDFFont) { this.newPage(); }
  private newPage() {
    this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
    this.pages.push(this.page);
    this.y = PAGE.height - MARGIN;
  }
  private ensure(height: number) { if (this.y - height < MARGIN + LEAD) this.newPage(); }
  private wrap(text: string, font: PDFFont, width: number) {
    const out: string[] = [];
    for (const raw of text.split(/\s+/).filter(Boolean)) {
      const word = encodable(raw, font);
      const last = out[out.length - 1];
      if (last !== undefined && font.widthOfTextAtSize(`${last} ${word}`, BODY) <= width) out[out.length - 1] = `${last} ${word}`;
      else out.push(word);
    }
    return out;
  }
  gap(size = GAP) { this.y -= size; }
  paragraph(text: string, font = this.regular, indent = 0) {
    for (const line of this.wrap(text, font, PAGE.width - 2 * MARGIN - indent)) {
      this.ensure(LEAD);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - BODY, size: BODY, font, color: INK });
      this.y -= LEAD;
    }
  }
  heading(text: string) {
    this.ensure(3 * LEAD);
    this.gap(GAP / 2);
    this.paragraph(text, this.bold);
  }
  numbered(n: number, text: string) {
    const wrapped = this.wrap(text, this.regular, PAGE.width - 2 * MARGIN - INDENT);
    this.ensure(LEAD);
    this.page.drawText(`${n}.`, { x: MARGIN, y: this.y - BODY, size: BODY, font: this.regular, color: INK });
    for (const line of wrapped) {
      this.ensure(LEAD);
      this.page.drawText(line, { x: MARGIN + INDENT, y: this.y - BODY, size: BODY, font: this.regular, color: INK });
      this.y -= LEAD;
    }
    this.y -= GAP / 2;
  }
  /** A ruled box kept on one page, its first line bold. */
  box(rows: string[]) {
    const pad = 12, height = rows.length * LEAD + 2 * pad;
    this.ensure(height);
    this.page.drawRectangle({ x: MARGIN, y: this.y - height, width: PAGE.width - 2 * MARGIN, height, borderColor: MUTED, borderWidth: 0.75 });
    rows.forEach((row, i) => {
      const font = i === 0 ? this.bold : this.regular;
      this.page.drawText(encodable(row, font), { x: MARGIN + pad, y: this.y - pad - BODY - i * LEAD, size: BODY, font, color: INK });
    });
    this.y -= height;
  }
  finish(reference: string) {
    this.pages.forEach((page, i) => {
      const ref = encodable(reference, this.regular);
      page.drawText(ref, { x: PAGE.width - MARGIN - this.regular.widthOfTextAtSize(ref, SMALL), y: PAGE.height - MARGIN / 2, size: SMALL, font: this.regular, color: MUTED });
      const footer = `Page ${i + 1} of ${this.pages.length}`;
      page.drawText(footer, { x: (PAGE.width - this.regular.widthOfTextAtSize(footer, SMALL)) / 2, y: MARGIN / 2, size: SMALL, font: this.regular, color: MUTED });
    });
  }
}

export async function renderNoticePdf(input: NoticePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(input.reference);
  pdf.setCreationDate(input.date);
  pdf.setModificationDate(input.approval?.approvedAt ?? input.date);
  const w = new Writer(pdf, await pdf.embedFont(StandardFonts.Helvetica), await pdf.embedFont(StandardFonts.HelveticaBold));
  const c = input.content;
  lines(c.sender).forEach((line, i) => w.paragraph(line, i === 0 ? w.bold : w.regular));
  w.gap();
  w.paragraph(`Date: ${longDate(input.date)}`);
  if (input.place?.trim()) w.paragraph(`Place: ${input.place.trim()}`);
  w.gap();
  const recipient = lines(c.recipient);
  if (recipient.length) { w.paragraph('To,'); recipient.forEach(line => w.paragraph(line)); w.gap(); }
  if (c.subject.trim()) { w.paragraph(`Subject: ${c.subject.trim()}`, w.bold); w.gap(); }
  // The body is numbered continuously across facts and demand, one paragraph per line typed.
  let n = 0;
  for (const [heading, text] of [['Background & Facts', c.facts], ['Legal Demand', c.demand]] as const) {
    const paragraphs = lines(text);
    if (!paragraphs.length) continue;
    w.heading(heading);
    for (const paragraph of paragraphs) w.numbered(++n, paragraph);
    w.gap();
  }
  const closing = lines(c.closing);
  if (closing.length) { w.heading('Response Time & Closing'); closing.forEach(line => w.paragraph(line)); }
  // Design 192: "Signed by Client" — a record of the recorded approval, never a drawn signature.
  if (input.approval) {
    w.gap(2 * GAP);
    w.box(['Signed by Client', input.approval.clientName, `Approved ${longDate(input.approval.approvedAt)}, ${clock(input.approval.approvedAt)}`]);
  }
  w.finish(input.reference);
  return pdf.save();
}
