import {useCallback,useState} from 'react';
import {Text,View} from 'react-native';
import {router,useFocusEffect} from 'expo-router';
import {noticeDate,type ApiMessage} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import NoticeChatScreen from '../../components/NoticeChatScreen';
import {useCourt} from './model';
import {Screen,ErrorBox,s} from './ui';
export function CourtChat({caseId}:{caseId:string}){
 const m=useCourt(caseId),[messages,setMessages]=useState<ApiMessage[]>([]),[thread,setThread]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const refresh=async(id:string)=>{let after:string|undefined,rows:ApiMessage[]=[];do{const page=await backend.messages(id,after);rows.push(...page.items);after=page.next_cursor??undefined;}while(after);setMessages(rows);await backend.readMessages(id);};
 useFocusEffect(useCallback(()=>{let live=true,busy=false;const poll=async()=>{if(busy)return;busy=true;try{const t=await backend.caseThread(caseId);if(live){setThread(t.id);await refresh(t.id);await m.load();setError('');}}catch(e){if(live)setError(e instanceof Error?e.message:'Could not load messages. Retry.');}finally{busy=false;if(live)setLoading(false);}};void poll();const timer=setInterval(()=>void poll(),5000);return()=>{live=false;clearInterval(timer);};},[caseId,attempt]));
 if(!m.view)return <Screen title="Case chat"><ErrorBox message={m.error} retry={()=>void m.load()}/><Text style={s.body}>{m.loading?'Loading case…':'The case could not be opened.'}</Text></Screen>;
 return <View style={{flex:1}}><View style={s.notice}><Text style={s.muted}>Phone numbers are never shared. Voice and video calls are unavailable.</Text></View><NoticeChatScreen variant={m.role==='lawyer'?'advocate':'client'} name={m.role==='lawyer'?m.form.full_name:m.view.case.advocate?.full_name??'Your advocate'} verified={false} online={false} typing={false} onBack={()=>router.back()} readOnlyReason={m.view.chat.writable?undefined:m.view.chat.reason} placeholder="Type a message…" messages={messages.map(message=>({from:message.sender_id===m.user?.id?'me':'them',text:message.body??'Attached case document',documentId:message.document_id??undefined,time:noticeDate(message.created_at),read:!!message.read_at}))} state={{loading,error,ready:!!thread,onRetry:()=>setAttempt(n=>n+1)}} onSend={async body=>{try{await backend.sendMessage(thread,{body});await refresh(thread);return true;}catch(e){setError(e instanceof Error?e.message:'Could not send. Retry.');return false;}}} onAttach={()=>void m.run(async()=>{const d=await m.upload('court_support');if(d){await backend.sendMessage(thread,{document_id:d.id});await refresh(thread);}},false)} onOpenDocument={m.open}/></View>;
}
