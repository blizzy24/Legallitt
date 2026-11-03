/** Approved — project owner, 3 November 2026 (architecture §9.2).
 * API-owned client copy: provider diagnostics belong in logs and case events.
 * Subject lines have no manual input; only demands offer a custom alternative. */
export const noticeAiFailureCopy = {
  subject: 'Couldn’t generate the subject just now. Please try again.',
  demands: 'Couldn’t generate suggestions just now. Try again, or type your own.',
} as const;
