import {useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Platform} from 'react-native';
import {router,useFocusEffect,type Href} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {AdviceIntakeSchema,type AdviceIntake,type AdviceView,noticeDate} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
export const advicePath=(step:string,id?:string,extra:Record<string,string>={})=>({pathname:step==='index'?'/legal-advice':'/legal-advice/'+({advocates:'experience',documents:'details','payment-success':'payment',scan:'payment',room:'session/video'}[step]??step),params:{step,...id?{caseId:id}:{},...extra}} as Href);
export const adviceWhen=(v?:string|null)=>v?noticeDate(v):'';
export const adviceDay=(v?:string|null)=>v?new Date(v).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short',year:'numeric'}):'';
export const advicePhone=(v:string)=>{const d=v.replace(/\D/g,'');const local=d.length===12&&d.startsWith('91')?d.slice(2):d;return local.length===10?`+91 ${local.slice(0,5)} ${local.slice(5)}`:v;};
export function useAdvice(id?:string){
 const {user,role}=useSession(),[view,setView]=useState<AdviceView>(),[form,setForm]=useState<AdviceIntake>(()=>AdviceIntakeSchema.parse({})),[loading,setLoading]=useState(!!id),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saveState,setSaveState]=useState('Saved'),[tick,setTick]=useState(0);
 const current=useRef<AdviceView|undefined>(undefined),draft=useRef({form,generation:0,saved:0}),saving=useRef<Promise<boolean>|null>(null),working=useRef(false);
 const apply=(v:AdviceView)=>{current.current=v;setView(v);};
 const load=useCallback(async()=>{if(!id)return;try{const v=await backend.request<AdviceView>(`/legal-advice/${id}`);apply(v);if(draft.current.generation===draft.current.saved){const f=AdviceIntakeSchema.parse(v.data.intake);draft.current={form:f,generation:0,saved:0};setForm(f);}setError('');}catch(e){setError(e instanceof Error?e.message:'Your consultation could not load. Retry.');}finally{setLoading(false);}},[id]);
 useFocusEffect(useCallback(()=>{setLoading(!!id);void load();},[load]));
 const action=async(name:string,body:Record<string,unknown>={})=>{await backend.request(`/legal-advice/${id}/actions/${name}`,{...body,expected_revision:current.current?.booking.revision});const v=await backend.request<AdviceView>(`/legal-advice/${id}`);apply(v);return v;};
 const flush=():Promise<boolean>=>{if(saving.current)return saving.current;if(!id||!['draft','payment_pending'].includes(current.current?.booking.phase??'')||draft.current.generation===draft.current.saved)return Promise.resolve(true);
  saving.current=(async()=>{try{while(draft.current.generation!==draft.current.saved){const {form,generation}=draft.current;setSaveState('Saving…');await action('intake',{intake:form});draft.current.saved=generation;}setSaveState('Saved');return true;}catch(e){setSaveState('Not saved');setError(e instanceof Error?e.message:'Could not save this filing. Retry before leaving.');return false;}finally{saving.current=null;}})();return saving.current;};
 const update=(patch:Partial<AdviceIntake>)=>{if(!['draft','payment_pending'].includes(current.current?.booking.phase??''))return;draft.current={...draft.current,form:{...draft.current.form,...patch},generation:draft.current.generation+1};setForm(draft.current.form);setSaveState('Not saved');setTick(n=>n+1);};
 useEffect(()=>{if(!tick)return;const timer=setTimeout(()=>void flush(),450);return()=>clearTimeout(timer);},[tick]);
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state!=='active')void flush();});const leave=(e:BeforeUnloadEvent)=>{if(draft.current.generation!==draft.current.saved){e.preventDefault();e.returnValue='';void flush();}};if(Platform.OS==='web')globalThis.addEventListener?.('beforeunload',leave);return()=>{sub.remove();if(Platform.OS==='web')globalThis.removeEventListener?.('beforeunload',leave);};},[id]);
 const run=async(fn:()=>Promise<unknown>,reload=true)=>{if(working.current)return false;working.current=true;setBusy(true);setError('');try{if(!await flush())return false;await fn();if(reload)await load();return true;}catch(e){setError(e instanceof Error?e.message:'This action failed. Please retry.');return false;}finally{working.current=false;setBusy(false);}};
 const go=async(step:string,extra:Record<string,string>={})=>{if(await flush())router.push(advicePath(step,id,extra));};
 const upload=async(kind='supporting_document')=>{if(!id)return;const picked=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],copyToCacheDirectory:true});if(picked.canceled)return;const file=picked.assets[0],mime=file.mimeType as 'application/pdf'|'image/jpeg'|'image/png';const ticket=await backend.presign({case_id:id,kind,filename:file.name,mime});return backend.upload(ticket,file.file??{uri:file.uri,name:file.name,type:mime});};
 return {id,user,role,view,current,form,loading,error,setError,busy,saveState,load,update,flush,action,run,go,upload,open:(documentId:string)=>router.push({pathname:'/document-viewer',params:{documentId}})};
}
export type AdviceModel=ReturnType<typeof useAdvice>;
