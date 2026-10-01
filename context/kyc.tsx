import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// KYC sub-flow state (design/92-99). In memory only; nothing is verified and no
// identity document is ever read or stored.
//
// REPORTED — design/91 removed the Aadhaar Card UPLOAD row and replaced it with this
// flow. Identity now goes through DigiLocker or a video check rather than a document
// the user hands over, which changes what the app would hold: a verification result
// rather than a copy of an ID. The review screen (design/39) still lists an Aadhaar
// Card document, so the two screens disagree.

export type KycMethod = 'digilocker' | 'video';

export type KycState = {
  /** design/92 pre-selects DigiLocker. */
  method: KycMethod;
  completed: boolean;
};

export const EMPTY_KYC: KycState = { method: 'digilocker', completed: false };

type Ctx = {
  kyc: KycState;
  setMethod: (method: KycMethod) => void;
  complete: () => void;
  reset: () => void;
};

const KycContext = createContext<Ctx | null>(null);

export function KycProvider({ children }: { children: ReactNode }) {
  const [kyc, setKyc] = useState<KycState>(EMPTY_KYC);

  const value = useMemo<Ctx>(
    () => ({
      kyc,
      setMethod: (method) => setKyc((k) => ({ ...k, method })),
      complete: () => setKyc((k) => ({ ...k, completed: true })),
      reset: () => setKyc(EMPTY_KYC),
    }),
    [kyc]
  );

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
  const ctx = useContext(KycContext);
  if (!ctx) throw new Error('useKyc must be used inside a KycProvider');
  return ctx;
}
