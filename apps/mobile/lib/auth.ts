import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
export type AuthUser = {
  id: string;
  role: "client" | "advocate" | "admin";
  name: string;
  email: string | null;
  phone: string | null;
};
export type Tokens = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};
export type AuthResult = { user: AuthUser; tokens: Tokens };
export const SESSION_KEY = "legalitt.auth.tokens";
export async function api<T>(
  path: string,
  body?: unknown,
  token?: string,
  method?: string,
): Promise<T> {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) throw new Error("Sign-in service is not configured");
  const response = await fetch(`${base.replace(/\/$/, "")}/api/v1${path}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const value = await response.json();
  if (!response.ok)
    throw new Error(
      typeof value.message === "string" ? value.message : "Request failed",
    );
  return value as T;
}
export async function storedTokens(): Promise<Tokens | null> {
  const value =
    Platform.OS === "web"
      ? globalThis.sessionStorage?.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;
  // Native storage contains only the refresh credential, avoiding a multi-KB
  // JSON bundle that some Keychain versions reject. Identity is reverified.
  if (Platform.OS !== "web") {
    return (await api<AuthResult>("/auth/refresh", { refreshToken: value }))
      .tokens;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
export async function storeTokens(tokens: Tokens | null) {
  if (Platform.OS === "web") {
    if (tokens)
      globalThis.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(tokens));
    else globalThis.sessionStorage?.removeItem(SESSION_KEY);
  } else if (tokens) {
    if (!tokens.refreshToken) throw new Error("Refresh token is required");
    await SecureStore.setItemAsync(SESSION_KEY, tokens.refreshToken);
  } else await SecureStore.deleteItemAsync(SESSION_KEY);
}
