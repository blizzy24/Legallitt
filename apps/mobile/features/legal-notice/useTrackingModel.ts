import { Linking } from 'react-native';
import { router, type Href } from 'expo-router';
import { DATA_SOURCE } from '../../lib/data-source';
import { noticeMatterType } from '@legalitt/shared';
import { INVOICE, TRACKING, TRACKING_STEPS, invoiceTotal } from '../../data/legalNotice';
import { calendarDate, clockTime } from '../../data/cases';
import { noticeMatter } from '../../data/legalNoticeMatter';
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
    tracking:{ref:record?.reference ?? '', noticeType:noticeMatter(record?.matter_type ?? null).noticeType,
      // The event is a timestamp; the view's date formatter takes a calendar date.
      submittedOn:submitted ? calendarDate(submitted) : '',
      submittedAt:submitted ? clockTime(submitted) : '',
      estimate:{date:'',time:''}, draftFile:notice?.filename ?? '',
      // The case response has an advocate id, but no profile facts. Do not borrow Arjun's.
      advocate:{name:record?.advocate?.full_name??'',initials:(record?.advocate?.full_name??'').split(/\s+/).map(v=>v[0]??'').join('').slice(0,2),experience:'',practice:'',barReg:'',rating:'',reviews:''},
    },
  } : {invoice:INVOICE,tracking:{...TRACKING,noticeType:noticeMatter(noticeMatterType(model.form.issueType ?? undefined)).noticeType},steps:TRACKING_STEPS};
  const state = record?.status;
  const currentStep = !api ? undefined : state==='completed' ? 7 :
    ['approved','dispatching','dispatched'].includes(state ?? '') ? 6 :
    state==='client_review' ? 5 : ['advocate_accepted','in_progress','changes_requested'].includes(state ?? '') ? 4 :
    ['assigning','assigned','advocate_declined'].includes(state ?? '') ? 3 : state==='paid' ? 2 : 1;
  // A decision tapped before the first poll lands still acts on the sent draft.
  const latestDraft = async () => c.latest ?? (c.id ? (await c.repository.case(c.id)).drafts?.at(-1) : undefined);
  // 437's Your Decision: the review buttons while the draft awaits the client;
  // nothing between approval and shipment; then only the drawn route to 440,
  // while "Physical Notice on the Way" is true. Approval itself is carried by the
  // timeline's tick on Awaiting Your Approval (§8 question 19).
  const decisionStage = !api ? 'review' as const : state==='client_review' ? 'review' as const : state==='dispatched' ? 'route' as const : null;
  const stepActive = !api || !['approved','dispatching'].includes(state ?? '');
  const navigate: typeof router = api ? {...router,
    push:(href,options)=>router.push(c.href(typeof href==='string'?href:href.pathname),options),
    replace:(href,options)=>router.replace(c.href(typeof href==='string'?href:href.pathname),options),
  } : router;
  return {data,advocateVerified:!api,decisionStage,stepActive,form:model.form,navigate,currentStep,
    paidAmount: api ? (model.invoiceLines.length ? invoiceTotal(model.invoiceLines) : null) : undefined,
    // No profile facts are available yet; never open an unrelated fixture profile.
    onViewProfile: api ? ()=>{if(record?.advocate_id)router.push(c.href(`/advocates/${record.advocate_id}`));} : undefined,
    allowDemoAdvance:!api,
    onViewDraft:api ? ()=>{void c.run(async()=>{if(notice) await Linking.openURL((await c.repository.documentUrl(notice.id)).url);});} : undefined,
    onApprove:api ? ()=>{void c.run(async()=>{const draft=await latestDraft();if(c.id&&draft){await c.repository.approve(c.id,draft.id);await c.load();}});} : undefined,
    requestChanges:(comment:string)=>{
      if(!api) {router.push({pathname:'/chat/advocate',params:{message:comment}});return;}
      void c.run(async()=>{const draft=await latestDraft();if(c.id&&draft){await c.repository.requestChanges(c.id,draft.id,comment);c.go('/legal-notice/tracking');}});
    },
    controller:c,
  };
}
