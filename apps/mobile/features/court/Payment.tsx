import {useEffect,useRef,useState} from 'react';
import {Text} from 'react-native';
import {router} from 'expo-router';
import {formatPaise,type QuoteBreakdown} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Button,Card,Choice,ErrorBox,Value,s} from './ui';
import type {CourtModel} from './model';
type Quote={status:'ready';id:string;breakdown:QuoteBreakdown;full:QuoteBreakdown|null;advance_paise:string;simulated:boolean;non_refundable:boolean;pass_through:boolean}|{status:'blocked';message:string;documents:{id:string;reason:string}[]};
export function CourtPayment({model:m,purpose,itemId,onPaid}:{model:CourtModel;purpose:string;itemId?:string;onPaid():void}){
 const [quote,setQuote]=useState<Quote>(),[error,setError]=useState(''),[loading,setLoading]=useState(true),[attempt,setAttempt]=useState(0),[confirmed,setConfirmed]=useState(false),key=useRef('court-'+Date.now()+'-'+Math.random());
 useEffect(()=>{let alive=true;setLoading(true);setError('');backend.request<Quote>(`/courts/${m.id}/quote`,{purpose,...itemId?{item_id:itemId}:{}}).then(q=>{if(alive)setQuote(q);}).catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[m.id,purpose,itemId,attempt]);
 return <Card title="Complete payment"><Text style={s.body}>Test payment · No money moves.</Text><ErrorBox message={error} retry={()=>setAttempt(n=>n+1)}/>{loading?<Text style={s.body}>Calculating your saved payment breakdown…</Text>:quote?.status==='blocked'?<><ErrorBox message={quote.message}/><Button secondary onPress={()=>router.push(`/support-chat?caseId=${m.id}&service=${m.view!.case.service_code}` as never)}>Get help with these uploads</Button></>:quote?.status==='ready'?<>
 {quote.full&&<><Value label="Service fee (advocate base)" value={formatPaise(quote.full.service_fee_paise)}/><Value label="Platform fee" value={formatPaise(quote.full.platform_fee_paise)}/><Value label="GST on service + platform" value={formatPaise(quote.full.gst_paise)}/>{quote.full.charged_pages>0&&<Value label={`${quote.full.charged_pages} additional ${quote.full.charged_pages===1?'page':'pages'} · No GST`} value={formatPaise(quote.full.page_overage_paise)}/>}<Value label="Full service total" value={formatPaise(quote.full.total_paise)}/><Text style={s.muted}>Court and process fees are separate, requested with an amount and reason.</Text></>}
 {BigInt(quote.advance_paise)>0n&&<Value label="Less submission payment already paid" value={'− '+formatPaise(quote.advance_paise)}/>}
 {purpose==='deposit'&&<Text style={s.body}>This submission payment starts review and advocate assignment. It is part of your total and will be deducted from the balance after you accept an advocate.</Text>}
 {quote.pass_through&&<Text style={s.body}>Paid to the court via your advocate. No platform fee or GST. Your advocate must upload the receipt.</Text>}
 {quote.non_refundable&&<><Text style={s.body}>This advocate-change fee is non-refundable, even if admin rejects the request.</Text><Choice label="I understand this fee is non-refundable, including if rejected" selected={confirmed} onPress={()=>setConfirmed(!confirmed)}/></>}
 <Value label={purpose==='balance'?'Balance payable now':'Payable now'} value={formatPaise(quote.breakdown.total_paise)}/>{!quote.simulated?<ErrorBox message="Real payment collection is not available in this checkout. Contact Support."/>:<Button disabled={m.busy||quote.non_refundable&&!confirmed} onPress={()=>void m.run(async()=>{await backend.request(`/courts/${m.id}/pay`,{quote_id:quote.id,idempotency_key:key.current,confirmed_test:true});onPaid();})}>Simulate successful payment</Button>}
 </>:!error&&<Text style={s.body}>No payment quote is available. Retry before paying.</Text>}</Card>;
}
