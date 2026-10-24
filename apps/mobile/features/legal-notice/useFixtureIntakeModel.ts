import { router, type Href } from 'expo-router';
import { useLegalNotice } from '../../context/legalNotice';
import { INVOICE, SERVICE_TIERS, invoiceLines } from '../../data/legalNotice';
import type { NoticeIntakeModel } from './screen-model';

const next: Record<string, string> = {
  detail: 'step1', step1: 'step2', step2: 'step3', step3: 'step4',
  step4: 'step4-review', 'step4-review': 'step5', step5: 'step6', step6: 'scan-pay',
};
// Design/27's example data belongs to the fixture adapter, never to a real case.
export const fixtureSummary = {
  client: 'Suresh Kumar', noticeType: 'Property Notice',
  noticee: ['Rahul Kumar', 'Brother', 'Indore, Madhya Pradesh'],
  summary: 'My brother is refusing to give my share in ancestral Property.', documents: 3,
};
export function useFixtureIntakeModel(stage: string): NoticeIntakeModel {
  const state = useLegalNotice();
  return { ...state, tiers: SERVICE_TIERS, invoice: INVOICE,
    invoiceLines: invoiceLines(state.form.tier), summary: fixtureSummary,
    continue: () => router.push(`/legal-notice/${next[stage]}` as Href),
    navigate: (path) => router.push(path as Href),
  };
}
