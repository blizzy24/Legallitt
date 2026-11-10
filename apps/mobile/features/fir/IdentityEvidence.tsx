import {useEffect,useState} from 'react';
import {Linking,Pressable,Text,View} from 'react-native';
import {FirIdentityPolicySchema,acceptedFirIdentity,FIR_ID_NOTICE,MASKED_AADHAAR_HELP,MASKED_AADHAAR_URL,type ApiDocument,type FirIdentityPolicy} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Button,s,uploadEvidence} from './shared';

export function useFirIdentityPolicy(enabled=true){
 const [policy,setPolicy]=useState<FirIdentityPolicy|null>(null),[loading,setLoading]=useState(enabled),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let alive=true;if(!enabled){setLoading(false);return;}setLoading(true);setError('');setPolicy(null);
  backend.request<{config:Record<string,unknown>}>('/services/fir_draft').then(service=>{
   const result=FirIdentityPolicySchema.safeParse(service.config.fir_identity_policy);if(!result.success)throw new Error('Identity requirements could not be loaded. Retry; contact support if this continues.');if(alive)setPolicy(result.data);
  }).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};
 },[enabled,revision]);
 return {policy,loading,error,retry:()=>setRevision(n=>n+1)};
}
export function IdentityRequirement({state,documents}:{state:ReturnType<typeof useFirIdentityPolicy>;documents:ApiDocument[]}){
 if(state.loading)return <Text role="status" style={s.body}>Loading accepted identity documents…</Text>;
 if(state.error||!state.policy)return <View><Text role="alert" style={s.error}>{state.error||'Identity requirements are unavailable.'}</Text><Button title="Retry identity requirements" onPress={state.retry}/></View>;
 const accepted=documents.filter(d=>acceptedFirIdentity(state.policy!,d));
 return <View style={{gap:8}}><Text style={s.label}>Identity proof required · choose any one</Text><Text style={s.body}>{state.policy.accepted_documents.map(t=>t.label).join(' · ')}</Text>{accepted.length?<Text style={s.body}>Identity document attached. No ID number is extracted or recorded.</Text>:<Text role="alert" style={s.error}>Upload one accepted identity document in Documents &amp; Evidence before submitting or paying. Earlier uploads without a document type must be uploaded again with a type selected.</Text>}</View>;
}
export function IdentityUpload({state,caseId,run,busy}:{state:ReturnType<typeof useFirIdentityPolicy>;caseId:string;run(fn:()=>Promise<unknown>):Promise<void>;busy:boolean}){
 const [selected,setSelected]=useState(''),[masked,setMasked]=useState(false),[error,setError]=useState('');
 const type=state.policy?.accepted_documents.find(t=>t.code===selected),ready=!!type&&(!type.requires_masking||masked);
 return <View style={{gap:10,marginVertical:12}}><Text style={s.body}>{FIR_ID_NOTICE}</Text>
  {state.policy?.accepted_documents.map(t=><Pressable key={t.code} accessibilityRole="radio" accessibilityLabel={`Identity type: ${t.label}`} accessibilityState={{checked:selected===t.code,disabled:busy}} disabled={busy} onPress={()=>{setSelected(t.code);setMasked(false);}}><Text style={s.body}>{selected===t.code?'◉':'○'} {t.label}</Text></Pressable>)}
  {type?.requires_masking&&<><Text style={s.body}>{MASKED_AADHAAR_HELP}</Text><Button title="Open UIDAI My Aadhaar" onPress={()=>void Linking.openURL(MASKED_AADHAAR_URL).catch(()=>setError('Could not open UIDAI. Visit myaadhaar.uidai.gov.in in your browser.'))}/><Pressable accessibilityRole="checkbox" accessibilityLabel="I confirm this is masked Aadhaar showing only the last four digits" accessibilityState={{checked:masked,disabled:busy}} disabled={busy} onPress={()=>setMasked(v=>!v)}><Text style={s.body}>{masked?'☑':'☐'} I confirm this is masked Aadhaar showing only the last four digits. I am not uploading the full card.</Text></Pressable></>}
  {!ready&&<Text style={s.muted}>{type?.requires_masking?'Confirm the masked copy before choosing a file.':'Choose your document type before uploading.'}</Text>}
  {!!error&&<Text role="alert" style={s.error}>{error}</Text>}
  <Button title={busy?'Uploading identity proof…':'Upload Identity Proof'} disabled={busy||!ready||!caseId} onPress={()=>void run(()=>uploadEvidence(caseId,'id_proof',{document_type:selected,masked_copy:masked}))}/>
 </View>;
}
