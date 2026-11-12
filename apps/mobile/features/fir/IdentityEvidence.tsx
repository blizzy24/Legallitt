import {useEffect,useState} from 'react';
import {Linking,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {FileUp} from 'lucide-react-native';
import {FirIdentityPolicySchema,IdentityEvidenceSchema,acceptedFirIdentity,maskedIdentity,MASKED_AADHAAR_HELP,MASKED_AADHAAR_URL,type ApiDocument,type FirIdentityPolicy} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {colors,firStep as f,firStep4 as t,font,ink} from '../../constants/theme';
import {Button,s} from './shared';
import {pickAndUpload,type FirDocument} from './intake/upload';
import {CheckRow,ChoicePills,InlineError} from './intake/ui';

// Flow C6 [DECIDE] Identity Proof: any one accepted government ID, uploaded as a
// file, plus only its LAST FOUR digits typed by the client. Shown everywhere as
// XXXX-XXXX-1234. Never described as verified or "KYC".
export const FIR_IDENTITY_NOTICE='Upload any one accepted government ID. For Aadhaar, upload only the masked copy that shows the last four digits. Type just those last four digits below — never the full number.';
const ID_ACCEPT=['application/pdf','image/jpeg','image/png'] as const;

export function useFirIdentityPolicy(enabled=true){
 const [policy,setPolicy]=useState<FirIdentityPolicy|null>(null),[loading,setLoading]=useState(enabled),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let alive=true;if(!enabled){setLoading(false);return;}setLoading(true);setError('');setPolicy(null);
  backend.request<{config:Record<string,unknown>}>('/services/fir_draft').then(service=>{
   const result=FirIdentityPolicySchema.safeParse(service.config.fir_identity_policy);if(!result.success)throw new Error('The list of accepted identity documents couldn’t be loaded. Try again; contact support if this continues.');if(alive)setPolicy(result.data);
  }).catch(e=>{if(alive)setError(e instanceof Error?e.message:'The list of accepted identity documents couldn’t be loaded. Try again.');}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};
 },[enabled,revision]);
 return {policy,loading,error,retry:()=>setRevision(n=>n+1)};
}

/** "XXXX-XXXX-1234" for an identity upload, or null when no digits were recorded. */
export const identityMask=(doc:ApiDocument)=>maskedIdentity((doc as FirDocument).identity_last4);
/** The document type the client chose ("Masked Aadhaar", "Passport"…). */
export function identityTypeLabel(policy:FirIdentityPolicy|null,doc:ApiDocument){
 const evidence=IdentityEvidenceSchema.safeParse(doc.identity_evidence);
 return (evidence.success&&policy?.accepted_documents.find(d=>d.code===evidence.data.document_type)?.label)||'Identity Proof';
}

export function IdentityRequirement({state,documents}:{state:ReturnType<typeof useFirIdentityPolicy>;documents:ApiDocument[]}){
 if(state.loading)return <Text role="status" style={s.body}>Loading the accepted identity documents…</Text>;
 if(state.error||!state.policy)return <View><Text role="alert" style={s.error}>{state.error||'The accepted identity documents are unavailable.'}</Text><Button title="Try again" onPress={state.retry}/></View>;
 const accepted=documents.filter(d=>acceptedFirIdentity(state.policy!,d));
 const mask=accepted[0]?identityMask(accepted[0]):null;
 return <View style={{gap:8}}><Text style={s.label}>Identity proof required · any one</Text><Text style={s.body}>{state.policy.accepted_documents.map(d=>d.label).join(' · ')}</Text>{accepted.length?<Text style={s.body}>Identity proof attached{mask?` (${mask})`:''}.</Text>:<Text role="alert" style={s.error}>Upload one accepted identity document in Documents &amp; Evidence before paying. Older uploads without a document type must be uploaded again with a type chosen.</Text>}</View>;
}

/**
 * Document type, last four digits and (for Aadhaar) the masked-copy
 * confirmation, then the file. `run` performs the upload and its reload.
 */
export function IdentityUpload({state,caseId,run,busy}:{state:ReturnType<typeof useFirIdentityPolicy>;caseId:string;run(fn:()=>Promise<unknown>):Promise<void>;busy:boolean}){
 const [selected,setSelected]=useState(''),[last4,setLast4]=useState(''),[masked,setMasked]=useState(false),[linkError,setLinkError]=useState(''),[tried,setTried]=useState(false);
 if(state.loading)return <Text role="status" style={styles.muted}>Loading the accepted identity documents…</Text>;
 if(state.error||!state.policy)return <View style={{gap:8}}><InlineError text={state.error||'The accepted identity documents are unavailable.'}/><Pressable accessibilityRole="button" onPress={state.retry}><Text style={styles.link}>Try again</Text></Pressable></View>;
 const types=state.policy.accepted_documents,type=types.find(d=>d.code===selected);
 const problems=[!type&&'Choose the type of ID you’re uploading.',!/^\d{4}$/.test(last4)&&'Enter the last four digits of the ID number.',type?.requires_masking&&!masked&&'Confirm this is the masked copy.'].filter(Boolean) as string[];
 const upload=()=>{setTried(true);if(problems.length||!caseId)return;void run(()=>pickAndUpload({caseId,kind:'id_proof',accept:ID_ACCEPT,identity:{document_type:selected,masked_copy:masked},identityLast4:last4}));};
 return <View style={styles.form}>
  <Text style={styles.muted}>{FIR_IDENTITY_NOTICE}</Text>
  <Text style={styles.label}>Type of ID<Text style={styles.star}> *</Text></Text>
  <ChoicePills label="Type of ID" options={types.map(d=>d.label)} value={type?.label??''} onChange={label=>{setSelected(types.find(d=>d.label===label)?.code??'');setMasked(false);}}/>
  <Text style={styles.label}>Last four digits of the ID number<Text style={styles.star}> *</Text></Text>
  <TextInput value={last4} onChangeText={v=>setLast4(v.replace(/\D/g,'').slice(0,4))} keyboardType="number-pad" maxLength={4} placeholder="1234" placeholderTextColor={f.placeholder} accessibilityLabel="Last four digits of the ID number" style={styles.input}/>
  <Text style={styles.muted}>{/^\d{4}$/.test(last4)?`It will show as ${maskedIdentity(last4)}.`:'Only these four digits are kept, shown as XXXX-XXXX-1234.'}</Text>
  {type?.requires_masking?<>
   <Text style={styles.muted}>{MASKED_AADHAAR_HELP}</Text>
   <Pressable accessibilityRole="link" onPress={()=>void Linking.openURL(MASKED_AADHAAR_URL).catch(()=>setLinkError('UIDAI couldn’t be opened. Visit myaadhaar.uidai.gov.in in your browser.'))}><Text style={styles.link}>Open UIDAI My Aadhaar</Text></Pressable>
   <InlineError text={linkError}/>
   <CheckRow label="This is the masked Aadhaar showing only the last four digits — not the full card." checked={masked} onToggle={()=>setMasked(v=>!v)} disabled={busy}/>
  </>:null}
  {tried&&problems.length?<InlineError text={problems.join(' ')}/>:null}
  <Pressable accessibilityRole="button" accessibilityState={{disabled:busy||!caseId}} disabled={busy||!caseId} onPress={upload} style={({pressed})=>[styles.attach,(pressed||busy)&&{opacity:0.6}]}>
   <FileUp size={t.attachIcon} color={colors.textPrimary}/><Text style={styles.attachLabel}>{busy?'Uploading identity proof…':'Upload Identity Proof'}</Text>
  </Pressable>
 </View>;
}

const styles=StyleSheet.create({
 form:{marginTop:12,gap:8},
 muted:{fontFamily:font.appBody,fontSize:12.5,lineHeight:18,color:colors.textBody},
 label:{marginTop:6,fontFamily:font.appSemi,fontSize:13,color:f.label},
 star:{color:f.starColour},
 input:{height:f.fieldHeight,borderRadius:f.fieldRadius,backgroundColor:f.fieldBg,paddingHorizontal:f.fieldPadX,fontFamily:font.appBody,fontSize:f.fieldTextSize,color:f.fieldText,letterSpacing:4,outlineWidth:0},
 link:{fontFamily:font.appSemi,fontSize:13,color:ink.accent},
 attach:{marginTop:4,minHeight:t.attachHeight,borderRadius:t.attachRadius,backgroundColor:t.attachBg,flexDirection:'row',alignItems:'center',justifyContent:'center',paddingHorizontal:t.cardPad,gap:t.attachIconGap},
 attachLabel:{fontFamily:font.appSemi,fontSize:t.attachSize,color:colors.textPrimary},
});
