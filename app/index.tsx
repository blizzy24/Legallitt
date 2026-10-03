import { Redirect } from 'expo-router';

import { useSession } from '../context/session';

// First launch lands on the onboarding carousel; afterwards, straight to home.
//
// hasSeenOnboarding is in memory only, so a reload shows onboarding again. That is
// deliberate for a prototype — it keeps the flow reachable for review without a
// developer flag.
export default function Index() {
  const { hasSeenOnboarding } = useSession();
  return <Redirect href={hasSeenOnboarding ? '/(tabs)/home' : '/onboarding'} />;
}
