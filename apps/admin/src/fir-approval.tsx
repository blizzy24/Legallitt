import {useEffect,useState} from 'react';
import {waitingDuration,firTurnaround,FIR_REJECTION_HELP,type AdminCaseDetail,type FirLifecycleView} from '@legalitt/shared';
import {api} from './session';
import {AssignAdvocate} from './assign-advocate';
export function WaitingAge({since}:{since:string}){const [now,setNow]=useState(Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);return <><strong>{waitingDuration(since,now)}</strong><small>Since {new Date(since).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</small></>;}
export function Turnaround({value}:{value:Parameters<typeof firTurnaround>[0]}){const[now,setNow]=useState(Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);const result=firTurnaround(value,now);return <p className={'turnaround '+result.level}>{result.text}</p>;}
function ReviewFile({id,title,onReady}:{id:string;title:string;onReady?:()=>void}){
 const[url,setUrl]=useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setUrl('');setError('');api.adminDocumentPreview(id).then(r=>{if(live)setUrl(r.url);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[id,retry]);
 return <div><h3>{title}</h3>{error?<p className="error" role="alert">{error} <button onClick={()=>setRetry(n=>n+1)}>Retry document</button></p>:!url?<p role="status">Loading {title.toLowerCase()}…</p>:<><a href={url} target="_blank" rel="noreferrer">Open {title.toLowerCase()} ↗</a><iframe className="fir-pdf" title={title} src={url} onLoad={onReady} onError={()=>setError('Document could not be displayed. Retry.')}/></>}</div>;
}
// Q114: FIR collects no identity document, so the review shows nothing about identity:
// no identity file, no "Accept identity document", no unmasked-Aadhaar return.
export function FirApprovalPanel({record,reload}:{record:AdminCaseDetail;reload():void}){
 const[life,setLife]=useState<FirLifecycleView|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),[assign,setAssign]=useState(false);
 const[reason,setReason]=useState(''),[reassignReason,setReassignReason]=useState(''),[confirmed,setConfirmed]=useState(false),[pdfReady,setPdfReady]=useState(false);
 useEffect(()=>{let live=true;setLife(null);setError('');setConfirmed(false);setPdfReady(false);api.firLifecycle(record.id).then(r=>{if(live)setLife(r);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[record,retry]);
 const action=async(fn:()=>Promise<unknown>)=>{if(busy)return;setBusy(true);setError('');try{await fn();reload();}catch(e){setError(e instanceof Error?e.message:'Review failed. Reload before retrying.');}finally{setBusy(false);}};
 if(!life)return <section className="detail-panel fir-approval"><div className="fir-review-body">{error?<p role="alert" className="error">{error} <button onClick={()=>setRetry(n=>n+1)}>Retry lifecycle</button></p>:<p role="status">Loading FIR review history…</p>}</div></section>;
 const token={revision:life.revision,submission_id:life.current_submission_id},sub=life.submissions.find(s=>s.id===life.current_submission_id),pending=sub?.state==='pending';
 return <section className="detail-panel fir-approval" aria-label="FIR draft approval"><div className="section-title"><h2>{pending?'Awaiting admin approval':record.status==='client_review'?'Approved · with the client':['approved','completed'].includes(record.status)?'FIR review completed':'FIR review and corrections'}</h2></div><div className="fir-review-body">
  {!['client_review','approved','completed'].includes(record.status)&&<><Turnaround value={life}/><div className="waiting-age"><WaitingAge since={life.updated_at}/></div></>}
  <p>{life.rejection_count} draft rejections for the current advocate. Reassignment becomes available after {life.reassign_after}.</p>
  {error&&<p className="error" role="alert">{error} <button onClick={()=>setRetry(n=>n+1)}>Reload review</button></p>}
  {pending&&<><p><strong>Submitted draft · v{sub.version}</strong>. This version is frozen.</p><ReviewFile key={sub.document_id} id={sub.document_id} title="Submitted FIR draft" onReady={()=>setPdfReady(true)}/></>}
  {pending&&<><fieldset disabled={busy}><legend>Return for correction</legend><label htmlFor="fir-reason">Rejection reason (required)</label><textarea id="fir-reason" aria-describedby="fir-reason-help" value={reason} onChange={e=>setReason(e.target.value)} maxLength={4000}/><p id="fir-reason-help">{FIR_REJECTION_HELP}</p>
   <button disabled={!reason.trim()} onClick={()=>void action(()=>api.request(`/fir/${record.id}/return`,{...token,draft_reason:reason.trim()}))}>Return for correction</button>
  </fieldset><label className="fir-confirm"><input type="checkbox" checked={confirmed} disabled={!pdfReady||busy} onChange={e=>setConfirmed(e.target.checked)}/>I have reviewed this PDF, the intake and supporting documents.</label>
  <button className="primary" disabled={busy||!pdfReady||!confirmed} onClick={()=>void action(()=>api.approveFirDraft(record.id,sub.draft_id,token))}>Approve and send to client</button></>}
  {life.rejection_count>=life.reassign_after&&['in_progress','changes_requested'].includes(record.status)&&<fieldset disabled={busy}><legend>Reassign after repeated failure</legend><label htmlFor="fir-reassign-reason">Reason (required, shown in the case timeline)</label><textarea id="fir-reassign-reason" value={reassignReason} onChange={e=>setReassignReason(e.target.value)} maxLength={2000}/><button disabled={!reassignReason.trim()} onClick={()=>setAssign(true)}>Choose another advocate</button></fieldset>}
  <h3>Review history</h3>{!life.submissions.length?<p>No draft has been submitted yet.</p>:life.submissions.map(s=><article key={s.id}><strong>Draft v{s.version} · {s.state}</strong><p>{life.assignments.find(a=>a.id===s.assignment_id)?.name??'Advocate'} · {new Date(s.submitted_at).toLocaleString('en-IN')}</p>{s.draft_reason&&<p>{s.draft_reason}</p>}</article>)}
  {life.assignments.map(a=><p key={a.id}>{a.name}: {a.rejections} draft rejections · {a.ended_at?'Replaced':'Current assignment'}</p>)}
  {life.entitlement&&<p>Completing advocate entitlement: ₹{(Number(life.entitlement.amount_paise)/100).toFixed(2)}. Replaced advocates receive ₹0.</p>}
 </div>{assign&&<AssignAdvocate caseId={record.id} reference={record.reference} service="fir_draft" excludeId={record.advocate_id??undefined} choose={advocateId=>api.reassignFir(record.id,{...token,advocate_id:advocateId,reason:reassignReason.trim()})} close={()=>setAssign(false)} assigned={()=>{setAssign(false);reload();}}/>}</section>;
}
