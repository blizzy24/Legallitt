const fs=require('node:fs'),path=require('node:path');
for(const name of fs.readdirSync(__dirname).filter(n=>n.endsWith('.txt'))){
 const file=path.join(__dirname,name),raw=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,raw.replace(/\x1b\[[0-9;]*m/g,'').replace(/\r\n/g,'\n').split('\n').map(s=>s.trimEnd()).join('\n').trimEnd()+'\n');
}
