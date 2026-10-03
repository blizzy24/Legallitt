import { router } from 'expo-router';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Session = {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  /**
   * False until the onboarding carousel is completed. NOT PERSISTED — it resets on
   * reload, which keeps the flow reachable for review. A real build would store this.
   */
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  /** Clears the session and lands on the guest home. The app's only way out. */
  signOut: () => void;
};

const SessionContext = createContext<Session | null>(null);

// In-memory only: signing in does not survive a reload.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const value = useMemo<Session>(
    () => ({
      isLoggedIn,
      setLoggedIn,
      hasSeenOnboarding,
      setHasSeenOnboarding,
      // replace, not push: signing out should leave nothing to go back into.
      signOut: () => {
        setLoggedIn(false);
        router.replace('/(tabs)/home');
      },
    }),
    [isLoggedIn, hasSeenOnboarding]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside a SessionProvider');
  return session;
}
