/**
 * D-03: support hours and response times are the client's operational promise.
 * Kept as drawn (designs 20, 21, 36; profile-21) and held here as configurable
 * text so they change in one place. Listed in DECISIONS.md §12 for confirmation.
 */
export const supportHours = {
  hours: 'Monday–Saturday, 9 AM–7 PM IST',
  ticketResponse: 'Our team responds within 2 business days.',
  callbackResponse: 'We’ll call you back within 24 hours.',
  chatResponse: 'Messages are answered during support hours.',
} as const;
