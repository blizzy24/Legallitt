import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useLegalNotice } from '../../context/legalNotice';
import { noticeParents, noticeFinishedIntake, noticePaid, noticeNext } from './navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { validateNoticeStep } from './intake-validation';
import { noticeMatterType, LegalNoticeSubmissionSchema } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { EMPTY_FORM, type LegalNoticeForm } from '../../context/legalNotice';
import { SERVICE_TIERS } from '../../data/legalNotice';
import { useFixtureIntakeModel } from './useFixtureIntakeModel';
import { useNoticeController, type NoticeStage } from './useNoticeController';
import type { NoticeIntakeModel } from './screen-model';

/** Select the data adapter here, never inside a designed view. */
export function useIntakeModel(stage: string) {
  const {service} = useLocalSearchParams<{service?: string}>();
  const fixture = useFixtureIntakeModel(stage);
  const api = DATA_SOURCE === 'api';
  const mapped = ({step4:'upload', 'step4-review':'upload', step5:'summary', step6:'payment', 'scan-pay':'payment', success:'tracking'} as Record<string, NoticeStage>)[stage] ?? stage as NoticeStage;
  const c = useNoticeController(mapped, undefined, api);
  const {paid} = useLegalNotice();
  const finished = api ? noticePaid(c.record) : paid;
  useFocusEffect(useCallback(() => {
    if (!service && noticeFinishedIntake.has(stage) && finished) router.replace(c.href('/legal-notice/tracking'));
  }, [stage, finished, c.id, service]));
  const [prices, setPrices] = useState<typeof c.pricing>([]);
  const [demandOptions, setDemandOptions] = useState<string[]>([]);
  const requestedOptions = useRef<string | undefined>(undefined);
  const generateDemands = () => { void c.run(async () => {
    if (!c.id) return;
    const result = await c.repository.generateNoticeDemands(c.id);
    setDemandOptions(result.options);
  }); };
  useEffect(() => {
    if (!api || stage !== 'demand' || c.loading || c.busy || !c.id || c.record?.status !== 'draft' || requestedOptions.current === c.id) return;
    requestedOptions.current = c.id;
    generateDemands();
  }, [api, stage, c.loading, c.busy, c.id, c.record?.status]);
  useEffect(() => {
    if (!api) return;
    let alive = true;
    void c.run(async () => { const service = await c.repository.service('legal_notice'); if (alive) setPrices(service.pricing); });
    return () => { alive = false; };
  }, [api]);
  const form: LegalNoticeForm = {
    client: {...EMPTY_FORM.client, ...c.details.client,
      age: c.intakeFields.sender?.age == null ? '' : String(c.intakeFields.sender.age),
      fatherName: c.intakeFields.sender?.father_name ?? ''},
    noticee: {...EMPTY_FORM.noticee, ...c.details.noticee},
    issueType: c.details.issueType ?? null, tier: c.tier,
    subjectMatter: c.intakeFields.subject_matter ?? '', subjectLine: c.record?.subject_line ?? '',
    legalDemand: c.intakeFields.legal_demand ?? {selected: [], custom: ''},
    documents: c.record?.documents?.map(d => d.filename) ?? [],
  };
  const update = (patch: Partial<LegalNoticeForm>) => {
    c.clearError();
    c.dirty.current = true;
    if (patch.tier) c.setTier(patch.tier);
    const client = patch.client ? (({age, fatherName, ...party}) => party)(patch.client) : undefined;
    c.setIntakeFields(previous => ({...previous,
      ...(patch.subjectMatter !== undefined ? {subject_matter: patch.subjectMatter} : {}),
      ...(patch.legalDemand ? {legal_demand: patch.legalDemand} : {}),
      ...(patch.client ? {sender: {age: patch.client.age.trim() ? Number(patch.client.age) : null,
        father_name: patch.client.fatherName || null}} : {}),
    }));
    c.setDetails(previous => ({...previous,
      ...(client ? {client} : {}),
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
    error: c.error,
    busy: c.busy || c.loading,
    demandOptions: [...new Set([...demandOptions, ...form.legalDemand.selected])], generateDemands,
    back: () => { if(stage === "detail") { router.replace("/(tabs)/home"); return; } void c.run(async () => {
      if (noticePaid(c.record)) { router.replace(c.href('/legal-notice/tracking')); return; }
      if(c.id && c.dirty.current && c.record?.status === 'draft') {
        await c.repository.saveIntake(c.id,c.intakePayload());
        c.dirty.current=false;
      }
      router.replace(c.href(noticeParents[stage] ?? '/legal-notice/tracking'));
    }); },
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
    summary: {client:'',noticeType:'',noticee:[],summary:form.subjectMatter,documents:form.documents.length},
    navigate: path => { if(stage === "detail") c.go(path); else void c.run(() => c.save(path)); },
    continue: () => { void c.run(async () => {
      if (c.loading) return;
      validateNoticeStep(stage, form);
      const destination = '/legal-notice/' + noticeNext[stage];
      if (stage === 'detail') {
        if(c.id) {
          const existing=await c.repository.case(c.id);
          if(noticePaid(existing)) { router.replace(c.href('/legal-notice/tracking')); return; }
          if(existing.status === 'draft') await c.repository.saveIntake(c.id,{tier:c.tier});
          c.go(destination); return;
        }
        const created = await c.repository.createCase({service_code:'legal_notice',tier:c.tier});
        c.go(destination,created.id);
      } else if (stage === 'step5') {
        if (c.record?.status === 'payment_pending') { c.go(destination); return; }
        LegalNoticeSubmissionSchema.parse(c.details);
        if (!c.id) return;
        await c.repository.saveIntake(c.id,c.intakePayload());
        if (c.record?.status === 'draft') await c.repository.submit(c.id);
        c.dirty.current = false;
        c.go(destination);
      } else if (stage === 'step3') {
        if (!c.id) return;
        await c.repository.saveIntake(c.id,c.intakePayload());
        await c.repository.generateNoticeSubject(c.id);
        c.dirty.current = false;
        c.go(destination);
      } else if (stage === 'step6') c.go(destination);
      else await c.save(destination);
    }); },
  };
  return {model:api ? model : fixture, controller:c};
}
