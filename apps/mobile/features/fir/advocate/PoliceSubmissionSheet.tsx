import {useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {CalendarDays,Eye,FileText} from 'lucide-react-native';
import {FIR_POLICE_RECEIPT_KIND,type FirFlowView} from '@legalitt/shared';
import DatePickerSheet,{formatDdMmYyyy} from '../../../components/DatePickerSheet';
import {colors,font} from '../../../constants/theme';
import {backend} from '../../../lib/auth';
import {viewDocument} from '../flow';
import {formatSize,InlineError,pickAndUpload,Sheet,SheetButton,s,useAction,type FirDoc} from './common';

// A6 "Mark as submitted to police" (flow C14, advocate-submits version).
// NO DESIGN EXISTS for this step: built from the app's sheet, field and button
// components and recorded for §9.2. The receipt is required; the date can't be in
// the future or before the client approved (the API checks both too).
const ymd=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayIst=()=>new Date(Date.now()+330*60000).toISOString().slice(0,10);

export function PoliceSubmissionSheet({visible,caseId,station,approvedAt,onClose,onDone}:{visible:boolean;caseId:string;station:string|null;approvedAt:string|null;onClose():void;onDone(flow:FirFlowView):void}){
  const [receipt,setReceipt]=useState<FirDoc|null>(null),[date,setDate]=useState(()=>new Date()),[picking,setPicking]=useState(false),[dateError,setDateError]=useState('');
  const upload=useAction(),submit=useAction();
  useEffect(()=>{if(visible){setDate(new Date());setDateError('');submit.setError('');upload.setError('');}},[visible]);// eslint-disable-line react-hooks/exhaustive-deps
  const pick=()=>void upload.run(async()=>{const doc=await pickAndUpload(caseId,FIR_POLICE_RECEIPT_KIND);if(doc)setReceipt(doc);});
  const confirm=()=>{
    const day=ymd(date),min=approvedAt?new Date(Date.parse(approvedAt)+330*60000).toISOString().slice(0,10):null;
    if(day>todayIst()){setDateError('The submission date can’t be in the future.');return;}
    if(min&&day<min){setDateError('The submission date can’t be before the client approved the draft.');return;}
    if(!receipt)return;
    void submit.run(async()=>{const flow=await backend.firPoliceSubmission(caseId,{submitted_on:day,receipt_document_id:receipt.id});onDone(flow);});
  };
  return <Sheet visible={visible} title="Mark as submitted to police" onClose={()=>!submit.busy&&!upload.busy&&onClose()}
    body={`Upload the police receipt or acknowledgement${station?` from ${station}`:''} and the date you submitted the FIR. The client is notified and the request is completed.`}>
    <Text style={s.label}>Police receipt or acknowledgement</Text>
    {receipt?<View style={st.file}>
      <FileText size={20} color={colors.textPrimary}/>
      <View style={st.fileText}><Text style={st.fileName}>{receipt.filename}</Text>{!!formatSize(receipt.size_bytes)&&<Text style={st.fileMeta}>{formatSize(receipt.size_bytes)}</Text>}</View>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${receipt.filename}`} hitSlop={8} onPress={()=>void upload.run(()=>viewDocument(receipt.id))}><Eye size={20} color={colors.textPrimary}/></Pressable>
    </View>:<Text style={s.hint}>Required. PDF, JPEG or PNG, up to 25 MB.</Text>}
    <SheetButton label={upload.busy?'Uploading…':receipt?'Replace receipt':'Upload receipt'} tone="neutral" disabled={upload.busy||submit.busy} onPress={pick}/>
    <InlineError error={upload.error}/>
    <Text style={s.label}>Submitted on</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Submitted on ${formatDdMmYyyy(date)}. Change date`} onPress={()=>setPicking(true)} style={[s.input,st.date]}>
      <Text style={st.dateText}>{formatDdMmYyyy(date)}</Text><CalendarDays size={18} color={colors.textBody}/>
    </Pressable>
    {!!dateError&&<Text style={[s.error,{marginTop:8}]} accessibilityRole="alert">{dateError}</Text>}
    <InlineError error={submit.error}/>
    <SheetButton label={submit.busy?'Saving…':'Confirm submission'} disabled={!receipt||submit.busy||upload.busy} onPress={confirm}/>
    <SheetButton label="Cancel" tone="neutral" disabled={submit.busy} onPress={onClose}/>
    <DatePickerSheet visible={picking} value={date} onPick={d=>{setDate(d);setDateError('');setPicking(false);}} onClose={()=>setPicking(false)}/>
  </Sheet>;
}
const st=StyleSheet.create({
  file:{marginTop:8,borderRadius:12,backgroundColor:'#F7F4F1',padding:12,flexDirection:'row',alignItems:'center',gap:10},
  fileText:{flex:1,minWidth:0},
  fileName:{fontFamily:font.appHeading,fontSize:14,color:colors.textPrimary},
  fileMeta:{marginTop:2,fontFamily:font.appBody,fontSize:12.5,color:colors.textBody},
  date:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  dateText:{fontFamily:font.appBody,fontSize:14.5,color:colors.textPrimary},
});
