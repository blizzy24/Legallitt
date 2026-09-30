import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { DfDocTypeId, DfTierId } from '../data/documentForensic';

// Document Forensic flow state. In memory only: nothing is validated, uploaded or
// persisted, and no file ever leaves the device.

export type DocumentForensicForm = {
  /** Chosen on the landing screen; drives the fee shown in its footer bar. */
  tier: DfTierId;
  /** design/82 pre-selects the do-it-yourself path. */
  assisted: boolean;
  docType: DfDocTypeId | null;
  /** Placeholder file names — there is no real upload. */
  documentName: string;
  referenceName: string;
  instructions: string;
};

export const EMPTY_DF_FORM: DocumentForensicForm = {
  tier: 'ordinary',
  assisted: false,
  docType: null,
  documentName: '',
  referenceName: '',
  instructions: '',
};

type Ctx = {
  form: DocumentForensicForm;
  update: (patch: Partial<DocumentForensicForm>) => void;
  reset: () => void;
};

const DocumentForensicContext = createContext<Ctx | null>(null);

export function DocumentForensicProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<DocumentForensicForm>(EMPTY_DF_FORM);

  const value = useMemo<Ctx>(
    () => ({
      form,
      update: (patch) => setForm((f) => ({ ...f, ...patch })),
      reset: () => setForm(EMPTY_DF_FORM),
    }),
    [form]
  );

  return (
    <DocumentForensicContext.Provider value={value}>{children}</DocumentForensicContext.Provider>
  );
}

export function useDocumentForensic() {
  const ctx = useContext(DocumentForensicContext);
  if (!ctx) throw new Error('useDocumentForensic must be used inside a DocumentForensicProvider');
  return ctx;
}
