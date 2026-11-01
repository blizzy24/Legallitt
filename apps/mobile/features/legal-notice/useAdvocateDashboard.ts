import {useSession} from '../../context/session';
import {ADVOCATE_SELF,ADV_DASHBOARD_STATS,ADV_TODAY} from '../../data/advocateSide';
import {useNoticeLists} from './useNoticeLists';

export function useAdvocateDashboard() {
  const {user}=useSession();
  const model=useNoticeLists();
  if(!model.api) return {error:'',self:ADVOCATE_SELF,stats:ADV_DASHBOARD_STATS,events:ADV_TODAY,
    dateLine:`Here’s your schedule for today • ${ADVOCATE_SELF.today}`,availability:true,unread:true,previews:true};
  const name=user?.name.replace(/^Adv\.?\s+/i,'').trim()??'';
  const count=model.controller.items.filter(r=>r.service_code==='legal_notice'&&r.status==='assigned').length;
  const requests=ADV_DASHBOARD_STATS.find(s=>s.id==='requests')!;
  return {error:model.error,self:{firstName:name.split(/\s+/)[0]??'',initials:name.split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),standing:''},
    stats:(model.controller.loading||!!model.error)?[]:[{...requests,value:String(count),status:count?requests.status:''}],
    events:[],dateLine:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
    // No availability, verification/court credential, schedule, unread count or
    // earnings data in this entry controller. Absence is not a fabricated zero.
    availability:false,unread:false,previews:false};
}
