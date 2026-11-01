import { useLegalNotice } from '../../context/legalNotice';
import { noticePaid } from './navigation';
import { useCallback } from 'react';
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { DATA_SOURCE } from '../../lib/data-source';
import { INVOICE, invoiceTotal } from '../../data/legalNotice';
import { useIntakeModel } from './useIntakeModel';

export function usePaymentModel(stage:'scan-pay'|'success') {
  const {model,controller:c} = useIntakeModel(stage);
  const params = useLocalSearchParams<{service?:string;amount?:string;ref?:string;success?:string;next?:string}>();
  const api = DATA_SOURCE === 'api';
  const {setPaid} = useLegalNotice();
  useFocusEffect(useCallback(() => { if (!api && stage === 'success' && !params.service) setPaid(true); }, [api, stage, params.service, setPaid]));
  const query = new URLSearchParams();
  for (const key of ['service','amount','ref','next'] as const) if(params[key]) query.set(key,params[key]!);
  if(api && c.id) query.set('caseId',c.id);
  let nextHref: Href = (params.next ?? '/legal-notice/tracking') as Href;
  if (api) nextHref = c.href('/legal-notice/tracking');
  const successHref = (params.success ?? '/legal-notice/success') as Href;
  const total = params.amount ? Number(params.amount) : (api && !model.invoiceLines.length ? null : invoiceTotal(model.invoiceLines));
  const pay = () => {
    if (!api) { router.replace((String(successHref) + (query.size?'?'+query.toString():'')) as Href); return; }
    void c.run(async()=>{
      if(!c.id || c.loading) return;
      if (noticePaid(await c.repository.case(c.id))) { router.replace(c.href('/legal-notice/tracking')); return; }
      const payment = await c.repository.pay(c.id);
      query.set('amount',String(Number((BigInt(payment.total_paise)+50n)/100n)));
      query.set('ref',c.record?.reference ?? '');
      router.replace(c.href('/legal-notice/success?' + query.toString()));
    });
  };
  let backHref: Href | undefined;
  if (!params.service) backHref = c.href('/legal-notice/step6');
  return {
    error: c.error, onBack: params.service ? () => router.back() : stage === "success" ? () => router.replace(nextHref) : model.back,
    service: api ? 'Legal Notice' : params.service ?? (stage==='success'?'legal notice':INVOICE.service),
    backHref,
    total, requestId:api ? c.record?.reference ?? '' : params.ref ?? '#' + INVOICE.requestId,
    query, successHref, nextHref, onPayment:pay,
    paymentReady:!api || (!c.loading && Boolean(c.record)),
  };
}
