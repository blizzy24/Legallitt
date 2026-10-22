import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { ApiUser } from '@legalitt/shared';
import { DATA_SOURCE } from './data-source';

// Separate from Cognito credentials: this marker never authorizes API requests.
export const FIXTURE_SESSION_KEY = 'legalitt.fixture.role';
export type FixtureRole = 'client' | 'advocate';
export function fixtureUser(role: FixtureRole): ApiUser {
  return { id: `fixture-${role}`, role, name: role === 'client' ? 'Rahul Sharma' : 'Abhishek Verma', email: null, phone: null };
}
export async function readFixtureRole(): Promise<FixtureRole | null> {
  if (DATA_SOURCE !== 'fixtures') return null;
  const role = Platform.OS === 'web'
    ? globalThis.sessionStorage?.getItem(FIXTURE_SESSION_KEY)
    : await SecureStore.getItemAsync(FIXTURE_SESSION_KEY);
  return role === 'client' || role === 'advocate' ? role : null;
}
export async function storeFixtureRole(role: FixtureRole | null) {
  if (DATA_SOURCE !== 'fixtures') throw new Error('Fixture sign-in is unavailable in API mode');
  if (Platform.OS === 'web') {
    if (role) globalThis.sessionStorage?.setItem(FIXTURE_SESSION_KEY, role);
    else globalThis.sessionStorage?.removeItem(FIXTURE_SESSION_KEY);
  } else if (role) await SecureStore.setItemAsync(FIXTURE_SESSION_KEY, role);
  else await SecureStore.deleteItemAsync(FIXTURE_SESSION_KEY);
}
export function validateFixtureCredentials(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address');
  if (password.trim().length < 8) throw new Error('Enter a password of at least 8 characters');
}
