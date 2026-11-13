import {z} from 'zod';
const time=z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const SupportPolicySchema=z.strictObject({
  weekdays:z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(v=>new Set(v).size===v.length),
  opens_at:time,closes_at:time,timezone:z.literal('Asia/Kolkata'),callback_hours:z.number().int().min(1).max(168),
}).refine(v=>v.closes_at>v.opens_at,{message:'Closing time must be after opening time.'});
export type SupportPolicy=z.infer<typeof SupportPolicySchema>;
export type SupportPolicyView={id:string;version:number;config:SupportPolicy;effective_from:string};
export function supportHours(p:SupportPolicy){
 const labels=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];const days=p.weekdays.slice().sort((a,b)=>a-b);
 const consecutive=days.length>1&&days.every((v,i)=>!i||v===days[i-1]+1);
 const range=consecutive?`${labels[days[0]]}–${labels[days.at(-1)!]}`:days.map(d=>labels[d]).join(', ');
 const format=(v:string)=>{const [h,m]=v.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;};
 return `${range}, ${format(p.opens_at)}–${format(p.closes_at)} IST`;
}
export const supportCallbackPromise=(p:SupportPolicy)=>`We'll call you back within ${p.callback_hours} hours.`;
