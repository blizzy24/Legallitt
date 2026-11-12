import {noticeDocumentLabel} from '@legalitt/shared';
import {useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {router} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {Calendar,CloudUpload,FileText,Mail,MapPin,Phone,User,Users,Wallet} from 'lucide-react-native';
import {DOCUMENT_MAX_BYTES,DocumentMimeSchema,NoticeFilingSubmissionSchema,type NoticeFiling} from '@legalitt/shared';
import WizardShell from '../../components/WizardShell';
import ConfirmModal from '../../components/ConfirmModal';
import ChatBubble from '../../components/ChatBubble';
import FlatField from '../../components/FlatField';
import {colors,font} from '../../constants/theme';
import {backend} from '../../lib/auth';
import {openDocument} from '../fir/shared';
import {useNoticeFiling} from './useNoticeFiling';
import {noticeHref} from './navigation';
import DocumentThumbnail from '../documents/DocumentThumbnail';

export const NOTICE_ISSUES=[['property-dispute','Property Dispute'],['money-recovery','Money Recovery'],['tenant-issue','Tenant Issue'],['family-dispute','Family Dispute'],['cheque-bounce','Cheque Bounce'],['consumer-complaint','Consumer Complaint'],['other','Any other']] as const;
export const issueLabel=(code?:string|null)=>NOTICE_ISSUES.find(([key])=>key===code)?.[1]??code??'';
const slots:Record<string,[string,string][]>= {
  'property-dispute':[['notice_support_property','Property papers (sale deed, khata)'],['notice_support_agreement','Agreement'],['notice_support_screenshots','Screenshots']],
  'money-recovery':[['notice_support_invoice','Invoice / bill'],['notice_support_agreement','Agreement'],['notice_support_payment','Payment proof / ledger'],['notice_support_screenshots','Screenshots']],
  'cheque-bounce':[['notice_cheque','Cheque copy *'],['notice_return_memo','Bank return memo *'],['notice_support_invoice','Invoice / agreement'],['notice_support_screenshots','Screenshots']],
  'tenant-issue':[['notice_support_agreement','Rent agreement'],['notice_support_receipts','Rent receipts'],['notice_support_screenshots','Screenshots']],
};
type Step=1|2|3|4|5|'review';
export default function NoticeIntake({step}:{step:Step}){
  const m=useNoticeFiling(),v=m.filing,[custom,setCustom]=useState(''),[leave,setLeave]=useState(false);
  const [removeId,setRemoveId]=useState<string|null>(null);
  const client=(patch:Partial<NoticeFiling['client']>)=>m.update({...v,client:{...v.client,...patch}});
  const noticee=(patch:Partial<NoticeFiling['noticee']>)=>m.update({...v,noticee:{...v.noticee,...patch}});
  const cheque=(patch:Partial<NonNullable<NoticeFiling['cheque']>>)=>m.update({...v,cheque:{...v.cheque,...patch}});
  const docs=m.record?.documents?.filter(d=>d.status==='uploaded')??[],identity=docs.filter(d=>d.kind==='id_proof'),support=docs.filter(d=>d.kind!=='id_proof');
  const selectedSlots=[...(slots[v.issueType??'']??[['notice_support_document','Any supporting document'],['notice_support_screenshots','Screenshots']]),...(v.custom_slots??[]).map((label,i)=>[`notice_support_custom_${i}`,label])];
  const back=()=>{if(step===1){setLeave(true);return;}void m.run(async()=>{await m.save();m.go('/legal-notice/'+({2:'step1',3:'step2',4:'step3',review:'step4',5:'step4-review'} as Record<string,string>)[step]);});};
  const validate=()=>{
    const parsed=NoticeFilingSubmissionSchema.safeParse(v);
    if(!parsed.success){const issue=parsed.error.issues.find(e=>step===5||step===1&&e.path[0]==='client'||step===2&&e.path[0]==='noticee'||step===3&&!['client','noticee','identity_kind'].includes(String(e.path[0]))||[4,'review'].includes(step)&&e.path[0]==='identity_kind');if(issue)throw new Error(issue.message);}
    if([4,5,'review'].includes(step)){
      if(!identity.length)throw new Error('Upload masked Aadhaar or PAN before continuing.');
      if(v.identity_kind==='masked_aadhaar'&&identity.length<2)throw new Error('Upload both the front and back of your masked Aadhaar.');
      if(!support.length)throw new Error('Upload at least one supporting document.');
      if(v.issueType==='cheque-bounce'&&(!docs.some(d=>d.kind==='notice_cheque')||!docs.some(d=>d.kind==='notice_return_memo')))throw new Error('Cheque Bounce needs the cheque copy and bank return memo.');
    }
  };
  const next=()=>void m.run(async()=>{
    validate();await m.save();
    if(step===5){if(m.record?.status==='draft')await backend.submit(m.caseId!);m.go('/legal-notice/step6');return;}
    m.go(m.returnTo==='summary'?'/legal-notice/step5':'/legal-notice/'+({1:'step2',2:'step3',3:'step4',4:'step4-review',review:'step5'} as Record<string,string>)[step]);
  });
  const upload=(kind:string,label?:string,replacing?:string)=>void m.run(async()=>{
    if(!m.caseId)return;await m.save();
    const picked=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],copyToCacheDirectory:true});if(picked.canceled)return;
    const asset=picked.assets[0];if((asset.size??0)>DOCUMENT_MAX_BYTES)throw new Error('Choose a file no larger than 25 MB.');
    const mime=DocumentMimeSchema.parse(asset.mimeType);const ticket=await backend.presign({case_id:m.caseId,kind,filename:kind==='id_proof'?'Identity-proof.'+(mime==='application/pdf'?'pdf':mime==='image/png'?'png':'jpg'):asset.name,mime,...(label?{slot_label:label}: {})});
    await backend.upload(ticket,asset.file??{uri:asset.uri,name:ticket.document.filename,type:mime});
    // The old file is retained until the replacement upload has succeeded.
    if(replacing)await backend.deleteDocument(replacing);await m.reload();
  });
  const remove=(id:string)=>setRemoveId(id);
  const edit=(number:number)=>void m.run(async()=>{await m.save();router.push(noticeHref(`/legal-notice/step${number}?returnTo=summary`,m.caseId));});
  const rupees=(value?:string)=>value===undefined?'':(Number(value)/100).toString();
  const paise=(value:string)=>value.trim()?String(Math.round(Number(value)*100)):undefined;
  const readOnly=!!m.record&&m.record.status!=='draft';
  const pageCount=docs.reduce((n,d)=>n+(d.page_count??0),0),unresolved=docs.some(d=>d.mime_type==='application/pdf'&&d.page_count===null);
  return <WizardShell step={step==='review'?4:step} subtitle="" totalSteps={6} align={step===4||step==='review'?'top':'bottom'} background={step===4||step==='review'?'tinted':'white'} busy={m.busy||m.loading} hideButton={m.loading||!m.record||m.paid} buttonLabel={step===5?'Submit & Proceed to Pay':'Continue'} onContinue={next} onBack={back}>
    {m.loading?<Text style={s.body}>Loading your saved filing…</Text>:!m.caseId?<View style={s.card}><Text style={s.body}>Start a Legal Notice request to enter your details.</Text><Link label="Choose service" onPress={()=>router.replace('/legal-notice')}/></View>:!m.record?<View style={s.card}><Text style={s.error}>{m.error||'Your filing could not be loaded.'}</Text><Link label="Retry" onPress={()=>void m.reload()}/></View>:m.paid?<View style={s.card}><Text style={s.body}>This request has already been submitted and paid.</Text><Link label="View your request" onPress={()=>m.go('/legal-notice/tracking')}/></View>:<>
      {readOnly&&<View style={s.info}><Text style={s.body}>Your filing has been submitted. Its details are read-only. You can finish or replace uploads before payment.</Text><Link label="Return to payment" onPress={()=>m.go('/legal-notice/step6')}/></View>}
      {step===1&&<><ChatBubble title="Please provide your details!"/><View style={s.fields}>
        <FlatField icon={User} label="Full Name" required value={v.client.fullName??''} onChangeText={fullName=>client({fullName})} editable={!readOnly}/>
        <FlatField icon={Users} label="Father’s / Husband’s name" required value={v.client.relativeName??''} onChangeText={relativeName=>client({relativeName})} editable={!readOnly}/>
        <FlatField icon={User} label="Age" required keyboardType="number-pad" value={v.client.age===undefined?'':String(v.client.age)} onChangeText={age=>client({age:age?Number(age.replace(/\D/g,'')):undefined})} editable={!readOnly}/>
        <FlatField icon={Phone} label="Mobile Number" hint="(Optional)" value={v.client.mobile??''} onChangeText={mobile=>client({mobile})} keyboardType="phone-pad" editable={!readOnly}/>
        <FlatField icon={Mail} label="Email Address" hint="(Optional)" value={v.client.email??''} onChangeText={email=>client({email})} autoCapitalize="none" keyboardType="email-address" editable={!readOnly}/>
        <FlatField icon={MapPin} label="Full Address" required multiline value={v.client.address??''} onChangeText={address=>client({address})} editable={!readOnly}/>
      </View></>}
      {step===2&&<><View style={s.info}><Text style={s.body}>Don’t know the noticee’s address? Share whatever details you hold. Choose at least one way to send your notice.</Text></View><ChatBubble title="Who would you like to send the notice to?"/><View style={s.fields}>
        <View style={s.row}>{(['person','company'] as const).map(type=><Choice key={type} label={type==='person'?'Person':'Company'} selected={(v.noticee.type??'person')===type} onPress={()=>noticee({type})} disabled={readOnly}/>)}</View>
        <FlatField icon={User} label="Noticee Full Name" required value={v.noticee.fullName??''} onChangeText={fullName=>noticee({fullName})} editable={!readOnly}/>
        {v.noticee.type==='company'&&<FlatField icon={Users} label="Through (designation)" value={v.noticee.throughDesignation??''} onChangeText={throughDesignation=>noticee({throughDesignation})} editable={!readOnly}/>}
        <Text style={s.heading}>How should we send the notice?</Text>
        {(['courier','email','whatsapp'] as const).map(method=><View key={method} style={{gap:10}}><Choice label={{courier:'Courier to postal address',email:'Email',whatsapp:'WhatsApp'}[method]} selected={v.noticee.methods.includes(method)} onPress={()=>noticee({methods:v.noticee.methods.includes(method)?v.noticee.methods.filter(x=>x!==method):[...v.noticee.methods,method]})} disabled={readOnly}/>
          {v.noticee.methods.includes(method)&&(method==='courier'?<><FlatField icon={MapPin} label="Noticee Full Address" required multiline value={v.noticee.address??''} onChangeText={address=>noticee({address})} editable={!readOnly}/><FlatField icon={MapPin} label="PIN" required maxLength={6} keyboardType="number-pad" value={v.noticee.pin??''} onChangeText={pin=>noticee({pin})} editable={!readOnly}/><Text style={s.muted}>Courier delivery is charged separately at payment.</Text></>:method==='email'?<FlatField icon={Mail} label="Email Id of Noticee" required autoCapitalize="none" keyboardType="email-address" value={v.noticee.email??''} onChangeText={email=>noticee({email})} editable={!readOnly}/>:<FlatField icon={Phone} label="WhatsApp Mobile Number of Noticee" required keyboardType="phone-pad" value={v.noticee.whatsapp??''} onChangeText={whatsapp=>noticee({whatsapp})} editable={!readOnly}/>)}</View>)}
      </View></>}
      {step===3&&<><ChatBubble title="Quick Actions"/><View style={s.chips}>{NOTICE_ISSUES.map(([key,label])=><Choice key={key} label={label} selected={v.issueType===key} onPress={()=>m.update({...v,issueType:key})} disabled={readOnly}/>)}</View><View style={s.fields}>
        <FlatField icon={FileText} label="Briefly describe the issue" required multiline height={140} maxLength={2000} value={v.narrative??''} onChangeText={narrative=>m.update({...v,narrative})} editable={!readOnly}/><Text style={s.muted}>{v.narrative?.length??0}/2,000 characters</Text>
        <FlatField icon={Wallet} label="Amount involved (₹, optional)" keyboardType="decimal-pad" value={rupees(v.amount_paise)} onChangeText={value=>m.update({...v,amount_paise:paise(value)})} editable={!readOnly}/>
        <FlatField icon={Calendar} label="Key date (YYYY-MM-DD, optional)" maxLength={10} value={v.key_date??''} onChangeText={key_date=>m.update({...v,key_date})} editable={!readOnly}/>
        {v.issueType==='cheque-bounce'&&<View style={s.card}><Text style={s.heading}>Cheque details</Text>{([['number','Cheque number'],['date','Cheque date (YYYY-MM-DD)'],['amount_paise','Cheque amount (₹)'],['bank','Bank'],['return_date','Date returned (YYYY-MM-DD)']] as const).map(([key,label])=><FlatField key={key} icon={key.includes('date')?Calendar:FileText} label={label} required value={key==='amount_paise'?rupees(v.cheque?.[key]):v.cheque?.[key]??''} onChangeText={value=>cheque({[key]:key==='amount_paise'?paise(value):value})} editable={!readOnly}/>)}</View>}
      </View></>}
      {(step===4||step==='review')&&<>
        {m.record.documents?.filter(d=>d.status==='pending').map(doc=><View key={doc.id} style={s.card}><Text style={s.heading}>{noticeDocumentLabel(doc)}</Text><Text style={s.error}>This upload did not finish. Remove it, then upload the file again before paying.</Text><Link label="Remove unfinished upload" onPress={()=>remove(doc.id)}/></View>)}
        {step==='review'?<><Text style={s.large}>Review Your Documents</Text><Text style={s.body}>Check your uploads before proceeding.</Text><View style={s.info}><Text style={s.body}>{docs.length?`Documents uploaded successfully · ${docs.length} documents added`:'No documents uploaded yet. Add identity and supporting documents to continue.'}</Text></View></>:<View style={s.card}><Text style={s.heading}>{identity.length?'ID uploaded':'Identity document required'}</Text><Text style={s.body}>Upload masked Aadhaar (front and back) or PAN. This is an upload, not identity verification. Never upload a full Aadhaar card.</Text><Text style={s.muted}>On UIDAI’s MyAadhaar download page, choose “Do you want a masked Aadhaar?” before downloading. We do not extract or record ID numbers.</Text><View style={s.row}>{(['masked_aadhaar','pan'] as const).map(kind=><Choice key={kind} label={kind==='pan'?'PAN':'Masked Aadhaar'} selected={v.identity_kind===kind} onPress={()=>m.update({...v,identity_kind:kind})} disabled={readOnly}/>)}</View>{v.identity_kind&&<Link label={v.identity_kind==='pan'?'Upload PAN':'Upload Aadhaar front / back'} onPress={()=>upload('id_proof')}/>}</View>}
        {step===4&&selectedSlots.map(([kind,label])=><View key={kind} style={s.slot}><FileText color="#9A8263"/><View style={{flex:1}}><Text style={s.heading}>{label}</Text><Text style={s.muted}>{docs.filter(d=>d.kind===kind).length||'No'} file(s)</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Upload ${label}`} disabled={m.busy} onPress={()=>upload(kind,label)}><CloudUpload color="#9A8263"/></Pressable></View>)}
        {docs.map(doc=><View key={doc.id} style={s.card}><Text style={s.heading}>{doc.slot_label??(doc.kind==='id_proof'?'Identity proof (Aadhaar / PAN)':selectedSlots.find(([key])=>key===doc.kind)?.[1]??'Uploaded document')}</Text>{step==='review'&&doc.mime_type==='application/pdf'&&doc.kind!=='id_proof'&&<DocumentThumbnail documentId={doc.id}/>}<Text style={s.muted}>{doc.page_count===null?'Page count pending':`${doc.page_count} page(s)`} · {(Number(doc.size_bytes)/1024).toFixed(0)} KB</Text><View style={s.row}><Link label="View" onPress={()=>void openDocument(doc.id)}/><Link label="Replace" onPress={()=>upload(doc.kind,doc.slot_label??undefined,doc.id)}/><Link label="Delete" onPress={()=>remove(doc.id)}/></View></View>)}
        {step===4&&<View style={s.card}><TextInput accessibilityLabel="Custom document category" value={custom} maxLength={60} onChangeText={setCustom} placeholder="Name another document category" style={s.input}/><Link label="+ Add More Documents (Optional)" onPress={()=>{if(!custom.trim()){m.setError('Name the new document category first.');return;}m.update({...v,custom_slots:[...(v.custom_slots??[]),custom.trim()]});setCustom('');}}/></View>}
        <Text style={s.body}>{pageCount} pages counted{unresolved?' · Some PDF page counts are still being checked.':''}</Text><Text style={s.muted}>Pages above 25 are charged ₹25 each. You’ll see the case’s combined count and charge at payment.</Text>
      </>}
      {step===5&&<><ChatBubble title="Preview your case summary"/><View style={s.summary}>
        <Summary label="Client Name" value={v.client.fullName} edit={()=>edit(1)}/><Summary label="Notice Type" value={issueLabel(v.issueType)} edit={()=>edit(3)}/><Summary label="Noticee" value={[v.noticee.fullName,v.noticee.type==='company'?v.noticee.throughDesignation:undefined,...v.noticee.methods.map(method=>`${method==='courier'?'Courier':method==='email'?'Email':'WhatsApp'}: ${method==='courier'?[v.noticee.address,v.noticee.pin].filter(Boolean).join(', '):method==='email'?v.noticee.email:v.noticee.whatsapp}`)].filter(Boolean).join('\n')} edit={()=>edit(2)}/><Summary label="Issue Summary" value={v.narrative} edit={()=>edit(3)}/>{v.amount_paise&&<Summary label="Amount involved" value={`₹${rupees(v.amount_paise)}`} edit={()=>edit(3)}/>}<Summary label="Uploaded Documents" value={`${docs.length} documents`} edit={()=>edit(4)}/><Summary label="Tier" value={m.record.tier==='ordinary'?'Ordinary · 10 days':'Urgent · 5 days'} edit={()=>m.go('/legal-notice')}/>
      </View></>}
      <Text accessibilityLiveRegion="polite" style={s.muted}>{m.saving?'Saving…':m.saved?'Saved to your case':'Changes not saved yet'}</Text>
      {!!m.error&&<View style={s.info}><Text accessibilityRole="alert" style={s.error}>{m.error}</Text><Link label="Retry save" onPress={()=>void m.run(m.save)}/></View>}
      <ConfirmModal visible={!!removeId} icon={FileText} tone="neutral" title="Remove this document?" body="You can upload a replacement before submitting your filing." confirmLabel="Remove document" onCancel={()=>setRemoveId(null)} onConfirm={()=>{const id=removeId;setRemoveId(null);if(id)void m.run(async()=>{await backend.deleteDocument(id);await m.reload();});}}/>
      {leave&&<View style={s.card}><Text style={s.heading}>Save as draft and leave?</Text><Text style={s.body}>You can resume this request from My Requests.</Text><Link label="Save and leave" onPress={()=>void m.run(async()=>{await m.save();router.replace('/legal-notice');})}/><Link label="Leave with last saved version" onPress={()=>void m.run(async()=>{await m.discard();router.replace('/legal-notice');})}/><Link label="Stay" onPress={()=>setLeave(false)}/></View>}
    </>}
  </WizardShell>;
}
export function Link({label,onPress}:{label:string;onPress():void}){return <Pressable accessibilityRole="button" onPress={onPress} style={{paddingVertical:9}}><Text style={s.link}>{label}</Text></Pressable>;}
export function Choice({label,selected,onPress,disabled=false}:{label:string;selected:boolean;disabled?:boolean;onPress():void}){return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{checked:selected,disabled}} disabled={disabled} onPress={onPress} style={[s.choice,selected&&s.selected]}><Text style={s.body}>{selected?'● ':'○ '}{label}</Text></Pressable>;}
function Summary({label,value,edit}:{label:string;value?:string;edit():void}){return value?<View style={s.summaryRow}><View style={{flex:1,gap:6}}><Text style={s.muted}>{label}</Text><Text style={s.body}>{value}</Text></View><Link label="Edit" onPress={edit}/></View>:<Link label={`Add ${label}`} onPress={edit}/>;}
const s=StyleSheet.create({fields:{gap:14,marginTop:20},card:{backgroundColor:'#fff',borderRadius:17,padding:18,gap:13,marginVertical:10},info:{backgroundColor:'#F2EDE6',borderRadius:14,padding:16,marginVertical:16,gap:8},body:{fontFamily:font.appBody,fontSize:14,lineHeight:22,color:colors.textPrimary},muted:{fontFamily:font.appBody,fontSize:12,lineHeight:19,color:colors.textBody},heading:{fontFamily:font.appHeading,fontSize:16,color:colors.textPrimary},large:{fontFamily:font.appHeading,fontSize:23,color:colors.textPrimary},row:{flexDirection:'row',flexWrap:'wrap',gap:18},chips:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:20},choice:{borderWidth:1,borderColor:'#E3DDD3',borderRadius:22,paddingVertical:11,paddingHorizontal:15,backgroundColor:'#fff'},selected:{borderColor:'#9A8263',backgroundColor:'#F4EEE6'},link:{fontFamily:font.appSemi,color:'#806646',fontSize:14},slot:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'#fff',borderRadius:14,padding:18,marginVertical:8},input:{padding:12,borderWidth:1,borderColor:'#DDD5CB',borderRadius:10,fontFamily:font.appBody},summary:{backgroundColor:'#F4F1EB',borderRadius:15,padding:18,marginTop:20},summaryRow:{flexDirection:'row',gap:12,paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#E2D9CC'},error:{color:'#A12E2E',fontFamily:font.appBody,lineHeight:21}});
