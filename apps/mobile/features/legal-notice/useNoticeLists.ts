import {advocateNoticeMatters, advocateNoticeState, advocateNoticeStatistics, ADV_NOTICE_FILTERS} from './advocateList';
import {router} from 'expo-router';
import {bucketFor, type ApiCase} from '@legalitt/shared';
import {DATA_SOURCE} from '../../lib/data-source';
import {useNoticeController} from './useNoticeController';
import {noticeMatter} from '../../data/legalNoticeMatter';
import {calendarDate,activeCases,caseStats,upcomingHearings,PENDING_REQUESTS,type Case,type PendingRequest} from '../../data/cases';
import {REQUESTS,type RequestItem} from '../../data/requests';
import {ADV_CASES,ADV_CASES_STATS,type AdvCaseMatter} from '../../data/advocateSide';

export function useNoticeLists(){
 const api=DATA_SOURCE==='api',c=useNoticeController('list',undefined,api);
 const records=c.items.filter(r=>r.service_code==='legal_notice');
 const title=(r:ApiCase)=>noticeMatter(r.matter_type).title;
 const destination=(r:ApiCase,advocate=false)=>{
   const suffix=advocate ? advocateNoticeState(r.status).screen
     : ({draft:'step1',submitted:'step6',payment_pending:'step6',client_review:'tracking',approved:'request-submitted',dispatching:'request-submitted',dispatched:'delivery',completed:'tracking'} as Record<string,string>)[r.status]??'tracking';
   return c.href(advocate?`/advocate/notice/${r.id}/${suffix}`:`/legal-notice/${suffix}`,r.id);
 };
 const open=(id:string,advocate=false)=>{const r=records.find(r=>r.id===id);if(r&&(!advocate||advocateNoticeState(r.status).screen))router.push(destination(r,advocate));};
 const cards:Case[]=records.map(r=>({id:r.id,shortRef:r.reference,title:title(r),category:r.matter_type==='property_dispute'?'property':r.matter_type==='family_dispute'?'family':r.matter_type==='cheque_bounce'?'cheque-bounce':null,categoryLabel:noticeMatter(r.matter_type).noticeType,serviceCode:'legal_notice',advocate:r.advocate ? {name:r.advocate.full_name,initials:r.advocate.full_name.replace(/^Adv\.?\s+/i,'').split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),role:''} : null,court:'',city:'',state:'',status:bucketFor(r.status),statusLabel:bucketFor(r.status)==='closed'?'Closed':'Active',filedDate:calendarDate(r.created_at),advocateId:r.advocate_id??'',documentsCount:r.documents?.length??0}));
 const active=cards.filter(r=>r.status==='active'),closed=cards.filter(r=>r.status==='closed');
 const pending:PendingRequest[]=records.filter(r=>bucketFor(r.status)==='pending').map(r=>({id:r.id,title:title(r),categoryLabel:noticeMatter(r.matter_type).noticeType,note:'',requestedDate:r.created_at ? calendarDate(r.created_at) : '',estimatedMatch:'',status:'awaiting-review',statusLabel:'Awaiting Review',progressNote:'Verification in progress'}));
 const requests:RequestItem[]=records.map(r=>({id:r.id,service:'Legal Notice',reference:r.reference,status:bucketFor(r.status)==='pending'?'awaiting':bucketFor(r.status)==='closed'?'confirmed':'accepted',rows:[{label:'Assigned Advocate',value:''},{label:'Requested Date',value:new Date(r.created_at).toLocaleDateString('en-GB')}]}));
 const matters=advocateNoticeMatters(records);
 return {api,error:c.error,controller:c,open,
   matterFilters:api?ADV_NOTICE_FILTERS:undefined,
   matterServices:api?['All Services','Legal Notice']:undefined,
   matterCount:api?(rows:AdvCaseMatter[])=>(c.loading||!!c.error)?'':String(rows.length):undefined,
   matterStatistics:api?(rows:AdvCaseMatter[])=>(c.loading||!!c.error)?[]:advocateNoticeStatistics(rows):undefined,
   closed:api?closed:[],active:api?active:activeCases(),pending:api?pending:PENDING_REQUESTS,hearings:api?[]:upcomingHearings(),stats:api?{active:active.length,pending:pending.length,hearings:0}:caseStats(),
   requests:api?requests:REQUESTS,matters:api?matters:ADV_CASES,
   statistics:api?advocateNoticeStatistics(matters):ADV_CASES_STATS,
 };
}
