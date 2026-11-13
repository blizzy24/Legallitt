import {useCallback,useEffect,useRef,useState} from 'react';
import {router,useFocusEffect,type Href} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {AppState,Platform} from 'react-native';
import {CourtIntakeSchema,type CourtIntake,type CourtView,type CourtService,type CourtPolicy,type QuoteBreakdown,type ApiDocument} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
export type CourtSettings={version:number;config:CourtPolicy;prices:{id:string;tier:string;base_amount_paise:string;gst_bps:number;breakdown:QuoteBreakdown}[];rates:{kind:string;amount_paise:string|null}[]};
export const root=(service:CourtService)=>'/services/'+(service==='district_court'?'district-court':'high-court');
export function useCourt(id?:string){
 const {user,role}=useSession(),[view,setView]=useState<CourtView>(),[form,setForm]=useState<CourtIntake>(()=>CourtIntakeSchema.parse({})),[tier,setTier]=useState<'ordinary'|'urgent'>('ordinary'),[loading,setLoading]=useState(!!id),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saveState,setSaveState]=useState('Saved'),[tick,setTick]=useState(0);
 const current=useRef<CourtView|undefined>(undefined),draft=useRef({form,tier,generation:0,saved:0}),saving=useRef<Promise<boolean>|null>(null),working=useRef(false);
 const apply=(v:CourtView)=>{current.current=v;setView(v);};
 const load=useCallback(async()=>{if(!id)return;setLoading(true);try{const v=await backend.request<CourtView>(`/courts/${id}`);apply(v);if(!draft.current.generation||draft.current.saved===draft.current.generation){const f=CourtIntakeSchema.parse(role==='lawyer'?{...v.case.details,phone:''}:v.case.details),t=v.case.tier==='urgent'?'urgent':'ordinary';draft.current={form:f,tier:t,generation:0,saved:0};setForm(f);setTier(t);}setError('');}catch(e){setError(e instanceof Error?e.message:'Could not load this court request. Retry.');}finally{setLoading(false);}},[id]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 const flush=():Promise<boolean>=>{if(saving.current)return saving.current;if(!id||current.current?.data.phase!=='draft'||draft.current.generation===draft.current.saved)return Promise.resolve(true);
  saving.current=(async()=>{try{while(draft.current.generation!==draft.current.saved){const {form,tier,generation}=draft.current;setSaveState('Saving…');const v=await backend.request<CourtView>(`/courts/${id}/actions/intake`,{revision:current.current!.revision,intake:form,tier});apply(v);draft.current.saved=generation;}setSaveState('Saved');return true;}catch(e){setSaveState('Not saved');setError(e instanceof Error?e.message:'Could not save. Retry before leaving.');return false;}finally{saving.current=null;}})();return saving.current;
 };
 useEffect(()=>{const listener=AppState.addEventListener('change',state=>{if(state!=='active')void flush();});const leave=(event:BeforeUnloadEvent)=>{if(draft.current.generation!==draft.current.saved){event.preventDefault();event.returnValue='';void flush();}};if(Platform.OS==='web')globalThis.addEventListener?.('beforeunload',leave);return()=>{listener.remove();if(Platform.OS==='web')globalThis.removeEventListener?.('beforeunload',leave);};},[id]);
 const update=(patch:Partial<CourtIntake>,newTier?:'ordinary'|'urgent')=>{if(current.current?.data.phase!=='draft')return;draft.current={...draft.current,form:{...draft.current.form,...patch},tier:newTier??draft.current.tier,generation:draft.current.generation+1};setForm(draft.current.form);setTier(draft.current.tier);setSaveState('Not saved');setTick(n=>n+1);};
 useEffect(()=>{const timer=setTimeout(()=>void flush(),450);return()=>clearTimeout(timer);},[tick]);
 const run=async(fn:()=>Promise<unknown>,reload=true)=>{if(working.current)return false;working.current=true;setBusy(true);setError('');try{if(!await flush())return false;await fn();if(reload)await load();return true;}catch(e){setError(e instanceof Error?e.message:'The action failed. Retry.');return false;}finally{working.current=false;setBusy(false);}};
 const action=async(name:string,body:Record<string,unknown>={})=>{const v=await backend.request<CourtView>(`/courts/${id}/actions/${name}`,{...body,revision:current.current?.revision});apply(v);return v;};
 const go=async(step:string)=>{if(!await flush())return;const service=current.current?.case.service_code as CourtService;router.push({pathname:role==='lawyer'?'/advocate/court/request':root(service)+'/case-details',params:{caseId:id,step}} as Href);};
 const upload=async(kind:string):Promise<ApiDocument|undefined>=>{if(!id)return;const picked=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],copyToCacheDirectory:true});if(picked.canceled)return;const file=picked.assets[0];if((file.size??0)>25000000)throw Error('Choose a file no larger than 25 MB.');const mime=file.mimeType as 'application/pdf'|'image/jpeg'|'image/png';const ticket=await backend.presign({case_id:id,kind,filename:kind==='id_proof'?'Identity-proof.pdf':file.name,mime});return backend.upload(ticket,file.file??{uri:file.uri,name:file.name,type:mime});};
 return {id,user,role,view,form,tier,loading,error,busy,saveState,load,update,flush,run,action,go,upload,setError,open:(documentId:string)=>router.push({pathname:'/document-viewer',params:{documentId}}),current};
}
export type CourtModel=ReturnType<typeof useCourt>;
