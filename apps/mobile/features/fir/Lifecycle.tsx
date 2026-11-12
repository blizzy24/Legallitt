import {useEffect,useState} from 'react';
import {Text,View} from 'react-native';
import {type ApiCase,type FirLifecycleView} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Card,Button,s} from './shared';
import {IdentityUpload,useFirIdentityPolicy} from './IdentityEvidence';
export function useFirLifecycle(id?:string,revision?:string){
 const[data,setData]=useState<FirLifecycleView|null>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let alive=true;setData(null);setError('');if(id)backend.firLifecycle(id).then(r=>{if(alive)setData(r);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[id,revision,attempt]);
 return {data,error,reload:()=>setAttempt(n=>n+1)};
}
/**
 * C10 (undesigned, §9.2): when the admin returns a submitted identity document, the
 * client uploads a replacement and sends it for review from the status screen. The
 * stage timeline above it keeps showing Draft Preparation (flow C10 mapping).
 * Renders nothing while no identity correction is outstanding.
 */
export function ClientIdentityReplacement({caseId,revision}:{caseId:string;revision?:string}){
 const [record,setRecord]=useState<ApiCase|null>(null),[attempt,setAttempt]=useState(0),[busy,setBusy]=useState(false),[actionError,setActionError]=useState('');
 const m=useFirLifecycle(caseId,`${revision??''}:${attempt}`);
 const replacement=m.data?.identity_returns.find(r=>r.state==='replacement_required'),reviewing=m.data?.identity_returns.some(r=>r.state==='review_pending');
 const policy=useFirIdentityPolicy(!!replacement);
 useEffect(()=>{let alive=true;if(replacement)backend.case(caseId).then(r=>{if(alive)setRecord(r);}).catch(e=>{if(alive)setActionError(e instanceof Error?e.message:'Your documents couldn’t be loaded.');});return()=>{alive=false;};},[caseId,replacement?.id,attempt]);
 const run=async(fn:()=>Promise<unknown>)=>{if(busy)return;setBusy(true);setActionError('');try{await fn();setAttempt(n=>n+1);}catch(e){setActionError(e instanceof Error?e.message:'That didn’t work. Try again.');}finally{setBusy(false);}};
 if(m.error)return <Card title="Identity document"><Text role="alert" style={s.error}>We couldn’t check your identity document status. {m.error}</Text><Button title="Try again" onPress={m.reload}/></Card>;
 if(!m.data||(!replacement&&!reviewing))return null;
 if(!replacement)return <Card title="Identity document"><Text style={s.body}>Your replacement identity document is awaiting review. No action is needed from you.</Text></Card>;
 const uploads=(record?.documents??[]).filter(d=>d.kind==='id_proof'&&d.status==='uploaded'&&Date.parse(d.created_at??'')>=Date.parse(replacement.rejected_at));
 return <Card title="Action needed: replace your identity document">
  <Text style={s.error}>Full Aadhaar is not accepted. Upload the UIDAI masked version showing only the last four digits, or choose another accepted identity document. Your payment remains recorded.</Text>
  <IdentityUpload state={policy} caseId={caseId} run={run} busy={busy}/>
  {uploads.map(d=><View key={d.id}><Button title={`Send replacement for review: ${d.filename}`} disabled={busy} onPress={()=>void run(()=>backend.request(`/fir/${caseId}/identity-replacement`,{revision:m.data!.revision,return_id:replacement.id,document_id:d.id}))}/></View>)}
  <Text style={s.muted}>After uploading, send the replacement for review using its button above.</Text>
  {!!actionError&&<Text role="alert" style={s.error}>{actionError}</Text>}
 </Card>;
}
