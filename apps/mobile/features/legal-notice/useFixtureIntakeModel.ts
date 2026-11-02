import { router, type Href } from 'expo-router';
import { useLegalNotice } from '../../context/legalNotice';
import { INVOICE, SERVICE_TIERS, invoiceLines } from '../../data/legalNotice';
import { noticeHref, noticeParents, noticeNext } from './navigation';
import { useState } from 'react';
import { SIMULATED_NOTICE_SUBJECT, SIMULATED_NOTICE_DEMANDS } from '@legalitt/shared';
import { validateNoticeStep } from './intake-validation';
import type { NoticeIntakeModel } from './screen-model';

// Design/27's example data belongs to the fixture adapter, never to a real case.
export const fixtureSummary = {
  client: 'Suresh Kumar', noticeType: 'Property Notice',
  noticee: ['Rahul Kumar', 'Brother', 'Indore, Madhya Pradesh'],
  summary: 'My brother is refusing to give my share in ancestral Property.', documents: 3,
};
export function useFixtureIntakeModel(stage: string): NoticeIntakeModel {
  const state = useLegalNotice();
  const [error, setError] = useState('');
  return { ...state, back: () => router.replace(noticeHref(noticeParents[stage] ?? "/legal-notice/tracking")), tiers: SERVICE_TIERS, invoice: INVOICE,
    error, demandOptions: [...SIMULATED_NOTICE_DEMANDS], generateDemands: () => {},
    invoiceLines: invoiceLines(state.form.tier), summary: {...fixtureSummary, summary: state.form.subjectMatter || fixtureSummary.summary},
    continue: () => { try {
      setError(''); validateNoticeStep(stage, state.form);
      if (stage === "detail") state.setPaid(false);
      if (stage === 'step3') state.update({subjectLine: SIMULATED_NOTICE_SUBJECT});
      router.push(`/legal-notice/${noticeNext[stage]}` as Href);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not continue'); } },
    navigate: (path) => router.push(path as Href),
  };
}
