// Batch 433–454 source and optional pre-batch browser pixel comparisons.
// node scripts/batch-design-diff.cjs [browser-screenshot-directory]
// Browser directory contains manifest.json: [designNumber,route,cropX,cropY,cropW,cropH][]
// sips only decodes old JPEG/WebP exports; no token scale is inferred from file width.
const fs = require('fs');
const path = require('path');
const os = require('os');
const {execFileSync} = require('child_process');
const {PNG} = require('pngjs');
const report = 'reports/batch-433-454/pixel-diff.json';
const rows = JSON.parse(fs.readFileSync(report));
const names = fs.readdirSync('design');
const source = n => 'design/' + names.find(name => name.startsWith(n+'-') && !name.includes('reexport'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(),'legalitt-pixels-'));
function read(file) {
  if(file.endsWith('.png')) return PNG.sync.read(fs.readFileSync(file));
  const out = path.join(tmp,path.basename(file)+'.png');
  execFileSync('sips',['-s','format','png',file,'--out',out],{stdio:'ignore'});
  return PNG.sync.read(fs.readFileSync(out));
}
function compare(a,b,crop={x:0,y:0,w:a.width,h:a.height}) {
  let changed=0,over20=0,totalError=0;
  const width=b.width,height=b.height;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const ai=(Math.min(a.height-1,crop.y+Math.floor(y*crop.h/height))*a.width+Math.min(a.width-1,crop.x+Math.floor(x*crop.w/width)))*4;
    const bi=(y*width+x)*4;
    let delta=0;
    for(let c=0;c<4;c++)delta=Math.max(delta,Math.abs(a.data[ai+c]-b.data[bi+c]));
    if(delta)changed++;
    if(delta>20)over20++;
    totalError+=delta;
  }
  return {width,height,pixels:width*height,changedPixels:changed,over20Pixels:over20,over20Percent:+(over20*100/(width*height)).toFixed(3),meanMaxChannelError:+(totalError/(width*height)).toFixed(4)};
}
const equivalents={289:289,415:415,422:422,433:118,434:28,435:29,436:30,437:31,438:32,439:33,440:311,441:312,449:219};
const baselineDir=process.argv[2];
const manifest=baselineDir?JSON.parse(fs.readFileSync(path.join(baselineDir,'manifest.json'))):[];
for(const row of rows) {
  const n=+path.basename(row.file).split('-')[0];
  const a=read(row.file);
  if(equivalents[n]) {
    const file=source(equivalents[n]);
    row.sourceComparison={file,method:'decoded RGBA; nearest-neighbour normalization for differing export sizes; compression and frames included',...compare(a,read(file))};
    delete row.classification;
  }
  const capture=manifest.find(r=>r[0]===n);
  if(capture && n!==348) {
    const [,route,x,y,w,h]=capture;
    row.preBatchBrowserComparison={commit:'95b08ce',route,method:'cropped design content sampled by nearest-neighbour at browser resolution; full design-height viewport, demo timers disabled; runtime content and font rasterization also differ',crop:{x,y,w,h},...compare(a,read(path.join(baselineDir,n+'.png')),{x,y,w,h})};
  }
  if(n===348)row.note='Exact pixel duplicate of381, wrong 1× export. No token measurements or browser fidelity comparison performed.';
}
fs.writeFileSync(report,JSON.stringify(rows,null,2)+'\n');
fs.rmSync(tmp,{recursive:true,force:true});
console.log(rows.map(r=>({file:r.file,sourceChanged:r.changedPixels??r.sourceComparison?.changedPixels,browserOver20Percent:r.preBatchBrowserComparison?.over20Percent})));
