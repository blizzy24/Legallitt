const test=require('node:test'),assert=require('node:assert/strict');
const {NoticeFilingSchema,NoticeFilingSubmissionSchema,noticeStage,noticeChatWritable}=require('../dist');
const filing={intake_version:2,identity_kind:'pan',client:{fullName:'Test client',relativeName:'Test relative',age:32,address:'Test client address'},
 noticee:{fullName:'Test recipient',methods:['email'],email:'recipient@example.invalid'},issueType:'money-recovery',narrative:'Test facts'};
test('email-only intake needs no invented postal address or WhatsApp; selected courier and WhatsApp validate their own fields',()=>{
 assert.equal(NoticeFilingSubmissionSchema.safeParse(filing).success,true);
 for(const methods of [[],['email','email'],['courier'],['whatsapp']])assert.equal(NoticeFilingSubmissionSchema.safeParse({...filing,noticee:{...filing.noticee,methods}}).success,false);
 assert.equal(NoticeFilingSubmissionSchema.safeParse({...filing,noticee:{fullName:'Test recipient',methods:['courier'],address:'Test street',pin:'452001'}}).success,true);
 assert.equal(NoticeFilingSubmissionSchema.safeParse({...filing,noticee:{fullName:'Test recipient',methods:['whatsapp'],whatsapp:'+919876543210'}}).success,true);
 assert.equal(NoticeFilingSchema.safeParse({...filing,noticee:{...filing.noticee,relationship:'Friend'}}).success,false);
});
test('cheque bounce cannot be submitted without cheque and return details; partial drafts remain resumable',()=>{
 const cheque={...filing,issueType:'cheque-bounce'};
 assert.equal(NoticeFilingSchema.safeParse(cheque).success,true);
 assert.equal(NoticeFilingSubmissionSchema.safeParse(cheque).success,false);
 assert.equal(NoticeFilingSubmissionSchema.safeParse({...cheque,cheque:{number:'123456',date:'2026-11-01',amount_paise:'500000',bank:'Test bank',return_date:'2026-11-04'}}).success,true);
});
test('client sees finalisation through an internal return; all roles derive their stage from one mapping',()=>{
 for(const status of ['changes_requested','in_progress']){
  const view=noticeStage({status,sub_status:'notice_admin_advocate_correction'});
  assert.equal(view.stage,5);assert.equal(view.client,'Your notice is being finalised');assert.equal(view.advocate,'Admin requested corrections');
 }
 assert.equal(noticeStage({status:'completed'}).complete,true);
 assert.equal(noticeStage({status:'dispatched',sub_status:'notice_delivery_failed'}).admin,'Failed delivery · action required');
});
test('chat cannot reopen during admin correction or after completion; no elapsed-time session limit',()=>{
 for(const status of ['advocate_accepted','in_progress','changes_requested','client_review'])assert.equal(noticeChatWritable({status},false),true);
 for(const status of ['assigned','approved','dispatched','completed','cancelled','refunded'])assert.equal(noticeChatWritable({status},false),false);
 for(const status of ['in_progress','changes_requested','client_review'])assert.equal(noticeChatWritable({status},true),false);
});
