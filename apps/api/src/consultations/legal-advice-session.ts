import {ConflictException,ForbiddenException} from '@nestjs/common';
import type {LegalAdviceConfig} from '@legalitt/shared';

export type AdviceSession={
 state:'waiting'|'active'|'paused'|'completed'|'interrupted';
 client_joined_at?:string;advocate_joined_at?:string;started_at?:string;
 resumed_at?:string;paused_at?:string;elapsed_ms:number;ended_at?:string;
 ended_by?:'client'|'timeout'|'pause_timeout';
};
type Policy=Pick<LegalAdviceConfig,'session_minutes'|'maximum_pause_minutes'|'join_before_minutes'>;
export function adviceElapsed(session:AdviceSession,now:number){
 return session.elapsed_ms+(session.state==='active'&&session.resumed_at?Math.max(0,now-Date.parse(session.resumed_at)):0);
}
/** Run under the booking's database row lock, using server time. Returning an
 * expired state is persisted before any action or response is accepted. */
export function reconcileAdviceSession(session:AdviceSession,config:Policy,now:number):AdviceSession{
 if(session.state==='active'&&adviceElapsed(session,now)>=config.session_minutes*60000){
  const end=Date.parse(session.resumed_at!)+config.session_minutes*60000-session.elapsed_ms;
  return {...session,state:'completed',elapsed_ms:config.session_minutes*60000,ended_at:new Date(end).toISOString(),ended_by:'timeout'};
 }
 if(session.state==='paused'&&session.paused_at&&now-Date.parse(session.paused_at)>=config.maximum_pause_minutes*60000)
  return {...session,state:'interrupted',ended_at:new Date(Date.parse(session.paused_at)+config.maximum_pause_minutes*60000).toISOString(),ended_by:'pause_timeout'};
 return {...session};
}
export function adviceSessionAction(session:AdviceSession,config:Policy,scheduledAt:string,actor:'client'|'advocate',action:'join'|'pause'|'resume'|'end',now:number):AdviceSession{
 if(action==='end'&&actor!=='client')throw new ForbiddenException('Only the client can end the consultation.');
 if(['pause','resume'].includes(action)&&actor!=='advocate')throw new ForbiddenException('Only the advocate can pause or resume.');
 const s=reconcileAdviceSession(session,config,now),at=new Date(now).toISOString();
 if(s.state==='completed'||s.state==='interrupted')throw new ConflictException('This consultation has ended. Book a follow-up or contact support.');
 if(action==='join'){
  if(now<Date.parse(scheduledAt)-config.join_before_minutes*60000)throw new ConflictException('The consultation room is not open yet.');
  if(actor==='client')s.client_joined_at??=at;else s.advocate_joined_at??=at;
  if(s.state==='waiting'&&s.client_joined_at&&s.advocate_joined_at){
   // Joining early is allowed, but the paid timer starts no earlier than the
   // confirmed appointment. No timer-driven screen navigation is involved.
   s.state='active';s.started_at=new Date(Math.max(now,Date.parse(scheduledAt))).toISOString();s.resumed_at=s.started_at;
  }
  return s;
 }
 if(action==='pause'){
  if(s.state!=='active')throw new ConflictException('Only an active consultation can be paused.');
  return {...s,state:'paused',elapsed_ms:adviceElapsed(s,now),paused_at:at,resumed_at:undefined};
 }
 if(action==='resume'){
  if(s.state!=='paused')throw new ConflictException('The consultation is not paused.');
  return {...s,state:'active',resumed_at:at,paused_at:undefined};
 }
 if(!s.started_at)throw new ConflictException('The consultation has not started.');
 return {...s,state:'completed',elapsed_ms:adviceElapsed(s,now),ended_at:at,ended_by:'client'};
}
