import {advocateMatterCount, advocateMatterStatistics, ADV_MATTER_FILTERS} from './advocateList';
import {router, type Href} from 'expo-router';
import {bucketFor, isNoticeCase, SERVICE_NAMES} from '@legalitt/shared';
import {caseTitle, caseCategory, caseDestination, advocateCaseMatters} from '../cases/case-list';
import {DATA_SOURCE} from '../../lib/data-source';
import {useNoticeController} from './useNoticeController';
import {calendarDate,activeCases,caseStats,upcomingHearings,PENDING_REQUESTS,type Case,type PendingRequest} from '../../data/cases';
import {REQUESTS,type RequestItem} from '../../data/requests';
import {ADV_CASES,ADV_CASES_STATS,type AdvCaseMatter} from '../../data/advocateSide';

export function useNoticeLists(){
 const api=DATA_SOURCE==='api',c=useNoticeController('list',undefined,api);
 const records=c.items;
 const title=caseTitle;
 const open=(id:string,advocate=false)=>{const r=records.find(r=>r.id===id);const path=r&&caseDestination(r,advocate);if(path)router.push(path as Href);};
 const cards:Case[]=records.map(r=>({id:r.id,shortRef:r.reference,title:title(r),category:isNoticeCase(r)?r.matter_type==='property_dispute'?'property':r.matter_type==='family_dispute'?'family':r.matter_type==='cheque_bounce'?'cheque-bounce':null:null,categoryLabel:caseCategory(r),serviceCode:r.service_code,advocate:r.advocate ? {name:r.advocate.full_name,initials:r.advocate.full_name.replace(/^Adv\.?\s+/i,'').split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),role:''} : null,court:'',city:'',state:'',status:bucketFor(r.status),statusLabel:bucketFor(r.status)==='closed'?'Closed':'Active',filedDate:calendarDate(r.created_at),advocateId:r.advocate_id??'',documentsCount:r.documents?.length??0}));
 const active=cards.filter(r=>r.status==='active'),closed=cards.filter(r=>r.status==='closed');
 const pending:PendingRequest[]=records.filter(r=>bucketFor(r.status)==='pending').map(r=>({id:r.id,title:title(r),categoryLabel:caseCategory(r),note:'',requestedDate:r.created_at ? calendarDate(r.created_at) : '',estimatedMatch:'',status:'awaiting-review',statusLabel:'Awaiting Review',progressNote:'Verification in progress'}));
 const requests:RequestItem[]=records.map(r=>({id:r.id,service:SERVICE_NAMES[r.service_code],reference:r.reference,status:bucketFor(r.status)==='pending'?'awaiting':bucketFor(r.status)==='closed'?'confirmed':'accepted',rows:[{label:'Assigned Advocate',value:r.advocate?.full_name??''},{label:'Requested Date',value:new Date(r.created_at).toLocaleDateString('en-GB')}]}));
 // A1 FIR cards read their fee and latest note from the list response (record.fir_card).
 const matters=advocateCaseMatters(records);
 return {api,error:c.error,controller:c,open,
   matterFilters:api?ADV_MATTER_FILTERS:undefined,
   // Designs 213/214 always offer Legal Notice, FIR Draft and Property Search, then the
   // other services present. Property Search keeps the chip's drawn label (not the service
   // name "Property Search Report"), so it never appears twice; the filter matches on its key.
   matterServices:api?['All Services',...new Set(['Legal Notice','FIR Draft','Property Search',...records.map(r=>r.service_code==='property_search'?'Property Search':SERVICE_NAMES[r.service_code])])]:undefined,
   matterCount:api?(rows:AdvCaseMatter[])=>(c.loading||!!c.error)?'':advocateMatterCount(rows):undefined,
   matterStatistics:api?(rows:AdvCaseMatter[])=>(c.loading||!!c.error)?[]:advocateMatterStatistics(rows):undefined,
   closed:api?closed:[],active:api?active:activeCases(),pending:api?pending:PENDING_REQUESTS,hearings:api?[]:upcomingHearings(),stats:api?{active:active.length,pending:pending.length,hearings:0}:caseStats(),
   requests:api?requests:REQUESTS,matters:api?matters:ADV_CASES,
   statistics:api?advocateMatterStatistics(matters):ADV_CASES_STATS,
 };
}
