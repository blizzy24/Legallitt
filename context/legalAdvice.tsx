import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { LaConsultTypeId, LaExperienceId } from '../data/legalAdvice';

// Legal Advice flow state. In memory only: nothing is validated, booked or persisted.
//
// consultType and experience are deliberately INDEPENDENT. The designs price both
// axes and never say how they combine, so this context records each selection and
// derives no amount from either. See the pricing note in data/legalAdvice.ts.

export type LegalAdviceForm = {
  /** chat / audio / video. The landing and choose screens disagree on its price. */
  consultType: LaConsultTypeId;
  /** Advocate experience tier — a separate axis, not a modifier of the above. */
  experience: LaExperienceId | null;
  /** design/102 pre-selects the do-it-yourself path, as the other services do. */
  assisted: boolean;
  matter: string | null;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  concern: string;
  /** Chosen on the datetime screen (design/124). */
  date: string;
  time: string;
};

export const EMPTY_LA_FORM: LegalAdviceForm = {
  consultType: 'video',
  experience: null,
  assisted: false,
  matter: null,
  fullName: '',
  phone: '',
  email: '',
  city: '',
  concern: '',
  date: '',
  time: '',
};

type Ctx = {
  form: LegalAdviceForm;
  update: (patch: Partial<LegalAdviceForm>) => void;
  reset: () => void;
};

const LegalAdviceContext = createContext<Ctx | null>(null);

export function LegalAdviceProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<LegalAdviceForm>(EMPTY_LA_FORM);

  const value = useMemo<Ctx>(
    () => ({
      form,
      update: (patch) => setForm((f) => ({ ...f, ...patch })),
      reset: () => setForm(EMPTY_LA_FORM),
    }),
    [form],
  );

  return <LegalAdviceContext.Provider value={value}>{children}</LegalAdviceContext.Provider>;
}

export function useLegalAdvice(): Ctx {
  const ctx = useContext(LegalAdviceContext);
  if (!ctx) throw new Error('useLegalAdvice must be used inside LegalAdviceProvider');
  return ctx;
}
