import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Session = {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
};

const SessionContext = createContext<Session | null>(null);

// In-memory only: signing in does not survive a reload.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const value = useMemo(() => ({ isLoggedIn, setLoggedIn }), [isLoggedIn]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside a SessionProvider');
  return session;
}
