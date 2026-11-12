import {useCallback,useRef,useState} from 'react';
import {useFocusEffect} from 'expo-router';
import type {ApiNoticeCase,NoticeFlowView,NoticeFiling} from '@legalitt/shared';
import {backend} from '../../lib/auth';
export type NoticeRecord=Omit<ApiNoticeCase,'details'>&{details:NoticeFiling};
export function useNoticeFlow(id?:string){
  const [record,setRecord]=useState<NoticeRecord|null>(null),[flow,setFlow]=useState<NoticeFlowView|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),working=useRef(false);
  const currentId=useRef(id);currentId.current=id;
  const load=useCallback(async()=>{if(!id)return;const [r,f]=await Promise.all([backend.case(id),backend.request<NoticeFlowView>(`/notices/${id}/flow`)]);if(currentId.current!==id)return;if(r.service_code!=='legal_notice')throw new Error('This is not a Legal Notice.');setRecord(r as unknown as NoticeRecord);setFlow(f);setError('');},[id]);
  useFocusEffect(useCallback(()=>{let alive=true;setLoading(true);setError('');setRecord(null);setFlow(null);if(!id){setLoading(false);return;}
    void load().catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});
    const timer=setInterval(()=>{if(!working.current)void load().catch(e=>{if(alive)setError(e.message);});},15000);return()=>{alive=false;clearInterval(timer);};
  },[load,retry,id]));
  const run=async(action:()=>Promise<unknown>)=>{if(working.current)return;working.current=true;setBusy(true);setError('');try{await action();await load();}catch(e){setError(e instanceof Error?e.message:'Couldn’t complete that action. Please retry.');}finally{working.current=false;setBusy(false);}};
  const act=(action:string,body:Record<string,unknown>={})=>backend.request(`/notices/${id}/${action}`,{...body,revision:flow?.revision});
  return {record,flow,loading,error,setError,busy,run,act,load,reload:()=>setRetry(n=>n+1)};
}
