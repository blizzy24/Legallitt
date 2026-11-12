// Client FIR actions that span screens: paying (F3 and F4), the change-request
// attachment (F7) and opening / downloading the draft PDF (C11, C14).
import {useCallback,useEffect,useState} from 'react';
import {Linking,Platform} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {FIR_CHANGE_ATTACHMENT_KIND,FIR_CHANGE_ATTACHMENT_MAX_BYTES,type ApiCase,type ApiDocument,type PaymentQuote} from '@legalitt/shared';
import {backend} from '../../../lib/auth';
import {errorText} from './format';

/** The live quote for an unpaid FIR request. Reloaded on demand (Try again, new QR). */
export function useFirQuote(caseId:string|undefined,enabled:boolean){
  const [quote,setQuote]=useState<PaymentQuote|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[revision,setRevision]=useState(0);
  useEffect(()=>{
    if(!caseId||!enabled)return;
    let alive=true;setLoading(true);setError('');
    backend.paymentQuote(caseId).then(q=>{if(alive)setQuote(q);})
      .catch(e=>{if(alive){setQuote(null);setError(errorText(e,'We couldn’t calculate your fee.'));}})
      .finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[caseId,enabled,revision]);
  const reload=useCallback(()=>setRevision(n=>n+1),[]);
  return {quote,error,loading,reload};
}

/**
 * Pays the service fee against a ready quote. Re-reads the case first so a second
 * tap after a slow network never pays twice: 'paid' means the case is paid (now or
 * already), 'not_payable' that it is no longer waiting for payment.
 */
export async function payFirServiceFee(caseId:string,quoteId:string):Promise<'paid'|'not_payable'>{
  const current=await backend.firFlow(caseId);
  if(current.status!=='payment_pending')return current.paid_at||!['draft','submitted','cancelled'].includes(current.status)?'paid':'not_payable';
  await backend.pay(caseId,'service_fee',`fir:${caseId}:${quoteId}`,quoteId);
  return 'paid';
}

/** One case record (fees, reference) for the payment success screen. */
export function useCaseRecord(caseId?:string){
  const [record,setRecord]=useState<ApiCase|null>(null),[error,setError]=useState(caseId?'':'This request link is missing its request ID.'),[loading,setLoading]=useState(!!caseId),[revision,setRevision]=useState(0);
  useEffect(()=>{
    if(!caseId)return;
    let alive=true;setLoading(true);setError('');
    backend.case(caseId).then(r=>{if(alive)setRecord(r);}).catch(e=>{if(alive)setError(errorText(e,'Couldn’t load this request.'));}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[caseId,revision]);
  return {record,error,loading,reload:()=>setRevision(n=>n+1)};
}

const ATTACHMENT_TYPES=['application/pdf','image/jpeg','image/png'] as const;
type AttachmentMime=typeof ATTACHMENT_TYPES[number];
/** F7: one PDF / JPG / PNG up to 10 MB. Returns null when the person cancels the picker. */
export async function pickAndUploadChangeAttachment(caseId:string):Promise<ApiDocument|null>{
  const picked=await DocumentPicker.getDocumentAsync({type:[...ATTACHMENT_TYPES],copyToCacheDirectory:true,multiple:false});
  if(picked.canceled||!picked.assets?.length)return null;
  const file=picked.assets[0]!;
  const mime=(file.mimeType??(/\.pdf$/i.test(file.name)?'application/pdf':/\.png$/i.test(file.name)?'image/png':/\.jpe?g$/i.test(file.name)?'image/jpeg':'')) as AttachmentMime|'';
  if(!mime||!(ATTACHMENT_TYPES as readonly string[]).includes(mime))throw new Error('Choose a PDF, JPG or PNG file.');
  if(file.size!=null&&file.size>FIR_CHANGE_ATTACHMENT_MAX_BYTES)throw new Error('This file is larger than 10 MB. Choose a smaller file.');
  const ticket=await backend.presign({case_id:caseId,kind:FIR_CHANGE_ATTACHMENT_KIND,filename:file.name,mime});
  return backend.upload(ticket,Platform.OS==='web'?await(await fetch(file.uri)).blob():{uri:file.uri,name:ticket.document.filename,type:mime});
}

/** Downloads the PDF where the platform can (web), otherwise opens it. */
export async function downloadDocument(id:string,filename:string){
  const {url}=await backend.documentUrl(id);
  const doc=Platform.OS==='web'?(globalThis as unknown as {document?:{createElement(tag:'a'):{href:string;download:string;rel:string;target:string;click():void;remove():void};body:{appendChild(node:unknown):void}}}).document:undefined;
  if(doc){
    const a=doc.createElement('a');a.href=url;a.download=filename;a.rel='noopener';a.target='_blank';
    doc.body.appendChild(a);a.click();a.remove();return;
  }
  await Linking.openURL(url);
}
