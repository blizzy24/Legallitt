import { Linking } from 'react-native';
import { router, type Href } from 'expo-router';
import { DATA_SOURCE } from '../../lib/data-source';
import { INVOICE, TRACKING, TRACKING_STEPS, invoiceTotal } from '../../data/legalNotice';
import { useIntakeModel } from './useIntakeModel';
import type { NoticeTrackingData } from '../../app/legal-notice/tracking';

export function useTrackingModel() {
  const {model,controller:c} = useIntakeModel('tracking');
  const api = DATA_SOURCE === 'api';
  const record = c.record;
  const submitted = record?.events?.find(e=>e.to_status==='submitted')?.created_at ?? '';
  const notice = record?.documents?.find(d=>d.kind==='legal_notice');
  const data: NoticeTrackingData = api ? {
    invoice:model.invoice, steps:TRACKING_STEPS,
    tracking:{ref:record?.reference ?? '', submittedOn:submitted,
      submittedAt:submitted ? new Date(submitted).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '',
      estimate:{date:'',time:''}, draftFile:notice?.filename ?? '',
      // The case response has an advocate id, but no profile facts. Do not borrow Arjun's.
      advocate:{name:'',initials:'',experience:'',practice:'',barReg:'',rating:'',reviews:''},
    },
  } : {invoice:INVOICE,tracking:TRACKING,steps:TRACKING_STEPS};
  const state = record?.status;
  const currentStep = !api ? undefined : state==='completed' ? 7 :
    ['approved','dispatching','dispatched'].includes(state ?? '') ? 6 :
    state==='client_review' ? 5 : ['advocate_accepted','in_progress','changes_requested'].includes(state ?? '') ? 4 :
    ['assigning','assigned','advocate_declined'].includes(state ?? '') ? 3 : state==='paid' ? 2 : 1;
  const navigate: typeof router = api ? {...router,
    push:(href,options)=>router.push(c.href(typeof href==='string'?href:href.pathname),options),
    replace:(href,options)=>router.replace(c.href(typeof href==='string'?href:href.pathname),options),
  } : router;
  return {data,form:model.form,navigate,currentStep,
    paidAmount: api ? (model.invoiceLines.length ? invoiceTotal(model.invoiceLines) : null) : undefined,
    // No profile facts are available yet; never open an unrelated fixture profile.
    onViewProfile: api ? () => {} : undefined,
    allowDemoAdvance:!api,
    onViewDraft:api ? ()=>{void c.run(async()=>{if(notice) await Linking.openURL((await c.repository.documentUrl(notice.id)).url);});} : undefined,
    onApprove:api ? ()=>{void c.run(async()=>{if(c.id&&c.latest){await c.repository.approve(c.id,c.latest.id);c.go('/legal-notice/delivery');}});} : undefined,
    requestChanges:(comment:string)=>{
      if(!api) {router.push({pathname:'/chat/advocate',params:{message:comment}});return;}
      void c.run(async()=>{if(c.id&&c.latest){await c.repository.requestChanges(c.id,c.latest.id,comment);c.go('/legal-notice/tracking');}});
    },
    controller:c,
  };
}
