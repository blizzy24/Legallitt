import { instructedCopy } from '../copy/instructed';
const copy = instructedCopy.navigationAvailability;
/** Project-owner instruction, 4 Nov 2026: gate unbuilt account sections rather
 * than presenting fixture records as the signed-in person's data. This registry
 * describes frontend data coverage, not API adapter/simulation flags. */
export type UnavailableSection = { title: string; body: string };
const unavailable = (title: string, body: string = copy.general): UnavailableSection => ({ title, body });
export function unavailableSection(name: string, params?: Readonly<Record<string, unknown>>): UnavailableSection | undefined {
  const route = name.replace(/^\((?:tabs|advocate)\)\//, '').replace(/\/index$/, '');
  if (route==='fir'||route.startsWith('fir/')||route.startsWith('advocate/fir/')) return undefined;
  if (route === 'clients' || route.startsWith('advocate/clients')) return unavailable('Clients', copy.clients);
  // D-36: wallet, withdrawals, transfer details, bank account and payout settings are API-backed.
  if (route === 'earnings' || route.startsWith('advocate/wallet') || /^advocate\/settings\/(bank|payout)/.test(route)) return undefined;
  if (route.startsWith('advocate/analytics')) return unavailable('Analytics');
  if (route === 'advocate/settings') return undefined;
  if (route.startsWith('advocate/settings/')) return unavailable('Account Settings', copy.settings);
  if (route === 'advocate/reviews') return unavailable('Reviews');
  if (route === 'advocate/availability' || route.startsWith('advocate/calendar')) return unavailable('Calendar & Availability');
  if (route.startsWith('advocate/verify/')) return undefined; // D-35: advocate verification is API-backed.
  if (route.startsWith('advocate/documents/')) return unavailable('Documents');
  if (route.startsWith('advocate/') && !route.startsWith('advocate/notice/') && route !== 'advocate/notifications') return unavailable('Advocate Workspace');
  if (route === 'advocates/[id]' && typeof params?.caseId === 'string' && params.caseId) return undefined;
  if (route.startsWith('advocates/')) return unavailable('Advocates', copy.advocates); // D-27: 'advocates' (Saved Advocates) is live
  // D-28: the Messages inbox, case conversations and support threads are API-backed.
  if (route === 'messages/[id]') return unavailable('Messages', copy.messages);
  // D-15–D-18: documents, payments, Edit Profile and Request Details are real (account area).
  // D-21–D-26: privacy, language, help and support routes are real.
  if (route.startsWith('hearings') || route === 'cases/[id]') return unavailable('Case Details');
  if (route.startsWith('courier/') && !(route === 'courier/self/details' && params?.noticeOutbound === '1')) return unavailable('Courier');
  const service = [['legal-advice','Legal Advice'],['fir','FIR Draft'],['property-search','Property Search'],['document-forensic','Document Forensic'],['services/high-court','High Court Representation'],['services/district-court','District Court Representation']].find(([prefix])=>route===prefix||route.startsWith(prefix+'/'));
  if (service) return unavailable(service[1], copy.service);
  return undefined;
}
