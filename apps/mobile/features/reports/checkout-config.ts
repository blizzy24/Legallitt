import type {CheckoutConfig} from '../payments/ServiceCheckout';
export function reportCheckoutConfig(service:'property_search'|'document_forensic'):CheckoutConfig{
 const prefix=service.replaceAll('_','-');
 return {code:service,name:service==='property_search'?'Property Search Report':'Document Forensic',payment:`/${prefix}/payment`,scan:`/${prefix}/payment?step=scan`,success:`/${prefix}/payment?step=payment-success`,tracking:`/${prefix}/track`,review:`/${prefix}/review`,documents:`/${prefix}/documents`,steps:3};
}
