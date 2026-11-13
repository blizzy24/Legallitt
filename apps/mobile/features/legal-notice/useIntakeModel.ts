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
import { useCheckoutQuote } from './useCheckoutQuote';
import {backend} from '../../lib/auth';

/** Select the data adapter here, never inside a designed view. */
export function useIntakeModel(stage: string) {
  const {service} = useLocalSearchParams<{service?: string}>();
  const fixture = useFixtureIntakeModel(stage);
  const api = DATA_SOURCE === 'api';
  const mapped = ({step4:'upload', 'step4-review':'upload', step5:'summary', step6:'payment', 'scan-pay':'payment', success:'tracking'} as Record<string, NoticeStage>)[stage] ?? stage as NoticeStage;
  const c = useNoticeController(mapped, undefined, api);
  const checkout = useCheckoutQuote(c.repository, c.id, api && mapped === 'payment');
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
      age: '',
      salutation: c.intakeFields.sender?.salutation ?? null, relation: c.intakeFields.sender?.relation ?? null,
      relativeName: c.intakeFields.sender?.relative_name ?? ''},
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
    const client = patch.client ? (({age, salutation, relation, relativeName, ...party}) => party)(patch.client) : undefined;
    c.setIntakeFields(previous => ({...previous,
      ...(patch.subjectMatter !== undefined ? {subject_matter: patch.subjectMatter} : {}),
      ...(patch.legalDemand ? {legal_demand: patch.legalDemand} : {}),
      ...(patch.client ? {sender: {
        salutation: patch.client.salutation, relation: patch.client.relation,
        relative_name: patch.client.relativeName || null}} : {}),
    }));
    c.setDetails(previous => ({...previous,
      ...(client ? {client} : {}),
      ...(patch.noticee ? {noticee:patch.noticee} : {}),
      ...(patch.issueType ? {issueType:patch.issueType} : {}),
    }));
  };
  const rupees = (paise: bigint) => Number((paise + 50n) / 100n);
  const model: NoticeIntakeModel = {
    ...checkout, quoteRequired: true,
    openDocuments: () => c.go('/legal-notice/step4-review'),
    removeBlockedUpload: id => { void c.run(async () => { await c.repository.deleteDocument(id); checkout.retryQuote(); }); },
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
    invoiceLines: [],
    summary: {client:'',noticeType:'',noticee:[],summary:form.subjectMatter,documents:form.documents.length},
    navigate: path => { if(stage === "detail") c.go(path); else void c.run(() => c.save(path)); },
    continue: () => { void c.run(async () => {
      if (c.loading) return;
      if (c.record?.status === 'payment_pending' && ['step4','step4-review'].includes(stage)) {
        c.go(stage === 'step4' ? '/legal-notice/step4-review' : '/legal-notice/step6');
        return;
      }
      validateNoticeStep(stage, form);
      const destination = '/legal-notice/' + noticeNext[stage];
      if (stage === 'detail') {
        if(c.id) {
          const existing=await c.repository.case(c.id);
          if(noticePaid(existing)) { router.replace(c.href('/legal-notice/tracking')); return; }
          if(existing.status === 'draft') await c.repository.saveIntake(c.id,{tier:c.tier});
          c.go(destination); return;
        }
        const profile=await backend.accountProfile();
        const created = await c.repository.createCase({service_code:'legal_notice',tier:c.tier});
        await backend.request(`/notices/${created.id}/filing`,{intake_version:2,step:1,client:{fullName:profile.name,...(profile.email?{email:profile.email}:{}),...(profile.phone?{mobile:profile.phone}:{})},noticee:{methods:[]}},'PUT');
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
      } else if (stage === 'step6') {
        if (checkout.quote?.status !== 'ready' || checkout.quoteLoading) return;
        c.go(destination + '?quoteId=' + checkout.quote.id);
      }
      else await c.save(destination);
    }); },
  };
  return {model:api ? model : fixture, controller:c};
}
