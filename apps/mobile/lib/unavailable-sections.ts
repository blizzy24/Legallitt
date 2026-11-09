import { instructedCopy } from '../copy/instructed';
const copy = instructedCopy.navigationAvailability;
/** Project-owner instruction, 4 Nov 2026: gate unbuilt account sections rather
 * than presenting fixture records as the signed-in person's data. This registry
 * describes frontend data coverage, not API adapter/simulation flags. */
export type UnavailableSection = { title: string; body: string };
const unavailable = (title: string, body: string = copy.general): UnavailableSection => ({ title, body });
const wallet = unavailable('Wallet & Earnings', copy.wallet);
export function unavailableSection(name: string, params?: Readonly<Record<string, unknown>>): UnavailableSection | undefined {
  const route = name.replace(/^\((?:tabs|advocate)\)\//, '').replace(/\/index$/, '');
  if (route==='fir'||route.startsWith('fir/')||route.startsWith('advocate/fir/')) return undefined;
  if (route === 'clients' || route.startsWith('advocate/clients')) return unavailable('Clients', copy.clients);
  if (route === 'earnings' || route.startsWith('advocate/wallet') || /^advocate\/settings\/(bank|payout)/.test(route)) return wallet;
  if (route.startsWith('advocate/analytics')) return unavailable('Analytics');
  if (route === 'advocate/settings') return undefined;
  if (route.startsWith('advocate/settings/')) return unavailable('Account Settings', copy.settings);
  if (route === 'advocate/reviews') return unavailable('Reviews');
  if (route === 'advocate/availability' || route.startsWith('advocate/calendar')) return unavailable('Calendar & Availability');
  if (route.startsWith('advocate/verify/')) return unavailable('Advocate Verification');
  if (route.startsWith('advocate/documents/')) return unavailable('Documents');
  if (route.startsWith('advocate/') && !route.startsWith('advocate/notice/') && route !== 'advocate/notifications') return unavailable('Advocate Workspace');
  if (route === 'advocates/[id]' && typeof params?.caseId === 'string' && params.caseId) return undefined;
  if (route === 'advocates' || route.startsWith('advocates/')) return unavailable('Advocates', copy.advocates);
  if (route === 'messages' || route.startsWith('messages/')) return unavailable('Messages', copy.messages);
  if (route === 'documents' || route.startsWith('documents/')) return unavailable('My Documents', copy.documents);
  if (route === 'payments') return unavailable('Payments', copy.payments);
  if (['profile/edit','privacy','language'].includes(route)) return unavailable('Account Settings', copy.settings);
  if (['help','support','support-chat','callback'].includes(route)) return unavailable('Support', copy.support);
  if (route.startsWith('hearings') || route === 'cases/[id]' || route === 'requests/[id]') return unavailable('Case Details');
  if (route.startsWith('courier/') && !(route === 'courier/self/details' && params?.noticeOutbound === '1')) return unavailable('Courier');
  const service = [['legal-advice','Legal Advice'],['fir','FIR Draft'],['property-search','Property Search'],['document-forensic','Document Forensic'],['services/high-court','High Court Representation'],['services/district-court','District Court Representation']].find(([prefix])=>route===prefix||route.startsWith(prefix+'/'));
  if (service) return unavailable(service[1], copy.service);
  return undefined;
}
