import { useEffect, useState } from 'react';
import { Linking, type ImageSourcePropType } from 'react-native';
import { router, usePathname } from 'expo-router';
import { noticeMatterType } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { NOTICE_DELIVERY } from '../../data/noticeDelivery';
import { useIntakeModel } from './useIntakeModel';
import type { NoticeDeliveryFacts } from '../../components/NoticeDeliveryScreen';

export function useDeliveryModel() {
  const {model,controller:c} = useIntakeModel('delivery');
  const api = DATA_SOURCE === 'api';
  const pathname=usePathname();
  const record=c.record, shipment=record?.shipments?.at(-1);
  const notice=record?.documents?.find(d=>d.kind==='legal_notice');
  const proofId=record?.events?.find(e=>e.to_status==='completed')?.payload.pod_document_id;
  const proof=record?.documents?.find(d=>d.id===proofId);
  const [proofSource,setProofSource]=useState<ImageSourcePropType|null>(null);
  useEffect(()=>{
    if(!api || !proof || !proof.mime_type.startsWith('image/')) return;
    let active=true;
    void c.run(async()=>{const result=await c.repository.documentUrl(proof.id);if(active)setProofSource({uri:result.url});});
    return()=>{active=false;};
  },[api,proof?.id]);
  const data:typeof NOTICE_DELIVERY = {
    courier:shipment?.carrier ?? '',waybill:shipment?.waybill ?? '',case:record?.reference ?? '',
    recipient:record?.details.noticee?.fullName ?? '',address:record?.details.noticee?.address ?? '',
    phone:record?.details.noticee?.mobile ?? '',file:notice?.filename ?? '',
    progress:NOTICE_DELIVERY.progress.map(([title])=>[title,'']),
  };
  const completed=record?.status==='completed';
  useEffect(()=>{if(api && completed && pathname==='/legal-notice/delivery') router.replace(c.href('/legal-notice/delivered'));},[api,completed,pathname]);
  const approved=record?.events?.some(e=>e.to_status==='approved');
  const facts:NoticeDeliveryFacts = {
    confirmation:'',deliveredOn:shipment?.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString('en-IN') : '',
    deliveredAt:shipment?.delivered_at ? new Date(shipment.delivered_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '',
    receivedBy:'',proof:proofSource,proofStatus:proof?'Available':'',signatureStatus:'',fileMeta:'',
    estimate:'',latestUpdate:'',latestPlace:'',latestTime:'',
    progressStep:completed?7:record?.status==='dispatched'?5:approved?0:-1,
    completedSteps:approved?[0]:[],
  };
  const open = (id?:string)=>{void c.run(async()=>{if(id) await Linking.openURL((await c.repository.documentUrl(id)).url);});};
  return {
    onBack:api ? () => router.replace(c.href('/legal-notice/tracking')) : undefined,
    matterType:api ? record?.matter_type ?? null : noticeMatterType(model.form.issueType ?? undefined),
    data:api?data:undefined, facts:api?facts:undefined, allowDemoAdvance:!api,
    onViewNotice:api?()=>open(notice?.id):undefined,
    onViewProof:api?()=>open(proof?.id):undefined,
    proofSource:api?proofSource:require('../../assets/notice-delivery-proof.png') as ImageSourcePropType,
    completed,
  };
}
