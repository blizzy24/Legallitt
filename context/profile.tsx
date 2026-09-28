import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_PROFILE, type Profile } from '../data/profile';

// The user's profile, in memory only. Edit Profile writes here and the profile tab
// reads it back; nothing is persisted and nothing is sent anywhere.

type Ctx = {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
  reset: () => void;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

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
