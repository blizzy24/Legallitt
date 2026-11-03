import { ApiError } from "@legalitt/shared";
import { DATA_SOURCE } from "../lib/data-source";
import { router, type Href } from "expo-router";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
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
import { fixtureUser, readFixtureRole, storeFixtureRole, type FixtureRole } from "../lib/fixture-session";
import { afterSignIn, authDestination, destinationRole } from "../lib/auth-destination";
import { readEntry, writeEntry } from "../lib/entry-storage";
export type Role = "user" | "lawyer";
type Pending =
  | { kind: "email"; email: string; password: string }
  | { kind: "phone"; phone: string; role: "client" | "advocate" };
type Session = {
  isLoggedIn: boolean;
  ready: boolean;
  sessionError: string | null;
  retrySession: () => void;
  role: Role | null;
  user: AuthUser | null;
  registrationRole: Role | null;
  setRegistrationRole: (role: Role) => void;
  pending: Pending | null;
  setPending: (pending: Pending | null) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  returnTo: string | null;
  openAuthenticatedRoute: (destination: string) => void;
  finishSignIn: () => void;
  cancelSignIn: () => void;
  acceptFixture: (role: FixtureRole) => Promise<void>;
  accept: (result: AuthResult) => Promise<void>;
  signOut: () => void;
};
const Context = createContext<Session | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [registrationRole, updateRegistrationRole] = useState<Role | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [hasSeenOnboarding, updateHasSeenOnboarding] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [resumeRequested, setResumeRequested] = useState(false);
  const setRegistrationRole = (role: Role) => {
    updateRegistrationRole(role);
    void writeEntry('role', role);
  };
  const setHasSeenOnboarding = (value: boolean) => {
    updateHasSeenOnboarding(value);
    void writeEntry('onboarding', value ? 'true' : null);
  };
  const rememberDestination = (destination: string | null) => {
    setReturnTo(destination);
    void writeEntry('destination', destination);
  };
  const accept = async (result: AuthResult) => {
    if (result.user.role === "admin")
      throw new Error("Admin screens are not available");
    await storeTokens(result.tokens);
    setUser(result.user);
    setRegistrationRole(result.user.role === 'advocate' ? 'lawyer' : 'user');
    setHasSeenOnboarding(true);
    setPending(null);
  };
  const acceptFixture = async (role: FixtureRole) => {
    await storeFixtureRole(role);
    setUser(fixtureUser(role));
    setRegistrationRole(role === 'advocate' ? 'lawyer' : 'user');
    setHasSeenOnboarding(true);
    setPending(null);
  };
  useEffect(() => {
    let alive = true;
    setSessionError(null);
    setReady(false);
    (async () => {
      try {
        const [seen, chosenRole, savedDestination] = await Promise.all([
          readEntry('onboarding'), readEntry('role'), readEntry('destination'),
        ]);
        // Capture the incoming URL before Stack.Protected redirects a guest to
        // index. This also handles a fresh tab with no onboarding history.
        const initialUrl = Platform.OS === 'web'
          ? globalThis.location.pathname + globalThis.location.search + globalThis.location.hash
          : await Linking.getInitialURL();
        const initialPath = Platform.OS === 'web' ? initialUrl : initialUrl
          ? `/${(Linking.parse(initialUrl).path ?? '').replace(/^--\//, '')}${initialUrl.includes('?') ? initialUrl.slice(initialUrl.indexOf('?')) : ''}`
          : null;
        if (!alive) return;
        updateHasSeenOnboarding(seen === 'true');
        const destination = authDestination(initialPath) ?? authDestination(savedDestination);
        rememberDestination(destination);
        const entryRole = destination ? destinationRole(destination)
          : initialPath?.split(/[?#]/)[0] === '/home' || initialPath?.split(/[?#]/)[0] === '/services' ? 'user'
          : chosenRole === 'user' || chosenRole === 'lawyer' ? chosenRole : null;
        if (entryRole) setRegistrationRole(entryRole);
        if (DATA_SOURCE === "fixtures") {
          const role = await readFixtureRole();
          if (role && alive) await acceptFixture(role);
          return;
        }
        const tokens = await storedTokens();
        if (!tokens) return;
        const identity = await api<AuthUser>("/me");
        // The shared client may have refreshed while reading /me. Do not
        // overwrite its fresh credentials with the original stored snapshot.
        const result = {
          user: identity,
          tokens: (await storedTokens()) ?? tokens,
        };
        if (alive) await accept(result);
      } catch (error) {
        if (
          DATA_SOURCE === "api" &&
          error instanceof ApiError &&
          (error.status === 0 || error.status >= 500)
        ) {
          if (alive) setSessionError(error.message);
        } else await storeTokens(null);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [attempt]);
  // Navigate after the authenticated render has enabled Stack.Protected. Calling
  // push before that render can be swallowed just like a signed-out card tap.
  useEffect(() => {
    if (!resumeRequested || !user) return;
    const destination = afterSignIn(returnTo, user.role === 'advocate' ? 'lawyer' : 'user');
    rememberDestination(null);
    setResumeRequested(false);
    router.replace(destination as Href);
  }, [resumeRequested, user, returnTo]);
  const value = useMemo<Session>(
    () => ({
      isLoggedIn: !!user,
      ready,
      sessionError,
      retrySession: () => setAttempt((value) => value + 1),
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
      returnTo,
      openAuthenticatedRoute: (destination) => {
        const target = authDestination(destination);
        if (!target) return;
        if (user) { router.push(target as Href); return; }
        rememberDestination(target);
        setRegistrationRole(destinationRole(target));
        router.push('/(auth)/login');
      },
      finishSignIn: () => setResumeRequested(true),
      cancelSignIn: () => {
        rememberDestination(null);
        setPending(null);
        router.replace(registrationRole === 'user' ? '/(tabs)/home' : '/(auth)/role');
      },
      accept,
      acceptFixture,
      signOut: () => {
        setUser(null);
        setPending(null);
        rememberDestination(null);
        setResumeRequested(false);
        void (DATA_SOURCE === "fixtures" ? storeFixtureRole(null) : storeTokens(null));
        router.replace("/(auth)/login");
      },
    }),
    [user, ready, registrationRole, pending, hasSeenOnboarding, sessionError, returnTo],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error("SessionProvider required");
  return context;
}
