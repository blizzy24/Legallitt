const cp=require('child_process'),assert=require('assert/strict'),yaml=require('../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml');
const read=sha=>yaml.parse(cp.execFileSync('git',['show',sha+':pnpm-lock.yaml'],{encoding:'utf8'}));
const before=read('1bff6f2'),after=read('3a7631d');
for(const name of ['.','apps/api','packages/shared'])assert.deepEqual(after.importers[name],before.importers[name],name);
for(const group of ['packages','snapshots'])for(const [name,value]of Object.entries(before[group]))assert.deepEqual(after[group][name],value,group+': '+name);
console.log('PASS API/shared dependency importers and every existing resolution/snapshot unchanged');
