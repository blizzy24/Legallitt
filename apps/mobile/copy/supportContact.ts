/** D-03: support response promises are the client's operational text, kept as
 * drawn (profile-21, design 36) in one place so they can change without a hunt.
 * Listed in DECISIONS §12 for confirmation. */
export const supportContactCopy = {
  ticketResponse: 'Submit your request below. Our support team typically responds within 2 business hours.',
  callbackResponse: 'Our team will review your request and contact you in 24 hours',
  chatResponse: 'A member of the Legalitt support team will reply here.',
  /** D-58: support attachments need case-independent storage that isn't built. */
  attachmentsUnavailable: 'Attachments aren’t available for support requests yet. Describe the issue here; if it concerns a case file, mention the case and file name.',
};
