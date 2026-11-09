import {useEffect,useState} from 'react';
import {firAwaitingApproval,waitingDuration,type AdminCaseDetail} from '@legalitt/shared';
import {api} from './session';
export function WaitingAge({since}:{since:string}) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
  return <><strong>{waitingDuration(since,now)}</strong><small>Submitted {new Date(since).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</small></>;
}
export function FirApprovalPanel({record,reload}:{record:AdminCaseDetail;reload():void}) {
  const [url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[attempt,setAttempt]=useState(0);
  const [pdfLoaded,setPdfLoaded]=useState(false),[confirmed,setConfirmed]=useState(false);
  const approval=record.approval;
  useEffect(()=>{
    let alive=true;setUrl('');setError('');setPdfLoaded(false);setConfirmed(false);
    if(approval) api.adminDocumentPreview(approval.document_id).then(r=>{if(alive)setUrl(r.url);}).catch(e=>{if(alive)setError(e.message);});
    return()=>{alive=false;};
  },[approval?.document_id,attempt]);
  if(!firAwaitingApproval(record))return null;
  const draft=record.drafts.find(d=>d.id===approval?.draft_id);
  const approve=async()=>{if(!approval||!confirmed||!pdfLoaded)return;setBusy(true);setError('');
    try{await api.approveFirDraft(record.id,approval.draft_id);reload();}catch(e){setError(e instanceof Error?e.message:'Approval failed');}finally{setBusy(false);}};
  return <section className="detail-panel fir-approval" aria-label="FIR draft approval">
    <div className="section-title"><h2>Awaiting admin approval</h2>{approval&&<div className="waiting-age"><WaitingAge since={approval.submitted_at}/></div>}</div>
    <div className="fir-review-body"><p className="fir-stall" role="status">Paid case awaiting a decision. Approval is currently the only available action. Rejection and return for changes have not been defined; this case stays here until approved.</p>
      {approval&&draft?<><p><strong>Submitted draft · v{approval.version}</strong> · {draft.author}</p><p>This version is frozen. A second submission is blocked.</p></>:<p role="alert">The submitted draft record is missing. Reload the case; approval is blocked.</p>}
      {error&&<div className="error" role="alert">{error} <button disabled={busy} onClick={()=>setAttempt(n=>n+1)}>Retry PDF</button> <button disabled={busy} onClick={reload}>Reload case</button></div>}
      {!url&&!error&&approval&&<p role="status">Loading submitted PDF… Approval is blocked until it is available.</p>}
      {url&&<><a href={url} target="_blank" rel="noreferrer">Open submitted PDF in new tab ↗</a><iframe className="fir-pdf" title="Submitted FIR draft" src={url} onLoad={()=>setPdfLoaded(true)} onError={()=>{setPdfLoaded(false);setError('PDF could not be loaded. Retry before approving.');}}/></>}
      <p>Compare this draft with the intake and supporting documents below. Approval sends this exact PDF to the client and closes the drafting case.</p>
      <label className="fir-confirm"><input type="checkbox" checked={confirmed} disabled={!pdfLoaded||busy} onChange={e=>setConfirmed(e.target.checked)}/>I have reviewed the submitted PDF, intake and supporting documents.</label>
      {!confirmed&&<p>Review the documents and confirm above to enable approval.</p>}
      <button className="primary" disabled={busy||!draft||!pdfLoaded||!confirmed} onClick={approve}>{busy?'Approving…':'Approve and send to client'}</button>
    </div>
  </section>;
}
