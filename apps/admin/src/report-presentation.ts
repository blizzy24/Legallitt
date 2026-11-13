import {useEffect,useRef} from 'react';
export const reportDay=(value:string)=>new Date(value).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
export const reportPhone=(value:string|null|undefined)=>{if(!value)return value;const digits=value.replace(/\D/g,'');return /^(91)?\d{10}$/.test(digits)?`+91 ${digits.slice(-10,-5)} ${digits.slice(-5)}`:value;};
/** Report queues refresh on return to the tab and a downward pull at the top. */
export function useReportRefresh(enabled:boolean,refresh:()=>void){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{if(!enabled)return;let y:number|null=null;const focus=()=>latest.current(),start=(e:TouchEvent)=>{y=window.scrollY<=0?e.touches[0]?.clientY??null:null;},end=(e:TouchEvent)=>{if(y!==null&&(e.changedTouches[0]?.clientY??0)-y>70)latest.current();y=null;};window.addEventListener('focus',focus);window.addEventListener('touchstart',start,{passive:true});window.addEventListener('touchend',end,{passive:true});return()=>{window.removeEventListener('focus',focus);window.removeEventListener('touchstart',start);window.removeEventListener('touchend',end);};},[enabled]);
}
