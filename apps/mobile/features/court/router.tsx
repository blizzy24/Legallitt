import {useCallback,useState} from 'react';
import {Text} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {isCourtService,type CourtService,type ApiCase} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {ConsultationClientScreen} from '../consultation/ClientScreen';
import {ConsultationAdvocateScreen} from '../consultation/AdvocateScreen';
import {ConsultationChat} from '../consultation/Chat';
import {CourtClientScreen} from './ClientScreen';
import {CourtAdvocateScreen} from './AdvocateScreen';
import {CourtChat} from './Chat';
import {Screen,ErrorBox,s} from './ui';
export function courtRoute(name:string,params?:Readonly<Record<string,unknown>>){
 const route=name.replace(/\/index$/,''),advocate=route.startsWith('advocate/court/'),service:CourtService|undefined=route.startsWith('services/district-court')?'district_court':route.startsWith('services/high-court')?'high_court':undefined;
 if(!advocate&&!service)return null;
 const str=(key:string)=>typeof params?.[key]==='string'?params[key] as string:undefined,caseId=str('caseId')??str('id'),step=str('step')??(route.endsWith('/chat')?'chat':route.endsWith('/payment')?'payment':'overview');
 return <CourtBoundary key={caseId??service} caseId={caseId} service={service} advocate={advocate} step={step} itemId={str('itemId')} purpose={str('purpose')} hearingId={str('hearingId')}/>;
}
function CourtBoundary({caseId,service,advocate,step,itemId,purpose,hearingId}:{caseId?:string;service?:CourtService;advocate:boolean;step:string;itemId?:string;purpose?:string;hearingId?:string}){
 const [record,setRecord]=useState<ApiCase>(),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useFocusEffect(useCallback(()=>{if(!caseId)return;let live=true;backend.case(caseId).then(c=>{if(live){if(!isCourtService(c.service_code))throw Error('Open this case from its service in My Cases.');setRecord(c);setError('');}}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[caseId,attempt]));
 if(caseId&&!record)return <Screen title="Court representation"><ErrorBox message={error} retry={()=>setAttempt(n=>n+1)}/>{!error&&<Text style={s.body}>Loading your saved case…</Text>}</Screen>;
 const code=record?.service_code as CourtService|undefined??service??'district_court';
 // Old paid consultation cases retain their original route and tariff snapshot.
 if(record&&record.details.intake_version!==3)return step==='chat'?<ConsultationChat caseId={caseId}/>:advocate?<ConsultationAdvocateScreen caseId={caseId}/>:<ConsultationClientScreen service={code} step={step==='overview'?'track':step} caseId={caseId}/>;
 if(step==='chat'&&caseId)return <CourtChat caseId={caseId}/>;
 return advocate?<CourtAdvocateScreen caseId={caseId} step={step} hearingId={hearingId}/>:<CourtClientScreen service={code} caseId={caseId} step={step} purpose={purpose} itemId={itemId}/>;
}
