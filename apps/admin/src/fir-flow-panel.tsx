// docs/flows/FIR-DRAFT-FLOW.md §3. No admin designs exist yet (awaiting the Figma
// "Admin Dashboard" export, §9.2); this panel uses the existing admin panel style.
// The state line is firStage() — the same mapping the client and advocate apps use.
import {useEffect,useState} from 'react';
import {firSectionLabel,type FirFlowView,type FirSettings} from '@legalitt/shared';
import {api} from './session';

const when=(iso:string)=>new Date(iso).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST';
const size=(b:string)=>{const n=Number(b);return n>=1e6?`${(n/1e6).toFixed(1)} MB`:`${Math.max(1,Math.round(n/1e3))} KB`;};

function OpenFile({id,name}:{id:string;name:string}){
 const[error,setError]=useState('');
 return <>{' '}<button className="text-button" onClick={()=>void api.adminDocumentPreview(id).then(r=>window.open(r.url,'_blank','noreferrer')).catch(e=>setError(e instanceof Error?e.message:'Couldn’t open the file.'))}>{name} ↗</button>{error&&<span className="error" role="alert"> {error}</span>}</>;
}

/** C14: one switch for who takes the approved draft to the police. */
export function FirPoliceSetting(){
 const[settings,setSettings]=useState<FirSettings|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setError('');api.firSettings().then(s=>{if(live)setSettings(s);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[retry]);
 if(!settings)return <p>{error?<span className="error" role="alert">Couldn’t load the police-submission setting: {error} <button onClick={()=>setRetry(n=>n+1)}>Retry</button></span>:<span role="status">Loading police-submission setting…</span>}</p>;
 const flip=async()=>{setBusy(true);setError('');try{setSettings(await api.updateFirSettings({police_submission_by_advocate:!settings.police_submission_by_advocate}));}catch(e){setError(e instanceof Error?e.message:'Couldn’t save the setting.');}finally{setBusy(false);}};
 return <div className="fir-setting"><label><input type="checkbox" checked={settings.police_submission_by_advocate} disabled={busy} onChange={()=>void flip()}/> The advocate submits the approved FIR at the police station and uploads the receipt</label>
  <p>{settings.police_submission_by_advocate?'On: after the client approves, the case waits for the advocate’s police receipt before it completes.':'Off: the case completes when the client approves; the client takes the draft to the police station.'} Applies to approvals from now on. Turnaround shown to clients: {settings.turnaround.min_hours}–{settings.turnaround.max_hours} hours.</p>
  {error&&<p className="error" role="alert">{error}</p>}</div>;
}

export function FirFlowPanel({caseId,status}:{caseId:string;status:string}){
 const[flow,setFlow]=useState<FirFlowView|null>(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;setError('');api.firFlow(caseId).then(v=>{if(live)setFlow(v);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[caseId,status,retry]);
 if(!flow)return <section className="detail-panel"><div className="fir-review-body">{error?<p className="error" role="alert">Couldn’t load the FIR progress: {error} <button onClick={()=>setRetry(n=>n+1)}>Retry</button></p>:<p role="status">Loading FIR progress…</p>}</div></section>;
 const rejected=[...flow.events].reverse().find(e=>e.type==='fir_advocate_rejected');
 const clientReviews=flow.reviews.filter(r=>r.role==='client');
 return <section className="detail-panel fir-flow" aria-label="FIR progress"><div className="section-title"><h2>FIR progress</h2><span className="pill">{flow.stage.admin.label}</span></div><div className="fir-review-body">
  <p>Client sees: <strong>Stage {flow.stage.client.stage} of 5 · {flow.stage.client.label}</strong>{flow.stage.client.note?` (${flow.stage.client.note})`:''}. Advocate sees: <strong>{flow.stage.advocate.chip}</strong>.</p>
  {flow.status==='advocate_declined'&&rejected&&<p role="status"><strong>{rejected.label}</strong> on {when(rejected.created_at)}. Assign another advocate above.</p>}
  {clientReviews.length>0&&<><h3>Client review</h3>{clientReviews.map((r,i)=><article key={i}><strong>{r.decision==='approved'?'Approved':'Changes requested'} · draft v{r.version} · {when(r.created_at)}</strong>
   {r.sections.length>0&&<p>Sections: {r.sections.map(firSectionLabel).join(', ')}</p>}{r.comment&&<p>{r.comment}</p>}
   {r.attachment&&<p>Attachment:<OpenFile id={r.attachment.id} name={`${r.attachment.filename} (${size(r.attachment.size_bytes)})`}/></p>}</article>)}</>}
  {flow.status==='approved'&&<p role="status">The client approved the draft. Waiting for the advocate to submit it at {flow.police_station??'the police station'} and upload the receipt.</p>}
  {flow.police&&<><h3>Police submission</h3><p>Submitted on {new Date(flow.police.submitted_on+'T00:00:00Z').toLocaleDateString('en-IN',{timeZone:'UTC',day:'2-digit',month:'short',year:'numeric'})}, recorded {when(flow.police.created_at)}. Receipt:<OpenFile id={flow.police.receipt.id} name={flow.police.receipt.filename}/></p></>}
  {flow.share_paise&&<p>Advocate’s share from the price snapshot: ₹{(Number(flow.share_paise)/100).toLocaleString('en-IN',{minimumFractionDigits:2})}. Paid to the advocate who completes the case.</p>}
  <h3>Who submits to police</h3><FirPoliceSetting/>
  <h3>Timeline</h3>{flow.events.length?<ol className="fir-timeline">{flow.events.map((e,i)=><li key={i}><strong>{e.label}</strong> <small>{e.actor} · {when(e.created_at)}</small></li>)}</ol>:<p>No activity yet.</p>}
 </div></section>;
}
