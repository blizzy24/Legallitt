// Preserve only this walkthrough's synthetic file bytes across local API restarts.
const fs=require('node:fs'),assert=require('node:assert/strict');process.loadEnvFile('apps/api/.env.local');
async function main(){const base='http://127.0.0.1:3003',url=new URL(process.env.DATABASE_URL);assert.ok(['127.0.0.1','localhost'].includes(url.hostname));url.pathname='/legalitt_notice_local';
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-admin@legalitt.invalid',password})});assert.equal(response.status,201);const session=await response.json(),{ApiClient}=require('../packages/shared/dist'),api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});
 const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg'),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});
 try{const state=JSON.parse(fs.readFileSync('reports/notice-flow-20261112/local/state.json','utf8')),ids=[...[...state.cases,...state.prior_cases].map(c=>c.id),state.editor_case_id,state.partial_case_id,state.blocked_case_id,state.visual_case_id].filter(Boolean),docs=await db.document.findMany({where:{case_id:{in:ids},status:'uploaded'}}),items=[];
 for(const doc of docs){const result=await api.adminDocumentPreview(doc.id),file=await fetch(result.url);assert.ok(file.ok,doc.id);items.push({key:doc.s3_key,mime:doc.mime_type,bytes:Buffer.from(await file.arrayBuffer()).toString('base64')});}
 fs.writeFileSync('reports/notice-flow-20261112/local/storage-cache.json',JSON.stringify(items));console.log('Saved '+items.length+' synthetic local documents; no credentials or signed URLs.');
 }finally{await db.$disconnect();}}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
