import { router } from "expo-router";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  storedTokens,
  storeTokens,
  type AuthResult,
  type AuthUser,
  type Tokens,
} from "../lib/auth";
export type Role = "user" | "lawyer";
type Pending =
  | { kind: "email"; email: string; password: string }
  | { kind: "phone"; phone: string };
type Session = {
  isLoggedIn: boolean;
  ready: boolean;
  role: Role | null;
  user: AuthUser | null;
  registrationRole: Role | null;
  setRegistrationRole: (role: Role) => void;
  pending: Pending | null;
  setPending: (pending: Pending | null) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  accept: (result: AuthResult) => Promise<void>;
  signOut: () => void;
};
const Context = createContext<Session | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<Role | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const accept = async (result: AuthResult) => {
    if (result.user.role === "admin")
      throw new Error("Admin screens are not available");
    await storeTokens(result.tokens);
    setUser(result.user);
    setHasSeenOnboarding(true);
    setPending(null);
  };
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const tokens = await storedTokens();
        if (!tokens) return;
        let result: AuthResult;
        try {
          result = {
            tokens,
            user: await api<AuthUser>("/me", undefined, tokens.idToken),
          };
        } catch {
          if (!tokens.refreshToken) throw new Error("Session expired");
          result = await api<AuthResult>("/auth/refresh", {
            refreshToken: tokens.refreshToken,
          });
        }
        if (alive) await accept(result);
      } catch {
        await storeTokens(null);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const value = useMemo<Session>(
    () => ({
      isLoggedIn: !!user,
      ready,
      user,
      role:
        user?.role === "advocate"
          ? "lawyer"
          : user?.role === "client"
            ? "user"
            : null,
      registrationRole,
      setRegistrationRole,
      pending,
      setPending,
      hasSeenOnboarding,
      setHasSeenOnboarding,
      accept,
      signOut: () => {
        setUser(null);
        setPending(null);
        void storeTokens(null);
        router.replace("/(auth)/login");
      },
    }),
    [user, ready, registrationRole, pending, hasSeenOnboarding],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error("SessionProvider required");
  return context;
}
