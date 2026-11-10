// Shared typography only; service-specific document layouts stay separate.
import 'regenerator-runtime/runtime';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import fontkit,* as kit from '@pdf-lib/fontkit';
import {PDFDocument,rgb,type PDFFont,type PDFPage,PDFOperator,PDFOperatorNames,PDFName,PDFHexString} from 'pdf-lib';
const bytes=(name:string)=>readFileSync(resolve(__dirname,'../../../assets/fonts',name));
const files = {
  latin: {regular: bytes('NotoSans-Regular.ttf'), bold: bytes('NotoSans-Bold.ttf')},
  devanagari: {regular: bytes('NotoSansDevanagari-Regular.ttf'), bold: bytes('NotoSansDevanagari-Bold.ttf')},
};
type Script = keyof typeof files;
export type Weight = keyof typeof files.latin;
const faces = {latin: kit.create(files.latin.regular), devanagari: kit.create(files.devanagari.regular)};
const scriptOf = (ch: string): Script => /[ऀ-ॿ꣠-ꣿ᳐-᳿]/.test(ch) ? 'devanagari' : 'latin';
function covered(ch: string) {
  const cp = ch.codePointAt(0)!;
  return faces.latin.hasGlyphForCodePoint(cp) || faces.devanagari.hasGlyphForCodePoint(cp);
}
export function unsupportedCharacters(text: string) {
  return [...new Set([...text].filter(ch => !/\s/.test(ch) && !covered(ch)))];
}

export type Span={text:string;weight?:Weight};
export type Run={text:string;font:PDFFont};
export async function embedTextFonts(pdf:PDFDocument){
 pdf.registerFontkit(fontkit);
 const embed=(data:Buffer)=>pdf.embedFont(data,{subset:true});
 return {latin:{regular:await embed(files.latin.regular),bold:await embed(files.latin.bold)},devanagari:{regular:await embed(files.devanagari.regular),bold:await embed(files.devanagari.bold)}};
}
export function needsPage(top:number,height:number,bottom:number){return top+height>bottom;}
export class PdfText {
 constructor(private readonly pdf:PDFDocument,private readonly fonts:Awaited<ReturnType<typeof embedTextFonts>>){}
  runs(text:string,weight:Weight='regular'):Run[] {
    const out:Run[]=[];
    for(const ch of text){
      const font=this.fonts[scriptOf(ch)][weight],last=out.at(-1);
      const printable=covered(ch)||/\s/.test(ch)?ch:'?';
      if(last?.font===font)last.text+=printable;else out.push({text:printable,font});
    }
    return out;
  }
  width(runs:Run[],size=11){return runs.reduce((sum,r)=>sum+r.font.widthOfTextAtSize(r.text,size),0);}
  wrap(spans:Span[],max:number,size=11):Run[][] {
    // Break oversized words by grapheme, retaining Indic clusters. Normal words
    // and mixed regular/bold spans keep their exact spaces and wrap together.
    const out:Run[][]=[[]];
    const segmenter=new Intl.Segmenter('en',{granularity:'grapheme'});
    for(const span of spans)for(const token of span.text.match(/\s+|\S+/g)??[]){
      if(/\n/.test(token)){out.push([]);continue;}
      const run=this.runs(token,span.weight);
      if(/^\s+$/.test(token)){if(out.at(-1)!.length)out.at(-1)!.push(...this.runs(' ',span.weight));continue;}
      if(this.width(out.at(-1)!,size)+this.width(run,size)>max&&out.at(-1)!.length)out.push([]);
      if(this.width(run,size)<=max)out.at(-1)!.push(...run);
      else for(const {segment} of segmenter.segment(token)){
        const piece=this.runs(segment,span.weight);
        if(this.width(out.at(-1)!,size)+this.width(piece,size)>max&&out.at(-1)!.length)out.push([]);
        out.at(-1)!.push(...piece);
      }
    }
    return out.filter(line=>line.length).map(line=>{
      while(line.at(-1)?.text===' ')line.pop();return line;
    });
  }
  draw(page:PDFPage,runs:Run[],x:number,top:number,size=11,ink=rgb(0,0,0)){
    // Preserve the entire logical line across glyph reordering and font/script
    // switches. Marking individual shaped glyph runs loses combining clusters
    // in some PDF readers even though their visual appearance is correct.
    page.pushOperators(PDFOperator.of(PDFOperatorNames.BeginMarkedContentSequence, [PDFName.of('Span'),
      this.pdf.context.obj({ActualText:PDFHexString.fromText(runs.map(run=>run.text).join(''))}).toString()]));
    for(const run of runs){
      page.drawText(run.text,{x,y:page.getHeight()-top-size,size,font:run.font,color:ink});
      x+=this.width([run],size);
    }
    page.pushOperators(PDFOperator.of(PDFOperatorNames.EndMarkedContent));
  }

}
