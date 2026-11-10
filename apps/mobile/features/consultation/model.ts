import {useEffect,useRef,useState} from 'react';
import {AppState,Linking,Platform} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {router,type Href} from 'expo-router';
import {ConsultationIntakeSchema,type ApiCase,type ConsultationIntake,type ConsultationView,type ConsultationServiceCode} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
export const rootPath=(service:ConsultationServiceCode)=>service==='legal_advice'?'/legal-advice':`/services/${service.replaceAll('_','-')}`;
export const clientPath=(service:ConsultationServiceCode,step:string,id?:string)=>{
 const route=service==='legal_advice'?({documents:'details','quote-payment':'payment',chat:'session/chat'} as Record<string,string>)[step]??step:({details:'case-details',datetime:'case-details',track:service==='district_court'?'case-overview':'case-details',review:service==='district_court'?'review':'case-details','quote-payment':'payment'} as Record<string,string>)[step]??step;
 return `${rootPath(service)}/${route}?step=${step}${id?'&caseId='+id:''}` as Href;
};
export const when=(v:string)=>new Date(v).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})+' IST';
export const message=(e:unknown)=>e instanceof Error?e.message:'The request failed. Retry when your connection is available.';
export function useConsultation(id:string|undefined,service?:ConsultationServiceCode){
 const {user}=useSession(),[view,setView]=useState<ConsultationView>(),[record,setRecord]=useState<ApiCase>(),[loading,setLoading]=useState(!!id),[error,setError]=useState(''),[busy,setBusy]=useState(false),[form,setForm]=useState<ConsultationIntake>(()=>ConsultationIntakeSchema.parse({})),[saveState,setSaveState]=useState('');
 const active=useRef(0),saved=useRef<{id:string;stamp:string;form:ConsultationIntake;generation:number;done:number;promise:Promise<boolean>|null;conflict:boolean}|null>(null),[tick,setTick]=useState(0);
 const load=async()=>{if(!id)return;const seq=++active.current;setLoading(true);setError('');try{
  const [v,r]=await Promise.all([backend.request<ConsultationView>(`/consultations/${id}`),backend.case(id)]);
  if(seq!==active.current)return;if(service&&v.case.service_code!==service)throw new Error('This case belongs to another service. Open it from My Cases.');
  setView(v);setRecord(r);const intake=ConsultationIntakeSchema.parse(v.case.details);setForm(intake);saved.current={id,stamp:v.case.updated_at,form:intake,generation:0,done:0,promise:null,conflict:false};setSaveState('Saved');
 }catch(e){if(seq===active.current){setError(message(e));setView(undefined);setRecord(undefined);}}finally{if(seq===active.current)setLoading(false);}};
 useEffect(()=>{saved.current=null;setView(undefined);setRecord(undefined);void load();return()=>{active.current++;};},[id,user?.id]);
 const flush=():Promise<boolean>=>{const entry=saved.current;if(!entry||view?.case.status!=='draft')return Promise.resolve(true);if(entry.promise)return entry.promise;if(entry.conflict)return Promise.resolve(false);if(entry.generation<=entry.done)return Promise.resolve(true);
  entry.promise=(async()=>{try{setError('');while(saved.current===entry&&entry.generation>entry.done){setSaveState('Saving…');const generation=entry.generation;
    const r=await backend.request<ApiCase>(`/consultations/${entry.id}/intake`,{expected_updated_at:entry.stamp,intake:entry.form},'PATCH');entry.stamp=r.updated_at;entry.done=generation;
    if(saved.current===entry){setRecord(old=>old?{...old,...r}:r);setView(old=>old?{...old,case:{...old.case,...r}}:old);}}
    if(saved.current===entry)setSaveState('Saved');return true;
  }catch(e){if(saved.current===entry){setError(message(e));setSaveState('Not saved');}entry.conflict=typeof e==='object'&&e!==null&&'status'in e&&e.status===409;return false;}finally{entry.promise=null;}})();return entry.promise;
 };
 const update=(patch:Partial<ConsultationIntake>)=>{const entry=saved.current;if(!entry||view?.case.status!=='draft')return;entry.form={...entry.form,...patch};entry.generation++;setForm(entry.form);setSaveState('Not saved');setError('');setTick(v=>v+1);};
 useEffect(()=>{if(!saved.current||saved.current.generation<=saved.current.done||error)return;const timer=setTimeout(()=>void flush(),450);return()=>clearTimeout(timer);},[tick]);
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state!=='active')void flush();});const leave=(event:BeforeUnloadEvent)=>{const entry=saved.current;if(entry&&entry.generation>entry.done){event.preventDefault();event.returnValue='';void flush();}};if(Platform.OS==='web')globalThis.addEventListener?.('beforeunload',leave);return()=>{sub.remove();if(Platform.OS==='web')globalThis.removeEventListener?.('beforeunload',leave);};},[id,view?.case.status]);
 const run=async(fn:()=>Promise<unknown>,refresh=true)=>{if(busy)return false;setBusy(true);setError('');try{if(!await flush())return false;await fn();if(refresh)await load();return true;}catch(e){setError(message(e));return false;}finally{setBusy(false);}};
 const request=<T,>(path:string,body?:unknown,method?:string)=>backend.request<T>(`/consultations/${id}${path}`,body,method);
 const go=async(step:string)=>{if(service&&await flush())router.push(clientPath(service,step,id));};
 return {id,userId:user?.id,view,record,form,update,flush,loading,error,setError,busy,saveState,load,run,request,go,token:{expected_revision:view?.revision??0},
   upload:async(kind='supporting_document')=>{if(!id)return;const pick=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],multiple:false,copyToCacheDirectory:true});if(pick.canceled)return;const file=pick.assets[0];
    const mime=file.mimeType as 'application/pdf'|'image/jpeg'|'image/png';if(!['application/pdf','image/jpeg','image/png'].includes(mime))throw new Error('Choose a PDF, JPEG or PNG.');
    const ticket=await backend.presign({case_id:id,kind,filename:file.name,mime});return backend.upload(ticket,file.file??{uri:file.uri,name:file.name,type:mime});},
   open:async(docId:string)=>Linking.openURL((await backend.documentUrl(docId)).url),
 };
}
export type ConsultationModel=ReturnType<typeof useConsultation>;
