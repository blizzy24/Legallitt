// Audits design traceability through route imports and explicit design-number comments.
// Run: node scripts/design-inventory.cjs. Image pixels are decoded for PNG duplicate checks.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ts = require('typescript'), { PNG } = require('pngjs');
const root = process.cwd();
const ocr = process.argv[2] ? new Map(fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map(line => { const row = JSON.parse(line); return [path.relative(root, row.file), row]; })) : new Map();
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const routes = walk('apps/mobile/app').filter(f => /\.tsx?$/.test(f) && !path.basename(f).startsWith('_'));
const sources = [...walk('apps/mobile/app'), ...walk('apps/mobile/components'), ...walk('apps/mobile/constants'), ...walk('apps/mobile/context'), ...walk('apps/mobile/data'), ...walk('apps/mobile/hooks')].filter(f => /\.tsx?$/.test(f));
const texts = new Map(sources.map(f => [f, fs.readFileSync(f, 'utf8')]));
function resolve(from, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('@/')) return;
  const base = spec.startsWith('@/') ? path.join('apps/mobile', spec.slice(2)) : path.normalize(path.join(path.dirname(from), spec));
  return [base, base+'.ts', base+'.tsx', path.join(base,'index.ts'), path.join(base,'index.tsx')].find(f => texts.has(f));
}
const edges = new Map(sources.map(f => [f, ts.preProcessFile(texts.get(f), true, true).importedFiles.map(x => resolve(f,x.fileName)).filter(Boolean)]));
const ids = new Map(sources.map(f => {
  const found = new Set();
  for (const m of texts.get(f).matchAll(/\bdesigns?[\s/]+(\d+(?:(?:\s*[-–—/,]\s*)\d+)*)/gi)) {
    const fragment = m[1];
    for (const r of fragment.matchAll(/(\d+)\s*[-–—]\s*(\d+)/g)) {
      if (+r[2] - +r[1] < 500) for(let n=+r[1]; n<=+r[2]; n++) found.add(n);
    }
    for(const n of fragment.match(/\d+/g)) found.add(+n);
  }
  return [f, found];
}));
const reach = new Map();
for(const route of routes) {
  const seen = new Set(), todo = [route];
  // Shared route layouts supply tab bars/providers whose sources can also cite designs.
  let dir=path.dirname(route);
  while(dir.startsWith('apps/mobile/app')) { const layout=path.join(dir,'_layout.tsx');if(texts.has(layout))todo.push(layout);if(dir==='apps/mobile/app')break;dir=path.dirname(dir); }
  while(todo.length) { const f=todo.pop();if(seen.has(f))continue;seen.add(f);todo.push(...(edges.get(f)||[])); }
  reach.set(route,seen);
}
const files=walk('design').sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
const rows=[];const pixelGroups=new Map(),byteGroups=new Map();
for(const file of files) {
  const bytes=fs.readFileSync(file),sha=crypto.createHash('sha256').update(bytes).digest('hex');
  if(!byteGroups.has(sha))byteGroups.set(sha,[]);byteGroups.get(sha).push(file);
  let width=ocr.get(file)?.width ?? '',height=ocr.get(file)?.height ?? '',pixelHash='';
  if(file.toLowerCase().endsWith('.png')) {try {const png=PNG.sync.read(bytes);width=png.width;height=png.height;pixelHash=crypto.createHash('sha256').update(`${width}x${height}:`).update(png.data).digest('hex');if(!pixelGroups.has(pixelHash))pixelGroups.set(pixelHash,[]);pixelGroups.get(pixelHash).push(file);}catch{}}
  const id=Number(path.basename(file).match(/^\d+/)?.[0]);
  const archived=file.includes('/archive/');
  const refs=sources.filter(f => texts.get(f).includes(file) || (!archived && Number.isFinite(id) && ids.get(f).has(id)));
  const supported=routes.filter(r=>refs.some(f=>reach.get(r).has(f)));
  rows.push({file,width,height,sha256:sha,pixelHash,references:refs,routes:supported});
}
fs.mkdirSync('reports/design-audit',{recursive:true});
fs.writeFileSync('reports/design-audit/inventory.json',JSON.stringify({method:'Route import closure, parent layouts, explicit design IDs/ranges; archived exports require their exact path. Reference coverage is not proof of visual implementation. PNG duplicates compare decoded RGBA pixels.',files:rows.map(({routes,...row})=>({...row,routeCount:routes.length,routeExamples:routes.slice(0,3)})),byteIdentical:[...byteGroups.values()].filter(g=>g.length>1),pixelIdenticalPng:[...pixelGroups.values()].filter(g=>g.length>1)},null,2)+'\n');
fs.writeFileSync('reports/design-audit/unreferenced.txt',rows.filter(r=>!r.routes.length).map(r=>r.file).join('\n')+'\n');
fs.writeFileSync('reports/design-audit/inventory.tsv','file\twidth\theight\troute_count\treference_sources\tsha256\n'+rows.map(r=>[r.file,r.width,r.height,r.routes.length,r.references.join(';'),r.sha256].join('\t')).join('\n')+'\n');
console.log(JSON.stringify({files:rows.length,unreferenced:rows.filter(r=>!r.routes.length).map(r=>r.file),byteIdentical:[...byteGroups.values()].filter(g=>g.length>1),pixelIdenticalPng:[...pixelGroups.values()].filter(g=>g.length>1)},null,2));
