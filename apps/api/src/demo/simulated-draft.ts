import type { NoticeDraftContent } from '@legalitt/shared';

/** §2.11 placeholder: the seeded advocate's draft when no person has written one.
 * Honest on its face, never passable as a real notice. */
export const simulatedDraft: NoticeDraftContent = {
  sender: '',
  recipient: '',
  subject: 'SIMULATED DRAFT',
  facts: 'No advocate wrote this draft. No real event occurred.',
  demand: '',
  closing: '',
};
