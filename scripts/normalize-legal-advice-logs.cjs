const fs=require('node:fs');
for(const name of ['api-build.log','api-focused.log','api-suite-final.log','migrate-local.log','shared-tests.log']){
 const file='reports/legal-advice-20261114/'+name;
 fs.writeFileSync(file,fs.readFileSync(file,'utf8').split(/\r?\n/).map(line=>line.trimEnd()).join('\n').trimEnd()+'\n');
}
