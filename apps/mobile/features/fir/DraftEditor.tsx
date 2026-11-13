import {Fragment,useRef,useState,type ReactNode} from 'react';
import {Pressable,Text,TextInput,View} from 'react-native';
import {CirclePlus,Eye,FileText,Image as ImageIcon,Paperclip,Pencil,Shield,UserRoundPlus,UsersRound,X} from 'lucide-react-native';
import {answerText,firFiledValues,type Answer,type FirAccused,type FirDraftContext,type FirDraftEditable,type FirDraftOverrideKey,type FirWitness} from '@legalitt/shared';
import {advFirDraft as t,colors,ink} from '../../constants/theme';
import {shrinkToFit} from '../../constants/textFit';
import {FIR_DRAFT as copy} from '../../data/advocateFir';
import {styles as d} from './draftStyles';
import {LegalSectionSheet} from './advocate/LegalSectionSheet';
import {bnsLabel} from './advocate/bns';
import {docName,docSlot,formatSize,joinDot,type FirDoc} from './advocate/common';

// The FIR proforma (design/218, flow A5). Every field is editable: the filed values in
// sections 1-3 open pre-filled from the client's filing, and an edit is saved as the
// advocate's override (the filing itself stays on record). The police-only boxes stay
// empty. Optional fields left empty are not printed in the PDF. There is no "Official
// ID Document" row and no identity attachment (ISHAAN-ANSWERS 2026-11-12 Q114).
const newId=()=>globalThis.crypto?.randomUUID?.()??'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.floor(Math.random()*16);return(c==='x'?r:(r&3)|8).toString(16);});
export const DRAFT_SECTIONS=[copy.sections.station,copy.sections.complainant,copy.sections.when,copy.sections.accused,copy.sections.legal,copy.sections.facts,copy.sections.witnesses,copy.sections.attached];
const NOT_FILED='Not provided by the client';
/** A plain optional answer: typed text, or nothing. An older Unknown / N/A answer shows as its printed words. */
const answer=(v:string):Answer<string>|null=>v.trim()?{status:'provided',value:v}:null;

function Section({n,note,noteGreen,onLayout,children}:{n:number;note?:string;noteGreen?:boolean;onLayout?(y:number):void;children:ReactNode}){
  return <View onLayout={e=>onLayout?.(e.nativeEvent.layout.y)}>
    <View style={d.sectionRow}>
      <View style={d.sectionNum}><Text style={d.sectionNumText} {...shrinkToFit(0.8)}>{n}</Text></View>
      <Text style={d.sectionTitle} accessibilityRole="header" {...shrinkToFit(0.7)}>{DRAFT_SECTIONS[n-1]}</Text>
      {!!note&&<Text style={[d.sectionNote,noteGreen&&d.sectionNoteGreen]} {...shrinkToFit(0.75)}>{note}</Text>}
    </View>
    {children}
  </View>;
}
/** Left blank for the police (§1a.1): an empty box, never underscores. */
function PoliceBlank({label,half}:{label:string;half?:boolean}){
  return <View style={half?d.half:d.full}><Text style={d.fieldLabel} {...shrinkToFit(0.75)}>{label}</Text>
    <View style={[d.fieldBox,d.blankBox]} accessible accessibilityLabel={`${label}: left blank for the police to fill in`}/></View>;
}
function Edit({label,value,onChange,half,placeholder,multiline,onRemove,removeLabel,maxLength=2000}:{label:string;value:string;onChange(v:string):void;half?:boolean;placeholder?:string;multiline?:boolean;onRemove?():void;removeLabel?:string;maxLength?:number}){
  return <View style={half?d.half:d.full}>
    <View style={d.labelRow}>
      <Text style={[d.fieldLabel,d.labelText]} {...shrinkToFit(0.8)}>{label}</Text>
      {onRemove&&<Pressable accessibilityRole="button" accessibilityLabel={removeLabel??`Remove ${label}`} hitSlop={8} onPress={onRemove}><X size={t.tagX+2} color={colors.textBody}/></Pressable>}
    </View>
    <View style={d.fieldBox}><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={ink.hint} multiline={multiline} maxLength={maxLength} style={[d.fieldValue,d.input]}/></View></View>;
}
/** Details already in the draft (from the client's filing) that print in the PDF but have no box of their own. */
function AlsoPrinted({items}:{items:[string,string][]}){
  const seen=new Set<string>(),shown=items.filter(([,v])=>{const k=v.trim();if(!k||seen.has(k))return false;seen.add(k);return true;});
  return shown.length?<Text style={[d.hint,d.full]}>Also in the PDF: {shown.map(([label,v])=>`${label}: ${v.trim()}`).join(' · ')}</Text>:null;
}
function Add({label,icon,onPress,disabled}:{label:string;icon?:ReactNode;onPress():void;disabled?:boolean}){
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{disabled:!!disabled}} style={({pressed})=>[d.add,pressed&&d.pressed,disabled&&{opacity:0.5}]}>{icon}<Text style={d.addText} {...shrinkToFit(0.8)}>{label}</Text></Pressable>;
}

export function DraftEditor({context,value,onChange,documents,viewDocument,attach,attaching,onSectionLayout}:{
  context:FirDraftContext;value:FirDraftEditable;onChange(patch:Partial<FirDraftEditable>):void;
  documents:FirDoc[];viewDocument(id:string):void;
  attach():void;attaching:boolean;onSectionLayout?(n:number,y:number):void;
}){
  const i=context.intake,filed=firFiledValues(i),ov=value.overrides??{};
  const [picking,setPicking]=useState(false);
  const narrative=useRef<TextInput>(null);
  const accused=value.accused?.status==='listed'?value.accused.items:[],witnesses=value.witnesses?.status==='listed'?value.witnesses.items:[];
  const setAccused=(items:FirAccused[])=>onChange({accused:items.length?{status:'listed',items}:null});
  const setWitnesses=(items:FirWitness[])=>onChange({witnesses:items.length?{status:'listed',items}:null});
  const editAccused=(id:string,patch:Partial<FirAccused>)=>setAccused(accused.map(a=>a.id===id?{...a,...patch}:a));
  const editWitness=(id:string,patch:Partial<FirWitness>)=>setWitnesses(witnesses.map(w=>w.id===id?{...w,...patch}:w));
  const toggleDoc=(id:string)=>onChange({attachment_ids:value.attachment_ids.includes(id)?value.attachment_ids.filter(x=>x!==id):[...value.attachment_ids,id]});
  const words=value.statement_of_facts.trim().split(/\s+/).filter(Boolean).length;
  const included=value.attachment_ids.filter(id=>documents.some(doc=>doc.id===id)).length;
  const layout=(n:number)=>(y:number)=>onSectionLayout?.(n,y);

  // Filed fields: the box shows the advocate's edit, or the filed value until one is made.
  // Typing the filed value back removes the edit; clearing a box is an edit (it prints nothing).
  const shown=(k:FirDraftOverrideKey)=>ov[k]??filed[k];
  const setOverride=(k:FirDraftOverrideKey,v:string)=>{
    const next={...ov};if(v===filed[k])delete next[k];else next[k]=v;
    onChange({overrides:Object.keys(next).length?next:undefined});
  };
  const filedEdit=(k:FirDraftOverrideKey,label:string,o:{half?:boolean;multiline?:boolean}={})=>
    <Edit label={label} value={shown(k)} onChange={v=>setOverride(k,v)} placeholder={filed[k]?undefined:NOT_FILED} {...o}/>;
  const showResidence=(!!filed.residence&&filed.residence!==filed.address)||ov.residence!==undefined;
  const place=[shown('police_station').trim(),(ov.district_state??i.jurisdiction.state).trim()].filter(Boolean).join(', ');

  // Accused: a name, or the client's "unknown" (described in their filing) when the box is empty.
  const accusedName=(a:FirAccused,label:string,onRemove?:()=>void)=><Edit label={label} value={a.identity.status==='known'?a.identity.name:''} placeholder={a.identity.status==='unknown'?'Unknown':undefined}
    onRemove={onRemove} removeLabel={`Remove ${label.replace(/ Name$/,'').toLowerCase()}`} maxLength={10000} onChange={text=>{
      const src=i.people.find(p=>p.id===a.source_party_id);
      editAccused(a.id,{identity:!text.trim()&&src?.unknown?{status:'unknown',description:src.details||src.alias||''}:{status:'known',name:text}});
    }}/>;
  const accusedFacts=(a:FirAccused)=><>
    <Edit label={copy.accused.vehicle} value={answerText(a.vehicle_used)} onChange={v=>editAccused(a.id,{vehicle_used:answer(v)})}/>
    <Edit label={copy.accused.motive} value={answerText(a.suspected_motive)} onChange={v=>editAccused(a.id,{suspected_motive:answer(v)})}/>
    <AlsoPrinted items={[['Description',a.identity.status==='unknown'?a.identity.description:''],['Alias',answerText(a.alias)],['Phone',answerText(a.phone)],['Other details',answerText(a.other_details)]]}/>
  </>;
  const removeAccused=(id:string)=>setAccused(accused.filter(x=>x.id!==id));
  const [main,...rest]=accused;

  return <View style={d.card}>
    <View style={d.crest}><Shield size={t.crestGlyph} color={colors.brandDark}/></View>
    <Text style={d.command}>{copy.proforma.header(place)}</Text>
    <Text style={d.firTitle} accessibilityRole="header" {...shrinkToFit(0.75)}>{copy.proforma.title}</Text>
    <Text style={d.form} {...shrinkToFit(0.75)}>{copy.proforma.form}</Text>
    <Text style={d.under} {...shrinkToFit(0.75)}>{copy.proforma.under}</Text>

    <Section n={1} onLayout={layout(1)}>
      <View style={d.fields}>
        {filedEdit('police_station','Police Station')}
        {filedEdit('district_state','District & State',{half:true})}
        <PoliceBlank label="FIR Number (by police)" half/>
        <PoliceBlank label="Report Received Date & Time (by police)"/>
      </View>
    </Section>

    <Section n={2} onLayout={layout(2)}>
      <View style={d.fields}>
        {filedEdit('complainant_name','Full Legal Name')}
        {filedEdit('father_name',"Father's Name",{half:true})}
        {filedEdit('age_gender','Age & Gender',{half:true})}
        {filedEdit('occupation','Occupation / Job')}
        {filedEdit('address','Home & Present Address',{multiline:true})}
        {showResidence&&filedEdit('residence','Registered Residence',{multiline:true})}
        {filedEdit('phone_email','Email · phone private')}
      </View>
    </Section>

    <Section n={3} onLayout={layout(3)}>
      <View style={d.fields}>
        <View style={d.full}><Text style={d.fieldLabel} {...shrinkToFit(0.8)}>Date & Time of Crime</Text>
          <View style={d.pairRow}>
            <View style={[d.fieldBox,d.pairBox]}><TextInput accessibilityLabel="Date of crime, DD/MM/YYYY" value={shown('incident_date')} onChangeText={v=>setOverride('incident_date',v)} placeholder="DD/MM/YYYY" placeholderTextColor={ink.hint} maxLength={40} style={[d.fieldValue,d.input]}/></View>
            <View style={[d.fieldBox,d.pairBox]}><TextInput accessibilityLabel="Time of crime" value={shown('incident_time')} onChangeText={v=>setOverride('incident_time',v)} placeholder="HH:MM AM" placeholderTextColor={ink.hint} maxLength={40} style={[d.fieldValue,d.input]}/></View>
          </View>
        </View>
        {filedEdit('place','Place of Incident',{multiline:true})}
        <Edit label="Distance from Police Station" value={answerText(value.distance_and_direction_from_station)} onChange={v=>onChange({distance_and_direction_from_station:answer(v)})}/>
      </View>
    </Section>

    <Section n={4} note={copy.accused.note} onLayout={layout(4)}>
      <View style={d.fields}>
        {main?accusedName(main,copy.accused.main,()=>removeAccused(main.id)):<Text style={[d.emptyText,d.full]}>{value.accused?.status==='none_reported'?'None reported.':'No accused added yet.'}</Text>}
        <Edit label={copy.accused.others} value={value.others_involved??''} onChange={v=>onChange({others_involved:v||undefined})}/>
        {main&&accusedFacts(main)}
      </View>
      {rest.map((a,k)=><View key={a.id} style={d.person}>
        <View style={d.personHead}><Text style={d.personTitle}>Accused {k+2}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Remove accused ${k+2}`} hitSlop={8} onPress={()=>removeAccused(a.id)}><X size={t.tagX+2} color={colors.textBody}/></Pressable></View>
        <View style={d.fields}>{accusedName(a,'Name')}{accusedFacts(a)}</View>
      </View>)}
      <Add label={copy.accused.add} icon={<UserRoundPlus size={t.addIcon} color={t.addColour}/>} onPress={()=>setAccused([...accused,{id:newId(),source_party_id:null,identity:{status:'known',name:''},primary:!accused.length,alias:null,phone:null,other_details:null,vehicle_used:null,suspected_motive:null}])}/>
    </Section>

    <Section n={5} note={copy.legal.count(value.legal_sections.length)} onLayout={layout(5)}>
      <Text style={d.hint}>{value.legal_sections.length?copy.legal.hint:'No legal sections added yet. Add at least one BNS section.'}</Text>
      {!!value.legal_sections.length&&<View style={d.tags}>{value.legal_sections.map(row=>{const label=bnsLabel(row);return <View key={row.id} style={d.tag}>
        <Text style={d.tagText}>{label}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label}`} hitSlop={8} onPress={()=>onChange({legal_sections:value.legal_sections.filter(x=>x.id!==row.id)})}><X size={t.tagX} color={t.tagColour} style={d.tagX}/></Pressable>
      </View>;})}</View>}
      <Add label={copy.legal.add} icon={<CirclePlus size={t.addIcon} color={t.addColour}/>} onPress={()=>setPicking(true)}/>
      <LegalSectionSheet visible={picking} existing={value.legal_sections} onClose={()=>setPicking(false)} onAdd={row=>{onChange({legal_sections:[...value.legal_sections,{id:newId(),...row}]});setPicking(false);}}/>
    </Section>

    <Section n={6} note={copy.facts.note} onLayout={layout(6)}>
      <View style={d.narrative}>
        <TextInput ref={narrative} accessibilityLabel={copy.sections.facts} multiline maxLength={10000} value={value.statement_of_facts} onChangeText={statement_of_facts=>onChange({statement_of_facts})}
          placeholder="To, The Station House Officer, …" placeholderTextColor={ink.hint} style={[d.narrativeText,d.narrativeInput]}/>
      </View>
      <View style={d.narrativeFoot}>
        <Text style={d.narrativeFootText} {...shrinkToFit(0.8)}>{copy.facts.words(words)}</Text>
        <Pressable onPress={()=>narrative.current?.focus()} accessibilityRole="button" style={d.narrativeEdit}><Pencil size={t.narrativeEditIcon} color={t.narrativeEditColour}/><Text style={d.narrativeEditText} {...shrinkToFit(0.8)}>{copy.facts.edit}</Text></Pressable>
      </View>
    </Section>

    <Section n={7} onLayout={layout(7)}>
      <View style={d.fields}>
        {!witnesses.length&&<Text style={[d.emptyText,d.full]}>{value.witnesses?.status==='none_reported'?'None reported.':'No witnesses added yet.'}</Text>}
        {witnesses.map((w,n)=><Fragment key={w.id}>
          <Edit label={copy.witnesses.label(n+1)} value={w.name} maxLength={10000} onChange={name=>editWitness(w.id,{name})} onRemove={()=>setWitnesses(witnesses.filter(x=>x.id!==w.id))} removeLabel={`Remove witness ${n+1}`}/>
          <AlsoPrinted items={[['Phone',answerText(w.phone)],['Relationship',answerText(w.role_or_relationship)],['When present',answerText(w.when_present)],['Statement note',answerText(w.statement_note)]]}/>
        </Fragment>)}
      </View>
      <Add label={copy.witnesses.add} icon={<UsersRound size={t.addIcon} color={t.addColour}/>} onPress={()=>setWitnesses([...witnesses,{id:newId(),source_party_id:null,name:'',phone:null,role_or_relationship:null,when_present:null,statement_note:null}])}/>
    </Section>

    <Section n={8} note={copy.attached.included(included)} noteGreen onLayout={layout(8)}>
      {!documents.length&&<Text style={[d.hint,{marginTop:t.docGap}]}>No documents on this request yet.</Text>}
      {documents.map((doc,n)=>{
        const checked=value.attachment_ids.includes(doc.id);
        const Icon=doc.mime_type.startsWith('image/')?ImageIcon:FileText;
        return <View key={doc.id} style={[d.doc,n===0&&d.docFirst]}>
          <Pressable accessibilityRole="checkbox" accessibilityLabel={`Include ${docName(doc)}`} accessibilityState={{checked}} hitSlop={8} onPress={()=>toggleDoc(doc.id)}
            style={[d.docCheck,!checked&&d.docCheckOff]}/>
          <Icon size={t.docIcon} color={colors.textPrimary} style={d.docIcon}/>
          <View style={d.docText}><Text style={d.docName}>{docName(doc)}</Text><Text style={d.docSub}>{joinDot(docSlot(doc),formatSize(doc.size_bytes))}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${docName(doc)}`} hitSlop={8} onPress={()=>viewDocument(doc.id)}><Eye size={t.docEye} color={colors.textPrimary}/></Pressable>
        </View>;
      })}
      <Add label={attaching?'Uploading…':copy.attached.add} disabled={attaching} icon={<Paperclip size={t.addIcon} color={t.addColour}/>} onPress={attach}/>
    </Section>
  </View>;
}
