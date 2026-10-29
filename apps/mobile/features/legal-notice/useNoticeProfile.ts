import {useLocalSearchParams} from 'expo-router';
import {DATA_SOURCE} from '../../lib/data-source';
import {useNoticeController} from './useNoticeController';
import {advocatePortrait,type AdvocateProfileView} from '../../data/advocates';

/** Design 433 for the case's own advocate, from advocate_profiles. Availability and
 * Client Reviews have no data model yet, so those blocks are absent, not empty. */
export function useNoticeProfile():AdvocateProfileView|undefined{
 const {caseId}=useLocalSearchParams<{caseId?:string}>();
 const enabled=DATA_SOURCE==='api'&&Boolean(caseId),c=useNoticeController('tracking',undefined,enabled);
 if(!enabled)return undefined;
 const name=c.record?.advocate?.full_name??'',p=c.record?.advocate?.profile??null;
 const list=(v?:string[])=>v?.length?v.join(', '):undefined;
 return {id:c.record?.advocate_id??'',name,initials:name.replace(/^Adv\.?\s+/i,'').split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),
  verified:p?.verification==='approved',photo:advocatePortrait(p?.photo_key),
  experience:p?.years_experience?`${p.years_experience}+ Years`:undefined,
  location:[p?.city,p?.state].filter(Boolean).join(', ')||undefined,
  rating:p?.rating_avg??undefined,reviewCount:p?.rating_count||undefined,
  barCouncil:p?.bar_council_number??undefined,practiceAreas:p?.practice_areas.length?p.practice_areas:undefined,
  about:p?.bio??undefined,education:p?.education??undefined,courts:list(p?.courts),languages:list(p?.languages)};
}
