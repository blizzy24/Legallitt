const test=require('node:test'),assert=require('node:assert/strict');
const {reportStage,reportTimeline,reportFileLabel,ReportWorkflowPolicySchema}=require('../dist');
test('report stages distinguish verification, human file checks and internal correction without exposing reasons',()=>{
 const property={service_code:'property_search',status:'paid',advocate_id:null};assert.equal(reportStage(property).key,'verification');assert.equal(reportStage(property,{verification:{at:'2026-11-13T00:00:00Z',source:'admin_check'}}).key,'assignment');
 const forensic={service_code:'document_forensic',status:'in_progress',advocate_id:'assigned',sub_status:null};assert.equal(reportStage(forensic).key,'files_check');
 const checklist={files_open:true,pages_complete:true,legible:true,at:'2026-11-13T00:00:00Z',actor_id:'assigned',document_ids:[]};assert.equal(reportStage(forensic,{checklist}).advocate,'Waiting for Specialist Report');assert.equal(reportStage(forensic,{checklist,phase:'report_draft'}).advocate,'Report Draft');
 const returned=reportStage({...forensic,sub_status:'admin_changes_requested'},{checklist});assert.equal(returned.client,'Forensic Analysis');assert.equal(returned.advocate,'Changes Needed');
});
test('historical report timelines do not invent missing event timestamps',()=>{
 const c={service_code:'document_forensic',status:'completed',created_at:'2026-11-01T00:00:00Z',completed_at:'2026-11-06T00:00:00Z',events:[{type:'transition',to_status:'paid',created_at:'2026-11-02T00:00:00Z'}]};
 const flow={verification:null};const timeline=reportTimeline(c,flow);assert.equal(timeline.length,6);assert.equal(timeline[1].at,null);assert.equal(timeline[4].at,null);assert.equal(timeline[5].at,c.completed_at);
});
test('report file labels never fall back to internal filenames or UUIDs',()=>{assert.equal(reportFileLabel({kind:'questioned_document',filename:'client-private-uuid.pdf'}),'Document to examine');assert.equal(reportFileLabel({kind:'unknown',filename:'private.pdf'}),'Supporting document');});
test('turnaround policy refuses inverted windows and an empty working calendar',()=>{
 const policy={turnaround:{ordinary:{min:3,max:5,unit:'working_days'},urgent:{min:24,max:48,unit:'hours'}},chat_days_after_delivery:7,chat_reopen_days:7,followup_hours:48,admin_review_hours:4,max_upload_bytes:26214400,working_weekdays:[1,2,3,4,5],timezone:'Asia/Kolkata'};
 assert.equal(ReportWorkflowPolicySchema.safeParse(policy).success,true);assert.equal(ReportWorkflowPolicySchema.safeParse({...policy,working_weekdays:[]}).success,false);assert.equal(ReportWorkflowPolicySchema.safeParse({...policy,turnaround:{...policy.turnaround,urgent:{min:48,max:24,unit:'hours'}}}).success,false);
});
