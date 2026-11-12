const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto'),{Client}=require('pg');
test('report migration maps legacy requests without rewriting prices, files or review history',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new Client({connectionString:process.env.LEGALITT_TEST_DATABASE_URL});await db.connect();await db.query('BEGIN');
 try{
  const schema='report_migration_'+randomUUID().replaceAll('-','');await db.query(`CREATE SCHEMA ${schema}`);await db.query(`SET LOCAL search_path TO ${schema},public`);
  for(const name of ['cases','case_events','payments','drafts','documents'])await db.query(`CREATE TABLE ${schema}.${name} (LIKE public.${name} INCLUDING ALL)`);
  const ids=[];
  for(const service of ['property_search','document_forensic'])for(const state of ['paid','assigned','advocate_accepted','in_progress','awaiting_admin_approval','admin_changes_requested','completed']){
   const id=randomUUID(),owner=randomUUID(),advocate=randomUUID(),sub=['awaiting_admin_approval','admin_changes_requested'].includes(state)?state:null,status=sub?'in_progress':state;ids.push({id,service,state,status,sub});
   await db.query('INSERT INTO cases(id,reference,service_code,client_id,advocate_id,status,sub_status,tier,details) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,'TEST-'+id,service,owner,state==='paid'?null:advocate,status,sub,'ordinary',JSON.stringify({legacy_fact:'Keep this exact filing'})]);
   await db.query("INSERT INTO payments(case_id,payer_id,purpose,base_amount_paise,gst_paise,total_paise,status,idempotency_key) VALUES($1,$2,'service_fee',100,18,118,'captured',$3)",[id,owner,id]);
   await db.query("INSERT INTO documents(case_id,owner_id,kind,filename,s3_key,mime_type,size_bytes) VALUES($1,$2,'service_report','legacy.pdf',$3,'application/pdf',100)",[id,advocate,id]);
   await db.query("INSERT INTO drafts(case_id,kind,version,content,created_by,generated_by) VALUES($1,'service_report',1,$2,$3,'manual')",[id,JSON.stringify({legacy_content:'Keep this report'}),advocate]);
  }
  await db.query(fs.readFileSync(path.resolve('prisma/migrations/202611130030_report_workflows/migration.sql'),'utf8'));
  for(const c of ids){const {rows:[r]}=await db.query('SELECT c.status,c.sub_status,c.details,w.data FROM cases c JOIN report_workflows w ON w.case_id=c.id WHERE c.id=$1',[c.id]);assert.equal(r.status,c.status);assert.equal(r.sub_status,c.sub);assert.equal(r.data.original_details.legacy_fact,'Keep this exact filing');assert.equal(r.data.legacy,true);assert.equal(r.data.checklist,undefined,'do not invent manual attestations');assert.equal(!!r.data.legacy_pending_submission,c.state==='awaiting_admin_approval');assert.equal(r.data.phase,c.state==='completed'?'delivered':c.state==='awaiting_admin_approval'?'admin_review':c.state==='admin_changes_requested'?'waiting':c.state==='paid'?'verification':c.state==='assigned'?'assigned':c.service==='document_forensic'?'waiting':'preparing');assert.equal((await db.query('SELECT total_paise FROM payments WHERE case_id=$1',[c.id])).rows[0].total_paise,'118');assert.equal((await db.query('SELECT content FROM drafts WHERE case_id=$1',[c.id])).rows[0].content.legacy_content,'Keep this report');assert.equal((await db.query('SELECT filename FROM documents WHERE case_id=$1',[c.id])).rows[0].filename,'legacy.pdf');}
 }finally{await db.query('ROLLBACK');await db.end();}
});
