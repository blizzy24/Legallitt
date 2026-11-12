// In-memory, offline PDF viewer shared by native WebView and its browser harness.
export function nativePdfHtml({bytes,page,width,scale,runtime}:{bytes:Uint8Array;page:number;width:number;scale:number;runtime:{lib:string;worker:string;fonts:Record<string,string>;cmaps:Record<string,string>}}){
    let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    const data=JSON.stringify(btoa(binary));
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' data:; style-src 'unsafe-inline'; font-src data: blob:; img-src data: blob:; connect-src 'none';"></head><body style="margin:0;background:white"><canvas id="page"></canvas><script type="module">
    const send=value=>window.ReactNativeWebView.postMessage(JSON.stringify(value)),decode=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
    try{
      globalThis.pdfjsWorker=await import('data:text/javascript;base64,${runtime.worker}');
      const lib=await import('data:text/javascript;base64,${runtime.lib}'),fonts=${JSON.stringify(runtime.fonts)},cmaps=${JSON.stringify(runtime.cmaps)};
      class Fonts{async fetch({filename}){if(!fonts[filename])throw Error('Font unavailable');return decode(fonts[filename]);}}
      class CMaps{async fetch({name}){if(!cmaps[name+'.bcmap'])throw Error('CMap unavailable');return {cMapData:decode(cmaps[name+'.bcmap']),compressionType:1};}}
      const pdf=await lib.getDocument({data:decode(${data}),isEvalSupported:false,useWasm:false,StandardFontDataFactory:Fonts,CMapReaderFactory:CMaps}).promise;
      send({pages:pdf.numPages});let pending=Promise.resolve();
      window.renderPage=(page,width,scale)=>{pending=pending.catch(()=>{}).then(async()=>{const p=await pdf.getPage(page),viewport=p.getViewport({scale:width/p.getViewport({scale:1}).width*scale}),canvas=document.getElementById('page'),ratio=Math.min(devicePixelRatio||1,2);canvas.width=viewport.width*ratio;canvas.height=viewport.height*ratio;canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';await p.render({canvas,viewport,transform:[ratio,0,0,ratio,0,0]}).promise;send({height:viewport.height});}).catch(()=>send({error:true}));};
      window.renderPage(${page},${width},${scale});
    }catch{send({error:true});}
    </script></body></html>`;
}
