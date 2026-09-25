import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { ServiceTier } from '../data/legalNotice';

// Form state for the Legal Notice wizard. Plain object, in memory only: nothing is
// validated and nothing survives a reload.

export type ClientDetails = {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
};

export type NoticeeDetails = ClientDetails & {
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
  /** Chosen on the detail screen; drives the Service Fee on step 6. */
  tier: ServiceTier['id'];
  /** Document names the user has "uploaded" — placeholders until real uploads exist. */
  documents: string[];
};

const EMPTY_CLIENT: ClientDetails = { fullName: '', mobile: '', email: '', address: '' };

export const EMPTY_FORM: LegalNoticeForm = {
  client: EMPTY_CLIENT,
  noticee: { ...EMPTY_CLIENT, relationship: '' },
  issueType: null,
  // design/22 shows URGENT pre-selected.
  tier: 'urgent',
  documents: [],
};

type Ctx = {
  form: LegalNoticeForm;
  update: (patch: Partial<LegalNoticeForm>) => void;
  updateClient: (patch: Partial<ClientDetails>) => void;
  updateNoticee: (patch: Partial<NoticeeDetails>) => void;
  reset: () => void;
};

const LegalNoticeContext = createContext<Ctx | null>(null);

export function LegalNoticeProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<LegalNoticeForm>(EMPTY_FORM);

  const value = useMemo<Ctx>(
    () => ({
      form,
      update: (patch) => setForm((f) => ({ ...f, ...patch })),
      updateClient: (patch) => setForm((f) => ({ ...f, client: { ...f.client, ...patch } })),
      updateNoticee: (patch) => setForm((f) => ({ ...f, noticee: { ...f.noticee, ...patch } })),
      reset: () => setForm(EMPTY_FORM),
    }),
    [form]
  );

  return <LegalNoticeContext.Provider value={value}>{children}</LegalNoticeContext.Provider>;
}

export function useLegalNotice() {
  const ctx = useContext(LegalNoticeContext);
  if (!ctx) throw new Error('useLegalNotice must be used inside a LegalNoticeProvider');
  return ctx;
}
