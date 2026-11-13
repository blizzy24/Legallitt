/** Compare actual filed/account phone values, including punctuation/country-code
 * variants. Never infer a phone number from an unrelated identifier. */
export function privatePhonePatterns(values:unknown[]):RegExp[]{
 const digits=[...new Set(values.filter((v):v is string=>typeof v==='string').map(v=>v.replace(/\D/g,'')).filter(v=>v.length>=7&&v.length<=15))];
 return digits.flatMap(v=>[v,...v.length===12&&v.startsWith('91')?[v.slice(2)]:[],...v.length===10&&/^[6-9]/.test(v)?['91'+v,'0'+v]:[]]).map(v=>new RegExp(`(?<!\\d)\\+?${v.split('').join('[\\s().-]*')}(?!\\d)`,'g'));
}
export function redactPrivatePhones<T>(value:T,numbers:unknown[]):T {
 const patterns=privatePhonePatterns(numbers);
 const visit=(v:unknown):unknown=>typeof v==='string'?patterns.reduce((s,p)=>s.replace(p,'[phone private — use in-app chat]'),v):v instanceof Date||v===null?v:Array.isArray(v)?v.map(visit):typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,visit(x)])):v;
 return visit(value) as T;
}
/** Read-only projection. Historical age values remain in storage, but no longer
 * populate a Legal Notice form, review, draft or regenerated document. */
export function withoutNoticeAge(text:string){return text.replace(/(?:,?\s*\bAge[d]?\s*:?\s*\d{1,3}(?:\s*years?(?:\s*old)?)?)/gi,'').trim();}
export function currentNoticeFiling(value:unknown):unknown{
 if(!value||typeof value!=='object')return value;const d=value as Record<string,unknown>,client=d.client;
 if(!client||typeof client!=='object')return d;const {age:_age,relativeName:_relative,...facts}=client as Record<string,unknown>;return {...d,client:facts};
}
