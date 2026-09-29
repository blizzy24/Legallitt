import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { PropertyTierId, PropertyTypeId, SearchDuration } from '../data/propertySearch';
import { RECOMMENDED_DURATION } from '../data/propertySearch';

// Property Search Report flow state. In memory only: nothing is validated, nothing
// is persisted and nothing is sent anywhere.

export type PropertyContact = {
  fullName: string;
  mobile: string;
  email: string;
};

export type PropertyJurisdiction = {
  state: string;
  district: string;
  ward: string;
  tehsil: string;
  colony: string;
};

export type PropertySearchForm = {
  contact: PropertyContact;
  jurisdiction: PropertyJurisdiction;
  propertyType: PropertyTypeId | null;
  surveyNo: string;
  duration: SearchDuration;
  /** Chosen on the landing screen; will drive the invoice once pricing is confirmed. */
  tier: PropertyTierId;
  /** design/72 pre-selects the do-it-yourself path. */
  assisted: boolean;
};

const EMPTY_JURISDICTION: PropertyJurisdiction = {
  state: '',
  district: '',
  ward: '',
  tehsil: '',
  colony: '',
};

export const EMPTY_PROPERTY_FORM: PropertySearchForm = {
  contact: { fullName: '', mobile: '', email: '' },
  jurisdiction: EMPTY_JURISDICTION,
  propertyType: null,
  surveyNo: '',
  duration: RECOMMENDED_DURATION,
  tier: 'ordinary',
  assisted: false,
};

type Ctx = {
  form: PropertySearchForm;
  update: (patch: Partial<PropertySearchForm>) => void;
  updateContact: (patch: Partial<PropertyContact>) => void;
  updateJurisdiction: (patch: Partial<PropertyJurisdiction>) => void;
  reset: () => void;
};

const PropertySearchContext = createContext<Ctx | null>(null);

export function PropertySearchProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<PropertySearchForm>(EMPTY_PROPERTY_FORM);

  const value = useMemo<Ctx>(
    () => ({
      form,
      update: (patch) => setForm((f) => ({ ...f, ...patch })),
      updateContact: (patch) => setForm((f) => ({ ...f, contact: { ...f.contact, ...patch } })),
      updateJurisdiction: (patch) =>
        setForm((f) => ({ ...f, jurisdiction: { ...f.jurisdiction, ...patch } })),
      reset: () => setForm(EMPTY_PROPERTY_FORM),
    }),
    [form]
  );

  return <PropertySearchContext.Provider value={value}>{children}</PropertySearchContext.Provider>;
}

export function usePropertySearch() {
  const ctx = useContext(PropertySearchContext);
  if (!ctx) throw new Error('usePropertySearch must be used inside a PropertySearchProvider');
  return ctx;
}
