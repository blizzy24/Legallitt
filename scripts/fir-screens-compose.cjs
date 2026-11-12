// Puts each built FIR screenshot (docs/flows/fir-screens/built/, produced by
// scripts/verify-fir-full-flow.cjs) next to its design, one image per screen in
// docs/flows/fir-screens/, and writes docs/flows/fir-screens/README.md.
// Screens with no design (pop-ups, states, admin) are shown on their own and say so.
const fs=require('node:fs'),path=require('node:path'),puppeteer=require('puppeteer-core');
const root=path.resolve('docs/flows/fir-screens'),built=path.join(root,'built');
const D='design/',F='design/client/fir-draft/';
// [built screenshot, design file or null, title, flow section, note]
const SCREENS=[
  ['C1-landing',F+'F0a-landing-v2.png','FIR Draft landing','C1',''],
  ['C1a-request-callback',F+'F1-request-callback.png','Request a Callback','C1a',''],
  ['C1a-request-callback-submitted',null,'Request a Callback: submitted','C1a','Existing submitted state; no design.'],
  ['C1b-support-chat',F+'F2-support-chat.png','Support Chat','C1b',''],
  ['C1b-support-chat-sent',null,'Support Chat: after a quick question is sent','C1b','State; no design.'],
  ['C2-why-fir',D+'41-fir-info.jpeg','Why a proper FIR draft is important','C2',''],
  ['C3-step1-quick-submission',F+'F0b-step1-v2.png','Step 1 of 5: Quick Submission','C3',''],
  ['C4-step2-incident',D+'43-fir-step2-incident.png','Step 2 of 5: Incident Details','C4',''],
  ['C5-step3-people',D+'44-fir-step3-people.png','Step 3 of 5: People Involved','C5',''],
  ['C5-complainant-sheet',null,'Complainant details pop-up','C5','No design (§9.2).'],
  ['C5-accused-sheet',null,'Add Accused / Opposite Party pop-up','C5','No design (§9.2).'],
  ['C5-witness-sheet',null,'Add Witness pop-up','C5','No design (§9.2).'],
  ['C6-step4-documents',D+'45-fir-step4-documents.jpeg','Step 4 of 5: Documents & Evidence','C6',''],
  ['C6-step4-documents-blocked',null,'Step 4: Continue blocked, reasons beside the missing slots','C6','State; no design.'],
  ['C7-step5-review',D+'46-fir-step5-review.jpeg','Step 5 of 5: Review & Submit','C7',''],
  ['C8-F3-complete-payment',F+'F3-complete-payment.png','Complete Payment','C8',''],
  ['C8a-F4-scan-pay',F+'F4-scan-pay.png','Scan & Pay','C8a',''],
  ['C8b-F5-payment-success',F+'F5-payment-success.png','Payment Successful','C8b',''],
  ['C9-request-submitted',D+'47-fir-submitted.png','Request Submitted','C9',''],
  ['C10-status-stage2',D+'48-fir-status.jpeg','FIR Draft Status: stage 2, Information Review','C10',''],
  ['C10-status-stage4',D+'48-fir-status.jpeg','FIR Draft Status: stage 4, Awaiting Your Approval','C10','Same design, later state.'],
  ['C10-status-stage3-changes',D+'48-fir-status.jpeg','FIR Draft Status: stage 3 after the client asked for changes','C10','Same design, later state.'],
  ['C10-status-stage5-completed',D+'48-fir-status.jpeg','FIR Draft Status: stage 5, completed','C10','Same design, later state.'],
  ['C11-F6-draft-ready-decision',F+'F6-draft-ready-decision.png','Your FIR Draft Is Ready: decision due','C11',''],
  ['C11-approve-confirm',null,'Approve confirmation','C11','No design (§9.2).'],
  ['C11-49-draft-ready-no-decision',D+'49-fir-draft-ready.png','Your FIR Draft Is Ready: no decision pending','C11',''],
  ['C12-F7-request-changes',F+'F7-request-changes.png','Request Changes','C12',''],
  ['C12-F7-request-changes-validation',null,'Request Changes: nothing chosen yet','C12','State; no design.'],
  ['C13-F8-change-request-submitted',F+'F8-change-request-submitted.png','Change Request Submitted','C13',''],
  ['C14-F9-draft-approved',F+'F9-draft-approved.png','FIR Draft Approved: advocate submits to police (setting on)','C14',''],
  ['C14-F9-draft-approved-police-done',F+'F9-draft-approved.png','FIR Draft Approved: after the police receipt is recorded','C14','Same design, later state.'],
  ['C14-F9-draft-approved-client-submits',F+'F9-draft-approved.png','FIR Draft Approved: client submits to police (setting off)','C14','Same design, setting off.'],
  ['C10-status-completed-client-submits',D+'48-fir-status.jpeg','FIR Draft Status: completed (setting off)','C10','Same design, setting off.'],
  ['A1-cases-list',D+'213-adv-cases-full.png','Advocate: Cases list','A1',''],
  ['A1-cases-list-fir',D+'214-adv-cases-fir.png','Advocate: Cases list, FIR Draft filter','A1',''],
  ['A1-cases-list-empty',null,'Advocate: Cases list after rejecting the request','A1','Empty state; no design.'],
  ['A1-cases-list-sent-to-admin',D+'214-adv-cases-fir.png','Advocate: FIR card, Sent to Admin','A1','Same design, later state.'],
  ['A1-cases-list-admin-returned',D+'214-adv-cases-fir.png','Advocate: FIR card, Admin Returned','A1','Same design, later state.'],
  ['A1-cases-list-client-changes',D+'214-adv-cases-fir.png','Advocate: FIR card, Client Changes','A1','Same design, later state.'],
  ['A1-cases-list-client-approved',D+'214-adv-cases-fir.png','Advocate: FIR card, Client Approved','A1','Same design, later state.'],
  ['A2-request-details',D+'215-adv-fir-request.png','Advocate: FIR Request Details','A2',''],
  ['A2-reject-sheet',null,'Advocate: Reject reason pop-up','A2','No design (§9.2).'],
  ['A2-accept-confirm',null,'Advocate: Accept confirmation','A2','No design (§9.2).'],
  ['A3-review-documents',D+'216-adv-fir-documents.png','Advocate: Review Documents','A3',''],
  ['A4-draft-generator',D+'217-adv-fir-generator.png','Advocate: FIR Draft Generator','A4',''],
  ['A5-proforma-editor-initial',D+'218-adv-fir-draft.png','Advocate: FIR proforma editor, as opened','A5',''],
  ['A5-proforma-editor',D+'218-adv-fir-draft.png','Advocate: FIR proforma editor, filled and saved','A5',''],
  ['A5-legal-section-sheet',null,'Advocate: Add Legal Section (BNS) pop-up','A5','No design (§9.2).'],
  ['A5-proforma-admin-returned',D+'218-adv-fir-draft.png','Advocate: editor with the admin’s return reason','A5','Same design, later state.'],
  ['A5-proforma-client-changes',D+'218-adv-fir-draft.png','Advocate: editor with the client’s change request','A5','Same design, later state.'],
  ['A6-review-waiting-admin-449',D+'449-adv-fir-review-waiting-compact.png','Advocate: FIR Review after sending (compact)','A6',''],
  ['A6-review-waiting-admin-219',D+'219-adv-fir-review.png','Advocate: FIR Review, waiting for admin','A6',''],
  ['A6-review-admin-returned',D+'219-adv-fir-review.png','Advocate: FIR Review, admin returned','A6','Same design, other state.'],
  ['A6-review-client-changes',D+'219-adv-fir-review.png','Advocate: FIR Review, client requested changes','A6','Same design, other state.'],
  ['A6-review-client-approved',D+'219-adv-fir-review.png','Advocate: FIR Review, client approved','A6','Same design, other state.'],
  ['A6-mark-submitted-sheet',null,'Advocate: Mark as submitted to police','A6 / C14','No design (§9.2).'],
  ['A6-review-completed-client-submits',D+'219-adv-fir-review.png','Advocate: FIR Review, completed (setting off)','A6','Same design, setting off.'],
  ['A7-completed',D+'220-adv-fir-completed.png','Advocate: FIR Completed','A7',''],
  ['A7-completed-client-submits',D+'220-adv-fir-completed.png','Advocate: FIR Completed (setting off)','A7','Same design, setting off.'],
  ['A7-wallet',null,'Advocate: Wallet showing the FIR share','A7','Existing wallet screen.'],
  ['ADMIN-support-inbox',null,'Admin: Support inbox with the FIR Draft callback and chat','§3 / C1','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-fir-list',null,'Admin: FIR Drafts list','§3.1','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-new-request',null,'Admin: new paid request, assign an advocate','§3.1','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-advocate-rejected',null,'Admin: advocate rejected, reason shown, reassign','§3.2','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-approval-queue',null,'Admin: draft awaiting approval','§3.3','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-return-for-correction',null,'Admin: return to advocate with a reason','§3.3','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-approve',null,'Admin: approve and send to client','§3.3','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-sent-to-client',null,'Admin: sent to client','§3.3','Awaiting Figma admin designs (§9.2).'],
  ['ADMIN-police-setting-off',null,'Admin: police submission setting switched off','C14','Awaiting Figma admin designs (§9.2).'],
];
const uri=file=>`data:image/${/\.jpe?g$/i.test(file)?'jpeg':'png'};base64,${fs.readFileSync(file).toString('base64')}`;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
(async()=>{
  const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage(),rows=[],missing=[];
  for(const [name,design,title,section,note]of SCREENS){
    const shot=path.join(built,name+'.png');
    if(!fs.existsSync(shot)){missing.push(name);continue;}
    const admin=name.startsWith('ADMIN-'),col=admin?1100:430;
    const html=`<html><body style="margin:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#222">
      <div style="padding:14px 18px;border-bottom:1px solid #ddd"><div style="font-size:19px;font-weight:700">${esc(title)}</div>
      <div style="font-size:13px;color:#555;margin-top:4px">Flow ${esc(section)} · ${design?'design: '+esc(design):'no design'}${note?' · '+esc(note):''}</div></div>
      <div style="display:flex;gap:24px;padding:18px;align-items:flex-start">
      ${design?`<div><div style="font-size:12px;font-weight:700;color:#555;margin-bottom:6px">DESIGN</div><img src="${uri(path.resolve(design))}" style="width:${col}px;border:1px solid #ccc"/></div>`:''}
      <div><div style="font-size:12px;font-weight:700;color:#555;margin-bottom:6px">BUILT${admin?'':' (430 px wide)'}</div><img src="${uri(shot)}" style="width:${col}px;border:1px solid #ccc"/></div></div></body></html>`;
    await page.setViewport({width:(design?col*2+24:col)+36,height:600});await page.setContent(html,{waitUntil:'load'});
    await page.screenshot({path:path.join(root,name+'.png'),fullPage:true});
    rows.push(`| ${section} | ${title} | ${design?'`'+design+'`':'none'} | [${name}.png](${name}.png) | ${note} |`);
  }
  await browser.close();
  fs.writeFileSync(path.join(root,'README.md'),`# FIR Draft: built screens beside their designs\n\nEach image shows the design on the left and the built screen on the right, at phone width (430 px). Screens with no design are shown on their own. They were captured by \`scripts/verify-fir-full-flow.cjs\` on the local build with synthetic TEST ONLY data, then composed by \`scripts/fir-screens-compose.cjs\`. The raw captures are in \`built/\`.\n\n| Flow | Screen | Design | Side by side | Note |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
  console.log(`${rows.length} composed`+(missing.length?`; missing captures: ${missing.join(', ')}`:''));
  if(missing.length)process.exitCode=1;
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
