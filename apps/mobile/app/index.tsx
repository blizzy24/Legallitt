import { Redirect } from 'expo-router';

import { useSession } from '../context/session';

// First visit gets onboarding. A protected deep link takes priority and resumes
// after authentication; onboarding completion persists across visits.
export default function Index() {
  const { hasSeenOnboarding, role, isLoggedIn, ready, registrationRole, returnTo } = useSession();
  if (!ready) return null;
  if (!isLoggedIn && returnTo) return <Redirect href="/(auth)/login" />;
  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!isLoggedIn) return <Redirect href={registrationRole === "user" ? "/(tabs)/home" : registrationRole === "lawyer" ? "/(auth)/login" : "/(auth)/role"} />;
  // 'lawyer' lands in the advocate app; everything else in the client app.
  return <Redirect href={role === 'lawyer' ? '/(advocate)/dashboard' : '/(tabs)/home'} />;
}
