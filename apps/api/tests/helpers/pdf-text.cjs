const {PDFDocument, PDFName, PDFArray, decodePDFRawStream} = require('pdf-lib');

// Read the actual PDF's selectable text, including subset-font Unicode maps.
// This intentionally does not inspect the renderer's source or intermediate data.
async function readPdfText(bytes) {
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages().map(page => {
    const fonts = new Map();
    for (const [name, ref] of page.node.Resources().lookup(PDFName.of('Font')).entries()) {
      const font = pdf.context.lookup(ref);
      const cmap = Buffer.from(decodePDFRawStream(font.lookup(PDFName.of('ToUnicode'))).decode()).toString();
      const unicode = new Map();
      for (const block of cmap.matchAll(/beginbfchar\s+([\s\S]*?)endbfchar/g)) {
        for (const [, glyph, text] of block[1].matchAll(/<([\da-f]+)>\s*<([\da-f]+)>/gi)) {
          unicode.set(glyph.toUpperCase(), text.match(/.{4}/g).map(v => String.fromCharCode(parseInt(v, 16))).join(''));
        }
      }
      const cid = font.lookup(PDFName.of('DescendantFonts')).lookup(0);
      const widthEntries = cid.lookup(PDFName.of('W')), widths = new Map();
      for (let i = 0; i < widthEntries.size();) {
        const first = widthEntries.lookup(i++).asNumber(), next = widthEntries.lookup(i++);
        if (next instanceof PDFArray) {
          for (let offset = 0; offset < next.size(); offset++) widths.set(first + offset, next.lookup(offset).asNumber());
        } else {
          const last = next.asNumber(), width = widthEntries.lookup(i++).asNumber();
          for (let glyph = first; glyph <= last; glyph++) widths.set(glyph, width);
        }
      }
      fonts.set(name.toString(), {unicode, widths, defaultWidth: cid.lookup(PDFName.of('DW'))?.asNumber() ?? 1000});
    }
    const stream = page.node.Contents();
    const operators = Array.from({length: stream.size()}, (_, i) =>
      Buffer.from(decodePDFRawStream(pdf.context.lookup(stream.get(i))).decode()).toString()).join('\n');
    const runs = [], consumedActualText = new Set();
    for (const block of operators.matchAll(/\bBT\b([\s\S]*?)\bET\b/g)) {
      const font = block[1].match(/(\/[^\s]+)\s+([\d.]+)\s+Tf/);
      const position = block[1].match(/1 0 0 1 ([\d.\-]+) ([\d.\-]+) Tm/);
      if (!font || !position) continue;
      const map = fonts.get(font[1]), size = Number(font[2]);
      let text = '', width = 0;
      for (const [, hex] of block[1].matchAll(/<([\da-f]+)>\s*Tj/gi)) for (const glyph of hex.match(/.{4}/g)) {
        text += map.unicode.get(glyph.toUpperCase()) ?? '\uFFFD';
        width += (map.widths.get(parseInt(glyph, 16)) ?? map.defaultWidth) * size / 1000;
      }
      const glyphText = text;
      // PDF ActualText overrides visual glyph order for accessibility/copying.
      // Indic shaping can put a vowel glyph before the consonant even though
      // the original Unicode sequence puts the consonant first.
      const prefix = operators.slice(0, block.index), marked = prefix.lastIndexOf('/ActualText');
      if (marked > prefix.lastIndexOf('EMC')) {
        const actual = prefix.slice(marked).match(/\/ActualText\s*<([\da-f]+)>/i);
        if (actual) {
          // A single marked-content span may enclose several font runs. Its
          // replacement is emitted once, not once per BT/ET text object.
          text = consumedActualText.has(marked) ? '' :
            (actual[1].replace(/^FEFF/i, '').match(/.{4}/g) ?? []).map(v => String.fromCharCode(parseInt(v, 16))).join('');
          consumedActualText.add(marked);
        }
      }
      runs.push({text, glyphText, font: font[1], size, x: Number(position[1]), y: Number(position[2]), width});
    }
    return {width: page.getWidth(), height: page.getHeight(), runs, text: runs.map(r => r.text).join('')};
  });
  return {pdf, pages, text: pages.map(page => page.text).join('\n')};
}

module.exports = {readPdfText};
