import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { router, type Href } from 'expo-router';
import type { NoticeDraftContent } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { useSession } from '../../context/session';
import { useNoticeController, type NoticeStage } from './useNoticeController';
import * as fixture from '../../data/advocateSide';
import { noticeMatter } from '../../data/legalNoticeMatter';

export const draftKeys: (keyof NoticeDraftContent)[] = ['sender','recipient','subject','facts','demand','closing'];
export function useAdvocateNoticeModel(stage: string) {
  const api = DATA_SOURCE === 'api';
  const c=useNoticeController(stage as NoticeStage,undefined,api);
  useEffect(()=>{if(c.error){if(Platform.OS==='web')window.alert(c.error);else Alert.alert(c.error);}},[c.error]);
  const {user} = useSession();
  const r=c.record, documents=r?.documents??[], notice=documents.find(d=>d.kind==='legal_notice');
  const [pricing,setPricing]=useState<Awaited<ReturnType<typeof c.repository.service>>['pricing']>([]);
  useEffect(()=>{if(api)void c.run(async()=>setPricing((await c.repository.service('courier')).pricing));},[api]);
  const price=pricing.find(p=>!p.variant&&!p.tier);
  const total=price ? Number((BigInt(price.base_amount_paise)+(BigInt(price.base_amount_paise)*BigInt(price.gst_bps)+5000n)/10000n+50n)/100n) : null;
  const client=r?.details.client?.fullName??'',recipient=r?.details.noticee?.fullName??'',address=r?.details.noticee?.address??'';
  const matter=noticeMatter(r?.matter_type??null);
  const path=(suffix:string)=>c.href(`/advocate/notice/${c.id ?? (api ? '' : 'ln-2026-1048')}/${suffix}`);
  const courierHref=()=>c.href('/courier/self/details?noticeOutbound=1');
  useEffect(()=>{if(api&&stage==='dispatch'&&r?.status==='completed')router.replace(path('report'));},[api,stage,r?.status]);
  const open=(id?:string)=>{if(id)void c.run(async()=>{await Linking.openURL((await c.repository.documentUrl(id)).url);});};
  const saveDraft=async()=>{
    if(!c.id)throw new Error('Select a request from My Cases.');
    if(!c.dirty.current && c.latest)return c.latest;
    const draft=await c.repository.saveDraft(c.id,c.content);
    c.dirty.current=false;await c.load();return draft;
  };
  const navigateTo=(href:Href,replace=false)=>{
    let value=typeof href==='string'?href:href.pathname;
    if(typeof href!=='string'&&href.params){const q=new URLSearchParams();for(const [key,value] of Object.entries(href.params))if(value!==undefined)q.set(key,String(value));value+='?'+q.toString();}
    const destination=c.href(value);
    void c.run(async()=>{
      if(/\/final(\?|$)/.test(value)&&!['approved','dispatching','dispatched','completed'].includes(r?.status??''))throw new Error(fixture.ADV_NOTICE_REVIEW.awaiting.title);
      if((stage==='draft'||stage==='draft-editor')&&/\/(response|review)(\?|$)/.test(value)){const draft=await saveDraft();if(/\/review(\?|$)/.test(value)&&c.id)await c.repository.sendDraft(c.id,draft.id);}
      if(stage==='response'&&/\/review(\?|$)/.test(value)&&c.id){const draft=await saveDraft();await c.repository.sendDraft(c.id,draft.id);}
      if(replace)router.replace(destination);else router.push(destination);
    });
  };
  const navigate:typeof router=api?{...router,push:(href)=>navigateTo(href),replace:(href)=>navigateTo(href,true)}:router;
  const inbound=r?.shipments?.find(s=>s.direction==='to_advocate');
  const received=r?.events?.find(e=>e.type==='documents_received');
  const inboundRecipient=inbound?.recipient as {fullName?:string; name?:string; address?:string}|undefined;
  const inboundName=inboundRecipient?.fullName??inboundRecipient?.name??'';
  const when=(value?:string|null)=>value?new Date(value).toLocaleDateString('en-GB'):'';
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
    ADV_NOTICE_RESPONSE:api?{...fixture.ADV_NOTICE_RESPONSE,statusChip:'',letterhead:{...fixture.ADV_NOTICE_RESPONSE.letterhead,advocate:user?.name??'',quals:'',enrolmentNo:''}}:fixture.ADV_NOTICE_RESPONSE,
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
    ADV_NOTICE_DRAFT:api?{...fixture.ADV_NOTICE_DRAFT,parties:{client,opponent:recipient},sections:fixture.ADV_NOTICE_DRAFT.sections.map((s,i)=>({...s,body:c.content[draftKeys[i]]}))}:fixture.ADV_NOTICE_DRAFT,
    ADV_NOTICE_RECIPIENT:api?{name:recipient,address}:fixture.ADV_NOTICE_RECIPIENT,
    ADV_NOTICE_REVIEW:api?{...fixture.ADV_NOTICE_REVIEW,ref:r?.reference??'',
      cells:fixture.ADV_NOTICE_REVIEW.cells.map(cell=>({...cell,verified:false,value:cell.label==='CLIENT'?client:cell.label==='AGAINST'?recipient:cell.label==='FILING TYPE'?matter.label:cell.label==='STATUS'&&r?.status==='client_review'?'In Client Queue':''})),
      draftFile:{...fixture.ADV_NOTICE_REVIEW.draftFile,name:notice?.filename??'',size:'',status:c.latest?'Sent to Client':''},
      message:'',messageMeta:'',awaiting:{...fixture.ADV_NOTICE_REVIEW.awaiting,note:r?.reviews?.at(-1)?.comment??''},
    }:fixture.ADV_NOTICE_REVIEW,
    ADV_NOTICE_FINAL:api?{...fixture.ADV_NOTICE_FINAL,clientName:client,verifiedChip:'',signOff:'',doc:{name:notice?.filename??'',meta:''}}:fixture.ADV_NOTICE_FINAL,
    ADV_NOTICE_DISPATCH:api?{...fixture.ADV_NOTICE_DISPATCH,doc:{name:notice?.filename??'',meta:'',chip:''}}:fixture.ADV_NOTICE_DISPATCH,
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
  const documentFields=api?{reference:r?.reference??'',date:c.latest?new Date(c.latest.created_at).toLocaleDateString('en-GB'):'',recipient:c.content.recipient.split('\n'),subject:c.content.subject,
    client, father:'',age:'',address:r?.details.client?.address??'',facts:c.content.facts.split('\n'),demands:c.content.demand.split('\n')}:undefined;
  return {data,documentFields,navigate,controller:c,api,total:api?total:fixture.ADV_NOTICE_PAYMENT.totalAmount,path,courierHref,
    onViewDocument:api?(id?:string)=>open(id??notice?.id):undefined,
    onEditSection:api?(index:number,value:string)=>{c.dirty.current=true;c.setContent(prev=>({...prev,[draftKeys[index]]:value}));}:undefined,
    onSaveDraft:api?()=>{void c.run(saveDraft);}:undefined,
    onConfirmDispatch:()=>{if(!api){router.push(path('report'));return;}void c.run(async()=>{if(c.id){await c.repository.dispatch(c.id);await c.load();}});},
    onSendChoice:(choice:string)=>{let destination:Href=path('delivery');if(choice==='self')destination=courierHref();router.push(destination);},
    onPay:()=>{void c.run(async()=>{if(api&&c.id)await c.repository.pay(c.id,'courier');router.replace(path('paid'));});},
    onReceive:()=>{void c.run(async()=>{if(api&&c.id)await c.repository.receiveShipment(c.id);router.replace(path('received'));});},
    onAccept:()=>{void c.run(async()=>{if(api&&c.id&&r?.status==='assigned')await c.repository.accept(c.id);router.push(path('documents'));});},
    onDecline:()=>{void c.run(async()=>{if(api&&c.id)await c.repository.decline(c.id);router.replace('/matters');});},
    saveDraft,
  };
}
