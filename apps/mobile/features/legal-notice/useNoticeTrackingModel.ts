import { Linking } from 'react-native';
import { router, type Href } from 'expo-router';
import { noticeMatterType } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { INVOICE, TRACKING, TRACKING_STEPS, invoiceLines, invoiceTotal, tierFor } from '../../data/legalNotice';
import { LEGAL_NOTICE_ADVOCATE } from '../../data/advocates';
import { calendarDate, clockTime } from '../../data/cases';
import { noticeMatter } from '../../data/legalNoticeMatter';
import { useIntakeModel } from './useIntakeModel';
import type { NoticeTrackingModel, NoticeTrackingStage } from '../../components/NoticeTrackingScreen';

// Which of design 437's states the case is in (docs/CHUNK-1-TRACKING.md).
function stageFor(status: string | undefined): NoticeTrackingStage {
  if (status === 'client_review') return 'review';
  if (status === 'approved') return 'approved';
  if (status === 'dispatching' || status === 'dispatched' || status === 'completed') return 'dispatched';
  return 'drafting';
}
// Timeline ticks follow the lifecycle events behind the status: how many of the
// seven drawn steps have happened.
function tickedFor(status: string | undefined): number {
  switch (status) {
    case 'completed': return 7;
    case 'approved': case 'dispatching': case 'dispatched': return 5;
    case 'client_review': return 4;
    case 'assigned': case 'advocate_accepted': case 'in_progress': case 'changes_requested': return 3;
    case 'paid': case 'assigning': case 'advocate_declined': return 2;
    case 'submitted': case 'payment_pending': return 1;
    default: return 0;
  }
}

/** Design 437's data. The fixture demo has no lifecycle, so its route names the state. */
export function useNoticeTrackingModel(fixtureStage: 'drafting' | 'review' = 'drafting'): NoticeTrackingModel {
  const { model, controller: c } = useIntakeModel('tracking');
  const api = DATA_SOURCE === 'api';
  const record = c.record;
  const status = record?.status;
  const submitted = record?.events?.find(e => e.to_status === 'submitted')?.created_at ?? '';
  const notice = record?.documents?.find(d => d.kind === 'legal_notice');
  const name = record?.advocate?.full_name ?? '';
  const profile = record?.advocate?.profile ?? null;
  // A decision tapped before the first poll lands still acts on the sent draft.
  const latestDraft = async () => c.latest ?? (c.id ? (await c.repository.case(c.id)).drafts?.at(-1) : undefined);
  // Assigned, not a conditional expression: the typed-route union is too wide for one.
  const go = (path: string) => { let href: Href; if (api) href = c.href(path); else href = path as Href; router.push(href); };
  if (!api) {
    return {
      stage: fixtureStage, requestId: INVOICE.requestId, ref: TRACKING.ref,
      noticeType: noticeMatter(noticeMatterType(model.form.issueType ?? undefined)).noticeType,
      tier: tierFor(model.form.tier), submittedOn: TRACKING.submittedOn, submittedAt: TRACKING.submittedAt,
      estimate: TRACKING.estimate, steps: TRACKING_STEPS,
      // 437 draws Drafting in Progress as the active step; the review state is one on.
      ticked: fixtureStage === 'drafting' ? 3 : 4, stepActive: true,
      advocate: { id: LEGAL_NOTICE_ADVOCATE.id, ...TRACKING.advocate, rating: String(TRACKING.advocate.rating), reviews: String(TRACKING.advocate.reviews), verified: true },
      paidAmount: invoiceTotal(invoiceLines(model.form.tier)), draftFile: TRACKING.draftFile, allowDemoAdvance: true,
      onViewDraft: () => go(`/documents/file?name=${TRACKING.draftFile}`),
      onApprove: () => go('/legal-notice/delivery'),
      onRequestChanges: comment => { router.push({ pathname: '/chat/advocate', params: { message: comment } } as Href); },
      onViewProfile: () => go(`/advocates/${LEGAL_NOTICE_ADVOCATE.id}`),
      onChat: () => go('/chat/advocate'),
      onDelivery: () => go('/legal-notice/delivery'),
    };
  }
  return {
    stage: stageFor(status), requestId: record?.reference ?? '', ref: record?.reference ?? '',
    noticeType: noticeMatter(record?.matter_type ?? null).noticeType, tier: tierFor(c.tier),
    // The event is a timestamp; the screen's date formatter takes a calendar date.
    submittedOn: submitted ? calendarDate(submitted) : '', submittedAt: submitted ? clockTime(submitted) : '',
    estimate: { date: '', time: '' }, steps: TRACKING_STEPS,
    ticked: tickedFor(status),
    // Approved but not yet shipped: no drawn step describes the case, so none is active.
    stepActive: status !== 'approved' && status !== 'dispatching',
    // The advocate's own profile, bound into 437's drawn formats; a missing fact
    // leaves its element out (no star, number or brackets for an unrated advocate).
    advocate: name ? { id: record?.advocate_id ?? '', name, initials: name.replace(/^Adv\.?\s+/i, '').split(/\s+/).map(v => v[0] ?? '').join('').slice(0, 2),
      experience: profile?.years_experience ? `${profile.years_experience}+ Years Experience` : '',
      practice: profile?.practice_areas.join(', ') ?? '', barReg: profile?.bar_council_number ?? '',
      rating: profile?.rating_avg ?? '', reviews: profile?.rating_count ? String(profile.rating_count) : '',
      verified: profile?.verification === 'approved' } : null,
    paidAmount: model.invoiceLines.length ? invoiceTotal(model.invoiceLines) : null,
    draftFile: notice?.filename ?? '', allowDemoAdvance: false,
    onViewDraft: () => { void c.run(async () => { if (notice) await Linking.openURL((await c.repository.documentUrl(notice.id)).url); }); },
    onApprove: () => { void c.run(async () => { const draft = await latestDraft(); if (c.id && draft) { await c.repository.approve(c.id, draft.id); await c.load(); } }); },
    onRequestChanges: comment => { void c.run(async () => { const draft = await latestDraft(); if (c.id && draft) { await c.repository.requestChanges(c.id, draft.id, comment); await c.load(); } }); },
    onViewProfile: () => { if (record?.advocate_id) go(`/advocates/${record.advocate_id}`); },
    onChat: () => go('/chat/advocate'),
    onDelivery: () => go('/legal-notice/delivery'),
  };
}
