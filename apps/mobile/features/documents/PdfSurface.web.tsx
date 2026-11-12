import {useEffect, useRef, useState} from 'react';
import {Text, View} from 'react-native';
import type {PDFDocumentProxy} from 'pdfjs-dist';

export type PdfSurfaceProps = {bytes: Uint8Array; page: number; scale: number; width: number; onPages(n: number): void; onError(message: string): void};
export default function PdfSurface({bytes, page, scale, width, onPages, onError}: PdfSurfaceProps) {
  const canvas = useRef<HTMLCanvasElement>(null), [pdf, setPdf] = useState<PDFDocumentProxy | null>(null), [rendering, setRendering] = useState(true);
  const callbacks = useRef({onPages, onError});callbacks.current={onPages,onError};
  useEffect(() => {
    let alive=true, task: ReturnType<typeof import('pdfjs-dist')['getDocument']> | undefined;
    setPdf(null);setRendering(true);
    void import('pdfjs-dist').then(lib => {
      if(!alive)return;
      lib.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.min.mjs';
      task=lib.getDocument({data:bytes.slice(),cMapUrl:'/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/pdfjs/standard_fonts/',wasmUrl:'/pdfjs/wasm/'});
      return task.promise.then(document=>{if(alive){setPdf(document);callbacks.current.onPages(document.numPages);}});
    }).catch(()=>{if(alive){setRendering(false);callbacks.current.onError('Couldn’t open this PDF. Retry, or download it instead.');}});
    return()=>{alive=false;void task?.destroy();};
  },[bytes]);
  useEffect(()=>{
    let alive=true, task: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
    if(!pdf||!canvas.current)return;
    setRendering(true);const element=canvas.current;
    void pdf.getPage(Math.min(page,pdf.numPages)).then(p=>{
      if(!alive)return;const viewport=p.getViewport({scale:Math.max(0.2,width)/p.getViewport({scale:1}).width*scale});
      const ratio=Math.min(window.devicePixelRatio||1,2);element.width=Math.ceil(viewport.width*ratio);element.height=Math.ceil(viewport.height*ratio);
      element.style.width=viewport.width+'px';element.style.height=viewport.height+'px';
      task=p.render({canvas:element,viewport,transform:ratio!==1?[ratio,0,0,ratio,0,0]:undefined});
      return task.promise;
    }).then(()=>{if(alive)setRendering(false);}).catch(e=>{if(alive&&e?.name!=='RenderingCancelledException'){setRendering(false);callbacks.current.onError('This page could not be displayed. Retry or download the file.');}});
    return()=>{alive=false;task?.cancel();};
  },[pdf,page,scale,width]);
  return <View>{rendering&&<Text accessibilityLiveRegion="polite">Loading page…</Text>}<canvas ref={canvas} aria-label={`PDF page ${page}`} style={{background:'#fff',maxWidth:'none'}}/></View>;
}
