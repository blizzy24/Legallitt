import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {AppState,Platform} from 'react-native';
import {router,useGlobalSearchParams,usePathname,type Href} from 'expo-router';
import {ApiError,FirIntakeSchema,firIntakeErrors,INDIA_JURISDICTIONS,JURISDICTION_RETRIEVED_AT,type ApiCase,type ApiUser,type FirIntake,type FirPerson} from '@legalitt/shared';
import {backend} from '../lib/auth';
import {DATA_SOURCE} from '../lib/data-source';
import {useSession} from './session';
import {firStepHref,openFirDraftHref} from '../features/fir/intake/draft';

export type FirForm=FirIntake;
export const newFirPersonId=()=>globalThis.crypto?.randomUUID?.()??'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.floor(Math.random()*16);return(c==='x'?r:(r&3)|8).toString(16);});
export const EMPTY_FIR_FORM:FirForm={intake_version:2,intake_step:1,contact:{fullName:'',mobile:'',email:'',country_code:'IN',dial_code:'+91'},jurisdiction:{state:'',district:'',policeStation:'',state_code:'',district_code:'',source_retrieved_at:JURISDICTION_RETRIEVED_AT},place:{address:'',city:'',pin:''},incident:{type:'',date:'',time:'',location:'',description:'',additional:''},people:[]};
const emptyForm=():FirForm=>({...JSON.parse(JSON.stringify(EMPTY_FIR_FORM)),people:[{id:newFirPersonId(),kind:'complainant',name:'',phone:'',residence:'',details:''}]});

/** The contact's mobile as the complainant's phone ("+91 98765 43210"). */
export const contactPhone=(c:FirForm['contact'])=>c.mobile?c.mobile.startsWith('+')?c.mobile:[c.dial_code??'+91',c.mobile].join(' '):'';

/** Step 1 contact fields from the signed-in profile (flow C3 "pre-fill from the profile"). */
export function profileContact(user:Pick<ApiUser,'name'|'email'|'phone'>|null):Partial<FirForm['contact']>{
 if(!user)return {};
 const phone=(user.phone??'').trim(),india=/^\+91/.test(phone)||/^\d{10}$/.test(phone.replace(/\s/g,''));
 return {fullName:user.name?.trim()??'',email:user.email?.trim()??'',mobile:india?phone.replace(/^\+91[\s-]*/,''):phone,...(india?{country_code:'IN',dial_code:'+91'}:{})};
}
/** Fills the contact from the profile only while nothing has been entered yet. */
function withProfile(form:FirForm,user:Pick<ApiUser,'name'|'email'|'phone'>|null):FirForm{
 const c=form.contact;if(!user||c.fullName.trim()||c.mobile.trim()||c.email.trim())return form;
 const contact={...c,...profileContact(user)},phone=contactPhone(contact);
 return {...form,contact,people:form.people.map(p=>p.kind==='complainant'?{...p,name:p.name||contact.fullName,phone:p.phone||phone}:p)};
}
function hydrate(record:ApiCase,user:Pick<ApiUser,'name'|'email'|'phone'>|null):FirForm {
 const parsed=FirIntakeSchema.safeParse(record.details);
 if(!parsed.success&&Object.keys(record.details??{}).length)throw new Error('The saved request could not be read. Try loading it again; if it still fails, contact support with the reference '+record.reference+'. Nothing in your saved request has been changed.');
 const form=parsed.success?parsed.data:emptyForm();
 const people=form.people.map(p=>({...p,id:p.id??newFirPersonId()}));
 if(!people.some(p=>p.kind==='complainant'))people.unshift({id:newFirPersonId(),kind:'complainant',name:form.contact.fullName,phone:contactPhone(form.contact),residence:'',details:''});
 // Legacy free-text jurisdictions are matched only by exact names; never guessed.
 const state=INDIA_JURISDICTIONS.find(s=>s.name.toLowerCase()===form.jurisdiction.state.toLowerCase());
 const district=state?.districts.find(d=>d.name.toLowerCase()===form.jurisdiction.district.toLowerCase());
 return withProfile({...form,intake_version:2,intake_step:form.intake_step??1,people,place:form.place??{address:'',city:'',pin:''},jurisdiction:{...form.jurisdiction,...(!form.jurisdiction.state_code&&state?{state:state.name,state_code:state.code}:{}),...(!form.jurisdiction.district_code&&district?{district:district.name,district_code:district.code,source_retrieved_at:JURISDICTION_RETRIEVED_AT}:{})}},user);
}
type Entry={id:string;owner:string;record:ApiCase;form:FirForm;revision:string;generation:number;saved:number;error:string;conflict:boolean;promise:Promise<boolean>|null};
type Ctx={form:FirForm;record:ApiCase|null;loading:boolean;error:string;saveState:string;busy:boolean;conflict:boolean;errors:Record<string,string>;
 /** 'review' when a step was opened from Step 5's Edit links; Continue then returns to Review (flow C7). */
 returnTo:'review'|null;
 update(patch:Partial<FirForm>):void;updateContact(patch:Partial<FirForm['contact']>):void;updateJurisdiction(patch:Partial<FirForm['jurisdiction']>):void;updateIncident(patch:Partial<FirForm['incident']>):void;updatePlace(patch:Partial<NonNullable<FirForm['place']>>):void;
 updatePerson(id:string,patch:Partial<FirPerson>):void;addPerson(kind:'accused'|'witness'):string;removePerson(id:string):void;
 /** Adds or replaces one person. A primary accused makes every other accused non-primary. */
 savePerson(person:FirPerson):void;
 flush():Promise<boolean>;retry():void;reload():Promise<void>;
 /** Re-reads the case (documents) without replacing what is on screen. */
 refresh():Promise<void>;
 start():Promise<void>;go(step:number,opts?:{returnTo?:'review'}):Promise<void>;next(step:number):Promise<boolean>;back():Promise<void>;submit():Promise<void>;action(fn:()=>Promise<unknown>):Promise<void>;reset():void};
const Context=createContext<Ctx|null>(null);
export function FirProvider({children}:{children:ReactNode}) {
 const {user}=useSession(),owner=user?.id??'',params=useGlobalSearchParams<{caseId?:string;returnTo?:string}>(),path=usePathname();
 const id=path.startsWith('/fir')&&typeof params.caseId==='string'?params.caseId:undefined;
 const returnTo=path.startsWith('/fir/step')&&params.returnTo==='review'?'review':null;
 const entry=useRef<Entry|null>(null),ownerRef=useRef(owner),loadSequence=useRef(0),activeId=useRef<string|undefined>(undefined),attempted=useRef<number|null>(null);ownerRef.current=owner;
 const [form,setForm]=useState<FirForm>(()=>withProfile(emptyForm(),user)),[record,setRecord]=useState<ApiCase|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[saveState,setSaveState]=useState(''),[busy,setBusy]=useState(false),[errors,setErrors]=useState<Record<string,string>>({}),[tick,setTick]=useState(0);
 const formRef=useRef(form),show=(f:FirForm)=>{formRef.current=f;setForm(f);};
 const current=(e:Entry)=>entry.current===e&&ownerRef.current===e.owner;
 const latest=()=>entry.current?.form??formRef.current;
 const persist=(e:Entry):Promise<boolean>=>{
  if(e.promise)return e.promise;
  if(!current(e)||e.record.status!=='draft'||e.conflict)return Promise.resolve(false);
  if(e.saved>=e.generation)return Promise.resolve(true);
  e.promise=(async()=>{
   try{e.error='';if(current(e)){setError('');setSaveState('Saving…');}
    while(current(e)&&e.saved<e.generation){
     const generation=e.generation,snapshot=e.form;
     const saved=await backend.saveFirIntake(e.id,snapshot,e.revision);
     e.revision=saved.updated_at;e.saved=generation;e.record={...e.record,...saved,documents:e.record.documents};
     if(current(e))setRecord(e.record);
    }
    if(current(e))setSaveState('Saved');return true;
   }catch(cause){e.error=cause instanceof Error?cause.message:'Your changes couldn’t be saved. Check your connection and try again.';e.conflict=cause instanceof ApiError&&cause.status===409;
    if(current(e)){setError(e.error);setSaveState('Not saved');}return false;
   }finally{e.promise=null;}
  })();return e.promise;
 };
 const flush=async()=>DATA_SOURCE!=='api'?true:entry.current?persist(entry.current):false;
 const load=async(target=id)=>{
  if(!target||DATA_SOURCE!=='api')return;
  const sequence=++loadSequence.current;
  setLoading(true);setError('');setErrors({});attempted.current=null;
  try{const r=await backend.case(target);if(r.service_code!=='fir_draft')throw new Error('This is not a FIR Draft request. Open the right request from My Requests.');
   if(ownerRef.current!==owner||sequence!==loadSequence.current)return;
   const f=hydrate(r,user);entry.current={id:target,owner,record:r,form:f,revision:r.updated_at,generation:0,saved:0,error:'',conflict:false,promise:null};setRecord(r);show(f);setSaveState('Saved');
  }catch(cause){if(sequence===loadSequence.current&&ownerRef.current===owner){entry.current=null;setRecord(null);setError(cause instanceof Error?cause.message:'Your request couldn’t be loaded. Try again.');}}
  finally{if(sequence===loadSequence.current)setLoading(false);}
 };
 useEffect(()=>{++loadSequence.current;entry.current=null;setRecord(null);show(withProfile(emptyForm(),user));setError('');setSaveState('');},[owner]);
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
  const next={...latest(),...patch};if(e){e.form=next;e.generation++;}show(next);setSaveState('Not saved');setTick(n=>n+1);
  // After a Continue attempt, errors follow the entries: fixed ones disappear, the rest stay.
  setErrors(attempted.current?firIntakeErrors(next,attempted.current):{});
 };
 const updateContact=(patch:Partial<FirForm['contact']>)=>{
  const old=latest(),contact={...old.contact,...patch};
  const oldPhone=contactPhone(old.contact),newPhone=contactPhone(contact);
  const people=old.people.map(p=>p.kind==='complainant'?{...p,...(p.name===old.contact.fullName?{name:contact.fullName}:{}),...(p.phone===oldPhone?{phone:newPhone}:{})}:p);
  update({contact,people});
 };
 const stepOf=()=>Number(/\/fir\/step([1-5])/.exec(path)?.[1]??0);
 const caseParam=()=>entry.current?.id??(DATA_SOURCE==='api'?id:undefined);
 const go=async(step:number,opts:{returnTo?:'review'}={})=>{
  if((latest().intake_step??1)<step)update({intake_step:step});
  if(await flush()){attempted.current=null;setErrors({});router.push(firStepHref(step,caseParam(),opts.returnTo?{returnTo:opts.returnTo}:{}));}
 };
 const next=async(step:number)=>{
  attempted.current=step;
  const issues=firIntakeErrors(latest(),step);setErrors(issues);
  if(Object.keys(issues).length){await flush();return false;}
  if(returnTo==='review'){
   if(!await flush())return false;
   attempted.current=null;setErrors({});
   if(router.canGoBack())router.back();else router.replace(firStepHref(5,caseParam()));
   return true;
  }
  await go(step+1);return true;
 };
 const action=async(fn:()=>Promise<unknown>)=>{if(busy)return;setBusy(true);setError('');try{if(await flush()){await fn();await load();}}catch(cause){setError((cause instanceof Error?cause.message:'That didn’t work.')+' Try again.');}finally{setBusy(false);}};
 const refresh=async()=>{
  const e=entry.current;if(!e||DATA_SOURCE!=='api')return;
  const r=await backend.case(e.id);if(!current(e))return;
  // Adopt the server's revision only when nothing typed is waiting to be saved.
  if(e.saved>=e.generation&&!e.promise){e.revision=r.updated_at;e.record={...r,details:e.record.details};}
  else e.record={...e.record,documents:r.documents,status:r.status,sub_status:r.sub_status};
  setRecord(e.record);
 };
 const savePerson=(person:FirPerson)=>{
  const people=latest().people,exists=people.some(p=>p.id===person.id);
  let list=exists?people.map(p=>p.id===person.id?person:p):[...people,person];
  if(person.kind==='accused'&&person.primary)list=list.map(p=>p.kind==='accused'&&p.id!==person.id?{...p,primary:false}:p);
  update({people:list});
 };
 const removePerson=(personId:string)=>{
  const removed=latest().people.find(p=>p.id===personId);
  let list=latest().people.filter(p=>p.id!==personId);
  // The first remaining accused carries the Primary Accused tag (design 44).
  if(removed?.kind==='accused'&&removed.primary){const first=list.find(p=>p.kind==='accused');if(first)list=list.map(p=>p.id===first.id?{...p,primary:true}:p);}
  update({people:list});
 };
 const value:Ctx={form,record,loading,error,saveState,busy,conflict:entry.current?.conflict??false,errors,returnTo,update,updateContact,
  updateIncident:patch=>update({incident:{...latest().incident,...patch}}),updateJurisdiction:patch=>update({jurisdiction:{...latest().jurisdiction,...patch}}),
  updatePlace:patch=>update({place:{address:'',city:'',pin:'',...latest().place,...patch}}),
  updatePerson:(personId,patch)=>update({people:latest().people.map(p=>p.id===personId?{...p,...patch}:p)}),
  addPerson:kind=>{const personId=newFirPersonId();update({people:[...latest().people,{id:personId,kind,name:'',details:'',phone:'',unknown:false}]});return personId;},
  savePerson,removePerson,flush,retry:()=>{if(entry.current)void persist(entry.current);else void load();},reload:()=>load(),refresh,go,next,action,
  back:async()=>{
   if(!await flush())return;
   const step=stepOf();attempted.current=null;setErrors({});
   if(returnTo==='review'){if(router.canGoBack())router.back();else router.replace(firStepHref(5,caseParam()));return;}
   // Steps 2–5 go to Step N-1 explicitly, even when the draft was resumed past it:
   // dismissTo pops to it when it is in history and otherwise replaces this screen.
   if(step>1)router.dismissTo(firStepHref(step-1,caseParam()));else if(router.canGoBack())router.back();else router.replace('/fir' as Href);
  },
  start:async()=>{setBusy(true);setError('');try{router.push(await openFirDraftHref());}catch(cause){setError(cause instanceof Error?cause.message:'Your request couldn’t be opened. Check your connection and try again.');}finally{setBusy(false);}},
  submit:async()=>{
   if(busy)return;attempted.current=5;const issues=firIntakeErrors(latest());setErrors(issues);if(Object.keys(issues).length)return;
   setBusy(true);setError('');
   try{
    if(!await flush())return;
    const e=entry.current;
    if(!e){if(DATA_SOURCE!=='api')router.push('/fir/payment' as Href);return;}
    const updated=await backend.submit(e.id);
    router.push(`/fir/payment?caseId=${encodeURIComponent(e.id)}` as Href);
    if(current(e)){e.record={...e.record,status:updated.status,sub_status:updated.sub_status??null,updated_at:updated.updated_at};setRecord(e.record);}
   }catch(cause){setError(cause instanceof Error?cause.message:'Your request couldn’t be submitted. Check your connection and try again.');}
   finally{setBusy(false);}
  },
  reset:()=>{++loadSequence.current;entry.current=null;setRecord(null);show(withProfile(emptyForm(),user));setError('');setSaveState('');}};
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFir(){const value=useContext(Context);if(!value)throw new Error('FIR provider required');return value;}
