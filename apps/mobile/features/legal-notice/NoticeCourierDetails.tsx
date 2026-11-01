import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import { ShipmentDetailsSchema } from '@legalitt/shared';
import type { ShipmentDetails } from '@legalitt/shared';
import { CourierSelfDetailsView } from '../../components/CourierSelfDetailsScreen';
import { CO_SELF_DETAILS } from '../../data/courier';
import { ADV_NOTICE_RECIPIENT } from '../../data/advocateSide';
import { designSubstitutions } from '../../copy/substitutions';
import { DATA_SOURCE } from '../../lib/data-source';
import { useSession } from '../../context/session';
import { useNoticeController } from './useNoticeController';

type Form = {values: string[]; expected: string; receipt: string | null};
const empty: Form = {values: ['', '', '', '', '', ''], expected: '', receipt: null};
const keys = ['carrier','waybill','dispatch_date','courier_office','courier_phone','tracking_url'] as const;
const showDate = (date?: string | null) => date ? date.slice(0,10).split('-').reverse().join('/') : '';
const isoDate = (value: string) => {
  if (!value) return null;
  const result = ShipmentDetailsSchema.safeParse({dispatch_date:value.split('/').reverse().join('-')});
  return result.success ? result.data.dispatch_date : undefined;
};

export default function NoticeCourierDetails() {
  const api = DATA_SOURCE === 'api';
  const c = useNoticeController('dispatch', undefined, api);
  const {user} = useSession();
  const key = `notice-courier-${DATA_SOURCE}-${user?.id ?? ''}-${c.id ?? ''}`;
  const [form,setForm] = useState<Form>(empty);
  const [fixtureReceipt,setFixtureReceipt]=useState<DocumentPicker.DocumentPickerAsset|null>(null);
  const current = useRef(form), loaded = useRef(false), hydrated = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const shipment = c.record?.shipments?.find(s=>s.direction==='to_recipient');
  const [error,setError] = useState('');
  const reportError = (error: unknown) => setError(error instanceof Error ? error.message : String(error));
  const cache = (value: Form) => Platform.OS === 'web' ? Promise.resolve(sessionStorage.setItem(key,JSON.stringify(value))) : SecureStore.setItemAsync(key,JSON.stringify(value));
  const payload = (value: Form): ShipmentDetails => ({
    carrier:value.values[0],waybill:value.values[1],dispatch_date:isoDate(value.values[2]),
    courier_office:value.values[3],courier_phone:value.values[4],tracking_url:value.values[5],
    expected_delivery:isoDate(value.expected),receipt_document_id:value.receipt,
  });
  const save = () => {
    if(!hydrated.current) return Promise.resolve();
    if(timer.current) clearTimeout(timer.current);
    const snapshot=current.current;
    queue.current = queue.current.catch(()=>{}).then(async()=>{
      await cache(snapshot);
      if(api && c.id) await c.repository.saveShipment(c.id,payload(snapshot));
      setError('');
    });
    return queue.current;
  };
  useEffect(()=>{
    if(loaded.current || (api && !c.record) || !user) return;
    loaded.current=true;
    const server:Form = shipment ? {values:keys.map(k=>k==='dispatch_date'?showDate(shipment[k]):shipment[k]??''),expected:showDate(shipment.expected_delivery),receipt:shipment.receipt_document_id} : empty;
    void (async()=>{
      const raw=Platform.OS==='web'?sessionStorage.getItem(key):await SecureStore.getItemAsync(key);
      let restored=server;
      if(raw){try{const parsed=JSON.parse(raw);if(Array.isArray(parsed.values)&&parsed.values.length===6&&parsed.values.every((v:unknown)=>typeof v==='string')&&typeof parsed.expected==='string'&&(parsed.receipt===null||typeof parsed.receipt==='string'))restored=parsed;}catch{}}
      current.current=restored;setForm(restored);hydrated.current=true;
    })().catch(reportError);
  },[c.record,user,key]);
  const change = (value:Form) => {
    if(!hydrated.current)return;
    current.current=value;setForm(value);c.dirty.current=true;
    void cache(value).catch(reportError);
    if(timer.current) clearTimeout(timer.current);
    timer.current=setTimeout(()=>{void save().catch(reportError);},500);
  };
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const dispatchPath=()=>c.href(`/advocate/notice/${c.id}/dispatch`);
  const back=()=>{void save().then(()=>router.replace(dispatchPath())).catch(reportError);};
  const submit=()=>{void (async()=>{
    const v=current.current;
    if(!v.values[0].trim()||!v.values[1].trim()||!isoDate(v.values[2])) throw new Error(CO_SELF_DETAILS.foot);
    if(v.expected&&!isoDate(v.expected)) throw new Error('Expected Delivery Date: DD/MM/YYYY');
    await save();
    if(api&&c.id) await c.repository.bookShipment(c.id,payload(v));
    if(Platform.OS==='web')sessionStorage.removeItem(key);else await SecureStore.deleteItemAsync(key);
    router.replace(dispatchPath());
  })().catch(reportError);};
  const documents=c.record?.documents??[];
  const receipt=documents.find(d=>d.id===form.receipt);
  const open=(id?:string)=>{if(id)void c.run(async()=>{await Linking.openURL((await c.repository.documentUrl(id)).url);});};
  const upload=()=>{void c.run(async()=>{
    if(!api){const picked=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],copyToCacheDirectory:true});if(!picked.canceled)setFixtureReceipt(picked.assets[0]);return;}
    await save();
    if(await c.upload('courier_receipt')) {
      const record=await c.repository.case(c.id!);
      const document=record.documents?.filter(d=>d.kind==='courier_receipt').at(-1);
      if(document){change({...current.current,receipt:document.id});await save();}
    }
  });};
  const recipient=api ? {name:c.record?.details.noticee?.fullName??'',address:c.record?.details.noticee?.address??'',phone:c.record?.details.noticee?.mobile??''} : {...ADV_NOTICE_RECIPIENT,phone:''};
  const data:typeof CO_SELF_DETAILS={...CO_SELF_DETAILS,
    idValue:shipment?.id??'',fields:CO_SELF_DETAILS.fields.map((f,i)=>({...f,placeholder:['[Courier Name]','[Tracking Number]','DD/MM/YYYY','[Courier Office]','[Mobile Number]','[Paste tracking link]'][i]})),
    receiptFile:receipt?.filename??fixtureReceipt?.name??'',receiptStatus:receipt||fixtureReceipt?'Uploaded':'',
    docs:documents.filter(d=>d.kind==='legal_notice').map(d=>d.filename),docsCount:String(documents.filter(d=>d.kind==='legal_notice').length),
    sendRows:CO_SELF_DETAILS.sendRows.map(r=>({...r,value:r.label==='RECEIVER'?recipient.name:r.label==='ADDRESS'?recipient.address:r.label==='MOBILE'?recipient.phone:''})),
    trackBody:designSubstitutions[286].trackingHelp.after,
    trackRows:CO_SELF_DETAILS.trackRows.map((r,i)=>({...r,value:form.values[i]})),
  };
  const copy=(value:string)=>{if(Platform.OS==='web')void navigator.clipboard?.writeText(value);};
  return <NoticeScreenFeedback error={error || c.error}><CourierSelfDetailsView data={data} actions={{values:form.values,expected:form.expected,
    onField:(i,value)=>change({...current.current,values:current.current.values.map((v,j)=>j===i?value:v)}),
    onExpected:value=>change({...current.current,expected:value}),onBack:back,onSubmit:submit,
    onReceipt:upload,onViewReceipt:()=>{if(fixtureReceipt)void Linking.openURL(fixtureReceipt.uri);else open(receipt?.id);},onViewDocuments:()=>open(documents.find(d=>d.kind==='legal_notice')?.id),
    onCopyId:()=>copy(data.idValue),onCopyTracking:()=>copy(form.values[1]),
  }} /></NoticeScreenFeedback>;
}
