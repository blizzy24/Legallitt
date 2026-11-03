import { createContext, useContext, useMemo, useState, useCallback, useEffect, type ReactNode } from 'react';

import type { NoticeRelation, NoticeSalutation } from '@legalitt/shared';

import type { ServiceTier } from '../data/legalNotice';

// Fixture state for the Legal Notice wizard. The controller persists API data;
// both adapters validate entered steps before continuing.

type PartyDetails = {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
};
export type ClientDetails = PartyDetails & { age: string; salutation: NoticeSalutation | null;
  relation: NoticeRelation | null; relativeName: string };

export type NoticeeDetails = PartyDetails & {
  relationship: string;
};

export type IssueType =
  | 'property-dispute'
  | 'money-recovery'
  | 'tenant-issue'
  | 'family-dispute'
  | 'cheque-bounce'
  | 'consumer-complaint'
  | 'other';

export type LegalNoticeForm = {
  client: ClientDetails;
  noticee: NoticeeDetails;
  issueType: IssueType | null;
  subjectMatter: string;
  subjectLine: string;
  legalDemand: import('@legalitt/shared').LegalDemand;
  /** Chosen on the detail screen; drives the Service Fee on payment step 7. */
  tier: ServiceTier['id'];
  /** Document names the user has "uploaded" — placeholders until real uploads exist. */
  documents: string[];
};

const EMPTY_CLIENT: PartyDetails = { fullName: '', mobile: '', email: '', address: '' };

export const EMPTY_FORM: LegalNoticeForm = {
  client: {...EMPTY_CLIENT, age: '', salutation: null, relation: null, relativeName: ''},
  noticee: { ...EMPTY_CLIENT, relationship: '' },
  issueType: null,
  subjectMatter: '', subjectLine: '', legalDemand: {selected: [], custom: ''},
  // design/22 shows URGENT pre-selected.
  tier: 'urgent',
  documents: [],
};

type Ctx = {
  paid: boolean;
  setPaid: (paid: boolean) => void;
  form: LegalNoticeForm;
  update: (patch: Partial<LegalNoticeForm>) => void;
  updateClient: (patch: Partial<ClientDetails>) => void;
  updateNoticee: (patch: Partial<NoticeeDetails>) => void;
  reset: () => void;
};

const LegalNoticeContext = createContext<Ctx | null>(null);

export function LegalNoticeProvider({ children }: { children: ReactNode }) {
  // Keep fixture payment completion across browser history/reloads in this session.
  const [paid, setPaidState] = useState(() => {
    try { return globalThis.sessionStorage?.getItem('legalitt.notice.paid') === 'true'; }
    catch { return false; }
  });
  const setPaid = useCallback((value: boolean) => {
    setPaidState(value);
    try { globalThis.sessionStorage?.setItem('legalitt.notice.paid', String(value)); }
    catch { /* Native and restricted browsers retain the in-memory state. */ }
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const restore = () => {
      try { setPaidState(globalThis.sessionStorage?.getItem('legalitt.notice.paid') === 'true'); }
      catch { /* Storage may be unavailable. */ }
    };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);
  const [form, setForm] = useState<LegalNoticeForm>(EMPTY_FORM);

  const value = useMemo<Ctx>(
    () => ({
      form, paid, setPaid,
      update: (patch) => setForm((f) => ({ ...f, ...patch })),
      updateClient: (patch) => setForm((f) => ({ ...f, client: { ...f.client, ...patch } })),
      updateNoticee: (patch) => setForm((f) => ({ ...f, noticee: { ...f.noticee, ...patch } })),
      reset: () => { setForm(EMPTY_FORM); setPaid(false); },
    }),
    [form, paid, setPaid]
  );

  return <LegalNoticeContext.Provider value={value}>{children}</LegalNoticeContext.Provider>;
}

export function useLegalNotice() {
  const ctx = useContext(LegalNoticeContext);
  if (!ctx) throw new Error('useLegalNotice must be used inside a LegalNoticeProvider');
  return ctx;
}
