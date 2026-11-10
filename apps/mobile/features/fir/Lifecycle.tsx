import {useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {firTurnaround,type FirLifecycleView} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Card,Button,s,openDocument,type FirCase} from './shared';
import {IdentityUpload,useFirIdentityPolicy} from './IdentityEvidence';
export function useFirLifecycle(id?:string,revision?:string){
 const[data,setData]=useState<FirLifecycleView|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let alive=true;setData(null);setError('');if(id)backend.firLifecycle(id).then(r=>{if(alive)setData(r);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[id,revision,attempt]);
 return {data,error,reload:()=>setAttempt(n=>n+1)};
}
export function ClientFirProgress({record,run,busy}:{record:FirCase;run(fn:()=>Promise<unknown>):Promise<void>;busy:boolean}){
 const m=useFirLifecycle(record.id,record.updated_at),policy=useFirIdentityPolicy();
 const replacement=m.data?.identity_returns.find(r=>r.state==='replacement_required'),reviewing=m.data?.identity_returns.some(r=>r.state==='review_pending');
 const status=replacement?'Action needed: replace your identity document':reviewing?'Your replacement identity document is awaiting review.':record.sub_status==='awaiting_admin_approval'?'Your draft is awaiting our review.':record.status==='changes_requested'?'Your draft is being revised following our review. No action is needed from you.':'Your advocate is preparing your draft. No action is needed from you.';
 return <Card title="Your paid request">{m.error?<><Text role="alert" style={s.error}>{m.error}</Text><Button title="Retry progress" onPress={m.reload}/></>:!m.data?<Text role="status">Loading your request progress…</Text>:<>
  <Text style={s.body}>{status}</Text><Text style={s.body}>{firTurnaround(m.data).text}</Text><Text style={s.muted}>Last updated {new Date(m.data.updated_at).toLocaleString('en-IN')}</Text>
  {replacement&&<><Text style={s.error}>Full Aadhaar is not accepted. Upload the UIDAI masked version showing only the last four digits, or choose another accepted identity document. Your payment remains recorded.</Text><IdentityUpload state={policy} caseId={record.id} run={run} busy={busy}/>
   {(record.documents??[]).filter(d=>d.kind==='id_proof'&&d.status==='uploaded'&&Date.parse(d.created_at??'')>=Date.parse(replacement.rejected_at)).map(d=><Button key={d.id} title={`Send replacement for review: ${d.filename}`} disabled={busy} onPress={()=>void run(async()=>{await backend.request(`/fir/${record.id}/identity-replacement`,{revision:m.data!.revision,return_id:replacement.id,document_id:d.id});m.reload();})}/>)}
   <Text style={s.muted}>After uploading, send the replacement for review using its button above.</Text></>}
 </>}</Card>;
}
export function AdvocateFirFeedback({life,error,retry}:{life:FirLifecycleView|null;error:string;retry():void}){
 const[fileError,setFileError]=useState('');
 return <Card title="Admin review">{error?<><Text style={s.error} role="alert">{error}</Text><Button title="Retry review history" onPress={retry}/></>:!life?<Text role="status">Loading review history…</Text>:<>
  <Text style={s.body}>{life.rejection_count} draft rejections on your current assignment.{life.rejection_count>=life.reassign_after?' Admin may reassign this case.':''}</Text>
  {!life.submissions.length&&<Text>No draft has been submitted yet.</Text>}
  {fileError&&<Text role="alert" style={s.error}>{fileError}</Text>}
  {life.submissions.filter(r=>r.state==='returned').map(r=><View key={r.id}><Text style={s.label}>Draft v{r.version} returned by admin · {new Date(r.decided_at??r.submitted_at).toLocaleString('en-IN')}</Text><Text>{life.assignments.find(a=>a.id===r.assignment_id)?.name}</Text>{r.draft_reason?<Text style={s.body}>{r.draft_reason}</Text>:<Text>Identity replacement required; this does not count as a draft rejection.</Text>}<Button title={`Open returned draft v${r.version}`} onPress={()=>{setFileError('');void openDocument(r.document_id).catch(()=>setFileError('The returned PDF could not be opened. Retry its button.'));}}/></View>)}
  {life.identity_returns.some(r=>['replacement_required','review_pending'].includes(r.state))&&<Text style={s.error}>Identity correction is outstanding. You can save text changes; PDF generation and submission wait for the client’s replacement and admin review.</Text>}
 </>}</Card>;
}
