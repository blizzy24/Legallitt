import type {ReportServiceCode} from '@legalitt/shared';
import {ReportClientScreen} from './ClientScreen';
import {ReportAdvocateScreen} from './AdvocateScreen';
import {ReportChat} from './Chat';
import {ServicePayment,ServiceScanPay,ServicePaymentSuccess} from '../payments/ServiceCheckout';
import {reportCheckoutConfig} from './checkout-config';
/** Resolve navigator params explicitly: this boundary is above route hooks. */
export function reportRoute(name:string,params?:Readonly<Record<string,unknown>>){
 const route=name.replace(/\/index$/,''),id=typeof params?.caseId==='string'?params.caseId:typeof params?.id==='string'?params.id:undefined;
 if(route==='advocate/service-report'||route.startsWith('advocate/property-search/')||route.startsWith('advocate/forensic/')){
  const step=typeof params?.step==='string'?params.step:route.split('/').at(-1)==='[id]'?'request':route.split('/').at(-1)??'request';
  return step==='chat'?<ReportChat caseId={id}/>:<ReportAdvocateScreen caseId={id} step={step==='service-report'?'request':step}/>;
 }
 const prefix=['property-search','document-forensic','court-marriage'].find(p=>route===p||route.startsWith(p+'/'));if(!prefix)return null;
 const service=prefix.replaceAll('-','_') as ReportServiceCode,step=typeof params?.step==='string'?params.step:route.slice(prefix.length+1)||'index';
 if(id&&(service==='property_search'||service==='document_forensic')&&['payment','scan','scan-pay','payment-success'].includes(step)){
  const config=reportCheckoutConfig(service);
  return step==='payment-success'?<ServicePaymentSuccess config={config} caseId={id}/>:step==='scan'||step==='scan-pay'?<ServiceScanPay config={config} caseId={id} checkoutId={typeof params?.checkoutId==='string'?params.checkoutId:undefined}/>:<ServicePayment config={config} caseId={id}/>;
 }
 return step==='chat'?<ReportChat caseId={id}/>:<ReportClientScreen service={service} step={step} caseId={id}/>;
}
