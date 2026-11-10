module.exports=async function({p,v,api,id,mobile,goto,click,fill,route,shot,refresh,assert,save}){
 const before=await api.client.case(id),previous=before.drafts.at(-1),reason='TEST ONLY: clarify that the invoice remains unpaid and no actual dispute exists.';
 await goto(p,mobile+'/legal-notice/tracking?caseId='+id);await click(p,'Request Changes');
 await p.waitForSelector('textarea[placeholder="Describe what you would like to change"]');await p.type('textarea[placeholder="Describe what you would like to change"]',reason);await click(p,'Request Changes');
 let returned;for(let n=0;n<60;n++){returned=await refresh();if(returned.status==='changes_requested')break;await new Promise(r=>setTimeout(r,500));}assert.equal(returned.status,'changes_requested');await shot(p,'client-requested-changes');
 await goto(v,mobile+'/advocate/notice/'+id+'/review');await v.waitForFunction(reason=>document.body.innerText.includes(reason),{timeout:60000},reason);await shot(v,'advocate-client-change-reason');
 await goto(v,mobile+'/advocate/notice/'+id+'/drafting');await click(v,'Continue with AI Generation');await route(v,'/draft');await click(v,'Edit Background & Facts');await fill(v,'Background & Facts','TEST ONLY corrected after client review: the synthetic invoice remains unpaid. No actual dispute, dispatch or delivery exists.');await fill(v,'Offences','');
 const rendered=v.waitForResponse(r=>/\/drafts\/[^/]+\/pdf$/.test(r.url())&&r.request().method()==='POST',{timeout:90000});await click(v,'Generate Draft');assert.equal((await rendered).status(),201);await route(v,'/response');await click(v,'Share for Review');await route(v,'/review');
 const corrected=await refresh();assert.equal(corrected.status,'client_review');assert.ok(corrected.drafts.at(-1).version>previous.version);await goto(p,mobile+'/legal-notice/tracking?caseId='+id);await shot(p,'client-corrected-draft-review');
 save('request-changes',{case_id:id,reason,original_version:previous.version,corrected_version:corrected.drafts.at(-1).version,returned_status:returned.status,returned_to_client_review:corrected.status});
};
