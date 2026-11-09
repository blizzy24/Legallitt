import {designSubstitutions as copy} from '../../copy/substitutions';
import {useEffect,useState} from 'react';
import {ScrollView,Text,View} from 'react-native';
import {router,useLocalSearchParams} from 'expo-router';
import {FIR_FIELDS,FirIntakeSchema,firAwaitingApproval,waitingDuration,type FirDraftContent} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Button,Card,Field,ErrorBox,useFirCase,openDocument,s} from './shared';
const empty: FirDraftContent={fields:{},legal_sections:[],narrative:'',witnesses:[],document_ids:[]};
export default function FirAdvocate() {
  const params=useLocalSearchParams<{id?:string;caseId?:string}>(),id=params.caseId??params.id;
  const m=useFirCase(id),r=m.record,[draft,setDraft]=useState<FirDraftContent>(empty),[saved,setSaved]=useState('');
  useEffect(()=>{if(!r)return;const latest=r.drafts?.at(-1);if(latest){setDraft(latest.content);setSaved(`Saved v${latest.version}`);return;}
    const intake=FirIntakeSchema.safeParse(r.details);if(!intake.success){setDraft(empty);return;}const i=intake.data;
    setDraft({...empty,fields:{'Police Station':i.jurisdiction.policeStation,'District & State':[i.jurisdiction.district,i.jurisdiction.state].filter(Boolean).join(', '),'Full Legal Name':i.contact.fullName,'Phone & Email':[i.contact.mobile,i.contact.email].filter(Boolean).join(' · '),'Date & Time of Crime':[i.incident.date,i.incident.time].join(' '),'Place of Incident':i.incident.location,'Main Accused Name':i.people.filter(p=>p.kind==='accused').map(p=>p.name).join(', ')},narrative:i.incident.description,witnesses:i.people.filter(p=>p.kind==='witness').map(p=>[p.name,p.details].filter(Boolean).join(' · ')),document_ids:(r.documents??[]).filter(d=>d.kind!=='fir_draft').map(d=>d.id)});
  },[r?.id,r?.updated_at]);
  const edit=(patch:Partial<FirDraftContent>)=>{setDraft(d=>({...d,...patch}));setSaved('Unsaved changes');};
  const waiting=!!r&&firAwaitingApproval(r),editable=!!r&&['advocate_accepted','in_progress'].includes(r.status)&&!waiting;
  return <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><Button title="My Cases" onPress={()=>router.push('/matters')}/><Text style={s.heading}>FIR Draft</Text><ErrorBox error={m.error} retry={m.reload}/>
    {m.loading&&!r?<Text role="status">Loading FIR case…</Text>:!r?<Text>No FIR case selected. Open a case from My Cases.</Text>:<>
      <Card title={r.reference}><Text style={s.body}>{waiting?copy[219].waiting:r.status==='completed'?copy[220].completed:r.status.replaceAll('_',' ')}</Text>{waiting&&<><Text style={s.body}>{copy[219].frozen}</Text>{r.approval&&<Text>{waitingDuration(r.approval.submitted_at)}</Text>}</>}{r.status==='completed'&&<Text style={s.body}>{copy[220].body}</Text>}</Card>
      {r.status==='assigned'&&<Card title="Review Request"><Button title="Accept Request" disabled={m.busy} onPress={()=>void m.run(()=>backend.accept(r.id))}/><Button title="Decline Assignment" disabled={m.busy} onPress={()=>void m.run(()=>backend.decline(r.id))}/></Card>}
      <Card title="Client Intake">{FirIntakeSchema.safeParse(r.details).success?<Intake details={r.details}/>:<Text>No intake details recorded.</Text>}</Card>
      <Card title="Documents">{r.documents?.length?r.documents.map(d=><View key={d.id}><Button title={`View ${d.filename}`} onPress={()=>void m.run(()=>openDocument(d.id))}/>{editable&&d.kind!=='fir_draft'&&<Button title={`${draft.document_ids.includes(d.id)?'✓ Included':'Include'}: ${d.filename}`} onPress={()=>edit({document_ids:draft.document_ids.includes(d.id)?draft.document_ids.filter(x=>x!==d.id):[...draft.document_ids,d.id]})}/>}</View>):<Text>No documents uploaded.</Text>}</Card>
      {editable?<><Card title="FORM I — Police Information Proforma"><Text style={s.body}>Intake details are filled below. Review and complete your draft. Optional fields with no value will not be printed.</Text>{FIR_FIELDS.map(([title,fields])=><View key={title}><Text style={s.heading}>{title}</Text>{fields.map(key=><Field key={key} label={key} value={draft.fields[key]??''} onChange={value=>edit({fields:{...draft.fields,[key]:value}})}/>)}</View>)}<Field label="Applicable Legal Sections (one per line)" value={draft.legal_sections.join('\n')} multiline onChange={v=>edit({legal_sections:v.split('\n')})}/><Field label="Statement of Facts" value={draft.narrative} multiline onChange={narrative=>edit({narrative})}/><Field label="Witnesses (one per line)" value={draft.witnesses.join('\n')} multiline onChange={v=>edit({witnesses:v.split('\n')})}/></Card><Text style={s.muted}>{saved}</Text>
        <Button title="Save Draft" disabled={m.busy} onPress={()=>void m.run(async()=>{await backend.saveFirDraft(r.id,{...draft,legal_sections:draft.legal_sections.filter(v=>v.trim()),witnesses:draft.witnesses.filter(v=>v.trim())});})}/>
        <Text style={s.body}>{copy[218].freeze}</Text>
        <Button title={m.busy?'Working…':copy[218].send} disabled={m.busy} onPress={()=>void m.run(async()=>{const saved=await backend.saveFirDraft(r.id,{...draft,legal_sections:draft.legal_sections.filter(v=>v.trim()),witnesses:draft.witnesses.filter(v=>v.trim())});await backend.sendFirDraft(r.id,saved.id);})}/>
      </>:r.approval?<Card title={`Submitted Draft · v${r.approval.version}`}><Button title="View Draft" onPress={()=>void m.run(()=>openDocument(r.approval!.document_id))}/></Card>:null}
      <Button title="Refresh status" onPress={m.reload}/>
    </>}
  </ScrollView>;
}
function Intake({details}:{details:Record<string,unknown>}) {const i=FirIntakeSchema.parse(details);return <><Text style={s.body}>{i.contact.fullName} · {i.contact.mobile}</Text><Text style={s.body}>{Object.values(i.jurisdiction).filter(Boolean).join(', ')}</Text><Text style={s.body}>{i.incident.date} {i.incident.time} · {i.incident.location}</Text><Text style={s.body}>{i.incident.description}</Text>{!!i.incident.additional&&<Text style={s.body}>{i.incident.additional}</Text>}{i.people.map((p,n)=><Text key={n} style={s.body}>{p.kind}: {p.name} {p.details}</Text>)}</>;}
