// UI lifecycle verification with synthetic evidence only, never real ID data.
module.exports=async function(w){
 const {fs,path,assert,createHash,PDFDocument,out,deployed,mobile,adminWeb,caseId,pending,approval,identity,previewBytes,client,admin,adv,clients,sessions,login,click,selectorClick,fill,text,delay}=w;
 const shot=(p,name)=>p.screenshot({path:path.join(out,name+'.png'),fullPage:true});
 const goAdmin=()=>admin.goto(adminWeb+'/services/fir_draft/cases/'+caseId,{waitUntil:'networkidle0'});
 const life=()=>clients.admin.firLifecycle(caseId),token=l=>({revision:l.revision,submission_id:l.current_submission_id});
 const hash=b=>createHash('sha256').update(b).digest('hex');
 const url=await clients.admin.adminDocumentPreview(approval.document_id),original=Buffer.from(await(await fetch(url.url)).arrayBuffer());assert.deepEqual(original,previewBytes);fs.writeFileSync(path.join(out,'returned-v2.pdf'),original);
 if((await life()).submissions[0].state==='pending'){await admin.goto(adminWeb+'/services/fir_draft/cases?queue=approval',{waitUntil:'networkidle0'});await text(admin,pending.reference);await shot(admin,'admin-approval-queue');}
 await goAdmin();await text(admin,'Original intake');await text(admin,'TEST ONLY Station');
 if((await life()).submissions[0].state==='pending'){
 await text(admin,'Uploaded identity document');await text(admin,'Return for correction');
 await admin.waitForFunction(()=>[...document.querySelectorAll('button')].some(e=>e.textContent==='Accept identity document'&&!e.disabled));
 const oldToken=token(await life());
 await assert.rejects(clients.admin.approveFirDraft(caseId,approval.draft_id,oldToken),{status:409});
 // The fixture has no ID number or actual card. The operator action tests the
 // manual unmasked-Aadhaar decision even though the upload was labelled Passport.
 await admin.click('fieldset input[type="checkbox"]');await admin.type('#fir-reason','TEST FIRST RETURN: clarify the chronology and supporting facts.');
 await text(admin,'Visible to any advocate who works this case. Describe what’s wrong with the draft.');
 await admin.click('fieldset label:nth-of-type(3) input').catch(async()=>{const boxes=await admin.$$('fieldset input[type="checkbox"]');await boxes[1].click();});
 await shot(admin,'admin-combined-return');await click(admin,'Return for correction');await text(admin,'Waiting for the client to upload replacement identity evidence.');
 }
 let l=await life(),replacement;
 if(l.submissions.length===1){
 const oldToken=token(l);assert.equal(l.rejection_count,1);assert.equal(l.submissions[0].state,'returned');
 await assert.rejects(clients.admin.approveFirDraft(caseId,approval.draft_id,oldToken),{status:409});
 await assert.rejects(clients.admin.documentUrl(identity.id),{status:404});await assert.rejects(clients.client.documentUrl(identity.id),{status:404});
 if(l.identity_returns.at(-1)?.state!=='accepted'){
 await client.reload({waitUntil:'networkidle0'});await text(client,'Action needed: replace your identity document');await text(client,'Your payment remains recorded.');assert.ok(!(await client.evaluate(()=>document.body.innerText)).includes('TEST FIRST RETURN'));await shot(client,'client-replacement-required');
 await adv.goto(mobile+'/advocate/fir/draft?caseId='+caseId,{waitUntil:'networkidle0'});await text(adv,'TEST FIRST RETURN');await text(adv,'Identity correction is outstanding.');await shot(adv,'advocate-first-return');
 await selectorClick(client,'[aria-label="Identity type: Masked Aadhaar"]');await selectorClick(client,'[aria-label="I confirm this is masked Aadhaar showing only the last four digits"]');
 const pdf=await PDFDocument.create();pdf.addPage().drawText('TEST ONLY masked identity replacement fixture. No actual ID number.');const bytes=await pdf.save(),file=path.join(out,'TEST-replacement-fixture.pdf');fs.writeFileSync(file,bytes);
 if(deployed){const[chooser]=await Promise.all([client.waitForFileChooser(),click(client,'Upload Identity Proof')]);await chooser.accept([file]);}
 else{const ticket=await clients.client.presign({case_id:caseId,kind:'id_proof',filename:'TEST-masked-replacement.pdf',mime:'application/pdf',identity:{document_type:'masked_aadhaar',masked_copy:true}});await clients.client.upload(ticket,new Blob([bytes],{type:'application/pdf'}));await client.reload({waitUntil:'networkidle0'});}
 for(let i=0;i<40;i++){replacement=(await clients.client.case(caseId)).documents.find(d=>d.kind==='id_proof'&&d.status==='uploaded');if(replacement)break;await delay(1500);}assert.ok(replacement);
 await click(client,'Send replacement for review: '+replacement.filename);await text(client,'Your replacement identity document is awaiting review.');await shot(client,'client-replacement-submitted');
 await goAdmin();await text(admin,'Uploaded identity document');await click(admin,'Accept identity document');await text(admin,'accepted. File removal:');await shot(admin,'admin-replacement-accepted');
 }
 replacement??=(await clients.client.case(caseId)).documents.find(d=>d.id===l.identity_returns.at(-1)?.replacement_document_id);assert.ok(replacement);
 await adv.goto(mobile+'/advocate/fir/draft?caseId='+caseId,{waitUntil:'networkidle0'});await text(adv,'TEST FIRST RETURN');
 const versions=(await clients.admin.adminCase(caseId)).drafts.map(d=>d.version);
 if(Math.max(...versions)<3){await text(adv,'Unavailable — remove this attachment');await click(adv,'Remove attachment 1');await click(adv,'Use identity reference: '+replacement.filename);
 await fill(adv,'Statement of Facts','TEST corrected chronology after first admin return. हिंदी कथन। No real offence or police filing.');await click(adv,'Save Draft');await text(adv,'Saved v3');}
 await click(adv,'Generate PDF Preview');await text(adv,'Open PDF Preview');await click(adv,'Send for Admin Approval');await text(adv,'Awaiting Admin Approval');
 await goAdmin();await text(admin,'Submitted draft · v3');await admin.click('fieldset input[type="checkbox"]');await admin.type('#fir-reason','TEST SECOND RETURN: explain the witness sequence before finalising.');await click(admin,'Return for correction');await text(admin,'2 draft rejections for the current advocate.');await shot(admin,'admin-second-return-reassign');
 await adv.reload({waitUntil:'networkidle0'});await text(adv,'2 draft rejections on your current assignment.');await text(adv,'TEST SECOND RETURN');await shot(adv,'advocate-second-return');
 }
 const beforeReassign=await life(),paidAt=beforeReassign.paid_at;
 if(!beforeReassign.assignments.some(a=>!a.ended_at&&a.advocate_id===sessions['advocate-2'].user.id)){
  await click(admin,'Reassign case');await selectorClick(admin,'[aria-label="Assign to '+sessions['advocate-2'].user.name+'"]');
 }
 for(let i=0;i<80;i++){l=await life();if(l.rejection_count===0&&l.assignments.some(a=>!a.ended_at&&a.advocate_id===sessions['advocate-2'].user.id))break;await delay(500);}
 assert.equal(l.rejection_count,0);assert.equal(l.paid_at,paidAt);assert.equal(l.assignments.find(a=>a.ended_at)?.rejections,2);
 await assert.rejects(clients.advocate.case(caseId),{status:404});await assert.rejects(clients.advocate.documentUrl(approval.document_id),{status:404});
 // Both notifications are read in their real inboxes below; former advocate's
 // notice intentionally carries no case link after access is removed.
 await adv.goto(mobile+'/notifications',{waitUntil:'networkidle0'});await text(adv,'FIR case reassigned');await text(adv,pending.reference+' has been reassigned');await shot(adv,'replaced-advocate-notified');
 await client.goto(mobile+'/notifications',{waitUntil:'networkidle0'});await text(client,'We’ve assigned a new advocate to your case to make sure your draft meets our standards');await shot(client,'client-reassignment-notification');
 const next=await login('advocate-2');await next.goto(mobile+'/advocate/fir/draft?caseId='+caseId,{waitUntil:'networkidle0'});await text(next,'TEST FIRST RETURN');await text(next,'TEST SECOND RETURN');await click(next,'Accept Request');await text(next,'FORM I');await text(next,'0 draft rejections on your current assignment.');
 await fill(next,'Statement of Facts','TEST final chronology and witness sequence by completing advocate. हिंदी कथन। No real offence or police filing.');await click(next,'Save Draft');await text(next,'Saved v4');await click(next,'Generate PDF Preview');await text(next,'Open PDF Preview');
 const ctx=await clients['advocate-2'].firDraftContext(caseId),rendered=await clients['advocate-2'].previewFirDraft(caseId,ctx.latest_draft_id),expected=Buffer.from(rendered.pdf_base64,'base64');fs.writeFileSync(path.join(out,'final-preview.pdf'),expected);
 await click(next,'Send for Admin Approval');await text(next,'Awaiting Admin Approval');await goAdmin();await text(admin,'Submitted draft · v4');await click(admin,'Accept identity document');await admin.waitForFunction(()=>!!document.querySelector('.fir-confirm input')&&!document.querySelector('.fir-confirm input').disabled);await admin.click('.fir-confirm input');await shot(admin,'admin-final-version-review');await click(admin,'Approve and send to client');await text(admin,'FIR review completed');
 const done=await clients.client.case(caseId),finalLife=await life();assert.equal(done.status,'completed');assert.equal(done.drafts.length,1);assert.equal(done.drafts[0].version,4);assert.equal(finalLife.entitlement.assignment_id,finalLife.assignments.find(a=>!a.ended_at).id);assert.equal(finalLife.entitlement.amount_paise,'99900');
 const released=await clients.client.documentUrl(done.approval.document_id),final=Buffer.from(await(await fetch(released.url)).arrayBuffer());assert.deepEqual(final,expected);await assert.rejects(clients.client.documentUrl(approval.document_id),{status:404});
 await client.goto(mobile+'/fir/status?caseId='+caseId,{waitUntil:'networkidle0'});await text(client,'Your FIR Draft Is Ready');await shot(client,'client-completed');await next.reload({waitUntil:'networkidle0'});await text(next,'FIR Draft Completed');await shot(next,'completing-advocate');
 let historical=null;if(deployed){const previous=require('../../reports/fir-identity-2026-11-10/deployed/verification.json'),old=await clients.client.case(previous.case_id),u=await clients.client.documentUrl(old.approval.document_id);assert.equal(hash(Buffer.from(await(await fetch(u.url)).arrayBuffer())),previous.pdf_sha256);historical={case_id:old.id,pdf_sha256:previous.pdf_sha256};}
 return {case_id:caseId,reference:pending.reference,status:done.status,submissions:finalLife.submissions,assignments:finalLife.assignments,identity_returns:finalLife.identity_returns,payout:finalLife.entitlement,paid_at_unchanged:paidAt===finalLife.paid_at,approval:done.approval,pdf_sha256:hash(final),preview_equals_released_pdf:true,historical_pdf_unchanged:historical,stale_approval:409,manual_identity_check_required:409,rejected_identity_download:404,replaced_advocate_case:404,replaced_advocate_pdf:404,old_client_pdf:404,replaced_advocate_notified:true,client_neutral_notification:true,reassignment_count_reset:true,all_human_lifecycle_actions_through_ui:true};
};
