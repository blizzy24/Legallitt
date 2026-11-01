import { noticeHref } from './navigation';
import {useCallback,useState} from 'react';
import {router,useFocusEffect,useLocalSearchParams} from 'expo-router';
import {Linking} from 'react-native';
import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import type {ApiMessage} from '@legalitt/shared';
import {useSession} from '../../context/session';
import {DATA_SOURCE} from '../../lib/data-source';
import NoticeChatScreen from '../../components/NoticeChatScreen';
import {NOTICE_CHAT_ADVOCATE,NOTICE_CHAT_CLIENT,type ChatMessage} from '../../data/noticeChat';
import {useNoticeController} from './useNoticeController';
export default function NoticeChat({variant}:{variant:'client'|'advocate'}){
 const params=useLocalSearchParams<{caseId?:string;id?:string;notice?:string}>(),api=DATA_SOURCE==='api'&&Boolean(params.caseId||(variant==='advocate'&&params.id));
 const c=useNoticeController('tracking',undefined,api),{user}=useSession();
 const [messages,setMessages]=useState<ApiMessage[]>([]),[thread,setThread]=useState<string>();
 const fixture=variant==='client'?NOTICE_CHAT_CLIENT:NOTICE_CHAT_ADVOCATE;
 const [loadError,setLoadError]=useState(''),[actionError,setActionError]=useState('');
 const message=(e:unknown)=>e instanceof Error?e.message:String(e);
 const refresh=async(id:string)=>{let after:string|undefined,rows:ApiMessage[]=[];do{const page=await c.repository.messages(id,after);rows.push(...page.items);after=page.next_cursor??undefined;}while(after);setMessages(rows);await c.repository.readMessages(id);};
 useFocusEffect(useCallback(()=>{
  if(!api||!c.id)return;let active=true,working=false;
  const poll=async()=>{if(working)return;working=true;try{const value=await c.repository.caseThread(c.id!);if(active){setThread(value.id);await refresh(value.id);if(active)setLoadError('');}}catch(e){if(active)setLoadError(message(e));}finally{working=false;}};
  void poll();const timer=setInterval(()=>{void poll();},5000);return()=>{active=false;clearInterval(timer);};
 },[api,c.id]));
 const send=async(text:string)=>{if(!thread)return false;try{setActionError('');await c.repository.sendMessage(thread,{body:text});await refresh(thread);return true;}catch(e){setActionError(message(e));return false;}};
 const attach=()=>{if(!thread)return;void c.run(async()=>{if(await c.upload('chat_attachment')){const record=await c.repository.case(c.id!);const doc=record.documents?.filter(d=>d.kind==='chat_attachment').at(-1);if(doc){await c.repository.sendMessage(thread,{document_id:doc.id});await refresh(thread);}}});};
 const rows:ChatMessage[]=messages.map(m=>({from:m.sender_id===user?.id?'me':'them',text:m.body??c.record?.documents?.find(d=>d.id===m.document_id)?.filename??'',documentId:m.document_id??undefined,time:variant==='advocate'?new Date(m.created_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):undefined,read:Boolean(m.read_at)}));
 return <NoticeScreenFeedback error={actionError || loadError || c.error}><NoticeChatScreen variant={variant} onBack={variant==='client' && (api || params.notice==='1') ? () => router.replace(noticeHref('/legal-notice/tracking',params.caseId)) : undefined} name={api?(variant==='advocate'?c.record?.details.client?.fullName??'':c.record?.advocate?.full_name??''):fixture.name}
  messages={api?rows:fixture.messages} placeholder={fixture.placeholder}
  valid={variant==='advocate'&&!api?NOTICE_CHAT_ADVOCATE.valid:undefined} validTime={variant==='advocate'&&!api?NOTICE_CHAT_ADVOCATE.validTime:undefined}
  onSend={api?send:undefined} onAttach={api?attach:undefined} onOpenDocument={id=>{void c.run(async()=>{await Linking.openURL((await c.repository.documentUrl(id)).url);});}}
  verified={!api} online={!api} typing={!api} /></NoticeScreenFeedback>;
}
