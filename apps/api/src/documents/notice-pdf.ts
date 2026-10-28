// fontkit's Indic shaper is compiled against regenerator; load the runtime first.
import 'regenerator-runtime/runtime';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fontkit from '@pdf-lib/fontkit';
import * as kit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { NoticeDraftContent } from '@legalitt/shared';

// The notice as a document. No design draws the inside of a notice (266 is the
// editor, 189 a different letter), so this is a plain, conventional layout:
// sender block, date and place, recipient block, subject line, numbered body,
// closing. Every word is the advocate's; only the typography is ours. The
// section names drawn on 266 are the only headings, and the letter ends with
// whatever the advocate typed last (architecture §8, question 23).
//
// What the client approved is recorded on the case, never printed in the letter:
// the letter is posted to the other party.
export type NoticePdfInput = {
  reference: string;
  date: Date;
  place?: string | null;
  content: NoticeDraftContent;
};

// Noto Sans (Latin, Greek, Cyrillic, the rupee sign, typographic quotes and
// dashes) with Noto Sans Devanagari, both OFL, bundled in assets/fonts. Text is
// shaped by fontkit, so what the advocate typed is what prints.
const FONTS = resolve(__dirname, '../../../assets/fonts');
const bytes = (name: string) => readFileSync(resolve(FONTS, name));
const files = {
  latin: { regular: bytes('NotoSans-Regular.ttf'), bold: bytes('NotoSans-Bold.ttf') },
  devanagari: { regular: bytes('NotoSansDevanagari-Regular.ttf'), bold: bytes('NotoSansDevanagari-Bold.ttf') },
};
type Script = keyof typeof files;
type Weight = keyof typeof files.latin;
const faces = { latin: kit.create(files.latin.regular), devanagari: kit.create(files.devanagari.regular) };
const isDevanagari = (ch: string) => /[ऀ-ॿ꣠-ꣿ᳐-᳿]/.test(ch);
const scriptOf = (ch: string): Script => (isDevanagari(ch) ? 'devanagari' : 'latin');
function covered(ch: string) {
  const cp = ch.codePointAt(0)!;
  return faces.latin.hasGlyphForCodePoint(cp) || faces.devanagari.hasGlyphForCodePoint(cp);
}
/** Characters neither bundled font can print. Empty for everything a notice is expected to carry. */
export function unsupportedCharacters(text: string) {
  return [...new Set([...text].filter(ch => !/\s/.test(ch) && !covered(ch)))];
}

const PAGE = { width: 595.28, height: 841.89 }; // A4
const MARGIN = 56, BODY = 11, LEAD = 16, SMALL = 9, INDENT = 22, GAP = 10;
const INK = rgb(0.1, 0.1, 0.1), MUTED = rgb(0.45, 0.45, 0.45);
const lines = (text: string) => text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const longDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

type Segment = { text: string; font: PDFFont };
class Writer {
  private page!: PDFPage;
  private y = 0;
  private readonly pages: PDFPage[] = [];
  constructor(private readonly pdf: PDFDocument, private readonly fonts: Record<Script, Record<Weight, PDFFont>>) { this.newPage(); }
  private newPage() {
    this.page = this.pdf.addPage([PAGE.width, PAGE.height]);
    this.pages.push(this.page);
    this.y = PAGE.height - MARGIN;
  }
  private ensure(height: number) { if (this.y - height < MARGIN + LEAD) this.newPage(); }
  /** A word as runs of one script each, so a Devanagari name inside a Latin sentence keeps its own font. */
  private runs(word: string, weight: Weight): Segment[] {
    const out: Segment[] = [];
    for (const ch of word) {
      const printable = covered(ch) ? ch : '?';
      const script = scriptOf(ch);
      const last = out[out.length - 1];
      if (last && last.font === this.fonts[script][weight]) last.text += printable;
      else out.push({ text: printable, font: this.fonts[script][weight] });
    }
    return out;
  }
  private width(segments: Segment[], size = BODY) { return segments.reduce((w, s) => w + s.font.widthOfTextAtSize(s.text, size), 0); }
  private wrap(text: string, weight: Weight, maxWidth: number): Segment[][] {
    const space: Segment = { text: ' ', font: this.fonts.latin[weight] };
    const out: Segment[][] = [];
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const segments = this.runs(word, weight);
      const last = out[out.length - 1];
      if (last && this.width([...last, space, ...segments]) <= maxWidth) last.push(space, ...segments);
      else out.push(segments);
    }
    return out;
  }
  private draw(segments: Segment[], x: number, size = BODY, color = INK) {
    for (const s of segments) {
      this.page.drawText(s.text, { x, y: this.y - BODY, size, font: s.font, color });
      x += s.font.widthOfTextAtSize(s.text, size);
    }
  }
  gap(size = GAP) { this.y -= size; }
  paragraph(text: string, weight: Weight = 'regular', indent = 0) {
    for (const line of this.wrap(text, weight, PAGE.width - 2 * MARGIN - indent)) {
      this.ensure(LEAD);
      this.draw(line, MARGIN + indent);
      this.y -= LEAD;
    }
  }
  heading(text: string) {
    this.ensure(3 * LEAD);
    this.gap(GAP / 2);
    this.paragraph(text, 'bold');
  }
  numbered(n: number, text: string) {
    const wrapped = this.wrap(text, 'regular', PAGE.width - 2 * MARGIN - INDENT);
    this.ensure(LEAD);
    this.draw([{ text: `${n}.`, font: this.fonts.latin.regular }], MARGIN);
    for (const line of wrapped) {
      this.ensure(LEAD);
      this.draw(line, MARGIN + INDENT);
      this.y -= LEAD;
    }
    this.y -= GAP / 2;
  }
  finish(reference: string) {
    const font = this.fonts.latin.regular;
    this.pages.forEach((page, i) => {
      page.drawText(reference, { x: PAGE.width - MARGIN - font.widthOfTextAtSize(reference, SMALL), y: PAGE.height - MARGIN / 2, size: SMALL, font, color: MUTED });
      const footer = `Page ${i + 1} of ${this.pages.length}`;
      page.drawText(footer, { x: (PAGE.width - font.widthOfTextAtSize(footer, SMALL)) / 2, y: MARGIN / 2, size: SMALL, font, color: MUTED });
    });
  }
}

export async function renderNoticePdf(input: NoticePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(input.reference);
  pdf.setCreationDate(input.date);
  pdf.setModificationDate(input.date);
  const embed = (data: Buffer) => pdf.embedFont(data, { subset: true });
  const fonts = {
    latin: { regular: await embed(files.latin.regular), bold: await embed(files.latin.bold) },
    devanagari: { regular: await embed(files.devanagari.regular), bold: await embed(files.devanagari.bold) },
  };
  const w = new Writer(pdf, fonts);
  const c = input.content;
  lines(c.sender).forEach((line, i) => w.paragraph(line, i === 0 ? 'bold' : 'regular'));
  w.gap();
  w.paragraph(`Date: ${longDate(input.date)}`);
  if (input.place?.trim()) w.paragraph(`Place: ${input.place.trim()}`);
  w.gap();
  const recipient = lines(c.recipient);
  if (recipient.length) { w.paragraph('To,'); recipient.forEach(line => w.paragraph(line)); w.gap(); }
  if (c.subject.trim()) { w.paragraph(`Subject: ${c.subject.trim()}`, 'bold'); w.gap(); }
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
  w.finish(input.reference);
  return pdf.save();
}
