import type { LegalNoticeMatterType } from '@legalitt/shared';

// Values selected on 26 and printed on 440; these are not copy substitutions.
// Money Recovery is printed as “Recovery” on 440. Other labels follow 26.
const labels: Record<LegalNoticeMatterType, string> = {
  property_dispute: 'Property Dispute', money_recovery: 'Recovery',
  tenant_issue: 'Tenant Issue', family_dispute: 'Family Dispute',
  cheque_bounce: 'Cheque Bounce', consumer_complaint: 'Consumer Complaint', other: '',
};
// The option names drawn on 26, shown back as the Notice Type on 31/32/437.
const intakeLabels: Record<LegalNoticeMatterType, string> = {...labels, money_recovery: 'Money Recovery'};
export function noticeMatter(matterType: LegalNoticeMatterType | null) {
  const label = matterType ? labels[matterType] : '';
  return {
    label,
    // §9.2 fallback: never print "other"; an unset or Any-other matter reads Legal Notice.
    noticeType: (matterType && intakeLabels[matterType]) || 'Legal Notice',
    title: label ? `Legal Notice for ${label}` : 'Legal Notice',
    dispatch: `Your official ${label ? label.toLowerCase() : 'legal'} notice is dispatched via priority legal courier.`,
  };
}
