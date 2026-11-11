// Shared data + helpers for the rebuilt FIR screens (docs/flows/FIR-DRAFT-FLOW.md).
// Every screen reads the role-shaped GET /fir/:id/flow view; the C10 stage in it is
// the single source of truth for what client, advocate and admin are shown.
import {useCallback,useEffect,useRef,useState} from 'react';
import {Platform,Share} from 'react-native';
import {router,type Href} from 'expo-router';
import {formatPaise,type FirFlowView} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {openDocument} from './shared';

const WAITING=new Set(['paid','assigning','assigned','advocate_declined','in_progress','changes_requested','client_review','approved']);

/** Loading, error and reload for one FIR case. Polls every 15 s while another party is acting. */
export function useFirFlow(caseId?:string){
  const [flow,setFlow]=useState<FirFlowView|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(!!caseId),[busy,setBusy]=useState(false),[revision,setRevision]=useState(0);
  const busyRef=useRef(false);
  const reload=useCallback(()=>setRevision(n=>n+1),[]);
  useEffect(()=>{let alive=true;if(!caseId){setLoading(false);setError('This request link is missing its request ID.');return;}
    setLoading(true);backend.firFlow(caseId).then(v=>{if(alive){setFlow(v);setError('');}}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Couldn’t load this request.');}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};},[caseId,revision]);
  useEffect(()=>{if(!flow||!WAITING.has(flow.status))return;const t=setInterval(()=>{if(!busyRef.current)reload();},15000);return()=>clearInterval(t);},[flow?.status,reload]);
  /** Runs an action; returns its result, or undefined after showing the error. */
  const run=useCallback(async<T,>(action:()=>Promise<T>):Promise<T|undefined>=>{
    if(busyRef.current)return undefined;busyRef.current=true;setBusy(true);setError('');
    try{const result=await action();return result;}catch(e){setError(e instanceof Error?e.message:'That didn’t work. Please try again.');return undefined;}
    finally{busyRef.current=false;setBusy(false);}
  },[]);
  return {flow,setFlow,error,setError,loading,busy,reload,run};
}

export const firHref=(screen:string,caseId:string,extra:Record<string,string>={})=>
  (`/fir/${screen}?${new URLSearchParams({caseId,...extra}).toString()}`) as Href;
export const advocateFirHref=(screen:string,caseId:string)=>(`/advocate/fir/${screen}?caseId=${encodeURIComponent(caseId)}`) as Href;

/** Back that never strands the person: history if there is any, otherwise the given route. */
export function backOr(fallback:Href){if(router.canGoBack())router.back();else router.replace(fallback);}

// India Standard Time, the zone every filing is made in.
const IST='Asia/Kolkata';
export const formatDate=(iso:string|null|undefined)=>iso?new Date(iso).toLocaleDateString('en-IN',{timeZone:IST,day:'2-digit',month:'short',year:'numeric'}):'';
export const formatTime=(iso:string|null|undefined)=>iso?new Date(iso).toLocaleTimeString('en-IN',{timeZone:IST,hour:'2-digit',minute:'2-digit',hour12:true}).toUpperCase():'';
export const formatDateTime=(iso:string|null|undefined)=>iso?`${formatDate(iso)}, ${formatTime(iso)}`:'';
export const formatSize=(bytes:string|number|null|undefined)=>{const n=Number(bytes??0);if(!n)return '';return n>=1_000_000?`${(n/1_000_000).toFixed(1)} MB`:`${Math.max(1,Math.round(n/1000))} KB`;};
export const rupees=(paise:string|null|undefined)=>paise==null?'':formatPaise(paise);
export const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(p=>p[0]!.toUpperCase()).join('');
export const firPdfName=(reference:string,version:number)=>`FIR_Draft_${reference}_v${version}.pdf`;

/** Clipboard on web; returns false where no clipboard exists so the caller can say so. */
export async function copyText(text:string){
  const nav=Platform.OS==='web'?(globalThis as {navigator?:{clipboard?:{writeText(t:string):Promise<void>}}}).navigator:undefined;
  if(!nav?.clipboard)return false;
  try{await nav.clipboard.writeText(text);return true;}catch{return false;}
}
/** C10 Share: request ID and status text only, never a document link. */
export async function shareStatus(flow:Pick<FirFlowView,'reference'|'stage'>){
  await Share.share({message:`FIR Draft request ${flow.reference}: ${flow.stage.client.status} (Stage ${flow.stage.client.stage} of 5, ${flow.stage.client.label}).`});
}
export const viewDocument=(id:string)=>openDocument(id);

/** Browser speech-to-text where it exists (C4 Dictate statement); null hides the button. */
export function speechRecognition():(new()=>{lang:string;interimResults:boolean;continuous:boolean;start():void;stop():void;onresult:((e:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:(()=>void)|null;onend:(()=>void)|null})|null{
  if(Platform.OS!=='web')return null;
  const w=globalThis as unknown as Record<string,unknown>;
  return (w.SpeechRecognition??w.webkitSpeechRecognition??null) as never;
}
