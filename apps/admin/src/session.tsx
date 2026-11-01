import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiClient, ApiError, type ApiTokens, type ApiUser, type ApiAuthResult } from '@legalitt/shared';

const KEY = 'legalitt.admin.tokens';
function readTokens(): ApiTokens | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    return value && typeof value.idToken === 'string' && typeof value.accessToken === 'string' ? value : null;
  } catch { return null; }
}
async function storeTokens(tokens: ApiTokens | null) {
  if (tokens) sessionStorage.setItem(KEY, JSON.stringify(tokens));
  else sessionStorage.removeItem(KEY);
}
export const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL || window.location.origin,
  getTokens: async () => readTokens(), setTokens: storeTokens,
});
const refusal = (role: string) => `Admin access required. This account is a ${role}. Sign in with an admin account.`;
type Session = {user: ApiUser | null; loading: boolean; error: string; login(email: string, password: string): Promise<void>; logout(): void; refuse(message: string): void};
const Context = createContext<Session | null>(null);
export function SessionProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refuse = (message: string) => { void storeTokens(null); setUser(null); setError(message); };
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!readTokens()) return;
      try {
        const identity = await api.request<ApiUser>('/me');
        if (!alive) return;
        if (identity.role !== 'admin') refuse(refusal(identity.role));
        else setUser(identity);
      } catch (e) {
        if (alive) refuse(e instanceof Error ? e.message : 'Unable to verify your session');
      }
    })().finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, []);
  const login = async (email: string, password: string) => {
    setError('');
    const result = await api.request<ApiAuthResult>('/auth/login', {email: email.trim(), password});
    if (result.user.role !== 'admin') {
      const message = refusal(result.user.role);
      refuse(message);
      throw new ApiError(message, 403);
    }
    await storeTokens({...result.tokens, expiresAt: Date.now() + result.tokens.expiresIn * 1000});
    setUser(result.user);
  };
  return <Context.Provider value={{user, loading, error, login, refuse, logout: () => {void storeTokens(null); setUser(null); setError('');}}}>{children}</Context.Provider>;
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error('SessionProvider required');
  return value;
}
