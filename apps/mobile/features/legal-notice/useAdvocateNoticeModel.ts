import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { router, type Href } from 'expo-router';
import { CompliancePeriodSchema, DEFAULT_NOTICE_POLICY, noticeClosing, NOTICE_ADVOCATE_GREETING, NOTICE_EDITABLE_DRAFT_FIELDS, unchangedNoticeIntakeFields, type NoticeDraftContent } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { useSession } from '../../context/session';
import { useNoticeController, type NoticeStage } from './useNoticeController';
import * as fixture from '../../data/advocateSide';
import { noticeMatter } from '../../data/legalNoticeMatter';

export const draftKeys = ['sender','recipient','subject','facts','demand','closing'] as const satisfies readonly (keyof NoticeDraftContent)[];
export function useAdvocateNoticeModel(stage: string) {
  const api = DATA_SOURCE === 'api';
  const c=useNoticeController(stage as NoticeStage,undefined,api);
  const {user} = useSession();
  const r=c.record, documents=r?.documents??[];
  const intakeFields=api && r ? unchangedNoticeIntakeFields(r,c.content) : [];
  const intakeSections=draftKeys.flatMap((key,index)=>intakeFields.some(field=>field===key)?[index]:[]);
  // The final notice (rendered on approval) and the latest draft's PDF (rendered on send).
  const notice=documents.find(d=>d.id===r?.notice_document_id), draftDoc=documents.find(d=>d.id===c.latest?.document_id);
  const approvedAt=r?.reviews?.find(v=>v.decision==='approved')?.created_at;
  const when=(value?:string|null)=>value?new Date(value).toLocaleDateString('en-GB'):'';
  // Design 192's sign-off line: "Approved today, 11:20 AM", or the date when it was not today.
  const signOff=approvedAt?(()=>{const d=new Date(approvedAt),now=new Date();const day=d.toDateString()===now.toDateString()?'today':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
    return `Client Sign-off complete • Approved ${day}, ${d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`;})():'';
  const finalMeta=notice?.page_count ? `${notice.page_count} Pages • Signed by Client` : '';
  const [pricing,setPricing]=useState<Awaited<ReturnType<typeof c.repository.service>>['pricing']>([]);
  useEffect(()=>{if(api)void c.run(async()=>setPricing((await c.repository.service('courier')).pricing));},[api]);
  const price=pricing.find(p=>!p.variant&&!p.tier);
  const total=price ? Number((BigInt(price.base_amount_paise)+(BigInt(price.base_amount_paise)*BigInt(price.gst_bps)+5000n)/10000n+50n)/100n) : null;
  const client=r?.details.client?.fullName??'',recipient=r?.details.noticee?.fullName??'',address=r?.details.noticee?.address??'';
  const matter=noticeMatter(r?.matter_type??null);
  // These are the existing letterhead's fixed paragraphs, not draft.closing,
  // which the PDF does not use. Period and consequences follow the service policy.
  const closingCopy=fixture.ADV_NOTICE_RESPONSE.failing;
  const closingCost=r?.pricing?`₹${(Number(r.pricing.base_amount_paise)/100).toLocaleString('en-IN',{maximumFractionDigits:0})}`:'________';
  const validDays=CompliancePeriodSchema.safeParse(/^\d+$/.test(c.complianceDays)?Number(c.complianceDays):NaN);
  const policy=r?.notice_policy??DEFAULT_NOTICE_POLICY;
  // A required-offence policy is validated on save; incomplete edits must still render.
  const closing=noticeClosing(policy.criminal_clause==='required'&&!c.content.offences?.trim()?{...policy,criminal_clause:'when_offences'}:policy,
    validDays.success?validDays.data:null,c.content.offences);
  const fixedClosing=r?[
    closing.compliance, closing.consequence,
    closingCopy.further.trimStart()+closingCost+closingCopy.cost,
    fixture.ADV_NOTICE_RESPONSE.copyLine,
  ].filter(Boolean).join('\n\n'):'';
  const path=(suffix:string)=>c.href(`/advocate/notice/${c.id ?? (api ? '' : 'ln-2026-1048')}/${suffix}`);
  const courierHref=()=>c.href('/courier/self/details?noticeOutbound=1');
  // Navigation follows the tap, never the clock (§2.12): a completed case updates this screen in place.
  const open=(id?:string)=>{if(id)void c.run(async()=>{await Linking.openURL((await c.repository.documentUrl(id)).url);});};
  const saveDraft=async()=>{
    if(!c.id)throw new Error('Select a request from My Cases.');
    if(!validDays.success)throw new Error('Enter a whole number of days, at least 1.');
    if(!c.dirty.current && c.latest?.compliance_period_days)return c.latest;
    const draft=await c.repository.saveDraft(c.id,c.content,validDays.data);
    c.dirty.current=false;await c.load();return draft;
  };
  const renderDraft=async()=>{
    const draft=await saveDraft();
    if(c.id)await c.repository.renderDraft(c.id,draft.id);
  };
  const navigateTo=(href:Href,replace=false)=>{
    let value=typeof href==='string'?href:href.pathname;
    if(typeof href!=='string'&&href.params){const q=new URLSearchParams();for(const [key,value] of Object.entries(href.params))if(value!==undefined)q.set(key,String(value));value+='?'+q.toString();}
    const destination=c.href(value);
    void c.run(async()=>{
      if(/\/final(\?|$)/.test(value)&&!['approved','dispatching','dispatched','completed'].includes(r?.status??''))throw new Error(fixture.ADV_NOTICE_REVIEW.awaiting.title);
      // 187's drafting choice is where the advocate begins (or resumes) drafting.
      if(stage==='drafting'&&c.id&&['advocate_accepted','changes_requested'].includes(r?.status??''))await c.repository.start(c.id);
      if((stage==='draft'||stage==='draft-editor')&&/\/(response|review)(\?|$)/.test(value)){
        const draft=await saveDraft();
        if(c.id){
          if(/\/review(\?|$)/.test(value))await c.repository.sendDraft(c.id,draft.id);
          else await c.repository.renderDraft(c.id,draft.id);
        }
      }
      if(stage==='response'&&/\/review(\?|$)/.test(value)&&c.id){const draft=await saveDraft();await c.repository.sendDraft(c.id,draft.id);}
      if(replace)router.replace(destination);else router.push(destination);
    });
  };
  const navigate:typeof router=api?{...router,push:(href)=>navigateTo(href),replace:(href)=>navigateTo(href,true)}:router;
  const inbound=r?.shipments?.find(s=>s.direction==='to_advocate');
  const received=r?.events?.find(e=>e.type==='documents_received');
  const inboundRecipient=inbound?.recipient as {fullName?:string; name?:string; address?:string}|undefined;
  const inboundName=inboundRecipient?.fullName??inboundRecipient?.name??'';
  const data={
    ADV_NOTICE_SHIPMENT:api?{...fixture.ADV_NOTICE_SHIPMENT,chip:'',
      details:fixture.ADV_NOTICE_SHIPMENT.details.map((cell,i)=>({...cell,value:[inbound?.carrier??'',inbound?.waybill??'',''][i]})),
      pickupAddress:r?.details.client?.address??'',receiverName:inboundName,receiverAddress:inboundRecipient?.address??'',
      documents:{...fixture.ADV_NOTICE_SHIPMENT.documents,count:'',sub:''},
      steps:fixture.ADV_NOTICE_SHIPMENT.steps.map(cell=>({...cell,state:'upcoming' as const})),
    }:fixture.ADV_NOTICE_SHIPMENT,
    ADV_NOTICE_TRACKING:api?{...fixture.ADV_NOTICE_TRACKING,courier:inbound?.carrier??'',statusChip:'',waybill:inbound?.waybill??'',
      sendTo:{name:inboundName,lines:[inboundRecipient?.address??'']},documents:{...fixture.ADV_NOTICE_TRACKING.documents,sub:''},
      steps:fixture.ADV_NOTICE_TRACKING.steps.map(cell=>({...cell,meta:'',state:'upcoming' as const})),
      latest:{...fixture.ADV_NOTICE_TRACKING.latest,at:'',title:'',body:''},estimate:when(inbound?.expected_delivery),
    }:fixture.ADV_NOTICE_TRACKING,
    ADV_NOTICE_CONFIRM:api?{...fixture.ADV_NOTICE_CONFIRM,deliveredChip:inbound?.status==='delivered'?fixture.ADV_NOTICE_CONFIRM.deliveredChip:'',verified:'',
      caseRef:{...fixture.ADV_NOTICE_CONFIRM.caseRef,rows:fixture.ADV_NOTICE_CONFIRM.caseRef.rows.map((cell,i)=>({...cell,value:[client,matter.label,r?.reference??''][i]}))},
      documents:{...fixture.ADV_NOTICE_CONFIRM.documents,chip:'',rows:[]},
      delivery:{...fixture.ADV_NOTICE_CONFIRM.delivery,rows:fixture.ADV_NOTICE_CONFIRM.delivery.rows.map((cell,i)=>({...cell,value:[inbound?.carrier??'',inbound?.waybill??'',when(inbound?.delivered_at),'',''][i]}))},
    }:fixture.ADV_NOTICE_CONFIRM,
    ADV_NOTICE_RECEIVED:api?{...fixture.ADV_NOTICE_RECEIVED,
      caseInfo:{...fixture.ADV_NOTICE_RECEIVED.caseInfo,chip:r?.reference??'',rows:fixture.ADV_NOTICE_RECEIVED.caseInfo.rows.map((cell,i)=>({...cell,value:[client,matter.label][i]}))},
      documents:{...fixture.ADV_NOTICE_RECEIVED.documents,chip:'',statusChip:received?fixture.ADV_NOTICE_RECEIVED.documents.statusChip:'',rows:[]},
      delivery:{...fixture.ADV_NOTICE_RECEIVED.delivery,rows:fixture.ADV_NOTICE_RECEIVED.delivery.rows.map((cell,i)=>({...cell,value:[inbound?.carrier??'',inbound?.waybill??'',when(inbound?.delivered_at),received?user?.name??'':''][i]}))},
    }:fixture.ADV_NOTICE_RECEIVED,
    ADV_NOTICE_REPORT:api?{...fixture.ADV_NOTICE_REPORT,docChip:notice?.id??'',escrowChip:'',payout:''}:fixture.ADV_NOTICE_REPORT,
    ADV_NOTICE_RESPONSE:api?{...fixture.ADV_NOTICE_RESPONSE,statusChip:'',letterhead:{...fixture.ADV_NOTICE_RESPONSE.letterhead,
      advocate:r?.advocate?.full_name??'',quals:r?.advocate?.profile?.education??'',enrolmentNo:r?.advocate?.profile?.bar_council_number??''}}:fixture.ADV_NOTICE_RESPONSE,
    ADV_NOTICE:api?{...fixture.ADV_NOTICE,clientFee:null,ref:r?.reference??'',refLabel:r?.reference??'',docket:r?.reference??'',verifiedChip:'',
      client:{name:client,initials:client.split(/\s+/).map(v=>v[0]??'').join('').slice(0,2)},matter:matter.label,against:recipient,filingType:matter.label,
      slot:{...fixture.ADV_NOTICE.slot,date:'',time:''},escrowNote:'',
      payout:{...fixture.ADV_NOTICE.payout,chip:'',method:{...fixture.ADV_NOTICE.payout.method,value:''},window:{...fixture.ADV_NOTICE.payout.window,value:''}},
    }:fixture.ADV_NOTICE,
    ADV_NOTICE_DOCS: api?{...fixture.ADV_NOTICE_DOCS,
      summaryTitle:r?`${documents.length} Documents • ${documents.reduce((n,d)=>n+(d.page_count??0),0)} Pages`:'',
      summarySub:'',statusChip:'',aiChip:'',aiFindings:[],filesCountLabel:r?`${documents.length} Files Attached`:'',
      files:documents.map(d=>({id:d.id,name:d.filename,meta:d.page_count===null?'':`${d.page_count} pages`})),
    }:fixture.ADV_NOTICE_DOCS,
    ADV_NOTICE_DRAFTING: api?{...fixture.ADV_NOTICE_DRAFTING,docket:r?.reference??''}:fixture.ADV_NOTICE_DRAFTING,
    ADV_NOTICE_DRAFT:api?{...fixture.ADV_NOTICE_DRAFT,parties:{client,opponent:recipient},sections:fixture.ADV_NOTICE_DRAFT.sections.map((s,i)=>({...s,body:draftKeys[i]==='closing'?fixedClosing:c.content[draftKeys[i]]}))}:fixture.ADV_NOTICE_DRAFT,
    ADV_NOTICE_RECIPIENT:api?{name:recipient,address}:fixture.ADV_NOTICE_RECIPIENT,
    ADV_NOTICE_REVIEW:api?{...fixture.ADV_NOTICE_REVIEW,ref:r?.reference??'',
      cells:fixture.ADV_NOTICE_REVIEW.cells.map(cell=>({...cell,verified:false,value:cell.label==='CLIENT'?client:cell.label==='AGAINST'?recipient:cell.label==='FILING TYPE'?matter.label:cell.label==='STATUS'&&r?.status==='client_review'?'In Client Queue':''})),
      draftFile:{...fixture.ADV_NOTICE_REVIEW.draftFile,name:draftDoc?.filename??'',size:'',status:c.latest?'Sent to Client':''},
      message:'',messageMeta:'',awaiting:{...fixture.ADV_NOTICE_REVIEW.awaiting,note:r?.reviews?.at(-1)?.comment??''},
    }:fixture.ADV_NOTICE_REVIEW,
    ADV_NOTICE_FINAL:api?{...fixture.ADV_NOTICE_FINAL,clientName:client,verifiedChip:'',signOff,doc:{name:notice?.filename??'',meta:finalMeta}}:fixture.ADV_NOTICE_FINAL,
    ADV_NOTICE_DISPATCH:api?{...fixture.ADV_NOTICE_DISPATCH,doc:{name:notice?.filename??'',meta:finalMeta,chip:''}}:fixture.ADV_NOTICE_DISPATCH,
    ADV_NOTICE_SEND:api?{...fixture.ADV_NOTICE_SEND,serviceChip:'Legal Notice',matterRef:r?.reference??'',parties:r?`${client} vs ${recipient}`:'',advocate:user?.name??'',docsChip:r?`${documents.length} Documents`:'',docChips:documents.map(d=>d.filename),docChipOverflow:'',sendTo:{name:recipient,lines:[address]}}:fixture.ADV_NOTICE_SEND,
    ADV_NOTICE_DELIVERY:api?{...fixture.ADV_NOTICE_DELIVERY,
      pickup:{...fixture.ADV_NOTICE_DELIVERY.pickup,name:user?.name??'',address:'',cityLine:'',mobile:user?.phone??''},
      sendTo:{...fixture.ADV_NOTICE_DELIVERY.sendTo,name:recipient,address,cityLine:'',mobile:r?.details.noticee?.mobile??''},
      documents:{...fixture.ADV_NOTICE_DELIVERY.documents,chip:r?`${documents.length} Documents`:'',rows:documents.map(d=>d.filename)},
      delivery:{...fixture.ADV_NOTICE_DELIVERY.delivery,cells:fixture.ADV_NOTICE_DELIVERY.delivery.cells.map(cell=>({...cell,value:''}))},
      fee:{...fixture.ADV_NOTICE_DELIVERY.fee,amount:total===null?'':`₹${total}`},
    }:fixture.ADV_NOTICE_DELIVERY,
    ADV_NOTICE_PAYMENT:api?{...fixture.ADV_NOTICE_PAYMENT,service:'Legal Notice',ref:r?.reference??'',
      lines:fixture.ADV_NOTICE_PAYMENT.lines.map((line,i)=>({...line,amount:price?`₹${i===0?Number(BigInt(price.base_amount_paise))/100:total!-Number(BigInt(price.base_amount_paise))/100}/-`:''})),
      total:total===null?'':`₹${total}/-`,
    }:fixture.ADV_NOTICE_PAYMENT,
  };
  const senderParty=r?.parties?.find(p=>p.kind==='sender');
  const draftDate=c.latest?new Date(c.latest.created_at):null;
  const documentFields=api?{reference:r?.reference??'',date:draftDate?.toLocaleDateString('en-GB',{timeZone:'Asia/Kolkata'})??'',
    referenceYear:draftDate?.toLocaleDateString('en-GB',{year:'numeric',timeZone:'Asia/Kolkata'}).slice(-2)??'',
    recipient:[recipient,...address.split('\n')].filter(Boolean),subject:r?.subject_line??'',
    client, father:senderParty?.father_name??'',age:senderParty?.age?.toString()??'',address:r?.details.client?.address??'',
    facts:c.content.facts.split(/\r?\n/).map(line=>line.trim().replace(/^\d+[.)]\s+/, '')).filter(Boolean),
    demands:[...(r?.legal_demand?.selected??[]),...(r?.legal_demand?.custom?.trim()?[r.legal_demand.custom.trim()]:[])],
    closing:noticeClosing(c.latest?.closing_policy??DEFAULT_NOTICE_POLICY,c.latest?.compliance_period_days??null,c.latest?.content.offences??''),
    offences:c.content.offences??'',place:r?.advocate?.profile?.city??'',
    cost:r?.pricing?`₹${(Number(r.pricing.base_amount_paise)/100).toLocaleString('en-IN',{maximumFractionDigits:0})}`:'',
  }:undefined;
  return {error:c.error,data,documentFields,navigate,controller:c,api,intakeSections,total:api?total:fixture.ADV_NOTICE_PAYMENT.totalAmount,path,courierHref,
    onViewDocument:api?(id?:string)=>open(id??notice?.id??draftDoc?.id):undefined,
    onEditSection:api?(index:number,value:string)=>{
      const key=draftKeys[index];
      if(!key || !NOTICE_EDITABLE_DRAFT_FIELDS.some(field=>field===key))return;
      c.dirty.current=true;c.setContent(prev=>({...prev,[key]:value}));
    }:undefined,
    offences:c.content.offences??'',
    complianceDays:api?c.complianceDays:undefined,
    onEditComplianceDays:(value:string)=>{c.dirty.current=true;c.setComplianceDays(value);},
    onEditOffences:(value:string)=>{c.dirty.current=true;c.setContent(prev=>({...prev,offences:value}));},
    onSaveDraft:api?()=>{void c.run(stage==='response'?renderDraft:saveDraft);}:undefined,
    onGenerateDraft:api?()=>{void c.run(renderDraft);}:undefined,
    onConfirmDispatch:()=>{if(!api){router.push(path('report'));return;}void c.run(async()=>{if(c.id){await c.repository.dispatch(c.id);await c.load();}});},
    onSendChoice:(choice:string)=>{let destination:Href=path('delivery');if(choice==='self')destination=courierHref();router.push(destination);},
    onPay:()=>{void c.run(async()=>{if(api&&c.id)await c.repository.pay(c.id,'courier');router.replace(path('paid'));});},
    onReceive:()=>{void c.run(async()=>{if(api&&c.id)await c.repository.receiveShipment(c.id);router.replace(path('received'));});},
    onAccept:()=>{void c.run(async()=>{if(api&&c.id&&r?.status==='assigned'){await c.repository.accept(c.id);
      // The advocate's drawn opening message (33, 439), sent as them through the real endpoint.
      const thread=await c.repository.caseThread(c.id);const page=await c.repository.messages(thread.id);
      if(!page.items.some(m=>m.sender_id===user?.id))await c.repository.sendMessage(thread.id,{body:NOTICE_ADVOCATE_GREETING});}
      router.push(path('documents'));});},
    onDecline:()=>{void c.run(async()=>{if(api&&c.id)await c.repository.decline(c.id);router.replace('/matters');});},
    saveDraft,
  };
}
