import {useEffect} from 'react';
import {Alert,Platform} from 'react-native';
import {router} from 'expo-router';
import {bucketFor, type ApiCase} from '@legalitt/shared';
import {DATA_SOURCE} from '../../lib/data-source';
import {useNoticeController} from './useNoticeController';
import {noticeMatter} from '../../data/legalNoticeMatter';
import {activeCases,caseStats,upcomingHearings,PENDING_REQUESTS,type Case,type PendingRequest} from '../../data/cases';
import {REQUESTS,type RequestItem} from '../../data/requests';
import {ADV_CASES,ADV_CASES_STATS,type AdvCaseMatter} from '../../data/advocateSide';

export function useNoticeLists(){
 const api=DATA_SOURCE==='api',c=useNoticeController('list',undefined,api);
 useEffect(()=>{if(c.error){if(Platform.OS==='web')window.alert(c.error);else Alert.alert(c.error);}},[c.error]);
 const records=c.items.filter(r=>r.service_code==='legal_notice');
 const title=(r:ApiCase)=>noticeMatter(r.matter_type).title;
 const destination=(r:ApiCase,advocate=false)=>{
   const suffix=advocate ? ({assigned:'fee',advocate_accepted:'documents',in_progress:'draft',changes_requested:'draft',client_review:'review',approved:'final',dispatching:'dispatch',dispatched:'dispatch',completed:'report'} as Record<string,string>)[r.status]??'fee'
     : ({draft:'step1',submitted:'step6',payment_pending:'step6',client_review:'tracking',approved:'delivery',dispatching:'delivery',dispatched:'delivery',completed:'delivered'} as Record<string,string>)[r.status]??'tracking';
   return c.href(advocate?`/advocate/notice/${r.id}/${suffix}`:`/legal-notice/${suffix}`,r.id);
 };
 const open=(id:string,advocate=false)=>{const r=records.find(r=>r.id===id);if(r)router.push(destination(r,advocate));};
 const cards:Case[]=records.map(r=>({id:r.id,shortRef:r.reference,title:title(r),category:r.matter_type==='property_dispute'?'property':r.matter_type==='family_dispute'?'family':r.matter_type==='cheque_bounce'?'cheque-bounce':null,categoryLabel:'Legal Notice',court:'',city:'',state:'',status:bucketFor(r.status),statusLabel:bucketFor(r.status)==='closed'?'Closed':'Active',filedDate:r.created_at,advocateId:r.advocate_id??'',documentsCount:r.documents?.length??0}));
 const active=cards.filter(r=>r.status==='active'),closed=cards.filter(r=>r.status==='closed');
 const pending:PendingRequest[]=records.filter(r=>bucketFor(r.status)==='pending').map(r=>({id:r.id,title:title(r),categoryLabel:'Legal Notice',note:'',requestedDate:r.created_at,estimatedMatch:'',status:'awaiting-review',statusLabel:'Awaiting Review',progressNote:''}));
 const requests:RequestItem[]=records.map(r=>({id:r.id,service:'Legal Notice',reference:r.reference,status:bucketFor(r.status)==='pending'?'awaiting':bucketFor(r.status)==='closed'?'confirmed':'accepted',rows:[{label:'Assigned Advocate',value:''},{label:'Requested Date',value:new Date(r.created_at).toLocaleDateString('en-GB')}]}));
 const matters:AdvCaseMatter[]=records.map(r=>({id:r.id,service:'Legal Notice',serviceKey:'legal-notice',href:destination(r,true) as string,urgency:r.tier==='urgent'?'URGENT':'ORDINARY',title:title(r),ref:r.reference,status:bucketFor(r.status)==='closed'?(r.status==='completed'?'Completed':r.status==='cancelled'?'Cancelled':'Refunded'):r.status==='client_review'?'Client Review':['in_progress','changes_requested','advocate_accepted'].includes(r.status)?'Draft Preparation':bucketFor(r.status)==='pending'?'Upcoming':'Active',body:'',footer:'',bucket:bucketFor(r.status)==='closed'?'Completed':r.status==='client_review'?'Waiting for Client':bucketFor(r.status)==='pending'?'Upcoming':'Active'}));
 return {api,controller:c,open,
   closed:api?closed:[],active:api?active:activeCases(),pending:api?pending:PENDING_REQUESTS,hearings:api?[]:upcomingHearings(),stats:api?{active:active.length,pending:pending.length,hearings:0}:caseStats(),
   requests:api?requests:REQUESTS,matters:api?matters:ADV_CASES,
   statistics:api?ADV_CASES_STATS.map((s,i)=>({...s,value:String(records.filter(r=>bucketFor(r.status)===(['active','pending','closed'] as const)[i]).length)})):ADV_CASES_STATS,
 };
}
