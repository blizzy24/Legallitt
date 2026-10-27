import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { noticeMatterType, LegalNoticeSubmissionSchema } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { EMPTY_FORM, type LegalNoticeForm } from '../../context/legalNotice';
import { SERVICE_TIERS } from '../../data/legalNotice';
import { useFixtureIntakeModel } from './useFixtureIntakeModel';
import { useNoticeController, type NoticeStage } from './useNoticeController';
import type { NoticeIntakeModel } from './screen-model';

const next: Record<string, string> = {
  detail: 'step1', step1: 'step2', step2: 'step3', step3: 'step4',
  step4: 'step4-review', 'step4-review': 'step5', step5: 'step6', step6: 'scan-pay',
};
/** Select the data adapter here, never inside a designed view. */
export function useIntakeModel(stage: string) {
  const fixture = useFixtureIntakeModel(stage);
  const api = DATA_SOURCE === 'api';
  const mapped = ({step4:'upload', 'step4-review':'upload', step5:'summary', step6:'payment', 'scan-pay':'payment', success:'tracking'} as Record<string, NoticeStage>)[stage] ?? stage as NoticeStage;
  const c = useNoticeController(mapped, undefined, api);
  const [prices, setPrices] = useState<typeof c.pricing>([]);
  useEffect(() => {
    if (!api) return;
    let alive = true;
    void c.run(async () => { const service = await c.repository.service('legal_notice'); if (alive) setPrices(service.pricing); });
    return () => { alive = false; };
  }, [api]);
  useEffect(() => {
    if (!api || !c.error) return;
    if (Platform.OS === 'web') window.alert(c.error);
    else Alert.alert(c.error);
  }, [api, c.error]);
  const form: LegalNoticeForm = {
    client: {...EMPTY_FORM.client, ...c.details.client},
    noticee: {...EMPTY_FORM.noticee, ...c.details.noticee},
    issueType: c.details.issueType ?? null, tier: c.tier,
    documents: c.record?.documents?.map(d => d.filename) ?? [],
  };
  const update = (patch: Partial<LegalNoticeForm>) => {
    c.dirty.current = true;
    if (patch.tier) c.setTier(patch.tier);
    c.setDetails(previous => ({...previous,
      ...(patch.client ? {client:patch.client} : {}),
      ...(patch.noticee ? {noticee:patch.noticee} : {}),
      ...(patch.issueType ? {issueType:patch.issueType} : {}),
    }));
  };
  const base = prices.find(p => p.tier === c.tier && p.variant === null);
  const delivery = prices.find(p => p.variant === 'delivery_fee');
  const platform = prices.find(p => p.variant === 'platform_fee');
  const rows = [base, delivery, platform];
  const ready = rows.every(Boolean);
  const rupees = (paise: bigint) => Number((paise + 50n) / 100n);
  const gst = ready ? rows.reduce((sum,p) => sum + (BigInt(p!.base_amount_paise) * BigInt(p!.gst_bps) + 5000n) / 10000n, 0n) : 0n;
  const model: NoticeIntakeModel = {
    form, update,
    updateClient: patch => update({client:{...form.client,...patch}}),
    updateNoticee: patch => update({noticee:{...form.noticee,...patch}}),
    tiers: SERVICE_TIERS.map(t => ({...t, price: (() => {const p=prices.find(p=>p.tier===t.id&&p.variant===null); return p ? rupees(BigInt(p.base_amount_paise)) : null;})()})),
    invoice: {service:'Legal Notice', refId:c.record?.reference ?? '', requestId:c.record?.reference ?? ''},
    invoiceLines: ready ? [
      {label:'Service Fee',amount:rupees(BigInt(base!.base_amount_paise))},
      {label:'Legal Notice Delivery Fee',amount:rupees(BigInt(delivery!.base_amount_paise))},
      {label:'Goods & Services Tax (GST 18%)',amount:rupees(gst)},
      {label:'Platform fees',amount:rupees(BigInt(platform!.base_amount_paise))},
    ] : [],
    summary: {client:'',noticeType:'',noticee:[],summary:'',documents:form.documents.length},
    navigate: path => { void c.run(() => c.save(path)); },
    continue: () => { void c.run(async () => {
      if (c.loading) return;
      const destination = '/legal-notice/' + next[stage];
      if (stage === 'detail') {
        const created = await c.repository.createCase({service_code:'legal_notice',tier:c.tier});
        c.go(destination,created.id);
      } else if (stage === 'step5') {
        LegalNoticeSubmissionSchema.parse(c.details);
        if (!c.id) return;
        await c.repository.saveIntake(c.id,{details:c.details,tier:c.tier,matter_type:noticeMatterType(c.details.issueType)});
        if (c.record?.status === 'draft') await c.repository.submit(c.id);
        c.dirty.current = false;
        c.go(destination);
      } else if (stage === 'step6') c.go(destination);
      else await c.save(destination);
    }); },
  };
  return {model:api ? model : fixture, controller:c};
}
