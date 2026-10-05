import { Redirect } from 'expo-router';

import { useSession } from '../context/session';

// First launch lands on the onboarding carousel; afterwards, straight to home.
//
// hasSeenOnboarding is in memory only, so a reload shows onboarding again. That is
// deliberate for a prototype — it keeps the flow reachable for review without a
// developer flag.
export default function Index() {
  const { hasSeenOnboarding, role } = useSession();
  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  // 'lawyer' lands in the advocate app; everything else in the client app.
  return <Redirect href={role === 'lawyer' ? '/(advocate)/dashboard' : '/(tabs)/home'} />;
}
