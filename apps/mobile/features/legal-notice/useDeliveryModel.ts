import { useEffect, useState } from 'react';
import { Linking, type ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { noticeMatterType, shipmentReached, IN_FLIGHT_SHIPMENT_STATUSES, type ShipmentStatus } from '@legalitt/shared';
import { calendarDate, clockTime, formatDate } from '../../data/cases';
import { DATA_SOURCE } from '../../lib/data-source';
import { NOTICE_DELIVERY } from '../../data/noticeDelivery';
import { useIntakeModel } from './useIntakeModel';
import type { NoticeDeliveryFacts } from '../../components/NoticeDeliveryScreen';

/** Design 440 (delivery) or 441 (delivered). Once the shipment is delivered, 440
 * offers the instructed route to 441 (§9.2); the move is the client's tap. */
export function useDeliveryModel(screen: 'delivery' | 'delivered' = 'delivery') {
  const {model,controller:c} = useIntakeModel('delivery');
  const api = DATA_SOURCE === 'api';
  // The notice's own outbound shipment, never an inbound document hand-off.
  const record=c.record, shipment=record?.shipments?.filter(x=>x.direction==='to_recipient').sort((a,b)=>(a.booked_at??'').localeCompare(b.booked_at??'')).at(-1);
  const status=shipment?.status as ShipmentStatus|undefined;
  const approvedAt=record?.events?.find(e=>e.to_status==='approved')?.created_at;
  // Legal_Notice_Final.pdf, rendered on approval (designs 440 and 441).
  const notice=record?.documents?.find(d=>d.id===record.notice_document_id);
  const proofId=shipment?.pod_document_id??record?.events?.find(e=>e.to_status==='completed')?.payload.pod_document_id;
  const proof=record?.documents?.find(d=>d.id===proofId);
  const [proofSource,setProofSource]=useState<ImageSourcePropType|null>(null);
  useEffect(()=>{
    if(!api || !proof || !proof.mime_type.startsWith('image/')) return;
    let active=true;
    void c.run(async()=>{const result=await c.repository.documentUrl(proof.id);if(active)setProofSource({uri:result.url});});
    return()=>{active=false;};
  },[api,proof?.id]);
  const noticee=record?.details.noticee?.fullName;
  // Rows of 440's Delivery Progress, in order, and the fact that completes each.
  // Notice Prepared and Shipment Created both complete when the advocate books the
  // sealed packet; Delivered only when an admin confirms with proof of delivery.
  const done=[Boolean(approvedAt),shipmentReached(status,'booked'),shipmentReached(status,'booked'),shipmentReached(status,'pickup_booked'),
    shipmentReached(status,'picked_up'),shipmentReached(status,'in_transit'),shipmentReached(status,'out_for_delivery'),shipmentReached(status,'delivered')];
  // 440's descriptions; the two that print a fact are bound to it or left out.
  const sub=(i:number,fixture:string)=>i===0?(approvedAt?`Approved by you on ${formatDate(calendarDate(approvedAt)).replace(/ \d{4}$/,'')}`:'')
    :i===4?(shipment?.carrier?`Package collected by ${shipment.carrier}`:''):fixture;
  const data:typeof NOTICE_DELIVERY = {
    courier:shipment?.carrier ?? '',waybill:shipment?.waybill ?? '',case:record?.reference ? `Case #${record.reference}` : '',
    recipient:noticee ? `${noticee} (Noticee)` : '',address:record?.details.noticee?.address ?? '',
    phone:record?.details.noticee?.mobile ?? '',file:notice?.filename ?? '',
    progress:NOTICE_DELIVERY.progress.map(([title,fixture],i)=>[title,sub(i,fixture)]),
  };
  const completed=record?.status==='completed';
  const delivered=screen==='delivered';
  const shipmentDelivered=api && (status==='delivered' || completed);
  const approved=record?.events?.some(e=>e.to_status==='approved');
  const facts:NoticeDeliveryFacts = {
    confirmation:'',deliveredOn:shipment?.delivered_at ? formatDate(calendarDate(shipment.delivered_at)) : '',
    deliveredAt:shipment?.delivered_at ? clockTime(shipment.delivered_at) : '',
    receivedBy:shipment?.received_by??'',proof:proofSource,proofStatus:proof?'Available':'',signatureStatus:'',
    // The page count is read from the generated file, never assumed.
    fileMeta:notice?.page_count ? `${completed?'Signed Copy':'Signed copy'} · ${notice.page_count} Pages` : '',
    estimate:'',latestUpdate:'',latestPlace:'',latestTime:'',
    // The first unfinished row is the active one; none once every row is done.
    progressStep:approved?done.indexOf(false):-1,
    completedSteps:done.flatMap((value,i)=>value?[i]:[]),
    inTransit:status!==undefined&&IN_FLIGHT_SHIPMENT_STATUSES.includes(status),
  };
  const open = (id?:string)=>{void c.run(async()=>{if(id) await Linking.openURL((await c.repository.documentUrl(id)).url);});};
  return {
    error: c.error,
    onBack: () => router.replace(c.href('/legal-notice/tracking')),
    matterType:api ? record?.matter_type ?? null : noticeMatterType(model.form.issueType ?? undefined),
    data:api?data:undefined, facts:api?facts:undefined, allowDemoAdvance:!api,
    onViewNotice:api?()=>open(notice?.id):undefined,
    onViewProof:api?()=>open(proof?.id):undefined,
    proofSource:api?proofSource:require('../../assets/notice-delivery-proof.png') as ImageSourcePropType,
    completed, delivered,
    onViewCase: api ? () => router.push(c.href('/legal-notice/tracking')) : undefined,
    onDeliveryConfirmation: shipmentDelivered ? () => router.push(c.href('/legal-notice/delivered')) : undefined,
  };
}
