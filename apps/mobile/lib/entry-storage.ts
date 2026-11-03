import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Non-secret navigation preferences. Onboarding survives a new browser session;
// the auth destination belongs to this tab and is consumed after signing in.
export const ENTRY_KEYS = {
  onboarding: 'legalitt.entry.onboarding',
  role: 'legalitt.entry.role',
  destination: 'legalitt.entry.destination',
} as const;
type EntryKey = keyof typeof ENTRY_KEYS;

export async function readEntry(key: EntryKey): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') return await SecureStore.getItemAsync(ENTRY_KEYS[key]);
    return (key === 'destination' ? globalThis.sessionStorage : globalThis.localStorage)?.getItem(ENTRY_KEYS[key]) ?? null;
  } catch { return null; }
}

export async function writeEntry(key: EntryKey, value: string | null) {
  try {
    if (Platform.OS === 'web') {
      const storage = key === 'destination' ? globalThis.sessionStorage : globalThis.localStorage;
      if (value === null) storage?.removeItem(ENTRY_KEYS[key]);
      else storage?.setItem(ENTRY_KEYS[key], value);
    } else if (value === null) await SecureStore.deleteItemAsync(ENTRY_KEYS[key]);
    else await SecureStore.setItemAsync(ENTRY_KEYS[key], value);
  } catch { /* Storage may be disabled; navigation still works in memory. */ }
}
