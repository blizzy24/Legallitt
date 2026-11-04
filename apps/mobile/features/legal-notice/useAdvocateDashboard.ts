import {router} from 'expo-router';
import {useSession} from '../../context/session';
import {ADVOCATE_SELF,ADV_DASHBOARD_STATS,ADV_TODAY,type AdvStat} from '../../data/advocateSide';
import {noticeMatter} from '../../data/legalNoticeMatter';
import {useNoticeLists} from './useNoticeLists';
import {advocateNoticeState} from './advocateList';

export function useAdvocateDashboard() {
  const {user}=useSession();
  const model=useNoticeLists();
  if(!model.api) return {self:ADVOCATE_SELF,stats:ADV_DASHBOARD_STATS,events:ADV_TODAY,
    dateLine:`Here’s your schedule for today • ${ADVOCATE_SELF.today}`,availability:true,unread:true,previews:true};
  const name=user?.name.replace(/^Adv\.?\s+/i,'').trim()??'';
  const records=model.controller.items.filter(r=>r.service_code==='legal_notice');
  const groups=['Needs Review','In Progress','Resolved'];
  const stats:AdvStat[]=groups.map((group,index)=>({id:group,label:group.toUpperCase(),
    value:String(records.filter(r=>advocateNoticeState(r.status).bucket===group).length),status:'',tone:index===2?'green':'brand'}));
  const work=records.filter(r=>['assigned','advocate_accepted','in_progress','changes_requested','approved','dispatching'].includes(r.status))
    .sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at)).map(r=>({id:r.id,reference:r.reference,
      client:r.details.client?.fullName??'',matter:r.matter_type&&r.matter_type!=='other'?noticeMatter(r.matter_type).label:'',
      status:advocateNoticeState(r.status).status,action:advocateNoticeState(r.status).action??'',onOpen:()=>model.open(r.id,true)}));
  return {self:{firstName:name.split(/\s+/)[0]??'',initials:name.split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),standing:''},
    stats:model.controller.loading||model.error?[]:stats,events:[],
    dateLine:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
    availability:false,unread:false,previews:false,
    work:{loading:model.controller.loading,error:model.error,empty:records.length===0,cases:work,
      onRetry:()=>{void model.controller.run(model.controller.load);}},
    onStatPress:(group:string)=>router.push({pathname:'/matters',params:{filter:group}}),
  };
}
