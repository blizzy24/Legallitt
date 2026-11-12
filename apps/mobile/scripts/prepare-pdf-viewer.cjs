// Bundle Mozilla's worker/fonts with the app. No CDN gets document URLs or bytes.
const fs=require('node:fs'),path=require('node:path');
const root=path.dirname(require.resolve('pdfjs-dist/package.json'));
const output=path.resolve(__dirname,'../public/pdfjs');fs.mkdirSync(output,{recursive:true});
fs.copyFileSync(path.join(root,'build/pdf.worker.min.mjs'),path.join(output,'pdf.worker.min.mjs'));
for(const folder of ['cmaps','standard_fonts','wasm'])fs.cpSync(path.join(root,folder),path.join(output,folder),{recursive:true});
fs.copyFileSync(path.join(root,'LICENSE'),path.join(output,'LICENSE'));
// Native WebView receives only bundled code and in-memory bytes. No CDN, URL
// relay or third-party document viewer sees the document.
const read=relative=>fs.readFileSync(path.join(root,relative)).toString('base64');
const files=folder=>Object.fromEntries(fs.readdirSync(path.join(root,folder)).filter(name=>!name.startsWith('LICENSE')).map(name=>[name,read(folder+'/'+name)]));
fs.writeFileSync(path.resolve(__dirname,'../features/documents/pdf-runtime.generated.json'),JSON.stringify({lib:read('legacy/build/pdf.min.mjs'),worker:read('legacy/build/pdf.worker.min.mjs'),fonts:files('standard_fonts'),cmaps:files('cmaps')}));
