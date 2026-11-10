import {useFirLifecycle,AdvocateFirFeedback} from './Lifecycle';
import {designSubstitutions as copy} from '../../copy/substitutions';
import {useEffect,useRef,useState} from 'react';
import {Linking,Platform,ScrollView,Text,View} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {acceptedFirIdentity,FirIntakeSchema,firAwaitingApproval,waitingDuration,firEditableContent,assembleFirDraft,firDraftProblems,FirDraftEditableSchema,type FirDraftContext,type FirDraftEditable} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Button,Card,ErrorBox,useFirCase,openDocument,uploadEvidence,s} from './shared';
import {DraftEditor} from './DraftEditor';
import {styles as d} from './draftStyles';
import {FirPersonalSummary} from './PersonalDetails';

export default function FirAdvocate(){
 const params=useLocalSearchParams<{id?:string;caseId?:string}>(),id=params.caseId??params.id,m=useFirCase(id),r=m.record,insets=useSafeAreaInsets();
 const [context,setContext]=useState<FirDraftContext|null>(null),[draft,setDraft]=useState<FirDraftEditable|null>(null),[dirty,setDirty]=useState(false);
 const [loading,setLoading]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[reloadConfirm,setReloadConfirm]=useState(false),[preview,setPreview]=useState<{filename:string;pdf_base64:string}|null>(null);
 const history=useFirLifecycle(id,r?.updated_at);
 const generation=useRef(0),lock=useRef(false);
 const waiting=!!r&&firAwaitingApproval(r),editable=!!r&&['advocate_accepted','in_progress','changes_requested'].includes(r.status)&&!waiting;
 const load=async()=>{
  if(!id)return;const token=++generation.current;setLoading(true);setError('');
  try{const c=await backend.firDraftContext(id);if(token!==generation.current)return;setContext(c);setDraft(c.latest_content?firEditableContent(c.latest_content):c.initial_content);setDirty(false);setReloadConfirm(false);setPreview(null);}
  catch(e){if(token===generation.current)setError(e instanceof Error?e.message:'Could not load the FIR draft. Retry loading.');}
  finally{if(token===generation.current)setLoading(false);}
 };
 useEffect(()=>{setContext(null);setDraft(null);setError('');return()=>{generation.current++;};},[id]);
 useEffect(()=>{if(editable&&!context)void load();},[id,editable,context]);
 useEffect(()=>{if(Platform.OS!=='web'||!dirty)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};globalThis.addEventListener('beforeunload',warn);return()=>globalThis.removeEventListener('beforeunload',warn);},[dirty]);
 const edit=(patch:Partial<FirDraftEditable>)=>{setDraft(v=>v?{...v,...patch}:v);setDirty(true);setPreview(null);};
 const action=async(fn:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Action failed. Your edits remain on screen. Retry.');}finally{lock.current=false;setBusy(false);}};
 const save=async()=>{
  if(!r||!context||!draft)throw new Error('Load the draft first.');
  const parsed=FirDraftEditableSchema.safeParse(draft);if(!parsed.success)throw new Error(parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('\n'));
  if(!dirty&&!context.requires_new_version&&context.latest_draft_id&&context.latest_content)return {id:context.latest_draft_id,version:context.latest_version};
  const saved=await backend.saveFirDraft(r.id,{base_draft_id:context.latest_draft_id,filing_hash:context.filing_hash,content:parsed.data});
  setContext({...context,latest_draft_id:saved.id,latest_version:saved.version,latest_content:saved.content,legacy_content:null,requires_new_version:false});setDirty(false);return saved;
 };
 let problems:string[]=[];
 if(history.data?.identity_returns.some(r=>['replacement_required','review_pending'].includes(r.state)))problems.push('Identity replacement must be accepted by admin before generation.');
 if(context&&draft&&r){
  const parsed=FirDraftEditableSchema.safeParse(draft);
  if(!parsed.success)problems=parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`);
  else{const docs=r.documents??[],attachments=draft.attachment_ids.flatMap(id=>{const doc=docs.find(d=>d.id===id&&d.status==='uploaded');return doc?[{document_id:doc.id,filename:doc.filename,mime_type:doc.mime_type as 'application/pdf'}]:[];});
   if(draft.identity_document_id&&!docs.some(d=>d.id===draft.identity_document_id&&acceptedFirIdentity(context.identity_policy,d)))problems.push('The selected identity document is not accepted. Clear it and choose an accepted identity upload.');
   if(attachments.length!==draft.attachment_ids.length)problems.push('Remove unavailable attachments before generating the PDF.');
   problems.push(...firDraftProblems(assembleFirDraft(r.id,context.intake,context.filing_hash,new Date().toISOString(),parsed.data,attachments)).map(p=>p.message));
  }
 }
 const openPreview=async()=>{
  if(!preview)return;
  if(Platform.OS==='web'){
   const bytes=Uint8Array.from(atob(preview.pdf_base64),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download=preview.filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }else await Linking.openURL(`data:application/pdf;base64,${preview.pdf_base64}`);
 };
 return <View style={d.screen}><View style={[d.header,{paddingTop:insets.top+12}]}><Button title="My Cases" onPress={()=>router.push('/matters')}/><View style={d.headerText}><Text style={d.eyebrow}>ADVOCATE WORKSPACE</Text><Text style={d.title}>FIR Draft</Text></View></View>
  <ScrollView contentContainerStyle={d.content} keyboardShouldPersistTaps="handled"><ErrorBox error={m.error} retry={m.reload}/>
   {m.loading&&!r?<Text role="status">Loading FIR case…</Text>:!r?<Text>No FIR case selected. Open a case from My Cases.</Text>:<>
    <View style={d.docket}><View style={d.docketText}><Text style={d.docketTitle}>{r.reference}</Text><Text style={d.docketSub}>{waiting?copy[219].waiting:r.status==='completed'?copy[220].completed:r.status.replaceAll('_',' ')}</Text></View></View>
    <AdvocateFirFeedback life={history.data} error={history.error} retry={history.reload}/>
    {waiting&&<Card><Text>{copy[219].frozen}</Text>{r.approval&&<Text>{waitingDuration(r.approval.submitted_at)}</Text>}</Card>}
    {r.status==='completed'&&<Text style={s.body}>{copy[220].body}</Text>}
    {r.status==='assigned'&&<><OriginalFiling details={r.details}/><Card title="Documents">{r.documents?.length?r.documents.map(doc=><Button key={doc.id} title={`View ${doc.filename}`} onPress={()=>void m.run(()=>openDocument(doc.id))}/>):<Text>No documents uploaded.</Text>}</Card><Card title="Review Request"><Button title="Accept Request" disabled={m.busy} onPress={()=>void m.run(()=>backend.accept(r.id))}/><Button title="Decline Assignment" disabled={m.busy} onPress={()=>void m.run(()=>backend.decline(r.id))}/></Card></>}
    {editable&&<>
     <View style={d.ai}><View style={d.aiText}><Text style={d.aiTitle}>Manual draft</Text><Text style={d.aiBody}>Review the client’s filing and complete all eight sections. No AI is used.</Text></View></View>
     {loading?<Text role="status">Loading saved draft and client filing…</Text>:context&&draft?<>
      {context.legacy_content!==null&&<Card title="Legacy draft needs review"><Text>The previous draft uses the older content format. Review it alongside the structured form before saving a new version.</Text><Text selectable>{JSON.stringify(context.legacy_content,null,2)}</Text></Card>}
      <View pointerEvents={busy?'none':'auto'}><DraftEditor context={context} value={draft} onChange={edit} documents={r.documents??[]} viewDocument={id=>void action(()=>openDocument(id))} upload={()=>void action(async()=>{await uploadEvidence(r.id);m.reload();})}/></View>
      <Text style={s.muted} role="status">{dirty?'Unsaved changes':context.latest_version?`Saved v${context.latest_version}`:'No saved draft yet'}</Text>
      {!!problems.length&&<Card title="PDF not ready"><Text style={s.body}>Complete the answers below before previewing or sending. Partial drafts can still be saved.</Text>{problems.map((p,n)=><Text key={n} style={s.error}>• {p}</Text>)}</Card>}
      <ErrorBox error={error} retry={()=>setReloadConfirm(true)}/>
      <View style={d.bar}><Button title={busy?'Working…':'Save Draft'} disabled={busy} onPress={()=>void action(async()=>{await save();})}/><Button title="Generate PDF Preview" disabled={busy||!!problems.length} onPress={()=>void action(async()=>{const saved=await save();setPreview(await backend.previewFirDraft(r.id,saved.id));})}/>{preview&&<Button title={`Open PDF Preview · ${preview.filename}`} onPress={()=>void action(openPreview)}/>}<Text style={s.body}>{copy[218].freeze}</Text><Button title={copy[218].send} disabled={busy||!!problems.length} onPress={()=>void action(async()=>{const saved=await save();await backend.sendFirDraft(r.id,saved.id);m.reload();})}/></View>
     </>:<ErrorBox error={error||'The saved draft could not be loaded.'} retry={()=>void load()}/>}
     {context&&<Button title="Reload saved draft" disabled={busy} onPress={()=>setReloadConfirm(true)}/>}
     {reloadConfirm&&<Card title="Reload saved version?"><Text>Reloading replaces your unsaved edits with the latest saved version. Copy any text you need first.</Text><Button title="Keep my edits" onPress={()=>setReloadConfirm(false)}/><Button title="Discard edits and reload" onPress={()=>void load()}/></Card>}
    </>}
    {!editable&&r.approval&&<Card title={`Submitted Draft · v${r.approval.version}`}><Button title="View Draft" onPress={()=>void m.run(()=>openDocument(r.approval!.document_id))}/></Card>}
    <Button title="Refresh status" onPress={m.reload}/>
   </>}
  </ScrollView>
 </View>;
}
function OriginalFiling({details}:{details:unknown}){
 const parsed=FirIntakeSchema.safeParse(details);if(!parsed.success)return <Card title="Client intake"><Text>The saved filing could not be read. Refresh the case before accepting.</Text></Card>;
 const i=parsed.data;return <Card title="From client’s filing"><Text style={s.body}>{i.contact.fullName} · {i.contact.mobile}</Text><Text style={s.body}>{[i.jurisdiction.policeStation,i.jurisdiction.district,i.jurisdiction.state].filter(Boolean).join(', ')}</Text><Text style={s.body}>{i.incident.type} · {i.incident.date} {i.incident.time} · {i.incident.location}</Text><Text style={s.body}>{i.incident.description}</Text>{!!i.incident.additional&&<Text style={s.body}>{i.incident.additional}</Text>}{i.people.map((p,n)=><View key={p.id??n}><Text style={s.body}>{p.kind}: {p.unknown?'Unknown suspect':p.name}</Text>{[p.phone,p.residence,p.alias,p.role,p.presence,p.details].filter(Boolean).map((value,n)=><Text key={n} style={s.body}>{value}</Text>)}{p.kind==='complainant'&&<FirPersonalSummary value={p.personal_details}/>}</View>)}</Card>;
}
