import {useCallback,useEffect,useRef,useState} from 'react';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {NoticeFilingSchema,type NoticeFiling,type ApiCase} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {noticeHref,noticePaid} from './navigation';
export const emptyFiling=():NoticeFiling=>({intake_version:2,client:{},noticee:{methods:[]}});

/** Serial writes keep a slow autosave from overwriting the last explicit save. */
export function useNoticeFiling(){
  const {caseId,returnTo}=useLocalSearchParams<{caseId?:string;returnTo?:string}>();
  const [record,setRecord]=useState<ApiCase|null>(null),[filing,setFiling]=useState<NoticeFiling>(emptyFiling),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(true),[saving,setSaving]=useState(false);
  const latest=useRef(filing),queue=useRef<Promise<unknown>>(Promise.resolve()),generation=useRef(0),ready=useRef(false),mounted=useRef(true);
  const currentId=useRef(caseId);currentId.current=caseId;
  useEffect(()=>{ready.current=false;generation.current++;latest.current=emptyFiling();setFiling(latest.current);setRecord(null);setSaved(true);},[caseId]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  const reload=useCallback(async()=>{if(!caseId){setLoading(false);return;}setLoading(true);setError('');try{
    const row=await backend.case(caseId);if(currentId.current!==caseId)return;if(row.service_code!=='legal_notice')throw new Error('This is not a Legal Notice request.');setRecord(row);
    if(!ready.current){
      const stored=row.details as {client?:Record<string,unknown>};const {age:_age,relativeName:_relative,...client}=stored.client??{};const parsed=NoticeFilingSchema.safeParse({...stored,client});let value:NoticeFiling;
      if(parsed.success)value=parsed.data;
      else{
        const old=row.details as {client?:NoticeFiling['client'];noticee?:NoticeFiling['noticee'];issueType?:NoticeFiling['issueType']};
        const party=row.parties?.find(p=>p.kind==='sender');
        value={...emptyFiling(),client:{fullName:old.client?.fullName,address:old.client?.address,mobile:old.client?.mobile,email:old.client?.email},noticee:{fullName:old.noticee?.fullName,address:old.noticee?.address,email:old.noticee?.email,methods:old.noticee?.address?['courier']:[]},narrative:row.subject_matter??undefined,issueType:old.issueType};
        // Legacy drafts retain their entered facts. Paid cases are never rewritten.
        value=NoticeFilingSchema.parse(value);
      }
      latest.current=value;setFiling(value);ready.current=true;setSaved(true);
    }
  }catch(e){setError(e instanceof Error?e.message:'Couldn’t load your filing. Retry.');}finally{setLoading(false);}},[caseId]);
  useFocusEffect(useCallback(()=>{void reload();},[reload]));
  const update=(next:NoticeFiling)=>{if(record?.status!=='draft')return;generation.current++;latest.current=next;setFiling(next);setSaved(false);setError('');};
  const save=useCallback(async()=>{
    if(!caseId||!ready.current||record?.status!=='draft')return;
    const value=structuredClone(latest.current),version=generation.current;
    const task=queue.current.catch(()=>{}).then(async()=>{
      if(mounted.current)setSaving(true);
      try{await backend.request(`/notices/${caseId}/filing`,NoticeFilingSchema.parse(value),'PUT');if(mounted.current&&generation.current===version)setSaved(true);}
      finally{if(mounted.current)setSaving(false);}
    });queue.current=task;return task;
  },[caseId,record?.status]);
  useEffect(()=>{if(saved||!ready.current||record?.status!=='draft')return;const timer=setTimeout(()=>{void save().catch(e=>{if(mounted.current)setError(`Your latest changes haven’t saved. ${e.message} Retry before leaving.`);});},650);return()=>clearTimeout(timer);},[filing,saved,save,record?.status]);
  const run=async(action:()=>Promise<unknown>)=>{if(busy)return;setBusy(true);setError('');try{await action();}catch(e){setError(e instanceof Error?e.message:'Couldn’t finish that action. Retry.');}finally{setBusy(false);}};
  const go=(path:string)=>router.push(noticeHref(path,caseId));
  const discard=async()=>{ready.current=false;await queue.current.catch(()=>{});};
  return {caseId,record,filing,update,loading,busy,error,setError,saved,saving,save,discard,run,reload,go,returnTo,paid:noticePaid(record)};
}
