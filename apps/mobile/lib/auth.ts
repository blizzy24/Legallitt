import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  ApiClient,
  type ApiUser,
  type ApiTokens,
  type ApiAuthResult,
} from "@legalitt/shared";
export type AuthUser = ApiUser;
export type Tokens = ApiTokens;
export type AuthResult = ApiAuthResult;
export const SESSION_KEY = "legalitt.auth.tokens";
let memory: Tokens | null = null;
let tokensLoaded = false;
export const backend = new ApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "",
  getTokens: async () => (tokensLoaded ? memory : storedTokens()),
  setTokens: storeTokens,
});
// Existing auth screens use this adapter; transport, timeout/error handling and
// refresh are centralized in packages/shared, not hand-written fetch calls.
export function api<T>(
  path: string,
  body?: unknown,
  token?: string,
  method?: string,
) {
  return backend.request<T>(
    path,
    body,
    method ?? (body === undefined ? "GET" : "POST"),
    token,
  );
}
export async function storedTokens(): Promise<Tokens | null> {
  if (tokensLoaded) return memory;
  const value =
    Platform.OS === "web"
      ? globalThis.sessionStorage?.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) {
    tokensLoaded = true;
    return null;
  }
  // Native storage contains only the refresh credential, avoiding a multi-KB
  // JSON bundle that some Keychain versions reject. Identity is reverified.
  if (Platform.OS !== "web") {
    const result = await api<AuthResult>("/auth/refresh", {
      refreshToken: value,
    });
    await storeTokens(result.tokens);
    return memory;
  }
  try {
    memory = JSON.parse(value);
  } catch {
    memory = null;
  }
  tokensLoaded = true;
  return memory;
}
export async function storeTokens(tokens: Tokens | null) {
  tokens = tokens
    ? {
        ...tokens,
        expiresAt: tokens.expiresAt ?? Date.now() + tokens.expiresIn * 1000,
      }
    : null;
  memory = tokens;
  tokensLoaded = true;
  if (Platform.OS === "web") {
    if (tokens)
      globalThis.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(tokens));
    else globalThis.sessionStorage?.removeItem(SESSION_KEY);
  } else if (tokens) {
    if (!tokens.refreshToken) throw new Error("Refresh token is required");
    await SecureStore.setItemAsync(SESSION_KEY, tokens.refreshToken);
  } else await SecureStore.deleteItemAsync(SESSION_KEY);
}
