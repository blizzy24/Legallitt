import type { ApiCase } from '@legalitt/shared';
import type { Href } from 'expo-router';

export const noticeParents: Record<string, string> = {
  detail: '/home', info: '/legal-notice', step3: '/legal-notice/step2',
  step2: '/legal-notice/step1', step1: '/legal-notice', demand: '/legal-notice/step3', step4: '/legal-notice/step3',
  'step4-review': '/legal-notice/step4', step5: '/legal-notice/step4-review', step6: '/legal-notice/step5',
  'scan-pay': '/legal-notice/step6', success: '/legal-notice/tracking',
  tracking: '/cases', delivery: '/legal-notice/tracking', chat: '/legal-notice/tracking', profile: '/legal-notice/tracking',
};
export const noticeFinishedIntake = new Set(['step1','step2','step3','demand','step4','step4-review','step5','step6','scan-pay']);
export const noticeNext: Record<string, string> = {
  detail: 'step1', step1: 'step2', step2: 'step3', step3: 'step4', demand: 'step4',
  step4: 'step4-review', 'step4-review': 'step5', step5: 'step6', step6: 'scan-pay',
};
export function noticeHref(path: string, caseId?: string): Href {
  const [base, search = ''] = path.split('?');
  const query = new URLSearchParams(search);
  if (caseId) query.set('caseId', caseId);
  return (base + (query.size ? '?' + query.toString() : '')) as Href;
}
export function noticePaid(record: ApiCase | null) {
  return Boolean(record && (record.events?.some(e => e.to_status === 'paid') ||
    ['paid','assigning','assigned','advocate_declined','advocate_accepted','in_progress','client_review','changes_requested','approved','dispatching','dispatched','completed','refunded'].includes(record.status)));
}
