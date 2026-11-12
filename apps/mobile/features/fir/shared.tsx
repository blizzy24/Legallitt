import {useEffect,useState,type ReactNode} from 'react';
import {Linking,Platform,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import type {ApiCase,ApiDraft,FirApproval,FirDraftContent,FirIntake} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {colors,font} from '../../constants/theme';
export type FirCase = Omit<ApiCase,'drafts'> & {drafts?: (Omit<ApiDraft,'content'> & {content:FirDraftContent})[];approval?:FirApproval|null};
export const emptyIntake: FirIntake = {contact:{fullName:'',mobile:'',email:''},jurisdiction:{state:'',district:'',policeStation:''},incident:{type:'',date:'',time:'',location:'',description:'',additional:''},people:[]};
export function useFirCase(id?:string) {
  const [record,setRecord]=useState<FirCase|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(!!id),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
  const reload=()=>setRevision(n=>n+1);
  useEffect(()=>{let alive=true;if(!id){setLoading(false);return;}setLoading(true);setError('');
    backend.request<FirCase>(`/cases/${id}`).then(r=>{if(r.service_code!=='fir_draft')throw new Error('This is not a FIR case');if(alive)setRecord(r);}).catch(e=>{if(alive){setRecord(null);setError(e.message);}}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};
  },[id,revision]);
  useEffect(()=>{if(!id||!record||['draft','advocate_accepted','completed'].includes(record.status)||record.status==='in_progress'&&!record.sub_status)return;
    const timer=setInterval(()=>{if(!busy)reload();},15000);return()=>clearInterval(timer);
  },[id,record?.status,record?.sub_status,busy]);
  const run=async(action:()=>Promise<unknown>)=>{if(busy)return;setBusy(true);setError('');try{await action();reload();}catch(e){setError(e instanceof Error?e.message:'Action failed. Retry.');}finally{setBusy(false);}};
  return {record,error,loading,busy,reload,run};
}
export function Card({title,children}:{title?:string;children:ReactNode}) {return <View style={s.card}>{title&&<Text style={s.heading}>{title}</Text>}{children}</View>;}
export function Button({title,onPress,disabled=false}:{title:string;onPress():void;disabled?:boolean}) {return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.button,disabled&&{opacity:0.5}]}><Text style={s.buttonText}>{title}</Text></Pressable>;}
export function Field({label,value,onChange,multiline=false}:{label:string;value:string;onChange(v:string):void;multiline?:boolean}) {return <View style={{gap:7,marginVertical:8}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChange} multiline={multiline} style={[s.input,multiline&&{minHeight:100,textAlignVertical:'top'}]}/></View>;}
export function ErrorBox({error,retry}:{error:string;retry():void}) {return error?<Card><Text accessibilityRole="alert" style={s.error}>{error}</Text><Button title="Retry" onPress={retry}/></Card>:null;}
export async function openDocument(id:string) {const r=await backend.documentUrl(id);await Linking.openURL(r.url);}
export async function uploadEvidence(id:string,kind='supporting_document') {
  const picked=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/png','image/jpeg'],copyToCacheDirectory:true});
  if(picked.canceled)return;const file=picked.assets[0];
  const mime=file.mimeType??'application/pdf';
  const ticket=await backend.presign({case_id:id,kind,filename:file.name,mime:mime as 'application/pdf'});
  await backend.upload(ticket,Platform.OS==='web'?await(await fetch(file.uri)).blob():{uri:file.uri,name:ticket.document.filename,type:mime});
}
export const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.appBg},content:{padding:20,paddingBottom:40,gap:12},card:{backgroundColor:colors.card,borderRadius:16,padding:18,marginBottom:16,gap:9},heading:{fontFamily:font.appHeading,fontSize:19,color:colors.textPrimary},body:{fontFamily:font.appBody,fontSize:14,lineHeight:22,color:colors.textBody},label:{fontFamily:font.appSemi,fontSize:13,color:colors.textPrimary},input:{backgroundColor:'#F4F2EF',borderRadius:9,padding:12,fontFamily:font.appBody,fontSize:14,color:colors.textPrimary},button:{backgroundColor:colors.brand,padding:15,borderRadius:12,alignItems:'center',marginVertical:7},buttonText:{fontFamily:font.appSemi,fontSize:15,color:'#fff'},error:{color:'#9C2929',lineHeight:22},row:{flexDirection:'row',justifyContent:'space-between',gap:12},muted:{fontFamily:font.appBody,color:colors.textBody,fontSize:12,lineHeight:19}});
