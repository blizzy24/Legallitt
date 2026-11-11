import { DATA_SOURCE } from '../lib/data-source';
import { useSession } from './session';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GENDER_OPTIONS, type AccountProfile } from '@legalitt/shared';
import { backend } from '../lib/auth';

import { DEFAULT_PROFILE, type Profile } from '../data/profile';

// Fixture previews retain their editable in-memory profile. API mode reads the
// signed-in client's account profile (D-15) and refreshes after edits.

type Ctx = {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  reset: () => void;
  /** API mode only. */
  account: AccountProfile | null;
  accountError: string;
  accountLoading: boolean;
  refreshAccount: () => Promise<void>;
};

const ProfileContext = createContext<Ctx | null>(null);
const initials = (name: string) => name.split(/\s+/).map(part => part[0] ?? '').join('').slice(0, 2).toUpperCase();

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [fixtureProfile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [accountError, setAccountError] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const signedInClient = DATA_SOURCE === 'api' && user?.role === 'client';

  const refreshAccount = useCallback(async () => {
    if (!signedInClient) { setAccount(null); return; }
    setAccountLoading(true); setAccountError('');
    try { setAccount(await backend.accountProfile()); }
    catch (e) { setAccountError(e instanceof Error ? e.message : 'Profile could not be loaded.'); }
    finally { setAccountLoading(false); }
  }, [signedInClient, user?.id]);
  useEffect(() => { void refreshAccount(); }, [refreshAccount]);

  const profile = useMemo<Profile>(() => {
    if (DATA_SOURCE !== 'api') return fixtureProfile;
    const name = account?.name ?? user?.name ?? '';
    return {
      fullName: name, initials: initials(name),
      accountType: user?.role === 'client' ? 'Client Account' : '', email: account?.email ?? user?.email ?? '', mobile: account?.phone ?? user?.phone ?? '',
      mobileVerified: !!account?.phone_verified, dateOfBirth: account?.date_of_birth ?? '',
      gender: GENDER_OPTIONS.find(g => g.code === account?.gender)?.label ?? '', city: account?.city ?? '', state: account?.state ?? '',
      country: account?.country ?? '', language: 'English', consultation: ['chat'],
    };
  }, [user, fixtureProfile, account]);
  const value = useMemo<Ctx>(
    () => ({
      profile,
      update: (patch) => setProfile((p) => ({ ...p, ...patch })),
      reset: () => setProfile(DEFAULT_PROFILE),
      account, accountError, accountLoading, refreshAccount,
    }),
    [profile, account, accountError, accountLoading, refreshAccount]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside a ProfileProvider');
  return ctx;
}
