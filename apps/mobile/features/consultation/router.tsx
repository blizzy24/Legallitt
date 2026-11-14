import type {ConsultationServiceCode} from '@legalitt/shared';
import {ConsultationClientScreen} from './ClientScreen';
import {ConsultationAdvocateScreen} from './AdvocateScreen';
import {ConsultationAvailability} from './Availability';
import {ConsultationChat} from './Chat';
import {AdviceGate} from '../advice/Gate';
/** API-backed service routes replace their archived fixture implementations at
 * the existing navigator boundary; no fixture child is mounted. */
export function consultationRoute(name:string,params?:Readonly<Record<string,unknown>>){
 const route=name.replace(/\/index$/,'');
 const caseId=typeof params?.caseId==='string'?params.caseId:typeof params?.id==='string'?params.id:undefined;
 if(route==='advocate/availability'||route==='advocate/calendar/availability')return <ConsultationAvailability/>;
 if(route.startsWith('advocate/consultation/'))return <AdviceGate id={caseId} advocate query={params} step={typeof params?.step==='string'?params.step:route.split('/').at(-1)} legacy={route.endsWith('/chat')?<ConsultationChat caseId={caseId}/>:<ConsultationAdvocateScreen caseId={caseId}/>}/>;
 if(route.startsWith('advocate/court/'))return route.endsWith('/chat')?<ConsultationChat caseId={caseId}/>:<ConsultationAdvocateScreen caseId={caseId}/>;
 const prefix=route.startsWith('legal-advice')?'legal-advice':route.startsWith('services/district-court')?'services/district-court':route.startsWith('services/high-court')?'services/high-court':null;
 if(!prefix)return null;
 if(route.endsWith('/chat')&&!prefix.startsWith('legal-advice'))return <ConsultationChat caseId={caseId}/>;
 const service:ConsultationServiceCode=prefix==='legal-advice'?'legal_advice':prefix.includes('district')?'district_court':'high_court';
 const original=route.slice(prefix.length+1)||'index',step=typeof params?.step==='string'?params.step:original==='case-details'?'details':original==='review-filing'?'review':original;
 return service==='legal_advice'?<AdviceGate id={caseId} step={step} query={params} legacy={step.endsWith('chat')?<ConsultationChat caseId={caseId}/>:<ConsultationClientScreen service={service} step={step} caseId={caseId}/>}/>:<ConsultationClientScreen service={service} step={step} caseId={caseId}/>;
}
