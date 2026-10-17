import { router, type Href } from 'expo-router';
import { useSession } from './session';
import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';

// Session-scoped reuse of the existing preview KYC result. This is not an identity
// provider integration: a production verification result must come from the server.
// Never reuse the client's identity as an advocate's professional verification.

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
  returnTo: Href;
  begin: (returnTo: Href) => void;
};

const KycContext = createContext<Ctx | null>(null);

export function KycProvider({ children }: { children: ReactNode }) {
  const { role, isLoggedIn } = useSession();
  const [returnTo, setReturnTo] = useState<Href>('/legal-notice/step4-review');
  useEffect(() => { setKyc(EMPTY_KYC); }, [role, isLoggedIn]);
  const [kyc, setKyc] = useState<KycState>(EMPTY_KYC);

  const value: Ctx = {
      kyc,
      returnTo,
      begin: (destination) => { setReturnTo(destination); router.push('/kyc/choose'); },
      setMethod: (method) => setKyc((k) => ({ ...k, method })),
      complete: () => setKyc((k) => ({ ...k, completed: true })),
      reset: () => setKyc(EMPTY_KYC),
    };

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
  const ctx = useContext(KycContext);
  if (!ctx) throw new Error('useKyc must be used inside a KycProvider');
  return ctx;
}
