// Inspect evidence without printing any matched credential or signed-URL value.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname,patterns={
 signed_url:/[?&](?:X-Amz-Signature|X-Amz-Security-Token|X-Goog-Signature)=[^\s&"<>]+/i,
 signed_url_json:/["'](?:X-Amz-Signature|X-Amz-Security-Token)["']\s*:\s*["'][^"']+["']/i,
 jwt:/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
 aws_access_key:/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
 auth_header:/authorization["']?\s*[:=]\s*["']?(?:Bearer|Basic)\s+[A-Za-z0-9+/_.=-]{12,}/i,
 token_value:/["'](?:access_token|refresh_token|secretAccessKey)["']\s*:\s*["'][A-Za-z0-9+/_.=-]{12,}["']/i,
 private_key:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
 database_credentials:/postgres(?:ql)?:\/\/[^\s:/]+:[^\s@]+@/i,
};
let files=0;const findings=[];
function scan(folder){for(const item of fs.readdirSync(folder,{withFileTypes:true})){
 const file=path.join(folder,item.name);if(item.isDirectory()){scan(file);continue;}
 if(!item.isFile())continue;files++;const data=fs.readFileSync(file).toString();
 for(const [kind,pattern]of Object.entries(patterns))if(pattern.test(data))findings.push({file:path.relative(root,file),kind});
}}
scan(root);
const log=fs.readFileSync(path.join(root,'local-api-tests.txt'),'utf8');
const matches=log.split(/\r?\n/).map((line,i)=>({line:i+1,text:line})).filter(row=>/x-amz-signature|authorization|access_token|refresh_token|secretaccesskey/i.test(row.text));
// Print only known TAP test titles, never arbitrary log content.
console.log(JSON.stringify({files,findings,test_log_keyword_matches:matches.map(row=>({line:row.line,is_test_title:/^\s*(?:# Subtest:|ok \d+ -)/.test(row.text),text:/^\s*(?:# Subtest:|ok \d+ -)/.test(row.text)?row.text:'[redacted pending inspection]'}))},null,2));
assert.equal(findings.length,0,'Potential credential material must be removed before publication.');
console.log('PASS evidence contains no signed URL values, token values, access keys, private keys or database credentials');
