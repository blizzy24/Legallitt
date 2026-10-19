import { router } from 'expo-router';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Which side of the app the session is in. Chosen on app/(auth)/role.tsx and read by
 * app/index.tsx to pick a landing group. 'user' is the client app under (tabs);
 * 'lawyer' is the advocate app under (advocate).
 */
export type Role = 'user' | 'lawyer';

type Session = {
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  /** Null until a role is chosen. Not persisted, like the rest of this context. */
  role: Role | null;
  setRole: (value: Role) => void;
  /**
   * False until the onboarding carousel is completed. NOT PERSISTED — it resets on
   * reload, which keeps the flow reachable for review. A real build would store this.
   */
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  /**
   * Clears the session and the role, and returns to the login screen. The app's only
   * way out, and the only exit shared by both sides — it previously landed on the
   * CLIENT guest home, which dropped a signed-out advocate into the wrong app.
   */
  signOut: () => void;
};

const SessionContext = createContext<Session | null>(null);

// In-memory only: signing in does not survive a reload.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const value = useMemo<Session>(
    () => ({
      isLoggedIn,
      setLoggedIn,
      role,
      setRole,
      hasSeenOnboarding,
      setHasSeenOnboarding,
      // replace, not push: signing out should leave nothing to go back into.
      signOut: () => {
        setLoggedIn(false);
        setRole(null);
        router.replace('/(auth)/login');
      },
    }),
    [isLoggedIn, role, hasSeenOnboarding]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside a SessionProvider');
  return session;
}
