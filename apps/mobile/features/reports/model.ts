import {useEffect,useRef,useState} from 'react';
import {AppState,Linking,Platform} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {router,type Href} from 'expo-router';
import {REPORT_INTAKE_SCHEMAS,REPORT_SERVICE_CONFIG,isReportService,type ApiCase,type ReportServiceCode,type ReportState} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
export {message,when} from '../consultation/model';
import {message} from '../consultation/model';
export type ReportCase=ApiCase&{report:ReportState;client_name:string|null};
export const reportPath=(service:ReportServiceCode,step:string,id?:string)=>({pathname:`${REPORT_SERVICE_CONFIG[service].clientPath}/${step}`,params:id?{caseId:id}:{}} as Href);
export const advocateReportPath=(id:string,step='request')=>({pathname:'/advocate/service-report',params:{caseId:id,step}} as Href);
export function useReport(id?:string,service?:ReportServiceCode){
 const {user,role}=useSession(),[record,setRecord]=useState<ReportCase>(),[form,setForm]=useState<Record<string,unknown>>({}),[tier,setTier]=useState<'ordinary'|'urgent'|null>(null),[loading,setLoading]=useState(!!id),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saveState,setSaveState]=useState(''),[tick,setTick]=useState(0);
 const sequence=useRef(0),saved=useRef<{id:string;stamp:string;form:Record<string,unknown>;tier:'ordinary'|'urgent'|null;generation:number;done:number;promise:Promise<boolean>|null;conflict:boolean}|null>(null);
 const load=async()=>{if(!id)return;const seq=++sequence.current;setLoading(true);setError('');try{const r=await backend.case(id) as ReportCase;if(!isReportService(r.service_code)||service&&r.service_code!==service)throw new Error('Open this case from My Cases to use the correct service.');if(seq!==sequence.current)return;const f=REPORT_INTAKE_SCHEMAS[r.service_code].parse(r.details) as Record<string,unknown>;const t=r.tier==='urgent'?'urgent':r.tier==='ordinary'?'ordinary':null;setRecord(r);setForm(f);setTier(t);saved.current={id,stamp:r.updated_at,form:f,tier:t,generation:0,done:0,promise:null,conflict:false};setSaveState('Saved');}catch(e){if(seq===sequence.current){setError(message(e));setRecord(undefined);}}finally{if(seq===sequence.current)setLoading(false);}};
 useEffect(()=>{saved.current=null;setRecord(undefined);void load();return()=>{sequence.current++;};},[id,user?.id]);
 const flush=():Promise<boolean>=>{const entry=saved.current;if(!entry||record?.status!=='draft'||user?.role!=='client')return Promise.resolve(true);if(entry.promise)return entry.promise;if(entry.conflict)return Promise.resolve(false);if(entry.generation<=entry.done)return Promise.resolve(true);
  entry.promise=(async()=>{try{while(saved.current===entry&&entry.generation>entry.done){setSaveState('Saving…');const generation=entry.generation;const next=await backend.saveReportIntake(entry.id,{details:entry.form,tier:entry.tier,expected_updated_at:entry.stamp});entry.stamp=next.updated_at;entry.done=generation;if(saved.current===entry)setRecord(old=>old?{...old,...next}:old);}if(saved.current===entry){setSaveState('Saved');setError('');}return true;}catch(e){if(saved.current===entry){setError(message(e));setSaveState('Not saved');}entry.conflict=typeof e==='object'&&e!==null&&'status'in e&&e.status===409;return false;}finally{entry.promise=null;}})();return entry.promise;
 };
 const update=(patch:Record<string,unknown>,newTier?:'ordinary'|'urgent'|null)=>{const entry=saved.current;if(!entry||record?.status!=='draft')return;entry.form={...entry.form,...patch};if(newTier!==undefined)entry.tier=newTier;entry.generation++;setForm(entry.form);setTier(entry.tier);setSaveState('Not saved');setError('');setTick(v=>v+1);};
 useEffect(()=>{const e=saved.current;if(!e||e.generation<=e.done)return;const timer=setTimeout(()=>void flush(),450);return()=>clearTimeout(timer);},[tick]);
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state!=='active')void flush();});const leave=(event:BeforeUnloadEvent)=>{const e=saved.current;if(e&&e.generation>e.done){event.preventDefault();event.returnValue='';void flush();}};if(Platform.OS==='web')globalThis.addEventListener?.('beforeunload',leave);return()=>{sub.remove();if(Platform.OS==='web')globalThis.removeEventListener?.('beforeunload',leave);};},[id,record?.status]);
 const run=async(fn:()=>Promise<unknown>,refresh=true)=>{if(busy)return false;setBusy(true);setError('');try{if(!await flush())return false;await fn();if(refresh)await load();return true;}catch(e){setError(message(e));return false;}finally{setBusy(false);}};
 const go=async(step:string)=>{if(record&&isReportService(record.service_code)&&await flush())router.push(reportPath(record.service_code,step,id));};
 const upload=async(kind:string,pdfOnly=false)=>{if(!id)return;const pick=await DocumentPicker.getDocumentAsync({type:pdfOnly?'application/pdf':['application/pdf','image/jpeg','image/png'],multiple:false,copyToCacheDirectory:true});if(pick.canceled)return;const file=pick.assets[0],mime=file.mimeType as 'application/pdf'|'image/jpeg'|'image/png';if(!['application/pdf','image/jpeg','image/png'].includes(mime)||pdfOnly&&mime!=='application/pdf')throw new Error(pdfOnly?'Choose a PDF.':'Choose a PDF, JPEG or PNG.');const ticket=await backend.presign({case_id:id,kind,filename:file.name,mime});return backend.upload(ticket,file.file??{uri:file.uri,name:file.name,type:mime});};
 return {id,record,form,tier,update,flush,loading,error,setError,busy,saveState,load,run,go,upload,user,role,open:async(doc:string)=>Linking.openURL((await backend.documentUrl(doc)).url)};
}
export type ReportModel=ReturnType<typeof useReport>;
