import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {AppState,Platform} from 'react-native';
import {router,useGlobalSearchParams,usePathname,type Href} from 'expo-router';
import {ApiError,FirIntakeSchema,firIntakeErrors,INDIA_JURISDICTIONS,JURISDICTION_RETRIEVED_AT,type ApiCase,type FirIntake,type FirPerson} from '@legalitt/shared';
import {backend} from '../lib/auth';
import {DATA_SOURCE} from '../lib/data-source';
import {useSession} from './session';

export type FirForm=FirIntake;
export const newFirPersonId=()=>globalThis.crypto?.randomUUID?.()??'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.floor(Math.random()*16);return(c==='x'?r:(r&3)|8).toString(16);});
export const EMPTY_FIR_FORM:FirForm={intake_version:2,intake_step:1,contact:{fullName:'',mobile:'',email:'',country_code:'IN',dial_code:'+91'},jurisdiction:{state:'',district:'',policeStation:'',state_code:'',district_code:'',source_retrieved_at:JURISDICTION_RETRIEVED_AT},incident:{type:'',date:'',time:'',location:'',description:'',additional:''},people:[]};
const emptyForm=():FirForm=>({...JSON.parse(JSON.stringify(EMPTY_FIR_FORM)),people:[{id:newFirPersonId(),kind:'complainant',name:'',phone:'',residence:'',details:''}]});
function hydrate(record:ApiCase):FirForm {
 const parsed=FirIntakeSchema.safeParse(record.details);
 if(!parsed.success&&Object.keys(record.details??{}).length)throw new Error('The saved intake could not be read. Retry loading; if it still fails, contact support with the case reference. Your saved case has not been changed.');
 const form=parsed.success?parsed.data:emptyForm();
 const people=form.people.map(p=>({...p,id:p.id??newFirPersonId()}));
 if(!people.some(p=>p.kind==='complainant'))people.unshift({id:newFirPersonId(),kind:'complainant',name:form.contact.fullName,phone:form.contact.mobile?form.contact.mobile.startsWith('+')?form.contact.mobile:[form.contact.dial_code??'+91',form.contact.mobile].join(' '):'',residence:'',details:''});
 // Legacy free-text jurisdictions are matched only by exact names; never guessed.
 const state=INDIA_JURISDICTIONS.find(s=>s.name.toLowerCase()===form.jurisdiction.state.toLowerCase());
 const district=state?.districts.find(d=>d.name.toLowerCase()===form.jurisdiction.district.toLowerCase());
 return {...form,intake_version:2,intake_step:form.intake_step??1,people,jurisdiction:{...form.jurisdiction,...(!form.jurisdiction.state_code&&state?{state:state.name,state_code:state.code}:{}),...(!form.jurisdiction.district_code&&district?{district:district.name,district_code:district.code,source_retrieved_at:JURISDICTION_RETRIEVED_AT}:{})}};
}
type Entry={id:string;owner:string;record:ApiCase;form:FirForm;revision:string;generation:number;saved:number;error:string;conflict:boolean;promise:Promise<boolean>|null};
type Ctx={form:FirForm;record:ApiCase|null;loading:boolean;error:string;saveState:string;busy:boolean;conflict:boolean;errors:Record<string,string>;
 update(patch:Partial<FirForm>):void;updateContact(patch:Partial<FirForm['contact']>):void;updateJurisdiction(patch:Partial<FirForm['jurisdiction']>):void;updateIncident(patch:Partial<FirForm['incident']>):void;
 updatePerson(id:string,patch:Partial<FirPerson>):void;addPerson(kind:'accused'|'witness'):string;removePerson(id:string):void;
 flush():Promise<boolean>;retry():void;reload():Promise<void>;start():Promise<void>;go(step:number):Promise<void>;next(step:number):Promise<void>;back():Promise<void>;submit():Promise<void>;action(fn:()=>Promise<unknown>):Promise<void>;reset():void};
const Context=createContext<Ctx|null>(null);
export function FirProvider({children}:{children:ReactNode}) {
 const {user}=useSession(),owner=user?.id??'',params=useGlobalSearchParams<{caseId?:string}>(),path=usePathname();
 const id=path.startsWith('/fir')&&typeof params.caseId==='string'?params.caseId:undefined;
 const entry=useRef<Entry|null>(null),ownerRef=useRef(owner),loadSequence=useRef(0),activeId=useRef<string|undefined>(undefined);ownerRef.current=owner;
 const [form,setForm]=useState<FirForm>(emptyForm),[record,setRecord]=useState<ApiCase|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[saveState,setSaveState]=useState(''),[busy,setBusy]=useState(false),[errors,setErrors]=useState<Record<string,string>>({}),[tick,setTick]=useState(0);
 const current=(e:Entry)=>entry.current===e&&ownerRef.current===e.owner;
 const persist=(e:Entry):Promise<boolean>=>{
  if(e.promise)return e.promise;
  if(!current(e)||e.record.status!=='draft'||e.conflict)return Promise.resolve(false);
  if(e.saved>=e.generation)return Promise.resolve(true);
  e.promise=(async()=>{
   try{e.error='';if(current(e)){setError('');setSaveState('Saving…');}
    while(current(e)&&e.saved<e.generation){
     const generation=e.generation,snapshot=e.form;
     const saved=await backend.saveFirIntake(e.id,snapshot,e.revision);
     e.revision=saved.updated_at;e.saved=generation;e.record={...e.record,...saved};
     if(current(e))setRecord(e.record);
    }
    if(current(e))setSaveState('Saved');return true;
   }catch(cause){e.error=cause instanceof Error?cause.message:'Could not save intake. Check your connection and retry.';e.conflict=cause instanceof ApiError&&cause.status===409;
    if(current(e)){setError(e.error);setSaveState('Not saved');}return false;
   }finally{e.promise=null;}
  })();return e.promise;
 };
 const flush=async()=>DATA_SOURCE!=='api'?true:entry.current?persist(entry.current):false;
 const load=async(target=id)=>{
  if(!target||DATA_SOURCE!=='api')return;
  const sequence=++loadSequence.current;
  setLoading(true);setError('');setErrors({});
  try{const r=await backend.case(target);if(r.service_code!=='fir_draft')throw new Error('This is not a FIR case. Open the correct case from My Cases.');
   if(ownerRef.current!==owner||sequence!==loadSequence.current)return;
   const f=hydrate(r);entry.current={id:target,owner,record:r,form:f,revision:r.updated_at,generation:0,saved:0,error:'',conflict:false,promise:null};setRecord(r);setForm(f);setSaveState('Saved');
  }catch(cause){if(sequence===loadSequence.current&&ownerRef.current===owner){entry.current=null;setRecord(null);setError(cause instanceof Error?cause.message:'Could not load intake. Retry.');}}
  finally{if(sequence===loadSequence.current)setLoading(false);}
 };
 useEffect(()=>{++loadSequence.current;entry.current=null;setRecord(null);setForm(emptyForm());setError('');setSaveState('');},[owner]);
 useEffect(()=>{
  const previous=activeId.current;activeId.current=id;
  if(!id||DATA_SOURCE!=='api'){++loadSequence.current;return;}
  const e=entry.current;
  if(e?.id===id&&e.owner===owner&&(previous===id||e.generation>e.saved||e.error))return;
  setRecord(null);void load(id);
 },[id,owner]);
 useEffect(()=>{const e=entry.current;if(!e||e.saved>=e.generation||e.error)return;const timer=setTimeout(()=>void persist(e),450);return()=>clearTimeout(timer);},[tick]);
 useEffect(()=>{
  const sub=AppState.addEventListener('change',state=>{if(state!=='active'&&entry.current)void persist(entry.current);});
  const leave=(event:BeforeUnloadEvent)=>{const e=entry.current;if(e&&e.generation>e.saved){event.preventDefault();event.returnValue='';void persist(e);}};
  if(Platform.OS==='web')globalThis.addEventListener?.('beforeunload',leave);
  return()=>{sub.remove();if(Platform.OS==='web')globalThis.removeEventListener?.('beforeunload',leave);};
 },[]);
 const update=(patch:Partial<FirForm>)=>{
  const e=entry.current;if(DATA_SOURCE==='api'&&(!e||e.record.status!=='draft'))return;
  const next={...(e?.form??form),...patch};if(e){e.form=next;e.generation++;}setForm(next);setSaveState('Not saved');setErrors({});setTick(n=>n+1);
 };
 const updateContact=(patch:Partial<FirForm['contact']>)=>{
  const old=entry.current?.form??form,contact={...old.contact,...patch};
  const oldPhone=old.contact.mobile?old.contact.mobile.startsWith('+')?old.contact.mobile:[old.contact.dial_code??'+91',old.contact.mobile].join(' '):'';
  const newPhone=contact.mobile?contact.mobile.startsWith('+')?contact.mobile:[contact.dial_code??'+91',contact.mobile].join(' '):'';
  const people=old.people.map(p=>p.kind==='complainant'?{...p,...(p.name===old.contact.fullName?{name:contact.fullName}:{}),...(p.phone===oldPhone?{phone:newPhone}:{})}:p);
  update({contact,people});
 };
 const go=async(step:number)=>{update({intake_step:step});if(await flush())router.push((`/fir/step${step}${entry.current?'?caseId='+entry.current.id:''}`) as Href);};
 const next=async(step:number)=>{const issues=firIntakeErrors(entry.current?.form??form,step);setErrors(issues);if(!Object.keys(issues).length)await go(step+1);else await flush();};
 const action=async(fn:()=>Promise<unknown>)=>{if(busy)return;setBusy(true);setError('');try{if(await flush()){await fn();await load();}}catch(cause){setError((cause instanceof Error?cause.message:'Action failed.')+' Try the action again.');}finally{setBusy(false);}};
 const value:Ctx={form,record,loading,error,saveState,busy,conflict:entry.current?.conflict??false,errors,update,updateContact,
  updateIncident:patch=>update({incident:{...(entry.current?.form??form).incident,...patch}}),updateJurisdiction:patch=>update({jurisdiction:{...(entry.current?.form??form).jurisdiction,...patch}}),
  updatePerson:(id,patch)=>update({people:(entry.current?.form??form).people.map(p=>p.id===id?{...p,...patch}:p)}),
  addPerson:kind=>{const id=newFirPersonId();update({people:[...(entry.current?.form??form).people,{id,kind,name:'',details:'',phone:'',unknown:false}]});return id;},
  removePerson:id=>update({people:(entry.current?.form??form).people.filter(p=>p.id!==id)}),flush,retry:()=>{if(entry.current)void persist(entry.current);else void load();},reload:()=>load(),go,next,action,
  back:async()=>{if(await flush()){if(router.canGoBack())router.back();else router.replace('/fir');}},
  start:async()=>{setBusy(true);setError('');try{const c=await backend.createCase({service_code:'fir_draft'});router.push(`/fir/step1?caseId=${c.id}` as Href);}catch(cause){setError(cause instanceof Error?cause.message:'Could not create case. Retry.');}finally{setBusy(false);}},
  submit:async()=>{if(busy)return;const issues=firIntakeErrors(entry.current?.form??form);setErrors(issues);if(Object.keys(issues).length)return;setBusy(true);try{if(await flush()&&entry.current){const target=entry.current.id;await backend.submit(target);await load(target);router.push(`/fir/payment?caseId=${target}` as Href);}}catch(cause){setError(cause instanceof Error?cause.message:'Submission failed. Retry.');}finally{setBusy(false);}},
  reset:()=>{++loadSequence.current;entry.current=null;setRecord(null);setForm(emptyForm());setError('');setSaveState('');}};
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFir(){const value=useContext(Context);if(!value)throw new Error('FIR provider required');return value;}
