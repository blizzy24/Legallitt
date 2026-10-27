import {useLocalSearchParams} from 'expo-router';
import {DATA_SOURCE} from '../../lib/data-source';
import {useNoticeController} from './useNoticeController';
import type {AdvocateProfileView} from '../../data/advocates';
export function useNoticeProfile():AdvocateProfileView|undefined{
 const {caseId}=useLocalSearchParams<{caseId?:string}>();
 const enabled=DATA_SOURCE==='api'&&Boolean(caseId),c=useNoticeController('tracking',undefined,enabled);
 if(!enabled)return undefined;
 const name=c.record?.advocate?.full_name??'';
 return {id:c.record?.advocate_id??'',name,initials:name.split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),verified:false};
}
