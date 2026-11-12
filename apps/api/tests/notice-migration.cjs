const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto'),{Client}=require('pg');
test('legacy notice migration preserves final documents, old charges, approval time and courier history', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new Client({connectionString:process.env.LEGALITT_TEST_DATABASE_URL});await db.connect();
 // Entire disposable schema is rolled back. No existing case is touched, and
 // the actual migration SQL is exercised, rather than a reimplementation.
 const schema='notice_migration_'+randomUUID().replaceAll('-','');await db.query('BEGIN');
 try{
  await db.query(`CREATE SCHEMA ${schema}`);await db.query(`SET LOCAL search_path TO ${schema},public`);
  for(const table of ['cases','drafts','documents','users','payments','shipments','case_events'])await db.query(`CREATE TABLE ${schema}.${table} (LIKE public.${table} INCLUDING ALL)`);
  const client=randomUUID(),adv=randomUUID(),ids=[];
  for(const status of ['approved','dispatching','dispatched','completed']){
   const id=randomUUID(),document=randomUUID(),proof=randomUUID();ids.push({id,document,proof,status});
   await db.query("INSERT INTO cases(id,reference,service_code,client_id,advocate_id,status,tier,details,notice_document_id,sub_status) VALUES($1,$2,'legal_notice',$3,$4,$5,'urgent',$6,$7,'legacy_advocate_dispatch')",[id,'TEST-'+status,client,adv,status,JSON.stringify({noticee:{fullName:'TEST recipient',address:'TEST old address'}}),document]);
   for(const doc of [document,proof])await db.query("INSERT INTO documents(id,case_id,owner_id,kind,filename,s3_key,mime_type,size_bytes) VALUES($1::uuid,$2,$3,'legal_notice','TEST.pdf',($1::uuid)::text,'application/pdf',1234)",[doc,id,adv]);
   await db.query("INSERT INTO payments(case_id,payer_id,purpose,base_amount_paise,gst_paise,total_paise,status,idempotency_key,captured_at) VALUES($1::uuid,$2,'service_fee',137800,24700,162500,'captured',($1::uuid)::text,'2026-11-01T10:00:00Z')",[id,client]);
   await db.query("INSERT INTO case_events(case_id,type,from_status,to_status,created_at,payload) VALUES($1,'draft_approved','client_review','approved','2026-11-02T10:00:00Z','{}')",[id]);
   if(['dispatched','completed'].includes(status)){
    await db.query("INSERT INTO shipments(case_id,direction,carrier,waybill,dispatched_at,received_by,pod_document_id) VALUES($1,'to_recipient','TEST Carrier','TEST waybill','2026-11-03T10:00:00Z','TEST recipient',$2)",[id,proof]);
    await db.query("INSERT INTO case_events(case_id,type,payload,created_at) VALUES($1,'shipment_status_changed','{\"to\":\"in_transit\"}','2026-11-03T11:00:00Z')",[id]);
   }
  }
  for(const name of ['202611130020_notice_admin_dispatch','202611130021_notice_deadline_backfill']){
   const sql=fs.readFileSync(path.resolve('prisma/migrations',name,'migration.sql'),'utf8').replace(/^BEGIN;\s*$/gm,'').replace(/^COMMIT;\s*$/gm,'');await db.query(sql);
  }
  for(const {id,document,proof,status}of ids){
   const {rows:[row]}=await db.query('SELECT c.status,c.sub_status,c.notice_document_id,l.* FROM cases c JOIN notice_lifecycles l ON l.case_id=c.id WHERE c.id=$1',[id]);
   assert.equal(row.status,status);assert.equal(row.approved_document_id,document);assert.equal(row.notice_document_id,document);assert.equal(row.handed_to_admin_at.toISOString(),'2026-11-02T10:00:00.000Z');assert.equal(row.deadline_at.toISOString(),'2026-11-06T10:00:00.000Z');
   assert.equal((await db.query('SELECT total_paise FROM payments WHERE case_id=$1',[id])).rows[0].total_paise,'162500');
   if(['approved','dispatching'].includes(status))assert.equal(row.sub_status,'notice_admin_address_check');
   else{const {rows:[delivery]}=await db.query('SELECT * FROM notice_deliveries WHERE case_id=$1',[id]);assert.equal(delivery.status,status==='completed'?'delivered':'sent');assert.equal(delivery.proof_document_id,proof);assert.equal(delivery.waybill,'TEST waybill');assert.equal(delivery.document_id,document);assert.equal((await db.query('SELECT text FROM notice_delivery_events WHERE delivery_id=$1',[delivery.id])).rows[0].text,'Legacy courier update: in transit');}
  }
 }finally{await db.query('ROLLBACK');await db.end();}
});
