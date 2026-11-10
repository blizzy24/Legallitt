import {useState} from 'react';
import {Text,View} from 'react-native';
import {Button,Card,Choice,Field,s} from './ui';
import type {ConsultationModel} from './model';
function timestamp(value:string,label:string){
 if(!value.trim())return undefined;
 if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))throw new Error(`${label}: use YYYY-MM-DD HH:mm in IST.`);
 const date=new Date(value.replace(' ','T')+':00+05:30');
 if(Number.isNaN(date.getTime())||new Date(date.getTime()+330*60_000).toISOString().slice(0,16).replace('T',' ')!==value)throw new Error(`${label}: enter a valid date and time.`);
 return date.toISOString();
}
export function CourtProgress({model:m}:{model:ConsultationModel}){
 const [stage,setStage]=useState<'preparation'|'filed'|'hearing'|'decision'>('preparation'),[update,setUpdate]=useState(''),[court,setCourt]=useState(''),[caseNo,setCaseNo]=useState(''),[next,setNext]=useState(''),[hearing,setHearing]=useState(''),[room,setRoom]=useState(''),[steps,setSteps]=useState(''),[documents,setDocuments]=useState<string[]>([]);
 const files=(m.record?.documents??[]).filter(d=>d.kind!=='consultation_report');
 return <Card title={stage==='hearing'?'Hearing update':'Record court progress'}>
  <Text style={s.muted}>Court work takes place offline. Record only actions and documents that have actually occurred. This update is visible to the client.</Text>
  <View style={s.row}>{(['preparation','filed','hearing','decision'] as const).map(k=><Choice key={k} label={k} selected={stage===k} onPress={()=>setStage(k)}/>)}</View>
  <Field label="Client-facing update" value={update} onChange={setUpdate} multiline required/>
  <Field label="Court / bench" value={court} onChange={setCourt}/><Field label="Court case number" value={caseNo} onChange={setCaseNo}/>
  {stage==='hearing'&&<><Field label="Hearing date & time (YYYY-MM-DD HH:mm IST)" value={hearing} onChange={setHearing}/><Field label="Court room" value={room} onChange={setRoom}/></>}
  <Field label="Next step" value={steps} onChange={setSteps} multiline/>
  <Field label="Next hearing (YYYY-MM-DD HH:mm IST, optional)" value={next} onChange={setNext}/>
  <Text style={s.label}>Court order / supporting documents</Text><Text style={s.muted}>Optional. Upload the order in Documents above, then select it here to share it with this update.</Text>
  {!files.length?<Text style={s.body}>No uploaded documents available yet.</Text>:files.map(d=><Choice key={d.id} label={`Share ${d.filename}`} selected={documents.includes(d.id)} onPress={()=>setDocuments(old=>old.includes(d.id)?old.filter(id=>id!==d.id):[...old,d.id])}/>)}
  <Text style={s.muted}>Publishing sends the client an in-app notification and adds this update to their case tracking.</Text>
  <Button disabled={m.busy} onPress={()=>void m.run(()=>m.request('/progress',{...m.token,stage,update,...(court?{court}:{}),...(caseNo?{case_number:caseNo}:{}),next_hearing:timestamp(next,'Next hearing'),...(stage==='hearing'?{hearing_at:timestamp(hearing,'Hearing'),court_room:room||undefined}:{}),next_steps:steps||undefined,document_ids:documents}))}>Publish court update</Button>
 </Card>;
}
