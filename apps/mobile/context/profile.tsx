import { DATA_SOURCE } from '../lib/data-source';
import { useSession } from './session';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_PROFILE, type Profile } from '../data/profile';

// Fixture previews retain their editable in-memory profile. API mode reads only
// the authenticated identity; unsupported profile editing is gated by navigation.

type Ctx = {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  reset: () => void;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [fixtureProfile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  const profile = useMemo<Profile>(() => DATA_SOURCE === 'api' ? {
    fullName: user?.name ?? '', initials: (user?.name ?? '').split(/\s+/).map(part=>part[0]??'').join('').slice(0,2).toUpperCase(),
    accountType: user?.role === 'client' ? 'Client Account' : '', email: user?.email ?? '', mobile: user?.phone ?? '',
    mobileVerified:false, dateOfBirth:'', gender:'', city:'', state:'', country:'', language:'', consultation:[],
  } : fixtureProfile, [user, fixtureProfile]);
  const value = useMemo<Ctx>(
    () => ({
      profile,
      update: (patch) => setProfile((p) => ({ ...p, ...patch })),
      reset: () => setProfile(DEFAULT_PROFILE),
    }),
    [profile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside a ProfileProvider');
  return ctx;
}
