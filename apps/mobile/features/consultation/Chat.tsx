import {useCallback,useState} from 'react';
import {router,useFocusEffect} from 'expo-router';
import type {ApiMessage} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
import NoticeChatScreen from '../../components/NoticeChatScreen';
import {message,useConsultation} from './model';
import {Button,ErrorBox,Screen,s} from './ui';
import {Text,View} from 'react-native';
export function ConsultationChat({caseId:id}:{caseId?:string}){
 const m=useConsultation(id),{role,user}=useSession(),adv=role==='lawyer';
 const [messages,setMessages]=useState<ApiMessage[]>([]),[thread,setThread]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const refresh=async(threadId:string)=>{let after:string|undefined,rows:ApiMessage[]=[];do{const p=await backend.messages(threadId,after);rows.push(...p.items);after=p.next_cursor??undefined;}while(after);setMessages(rows);await backend.readMessages(threadId);};
 useFocusEffect(useCallback(()=>{if(!id)return;let alive=true,busy=false;const poll=async()=>{if(busy)return;busy=true;try{const t=await backend.caseThread(id);if(alive){setThread(t.id);await refresh(t.id);setError('');}}catch(e){if(alive)setError(message(e));}finally{busy=false;if(alive)setLoading(false);}};void poll();const timer=setInterval(()=>void poll(),5000);return()=>{alive=false;clearInterval(timer);};},[id,attempt]));
 if(!id||!m.view)return <Screen title="Consultation chat"><Text style={s.body}>{m.loading?'Loading case…':'Open a consultation from My Cases.'}</Text><ErrorBox message={m.error} retry={()=>void m.load()}/></Screen>;
 return <View style={{flex:1}}><View style={[s.notice,{borderRadius:0}]}><Text style={s.muted}>30-minute consultation via chat. Voice and video are unavailable.</Text><ErrorBox message={m.error}/>{adv&&m.view.session?.status==='scheduled'&&<Button disabled={m.busy} onPress={()=>void m.run(()=>m.request('/session/start',m.token))}>Start consultation</Button>}{adv&&m.view.session?.status==='in_progress'&&<Button disabled={m.busy} onPress={()=>void m.run(async()=>{await m.request('/session/end',m.token);router.back();},false)}>End consultation & prepare brief</Button>}{!adv&&m.view.session?.status==='scheduled'&&!m.view.session.client_joined_at&&<Button disabled={m.busy} onPress={()=>void m.run(()=>m.request('/session/join',m.token))}>I’m ready for consultation</Button>}<Button secondary onPress={()=>void m.load()}>Refresh session status</Button></View>
 <NoticeChatScreen variant={adv?'advocate':'client'} name={adv?m.form.full_name:m.view.selected_advocate?.full_name??'Your advocate'} messages={messages.map(v=>({from:v.sender_id===user?.id?'me':'them',text:v.body??'Attached case document',documentId:v.document_id??undefined,time:new Date(v.created_at).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'}),read:!!v.read_at}))} placeholder="Type a message…" verified={false} online={false} typing={false} onBack={()=>router.back()}
 state={{loading,error,ready:!!thread,onRetry:()=>setAttempt(n=>n+1)}} onSend={async body=>{try{await backend.sendMessage(thread,{body});await refresh(thread);setError('');return true;}catch(e){setError(message(e));return false;}}} onAttach={()=>void m.run(async()=>{const doc=await m.upload('chat_attachment');if(doc){await backend.sendMessage(thread,{document_id:doc.id});await refresh(thread);}},false)} onOpenDocument={doc=>void m.run(()=>m.open(doc),false)}/></View>;
}
