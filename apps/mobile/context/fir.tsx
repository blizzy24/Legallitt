import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { IncidentType } from '../data/fir';

// Form state for the FIR Draft flow. Plain object, in memory only: nothing is
// validated and nothing survives a reload. Same pattern as context/legalNotice.tsx.

export type FirContact = {
  fullName: string;
  mobile: string;
  email: string;
};

export type FirJurisdiction = {
  state: string;
  district: string;
  policeStation: string;
};

export type FirIncident = {
  type: IncidentType | null;
  date: string;
  time: string;
  location: string;
  description: string;
};

export type FirForm = {
  contact: FirContact;
  jurisdiction: FirJurisdiction;
  incident: FirIncident;
  /** Names of the people involved — placeholders until real entry exists. */
  people: string[];
  /** Document names the user has "uploaded" — placeholders until real uploads exist. */
  documents: string[];
};

const EMPTY_CONTACT: FirContact = { fullName: '', mobile: '', email: '' };
const EMPTY_JURISDICTION: FirJurisdiction = { state: '', district: '', policeStation: '' };
const EMPTY_INCIDENT: FirIncident = { type: null, date: '', time: '', location: '', description: '' };

export const EMPTY_FIR_FORM: FirForm = {
  contact: EMPTY_CONTACT,
  jurisdiction: EMPTY_JURISDICTION,
  incident: EMPTY_INCIDENT,
  people: [],
  documents: [],
};

type Ctx = {
  form: FirForm;
  update: (patch: Partial<FirForm>) => void;
  updateContact: (patch: Partial<FirContact>) => void;
  updateJurisdiction: (patch: Partial<FirJurisdiction>) => void;
  updateIncident: (patch: Partial<FirIncident>) => void;
  reset: () => void;
};

const FirContext = createContext<Ctx | null>(null);

export function FirProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<FirForm>(EMPTY_FIR_FORM);

  const value = useMemo<Ctx>(
    () => ({
      form,
      update: (patch) => setForm((f) => ({ ...f, ...patch })),
      updateContact: (patch) => setForm((f) => ({ ...f, contact: { ...f.contact, ...patch } })),
      updateJurisdiction: (patch) => setForm((f) => ({ ...f, jurisdiction: { ...f.jurisdiction, ...patch } })),
      updateIncident: (patch) => setForm((f) => ({ ...f, incident: { ...f.incident, ...patch } })),
      reset: () => setForm(EMPTY_FIR_FORM),
    }),
    [form]
  );

  return <FirContext.Provider value={value}>{children}</FirContext.Provider>;
}

export function useFir() {
  const ctx = useContext(FirContext);
  if (!ctx) throw new Error('useFir must be used inside a FirProvider');
  return ctx;
}
