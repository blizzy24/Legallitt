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
/** DD/MM/YYYY, with or without leading zeros (5/11/2026). null when blank, undefined when not a real date. */
const isoDate = (value: string) => {
  const text = value.trim();
  if (!text) return null;
  const parts = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parts) return undefined;
  const iso = `${parts[3]}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;
  const day = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0,10) !== iso) return undefined;
  const result = ShipmentDetailsSchema.safeParse({dispatch_date:iso});
  return result.success ? result.data.dispatch_date : undefined;
};
// Every field as the form shows it, in one list: the six form fields, Expected Delivery, receipt.
const flat = (form: Form) => [...form.values, form.expected, form.receipt ?? ''];
const unflat = (fields: string[]): Form => ({values: fields.slice(0, 6), expected: fields[6], receipt: fields[7] || null});
const serverForm = (shipment?: {[key: string]: unknown} | null): Form => shipment ? {
  values: keys.map(k => k === 'dispatch_date' ? showDate(shipment[k] as string | null) : (shipment[k] as string | null) ?? ''),
  expected: showDate(shipment.expected_delivery as string | null), receipt: (shipment.receipt_document_id as string | null) ?? null} : empty;
const API_KEYS = [...keys, 'expected_delivery', 'receipt_document_id'] as const;
const dateLabel = (index: number) => `${index === 6 ? CO_SELF_DETAILS.expectedLabel : CO_SELF_DETAILS.fields[2].label}: DD/MM/YYYY`;

export default function NoticeCourierDetails() {
  const api = DATA_SOURCE === 'api';
  const c = useNoticeController('dispatch', undefined, api);
  const {user} = useSession();
  const key = `notice-courier-${DATA_SOURCE}-${user?.id ?? ''}-${c.id ?? ''}`;
  const [form,setForm] = useState<Form>(empty);
  const [fixtureReceipt,setFixtureReceipt]=useState<DocumentPicker.DocumentPickerAsset|null>(null);
  // base: the server's values when the form last read them. A field still equal to its
  // base was not edited here, so the server's current value wins for it.
  const current = useRef(form), base = useRef(empty), loaded = useRef(false), hydrated = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const shipment = c.record?.shipments?.find(s=>s.direction==='to_recipient');
  const [error,setError] = useState('');
  // Date messages show once a date looks finished, or after Submit or Back.
  const [tried,setTried]=useState(false);
  const reportError = (error: unknown) => setError(error instanceof Error ? error.message : String(error));
  // Earlier builds kept a local copy of the form and restored it over the server's values,
  // which could replace a waybill saved elsewhere. The server is now the only source.
  const forgetLocalCopy = () => Platform.OS === 'web' ? Promise.resolve(sessionStorage.removeItem(key)) : SecureStore.deleteItemAsync(key);
  // A changed field as the API takes it; an unparseable date is held back (its field says why).
  const apiValue = (index: number, value: string) => index === 2 || index === 6 ? isoDate(value) : index === 7 ? value || null : value.trim();
  // Two values of a field are the same when the server would store them the same way.
  const same = (index: number, a: string, b: string) => index === 2 || index === 6 ? (isoDate(a) ?? a.trim()) === (isoDate(b) ?? b.trim()) : a.trim() === b.trim();
  const save = () => {
    if(!hydrated.current) return Promise.resolve();
    if(timer.current) {clearTimeout(timer.current);timer.current=undefined;}
    queue.current = queue.current.catch(()=>{}).then(async()=>{
      if(!api || !c.id) return;
      // Read the server's current details before writing.
      const record = await c.repository.case(c.id);
      const fresh = record.shipments?.find(s=>s.direction==='to_recipient');
      const theirs = flat(serverForm(fresh)), was = flat(base.current), mine = flat(current.current);
      // The server's value replaces a field only when the advocate has not edited it here
      // and the server now holds something different; otherwise the typed text stays as is.
      const merged = mine.map((value,i)=>same(i,value,was[i])&&!same(i,value,theirs[i])?theirs[i]:value);
      const changes:ShipmentDetails = {};
      merged.forEach((value,i)=>{
        if(same(i,value,theirs[i]))return;
        const next=apiValue(i,value);
        if(next!==undefined)Object.assign(changes,{[API_KEYS[i]]:next});
      });
      const settled = (pick: (i: number) => string) => unflat(theirs.map((value,i)=>API_KEYS[i] in changes ? pick(i) : value));
      // An edit counts as on the server only once the write succeeds; until then it stays an edit.
      base.current = settled(i=>was[i]);
      if(merged.some((value,i)=>value!==mine[i])){current.current=unflat(merged);setForm(current.current);}
      // A draft is written even with nothing changed: complete details then book on the
      // server (a shipment an older build left complete but in draft); incomplete ones are a no-op.
      const editable = ['approved','dispatching'].includes(record.status);
      if(Object.keys(changes).length || (editable && fresh?.status==='draft')) await c.repository.saveShipment(c.id,changes);
      base.current = settled(i=>merged[i]);
      setError('');
    });
    return queue.current;
  };
  const saveRef = useRef(save); saveRef.current = save;
  useEffect(()=>{
    if(loaded.current || (api && !c.record) || !user) return;
    loaded.current=true;
    const server=serverForm(shipment);
    base.current=server;current.current=server;setForm(server);hydrated.current=true;
    void forgetLocalCopy().catch(()=>{});
  },[c.record,user,key]);
  const change = (value:Form) => {
    if(!hydrated.current)return;
    current.current=value;setForm(value);c.dirty.current=true;
    if(timer.current) clearTimeout(timer.current);
    timer.current=setTimeout(()=>{timer.current=undefined;void save().catch(reportError);},500);
  };
  // Leaving the form with an edit still waiting for its autosave writes it, not drops it.
  useEffect(()=>()=>{if(timer.current){clearTimeout(timer.current);timer.current=undefined;void saveRef.current().catch(()=>{});}},[]);
  const dispatchPath=()=>c.href(`/advocate/notice/${c.id}/dispatch`);
  // Return to the dispatch screen already in the stack rather than stacking another.
  const back=()=>{
    // A date that is not a real date is never saved; say so rather than leave without it.
    if(Object.keys(dateErrors).length){setTried(true);reportError(new Error(Object.values(dateErrors)[0]));return;}
    void save().then(()=>router.dismissTo(dispatchPath())).catch(reportError);
  };
  const submit=()=>{void (async()=>{
    setTried(true);
    const v=current.current;
    if(Object.keys(dateErrors).length) throw new Error(Object.values(dateErrors)[0]);
    if(!v.values[0].trim()||!v.values[1].trim()||!isoDate(v.values[2])) throw new Error(CO_SELF_DETAILS.foot);
    await save();
    // Complete details are already booked by the save; this refuses anything incomplete.
    if(api&&c.id) await c.repository.bookShipment(c.id,{});
    router.dismissTo(dispatchPath());
  })().catch(reportError);};
  const dateErrors:Record<number,string>={};
  for(const [index,value] of [[2,form.values[2]],[6,form.expected]] as const) if(isoDate(value)===undefined) dateErrors[index]=dateLabel(index);
  const finished=(value:string)=>/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim())||/[^\d/\s]/.test(value)||value.trim().length>10;
  const shownErrors=Object.fromEntries(Object.entries(dateErrors).filter(([i])=>tried||finished(Number(i)===6?form.expected:form.values[2])));
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
    onExpected:value=>change({...current.current,expected:value}),onBack:back,onSubmit:submit,fieldErrors:shownErrors,
    onReceipt:upload,onViewReceipt:()=>{if(fixtureReceipt)void Linking.openURL(fixtureReceipt.uri);else open(receipt?.id);},onViewDocuments:()=>open(documents.find(d=>d.kind==='legal_notice')?.id),
    onCopyId:()=>copy(data.idValue),onCopyTracking:()=>copy(form.values[1]),
  }} /></NoticeScreenFeedback>;
}
