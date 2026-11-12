// Stages of the FIR full-flow walk (scripts/verify-fir-full-flow.cjs), in the
// order of docs/flows/FIR-DRAFT-FLOW.md. Each stage drives the real UI.
const path=require('node:path');
module.exports=function stages(stage,{api,users,page,state,save,pdf,png,kit,S,pass,mobile,adminWeb,out,assert}){
  const {delay,click,clickCard,fill,text,noText,has,at,dump,shot,chooseFile,go}=kit;
  void noText;void has;void users;void adminWeb;
  // A5 answer pills toggle; the field's placeholder shows the chosen answer, so set each only once.
  const answer=async(p,label,choice,nth=0)=>{
    const current=await p.evaluate((label,nth)=>[...document.querySelectorAll('input,textarea')].filter(e=>e.getAttribute('aria-label')===label&&e.getClientRects().length)[nth]?.getAttribute('placeholder')??'',label,nth);
    if(current!==choice)await click(p,`${label}: ${choice}`,{nth});
  };
  // Saving with nothing changed keeps the last version, so the label may read "Saved N min ago".
  const saveDraft=async p=>{await click(p,'Save Draft');await p.waitForFunction(()=>/Saved (just now|\d+ min ago|\d+ h)/.test(document.body.innerText)&&!document.body.innerText.includes('Unsaved changes'),{timeout:60000});};
  // The admin page reloads the case after each action; wait for the review form to be back.
  const identityAccepted=a=>a.waitForFunction(()=>{const t=document.body.innerText;return t.includes('Return for correction')&&!t.includes('Accept the identity document above before approving')&&!t.includes('Loading case');},{timeout:90000});
  // Each submitted version needs the identity document accepted once before a decision.
  const ensureIdentityAccepted=async a=>{
    await a.waitForFunction(()=>{const t=document.body.innerText;return t.includes('Return for correction')&&!t.includes('Loading case');},{timeout:90000});await delay(1200);
    if(!await has(a,'Accept the identity document above before approving'))return;
    await a.waitForFunction(()=>[...document.querySelectorAll('button')].some(e=>e.textContent==='Accept identity document'&&!e.disabled),{timeout:90000});
    await click(a,'Accept identity document');await identityAccepted(a);
  };
  const sendForReview=async p=>{await click(p,'Send for Review');await at(p,'/advocate/fir/review-compact',90000);};
  const pickOption=async(p,trigger,search,option)=>{await click(p,trigger,{contains:true});await fill(p,search,option.split(',')[0]);await delay(500);await click(p,option);await delay(400);};

  // ---------- C1, C1a, C1b: landing and the Assistance path ----------
  stage('client-assistance',async()=>{
    const p=await page('client');
    // Local reruns: close this client's earlier open callback and chat so F1 and F2 start clean.
    for(const t of (await api.client.request('/support/tickets')).filter(t=>t.status==='open'&&['callback','chat'].includes(t.kind)))await api.admin.adminSupportClose(t.id);
    await go(p,mobile+'/fir');await text(p,'Get Help With Your FIR Draft');await shot(p,S('C1-landing'));
    // Tapping a card only selects it (radio); it never navigates.
    await click(p,'Assistance Service',{contains:true});assert.equal(await p.evaluate(()=>location.pathname),'/fir');pass('C1 card tap selects without navigating');
    await click(p,'Request Callback');await at(p,'/callback');await text(p,'Request a Callback');
    await fill(p,'Mobile Number','9000000000');await shot(p,S('C1a-request-callback'));
    await click(p,'Request Callback');await text(p,'Callback requested');await shot(p,S('C1a-request-callback-submitted'));
    const tickets=await api.client.request('/support/tickets');
    const callback=tickets.find(t=>t.kind==='callback'&&t.status==='open');assert.equal(callback?.service_code,'fir_draft');state.callback_id=callback.id;save();pass('Request Callback ticket tagged FIR Draft',callback.id);
    await go(p,mobile+'/fir');await click(p,'Assistance Service',{contains:true});await click(p,'Request Chat');await at(p,'/support-chat');await text(p,'Regarding: FIR Draft Service');
    await shot(p,S('C1b-support-chat'));
    await click(p,'What documents do I need?');await delay(2500);await shot(p,S('C1b-support-chat-sent'));
    const chat=(await api.client.supportChat()).chat;assert.equal(chat?.service_code,'fir_draft');assert.ok(chat.messages.some(m=>m.body==='What documents do I need?'));state.chat_id=chat.id;save();pass('Request Chat thread tagged FIR Draft',chat.id);
    // Both reach the admin Support inbox with the service shown.
    const a=await page('admin');await go(a,adminWeb+'/support');await text(a,'FIR Draft');await shot(a,S('ADMIN-support-inbox'),{width:1440});
    const inbox=await api.admin.adminSupport('open');
    for(const id of [state.callback_id,state.chat_id])assert.equal(inbox.items.find(i=>i.id===id)?.service_code,'fir_draft');pass('both requests are in the admin Support inbox');
  });

  // ---------- C2–C7: explainer and the five intake steps ----------
  stage('client-intake',async()=>{
    const p=await page('client');
    await go(p,mobile+'/fir');await click(p,'Learn more');await at(p,'/fir/info');await text(p,'24–48 Hours');await shot(p,S('C2-why-fir'));pass('C2 turnaround comes from settings','24–48 Hours');
    // Creates the draft, or reopens the newest unsubmitted one, at Step 1 (flow C2).
    await click(p,'Send a FIR Draft');await at(p,'/fir/step1');await text(p,'STEP 1 OF 5');
    state.case_id=new URL(p.url()).searchParams.get('caseId');assert.ok(state.case_id,'draft case created');
    state.reference=(await api.client.request(`/cases/${state.case_id}`)).reference;save();pass('C2 Send a FIR Draft opens Step 1',state.reference);
    await fill(p,'Full Name','TEST ONLY Demo Client');await fill(p,'Mobile Number','9000000000');
    await click(p,'Fraud',{last:true}); // the chip, not the dropdown showing the same value
    await fill(p,'Address or place of the incident','TEST ONLY 12 Synthetic Market Road, near Clock Tower');
    await pickOption(p,'City','Search city','Indore, Madhya Pradesh');
    await fill(p,'PIN Code','452001');
    assert.ok(await has(p,'Madhya Pradesh'),'city fills state and district');
    await click(p,'Police Station',{contains:true});await click(p,'Vijay Nagar');await delay(500);
    await shot(p,S('C3-step1-quick-submission'));
    await click(p,'Continue');await at(p,'/fir/step2');await text(p,'STEP 2 OF 5');pass('C3 Step 1 saved',state.case_id);
    await delay(1200);
    assert.ok(await p.evaluate(()=>[...document.querySelectorAll('input,textarea')].some(e=>e.value.includes('TEST ONLY 12 Synthetic Market Road'))),'incident location prefilled from Step 1');
    // Competent Police Station is the same picker as Step 1, showing the chosen station.
    assert.ok(await p.evaluate(()=>[...document.querySelectorAll('[role="button"],button')].some(e=>/Police Station/.test(e.getAttribute('aria-label')??'')&&/Vijay Nagar/.test((e.getAttribute('aria-label')??'')+e.textContent))),'police station prefilled from Step 1');pass('C4 location and police station prefilled from Step 1');
    await fill(p,'DD / MM / YYYY','10/11/2026');await fill(p,'04:30 PM','04:30 PM');
    await fill(p,'What happened','TEST ONLY: synthetic statement for the FIR full-flow check. A caller claiming to be from the bank asked for an OTP and Rs 25,000 was debited.');
    await fill(p,'Additional details','TEST ONLY: transaction reference SYNTH-0001.');
    await shot(p,S('C4-step2-incident'));
    await click(p,'Continue to People Involved');await at(p,'/fir/step3');await text(p,'STEP 3 OF 5');pass('C4 Step 2 saved');
    await delay(1200);
    await click(p,'Edit complainant details');await text(p,'Complainant Details');
    await fill(p,'Father’s / Husband’s Name','TEST ONLY Ramesh Client');await fill(p,'Age','34');await click(p,'Female');
    await fill(p,'Occupation','TEST ONLY Teacher');await fill(p,'Address','TEST ONLY 4 Synthetic Residency, Indore 452001');
    await shot(p,S('C5-complainant-sheet'));await click(p,'Save Details');await noText(p,'These details appear on your FIR draft');
    await text(p,'TEST ONLY Ramesh Client');pass('C5 complainant sheet saves the extra fields');
    const people=async()=>(await api.client.request(`/cases/${state.case_id}`)).details.people??[];
    if(!(await people()).some(x=>x.kind==='accused')){
      // At least one accused is required; "Unknown" counts.
      await click(p,'Continue to Evidence & Documents');await delay(900);assert.ok(new URL(p.url()).pathname.endsWith('/fir/step3'),'Continue is blocked without an accused');pass('C5 requires at least one accused');
      await click(p,'+ Add Accused / Opposite Party');await text(p,'Add what you know');
      await click(p,'Unknown — I don’t know who it was');await fill(p,'Phone','9000000001');await fill(p,'Alias / Description','TEST ONLY caller claiming to be a bank officer');
      await shot(p,S('C5-accused-sheet'));await click(p,'Add Person');await noText(p,'Add what you know');
    }
    if(!(await people()).some(x=>x.kind==='witness')){
      await click(p,'+ Add Witness');await text(p,'Someone who saw the incident');
      await fill(p,'Name','TEST ONLY Meera Witness');await fill(p,'Relation','Colleague');await fill(p,'Statement note','TEST ONLY present during the call');await click(p,'Key Witness');
      await shot(p,S('C5-witness-sheet'));await click(p,'Add Witness',{last:true});await noText(p,'Someone who saw the incident');
    }
    await text(p,'1 Added');await shot(p,S('C5-step3-people'));
    await click(p,'Continue to Evidence & Documents');await at(p,'/fir/step4');await text(p,'STEP 4 OF 5');
    const stored=await people();assert.ok(stored.some(x=>x.kind==='accused'&&x.unknown)&&stored.some(x=>x.kind==='witness'&&x.key),'accused and key witness stored');pass('C5 Step 3 saved: complainant, unknown accused, key witness');
    const documents=async()=>(await api.client.request(`/cases/${state.case_id}`)).documents??[];
    if(!(await documents()).length){
      // Continue is blocked until a Primary Document exists, with the reason beside that slot (no Identity Proof slot, Q114).
      await click(p,'Continue Draft');await text(p,'Add at least one primary document to continue.');assert.ok(new URL(p.url()).pathname.endsWith('/fir/step4'));
      await shot(p,S('C6-step4-documents-blocked'));pass('C6 Continue is blocked until a primary document is added');
      await chooseFile(p,'Upload Document',await pdf('TEST-ONLY-receipt.pdf',['TEST ONLY synthetic receipt','Not a real document.'],2),{nth:0});await text(p,'TEST-ONLY-receipt.pdf');
      await chooseFile(p,'Add photo or incident media',png('TEST-ONLY-scene.png'));await text(p,'TEST-ONLY-scene.png');
      await click(p,'Add Custom Category Slot');await fill(p,'Category name','Medical Reports');await click(p,'Add Category');await text(p,'5. Medical Reports');
    }
    for(const gone of ['Identity Proof','Last four digits'])assert.equal(await has(p,gone),false,'no '+gone);await shot(p,S('C6-step4-documents'));
    const docs=await documents();assert.ok(docs.some(d=>d.kind==='fir_primary')&&docs.some(d=>d.kind==='fir_scene'));assert.equal(docs.some(d=>d.kind==='id_proof'),false);
    pass('C6 uploads stored by slot; no Identity Proof slot');
    await click(p,'Continue Draft');await at(p,'/fir/step5');await text(p,'STEP 5 OF 5');await text(p,'1 Complainant (Self)');await text(p,'1 Suspect / Accused');await shot(p,S('C7-step5-review'));
    // Editing a step from Review returns straight to Review.
    await click(p,'Edit Incident Details');await at(p,'/fir/step2');await click(p,'Continue to People Involved');await at(p,'/fir/step5');pass('C7 editing from Review returns straight to Review');
    await click(p,'Proceed To Pay');await at(p,'/fir/payment');pass('C7 Proceed To Pay opens payment');
  });

  // ---------- C8–C10: payment (F3, F4, F5), submitted, status ----------
  stage('client-payment',async()=>{
    const p=await page('client');
    const shared=require('../../packages/shared/dist'),formatPaise=v=>shared.formatPaise(v).replace(/\.00$/,''); // whole rupees are drawn without paise
    await go(p,`${mobile}/fir/payment?caseId=${state.case_id}`);await text(p,'Total Payable');
    const quote=await api.client.paymentQuote(state.case_id);assert.equal(quote.status,'ready');const b=quote.breakdown,total=formatPaise(b.total_paise);
    // Our pricing rule, not the design's sample numbers: platform fee 25% of base, GST 18% on base + platform.
    assert.equal(BigInt(b.platform_fee_paise)*4n,BigInt(b.service_fee_paise));assert.equal(Number(b.gst_paise),Math.round((Number(b.service_fee_paise)+Number(b.platform_fee_paise))*0.18));
    for(const amount of [b.service_fee_paise,b.platform_fee_paise,b.gst_paise,b.total_paise])assert.ok(await has(p,formatPaise(amount)),'fee row '+formatPaise(amount));
    assert.equal(await has(p,'Extra pages'),b.charged_pages>0,'extra pages row only above 25 pages');assert.ok(await has(p,'Test payment, no money is charged'));assert.equal(await has(p,'Fast & Secure'),false);
    await shot(p,S('C8-F3-complete-payment'));pass('C8 fee rows come from the price quote',`total ${total}`);
    await click(p,'Scan QR Code',{contains:true});await click(p,'Pay');await at(p,'/fir/scan-pay');await text(p,'QR valid for');await text(p,'FIR Draft');await shot(p,S('C8a-F4-scan-pay'));
    // Nothing advances on its own: the screen is still waiting a few seconds later.
    await delay(6000);assert.ok(new URL(p.url()).pathname.endsWith('/fir/scan-pay'));assert.equal((await api.client.request(`/cases/${state.case_id}`)).status,'payment_pending');pass('C8a Scan & Pay never advances on a timer');
    await click(p,'Simulate successful payment');await at(p,'/fir/payment-success');await text(p,'Your FIR draft request has been submitted.');await shot(p,S('C8b-F5-payment-success'));
    assert.equal((await api.client.request(`/cases/${state.case_id}`)).status,'paid');pass('C8b payment captured (simulated)',total);
    await click(p,'Start Tracking');await at(p,'/fir/submitted');
    await text(p,'Request Submitted Successfully');await text(p,'24–48');await shot(p,S('C9-request-submitted'));
    await click(p,'Track Request');await at(p,'/fir/status');await text(p,'Stage 2 of 5');await shot(p,S('C10-status-stage2'));pass('C9 → C10 by tap; client sees Stage 2 of 5');
  });

  // ---------- A1, A2 and admin §3.1–3.2: assign, advocate rejects, admin reassigns ----------
  stage('advocate-reject',async()=>{
    const a=await page('admin');
    const status=async()=>{const c=await api.admin.adminCase(state.case_id);return {status:c.status,sub:c.sub_status,advocate:c.advocate_id};};
    await go(a,`${adminWeb}/services/fir_draft/cases`);await text(a,'FIR Draft');await delay(1500);await shot(a,S('ADMIN-fir-list'),{width:1440});
    await go(a,`${adminWeb}/services/fir_draft/cases/${state.case_id}`);await text(a,'Client sees: Stage 2 of 5');
    if((await status()).status==='paid'){
      await text(a,'New request · assign an advocate');await shot(a,S('ADMIN-new-request'),{width:1440});pass('admin §3.1 new paid request shows in the queue with Assign');
      await click(a,'+ Assign');await click(a,`Assign to ${users.advocate.name}`);await text(a,'Assigned · awaiting advocate');
    }
    if((await status()).advocate===users.advocate.id){
      const adv=await page('advocate');
      await go(adv,mobile+'/matters');await text(adv,'Review Request');await text(adv,'Fee: ₹999');await shot(adv,S('A1-cases-list'));
      await click(adv,'FIR Draft');await delay(900);await shot(adv,S('A1-cases-list-fir'));pass('A1 card shows FIR DRAFT, client · incident, fee and the status button');
      await clickCard(adv,state.reference,'Review Request');await text(adv,'YOU WILL RECEIVE');
      // A2: the client's mobile and email stay masked until the advocate accepts.
      const {maskMobile,maskEmail}=require('../../packages/shared/dist'),full=(await api.admin.firFlow(state.case_id)).client;
      await text(adv,maskMobile(full.mobile));assert.equal(await has(adv,full.mobile),false,'mobile masked');
      if(full.email){await text(adv,maskEmail(full.email));assert.equal(await has(adv,full.email),false,'email masked');}else assert.equal(await has(adv,'EMAIL'),false,'no email cell when the client gave none');
      pass('A2 masks the client’s mobile and email before acceptance',[maskMobile(full.mobile),full.email?maskEmail(full.email):'(no email given)'].join(' · '));assert.equal(await has(adv,'Identity Proof'),false,'no identity row (Q114)');await shot(adv,S('A2-request-details'));
      assert.equal(await has(adv,'KYC Verified'),false);assert.equal(await has(adv,'Escrow'),false);
      // Reject needs a reason; the case returns to admin and the advocate goes back to the list.
      await click(adv,'Reject');await text(adv,'Reject this request?');await click(adv,'Reject Request');await delay(900);assert.equal((await status()).status,'assigned','a reason is required');
      await fill(adv,'Reason for rejecting','TEST ONLY: outside my practice area');await shot(adv,S('A2-reject-sheet'));
      await click(adv,'Reject Request');await at(adv,'/matters');await delay(1500);
      const after=await status();assert.equal(after.status,'advocate_declined');assert.equal(after.advocate,null);
      await assert.rejects(api.advocate.firFlow(state.case_id),e=>e.status===404);pass('A2 Reject returns the case to admin; the advocate loses access');
      await shot(adv,S('A1-cases-list-empty'));
    }
    if((await status()).status==='advocate_declined'){
      await go(a,`${adminWeb}/services/fir_draft/cases/${state.case_id}`);await text(a,'Advocate rejected · reassign');await text(a,'TEST ONLY: outside my practice area');await shot(a,S('ADMIN-advocate-rejected'),{width:1440});
      pass('admin §3.2 sees the rejection reason and can reassign');
      await click(a,'+ Assign');await click(a,`Assign to ${users['advocate-2'].name}`);await text(a,'Assigned · awaiting advocate');
    }
    assert.equal((await status()).advocate,users['advocate-2'].id);
    const flow=await api.client.firFlow(state.case_id);assert.equal(flow.stage.client.stage,2);assert.equal(JSON.stringify(flow).includes('outside my practice area'),false,'the client never sees the rejection');
    pass('admin reassigned to the second advocate; client still at stage 2');
  });

  // ---------- A2–A5: accept, review documents, generator, proforma ----------
  stage('advocate-draft',async()=>{
    const adv=await page('advocate-2');
    const status=async()=>{const c=await api.admin.adminCase(state.case_id);return {status:c.status,sub:c.sub_status};};
    const now=await status();if(!(['assigned','advocate_accepted'].includes(now.status)||(now.status==='in_progress'&&!now.sub))){console.log('already past first drafting:',now.status,now.sub??'');return;}
    if((await status()).status==='assigned'){
      await go(adv,mobile+'/matters');await clickCard(adv,state.reference,'Review Request');await text(adv,'YOU WILL RECEIVE');await text(adv,'+91 90••••••00');assert.equal(await has(adv,'9000000000'),false);
      assert.equal(await has(adv,'outside my practice area'),false,'the next advocate never sees why the first left');
      await click(adv,'Accept Request');await text(adv,'Accept this request?');await shot(adv,S('A2-accept-confirm'));
      await click(adv,'Accept Request');await at(adv,'/advocate/fir/documents');pass('A2 Accept asks to confirm, then opens Review Documents');
    }else await go(adv,`${mobile}/advocate/fir/documents?caseId=${state.case_id}`);
    await text(adv,'Request Accepted');await text(adv,'2 Pages');await text(adv,'Original text from client');await shot(adv,S('A3-review-documents'));
    await text(adv,'9000000000');pass('after acceptance the advocate sees the client’s mobile in full');
    assert.equal(await has(adv,'Verified Client'),false);
    await click(adv,'Continue to FIR Draft');await at(adv,'/advocate/fir/generator');await text(adv,'AI drafting is coming soon. Use Create Manually.');await shot(adv,S('A4-draft-generator'));
    // Generate with AI is disabled until D-08 is built.
    await click(adv,'Generate with AI',{timeout:3000}).then(()=>delay(800),()=>{});assert.ok(new URL(adv.url()).pathname.endsWith('/generator'),'Generate with AI does nothing');pass('A4 Generate with AI is disabled with the coming-soon line');
    await click(adv,'Create Manually');await at(adv,'/advocate/fir/draft');await text(adv,'FIR DRAFT');await text(adv,'Prepared for submission at Vijay Nagar');
    assert.equal(await has(adv,'Police State Command'),false);await shot(adv,S('A5-proforma-editor-initial'));
    await fill(adv,'Distance from Police Station','2 km north');
    await fill(adv,'Suspected Reason / Motive','TEST ONLY financial gain');
    if(!await has(adv,'BNS 318')){
      await click(adv,'+ Add Legal Section');await fill(adv,'Search BNS sections','318');await delay(600);await shot(adv,S('A5-legal-section-sheet'));
      await click(adv,'BNS 318',{contains:true});await delay(800);
    }
    await text(adv,'BNS 318');assert.equal(await has(adv,'IPC'),false,'BNS only, no IPC numbers');
    await saveDraft(adv);await shot(adv,S('A5-proforma-editor'));
    assert.equal((await status()).status,'in_progress');pass('A5 Save Draft stores a version; status Draft Preparation');
    await sendForReview(adv);
    await text(adv,'SENT TO ADMIN');await text(adv,'Awaiting Legalitt approval');assert.equal(await has(adv,'Submitted to Police'),false,'no police row (Q119)');await shot(adv,S('A6-review-waiting-admin-449'));
    const sent=await status();assert.equal(sent.status,'in_progress');assert.equal(sent.sub,'awaiting_admin_approval');pass('A5 Send for Review → awaiting admin approval → A6');
    await click(adv,'Continue');await at(adv,'/matters');await text(adv,'Sent to Admin');await text(adv,'View Status');await shot(adv,S('A1-cases-list-sent-to-admin'));
    await clickCard(adv,state.reference,'View Status');await at(adv,'/advocate/fir/review');await text(adv,'SENT TO ADMIN');await delay(1200);await shot(adv,S('A6-review-waiting-admin-219'));
    assert.equal((await api.client.firFlow(state.case_id)).stage.client.stage,3,'client sees Draft Preparation while admin reviews');
  });

  // ---------- admin §3.3: return to the same advocate with a reason; advocate fixes and resends ----------
  stage('admin-return',async()=>{
    const a=await page('admin'),adv=await page('advocate-2');
    const status=async()=>{const c=await api.admin.adminCase(state.case_id);return {status:c.status,sub:c.sub_status};};
    if((await status()).sub==='awaiting_admin_approval'&&!(await api['advocate-2'].firFlow(state.case_id)).reviews.some(r=>r.role==='admin'&&r.decision==='returned')){
      await go(a,`${adminWeb}/services/fir_draft/cases/${state.case_id}`);await text(a,'Awaiting admin approval');await text(a,'Submitted draft · v');
      await shot(a,S('ADMIN-approval-queue'),{width:1440});
      await ensureIdentityAccepted(a);
      // A return is always a draft correction with a reason (no identity returns, Q114).
      await a.type('#fir-reason','TEST ONLY: add the exact time of the call to the statement.');await shot(a,S('ADMIN-return-for-correction'),{width:1440});
      await click(a,'Return for correction');await text(a,'Returned to advocate');pass('admin §3.3 Return to advocate needs a reason');
    }
    assert.equal((await api.client.firFlow(state.case_id)).reviews.length,0,'client never sees the admin step');assert.equal((await api.client.firFlow(state.case_id)).stage.client.stage,3);
    if((await status()).status==='changes_requested'){
      await go(adv,mobile+'/matters');await text(adv,'Admin Returned');await text(adv,'Continue Draft');await shot(adv,S('A1-cases-list-admin-returned'));
      await go(adv,`${mobile}/advocate/fir/review?caseId=${state.case_id}`);await text(adv,'add the exact time of the call');await delay(800);await shot(adv,S('A6-review-admin-returned'));
      await click(adv,'Edit Draft');await at(adv,'/advocate/fir/draft');await text(adv,'add the exact time of the call');await shot(adv,S('A5-proforma-admin-returned'));
      await fill(adv,'Statement of Facts','TEST ONLY: synthetic statement for the FIR full-flow check. At about 04:30 PM a caller claiming to be from the bank asked for an OTP and Rs 25,000 was debited.');
      await saveDraft(adv);await sendForReview(adv);await text(adv,'SENT TO ADMIN');
      pass('advocate fixed the returned draft and resent it');
    }
  });

  // ---------- admin §3.3 approve → C10 stage 4 → C11 (F6) → C12 (F7) → C13 (F8) ----------
  const caseStatus=async()=>{const c=await api.admin.adminCase(state.case_id);return {status:c.status,sub:c.sub_status};};
  const adminApprove=async shotName=>{
    const a=await page('admin');
    await go(a,`${adminWeb}/services/fir_draft/cases/${state.case_id}`);await text(a,'Awaiting admin approval');await ensureIdentityAccepted(a);
    // "I have reviewed this PDF" is enabled once the PDF has loaded in the page.
    await a.waitForFunction(()=>{const i=document.querySelector('label.fir-confirm input');return !!i&&!i.disabled;},{timeout:90000});await a.click('label.fir-confirm input');
    if(shotName)await shot(a,S(shotName),{width:1440});
    await click(a,'Approve and send to client');await text(a,'Sent to client');
    assert.equal((await caseStatus()).status,'client_review');
  };
  stage('admin-approve',async()=>{
    if((await caseStatus()).sub==='awaiting_admin_approval'){await adminApprove('ADMIN-approve');const a=await page('admin');await shot(a,S('ADMIN-sent-to-client'),{width:1440});pass('admin §3.3 Approve sends the draft to the client (status client_review)');}
  });
  stage('client-changes',async()=>{
    const p=await page('client');
    if((await caseStatus()).status==='client_review'&&!(await api.client.firFlow(state.case_id)).reviews.some(r=>r.decision==='changes_requested')){
      await go(p,`${mobile}/fir/status?caseId=${state.case_id}`);await text(p,'Stage 4 of 5');await text(p,'AWAITING YOUR APPROVAL');await shot(p,S('C10-status-stage4'));
      await click(p,'Review Your Draft');await at(p,'/fir/ready');await text(p,'Your FIR Draft Is Ready');await text(p,'Stage 4 of 4');await text(p,'_v');
      for(const claim of ['BNSS Compliant','Certified','IPC'])assert.equal(await has(p,claim),false,'no '+claim);
      await shot(p,S('C11-F6-draft-ready-decision'));pass('C11 shows the approved PDF with Approve and Request For Changes');
      await click(p,'Request For Changes');await at(p,'/fir/request-changes');await text(p,'What Changes Are Needed?');
      // Needs at least one section and some text.
      await click(p,'Submit Change Request');await delay(900);assert.ok(new URL(p.url()).pathname.endsWith('/fir/request-changes'));await shot(p,S('C12-F7-request-changes-validation'));
      await click(p,'Complainant Info');await click(p,'Date, Time, Place');
      await fill(p,'Describe required changes','TEST ONLY: please correct my father’s name spelling and state the call time as 4:35 PM.');await text(p,'/ 600');
      await chooseFile(p,'Choose file',await pdf('TEST-ONLY-change-note.pdf',['TEST ONLY synthetic supporting note']),{contains:true});await text(p,'TEST-ONLY-change-note.pdf');
      await shot(p,S('C12-F7-request-changes'));
      await click(p,'Submit Change Request');await at(p,'/fir/changes-submitted');await text(p,'Change Request Submitted Successfully');await delay(800);await shot(p,S('C13-F8-change-request-submitted'));
      const flow=await api.client.firFlow(state.case_id),review=flow.reviews.at(-1);
      assert.equal(flow.status,'changes_requested');assert.equal(flow.sub_status,'client_changes_requested');assert.deepEqual(review.sections,['complainant','date_time_place']);assert.ok(review.attachment);
      pass('C12 change request stored with 2 sections and an attachment');
      await click(p,'Back to FIR Request');await at(p,'/fir/status');await text(p,'Stage 3 of 5');await text(p,'Advocate is updating your draft');await shot(p,S('C10-status-stage3-changes'));pass('C13 → C10: stage 3, "Advocate is updating your draft"');
    }
  });

  // ---------- A6 client changes → A5 revise → admin approves again → C11 Approve → C14 (F9) ----------
  stage('advocate-revise',async()=>{
    const adv=await page('advocate-2');
    if((await caseStatus()).sub!=='client_changes_requested'){console.log('no client change request pending');return;}
    await go(adv,mobile+'/matters');await text(adv,'Client Changes');await text(adv,'Continue Draft');await shot(adv,S('A1-cases-list-client-changes'));
    await go(adv,`${mobile}/advocate/fir/review?caseId=${state.case_id}`);await text(adv,'correct my father’s name spelling');await text(adv,'Complainant Info');await text(adv,'Date, Time, Place');await text(adv,'TEST-ONLY-change-note.pdf');
    await delay(600);await shot(adv,S('A6-review-client-changes'));pass('A6 shows the client’s sections, text and attachment');
    await click(adv,'Edit Draft');await at(adv,'/advocate/fir/draft');await text(adv,'correct my father’s name spelling');await shot(adv,S('A5-proforma-client-changes'));
    await fill(adv,'Statement of Facts','TEST ONLY: synthetic statement for the FIR full-flow check. At about 04:35 PM a caller claiming to be from the bank asked for an OTP and Rs 25,000 was debited.');
    await saveDraft(adv);await sendForReview(adv);await text(adv,'SENT TO ADMIN');
    assert.equal((await caseStatus()).sub,'awaiting_admin_approval');pass('the revision goes to the admin again');
  });
  stage('admin-approve-2',async()=>{
    if((await caseStatus()).sub==='awaiting_admin_approval'){await adminApprove();pass('admin approved the revised draft');}
  });
  stage('client-approve',async()=>{
    const p=await page('client');
    if((await caseStatus()).status==='client_review'){
      await go(p,`${mobile}/fir/ready?caseId=${state.case_id}`);await text(p,'Your FIR Draft Is Ready');
      await click(p,'Approve');await text(p,'Approve this FIR draft?');await text(p,'Your advocate will be notified.');await shot(p,S('C11-approve-confirm'));
      await click(p,'Approve');await at(p,'/fir/approved');await text(p,'FIR Draft Approved Successfully');
      // Q119/Q120: the client submits the approved draft at the station; nothing promises the advocate will.
      await text(p,'Download your approved draft');await text(p,'Submit it at Vijay Nagar');
      for(const gone of ['within 24 hours','carried out by your assigned advocate','Police Station Submission'])assert.equal(await has(p,gone),false,'no '+gone);
      await delay(800);await shot(p,S('C14-F9-draft-approved'));
      const now=await caseStatus();assert.equal(now.status,'completed');pass('C11 Approve → C14; the case completes on client approval (client-submits wording)');
      for(const claim of ['E-SIGNED','biometric','ledger','Verification Confirmed','Signed & Certified'])assert.equal(await has(p,claim),false,'no '+claim);
    }
  });

  // ---------- A1 → A6 → A7 after completion; the advocate is credited on client approval ----------
  stage('advocate-completed',async()=>{
    const adv=await page('advocate-2');
    assert.equal((await caseStatus()).status,'completed');
    await go(adv,mobile+'/matters');await text(adv,'Completed');await shot(adv,S('A1-cases-list-completed'));
    await go(adv,`${mobile}/advocate/fir/review?caseId=${state.case_id}`);await text(adv,'COMPLETED');await text(adv,'Stage 5 of 5');
    for(const gone of ['Submitted to Police','Mark as submitted to police','police receipt'])assert.equal(await has(adv,gone),false,'no '+gone);
    await delay(800);await shot(adv,S('A6-review-completed'));pass('A6 timeline ends at Client Approved; no police step');
    await go(adv,`${mobile}/advocate/fir/completed?caseId=${state.case_id}`);await text(adv,'FIR Draft Completed');assert.equal(await has(adv,'Submitted to police'),false);await delay(800);await shot(adv,S('A7-completed'));
    const flow=await api['advocate-2'].firFlow(state.case_id);
    await click(adv,'View Earnings');await at(adv,'/earnings');await text(adv,'Your share');await delay(1200);await shot(adv,S('A7-wallet'));
    const wallet=await api['advocate-2'].wallet('all'),entry=wallet.entries.find(e=>e.case_id===state.case_id);
    assert.ok(entry,'completed FIR is in the wallet');assert.equal(entry.share_paise,flow.share_paise);pass('wallet shows the advocate’s share on client approval',`₹${Number(entry.share_paise)/100}`);
    assert.equal((await api.advocate.wallet('all')).entries.some(e=>e.case_id===state.case_id),false,'the advocate who rejected is not paid');
  });

  // ---------- client after completion: C10 stage 5, design 49, the approved PDF ----------
  stage('client-final',async()=>{
    const p=await page('client');
    await go(p,`${mobile}/fir/status?caseId=${state.case_id}`);await text(p,'Stage 5 of 5');await delay(800);await shot(p,S('C10-status-stage5-completed'));
    await go(p,`${mobile}/fir/ready?caseId=${state.case_id}`);await text(p,'View FIR Draft');await text(p,'Back to Dashboard');await delay(800);await shot(p,S('C11-49-draft-ready-no-decision'));
    // The approved draft as the client downloads it: no identity row (Q114).
    const flow=await api.client.firFlow(state.case_id),{url}=await api.client.documentUrl(flow.draft.document.id);
    const bytes=Buffer.from(await (await fetch(url)).arrayBuffer());assert.equal(bytes.subarray(0,4).toString(),'%PDF');require('node:fs').writeFileSync(path.join(out,'approved-fir-draft.pdf'),bytes);
    const {text:pdfText}=await require('../../apps/api/tests/helpers/pdf-text.cjs').readPdfText(bytes);
    assert.ok(pdfText.includes('FIR DRAFT — prepared for submission at'));for(const gone of ['Identity document','Official ID','Identity proof'])assert.equal(pdfText.includes(gone),false,'PDF has no '+gone);
    pass('client downloads the approved draft PDF; no identity row',flow.draft.document.filename);
  });

};
