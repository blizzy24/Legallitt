// Display helpers for the client FIR screens (C8–C14). Everything shown comes from
// the API; these only format it the way the designs print it.
import {router,type Href} from 'expo-router';
import type {FirFlowView,FirSettings} from '@legalitt/shared';
import {formatDate,formatTime} from '../flow';

const IST='Asia/Kolkata';
const HOME='/(tabs)/home' as Href;

/** The designs print request IDs with a leading "#" (#FIR12345678). Copy uses the bare ID. */
export const hashRef=(reference:string)=>reference.startsWith('#')?reference:`#${reference}`;

/** Whole rupees when there are no paise, as the designs print them (₹1,377). */
export function money(paise:string|null|undefined){
  if(paise==null||paise==='')return '';
  const value=BigInt(paise),rupees=value/100n,rest=value%100n;
  return `₹${rupees.toLocaleString('en-IN')}${rest?`.${rest.toString().padStart(2,'0')}`:''}`;
}
export const addPaise=(...values:(string|null|undefined)[])=>values.reduce((sum,v)=>sum+BigInt(v||'0'),0n).toString();
export const isZero=(paise:string|null|undefined)=>!paise||BigInt(paise)===0n;

const istDay=(d:Date)=>d.toLocaleDateString('en-CA',{timeZone:IST});
/** "Today, 08:35 PM", "Yesterday, …" or "11 Nov 2026, …" in India Standard Time. */
export function dayTime(iso:string|null|undefined){
  if(!iso)return '';
  const now=new Date(),day=istDay(new Date(iso));
  const label=day===istDay(now)?'Today':day===istDay(new Date(now.getTime()-86_400_000))?'Yesterday':formatDate(iso);
  return `${label}, ${formatTime(iso)}`;
}

/** Turnaround from the FIR policy (fir_policies via flow.settings). */
export const turnaroundShort=(s:FirSettings)=>`Within ${s.turnaround.min_hours}–${s.turnaround.max_hours} hrs`;
export const turnaroundLong=(s:FirSettings)=>`Within ${s.turnaround.min_hours}–${s.turnaround.max_hours} Hours`;

/** When the request entered the drafting queue: payment, else the submit step. */
export const requestSubmittedAt=(flow:Pick<FirFlowView,'paid_at'|'submitted_at'>)=>flow.paid_at??flow.submitted_at;

/** A request is paid once it has left draft / payment_pending (cancelled ones excepted). */
export const isPaid=(flow:Pick<FirFlowView,'status'|'paid_at'>)=>!!flow.paid_at||!['draft','submitted','payment_pending','cancelled'].includes(flow.status);

export const errorText=(e:unknown,fallback:string)=>e instanceof Error&&e.message?e.message:fallback;

/**
 * Home, without leaving the payment screens underneath it: returns to the Home tab
 * already in the stack, or replaces this screen with it when there is none.
 */
export function goHome(){router.dismissTo(HOME);}
/** Back to a screen already in the stack (e.g. Status), or replace with it. */
export function backTo(href:Href){router.dismissTo(href);}
