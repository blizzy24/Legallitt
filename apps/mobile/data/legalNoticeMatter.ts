import type { LegalNoticeMatterType } from '@legalitt/shared';

// Values selected on 26 and printed on 440; these are not copy substitutions.
// Money Recovery is printed as “Recovery” on 440. Other labels follow 26.
const labels: Record<LegalNoticeMatterType, string> = {
  property_dispute: 'Property Dispute', money_recovery: 'Recovery',
  tenant_issue: 'Tenant Issue', family_dispute: 'Family Dispute',
  cheque_bounce: 'Cheque Bounce', consumer_complaint: 'Consumer Complaint', other: '',
};
export function noticeMatter(matterType: LegalNoticeMatterType | null) {
  const label = matterType ? labels[matterType] : '';
  return {
    label,
    title: label ? `Legal Notice for ${label}` : 'Legal Notice',
    dispatch: `Your official ${label ? label.toLowerCase() : 'legal'} notice is dispatched via priority legal courier.`,
  };
}
