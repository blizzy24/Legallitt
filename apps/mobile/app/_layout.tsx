import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold } from '@expo-google-fonts/public-sans';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import AnimatedSplash from '../components/AnimatedSplash';
import { PreviewNoticeHost } from '../components/PreviewNotice';
import { SPLASH_ENABLED } from '../constants/dev';

import { DocumentForensicProvider } from '../context/documentForensic';
import { FirProvider } from '../context/fir';
import { KycProvider } from '../context/kyc';
import { LegalAdviceProvider } from '../context/legalAdvice';
import { LegalNoticeProvider } from '../context/legalNotice';
import { ProfileProvider } from '../context/profile';
import { PropertySearchProvider } from '../context/propertySearch';
import { SessionProvider } from '../context/session';
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

// The animated splash runs when the app opens at its root. A deep link (and every
// web route the screenshot / smoke tooling loads directly) skips it.
const OPENS_AT_ROOT = Platform.OS !== 'web' || (typeof window !== 'undefined' && window.location.pathname === '/');

/** Web: the splash already ran in this browser session, so this load is warm. */
function seenThisSession() {
  if (Platform.OS !== 'web') return false;
  try {
    const seen = window.sessionStorage.getItem('legalittSplash') === '1';
    window.sessionStorage.setItem('legalittSplash', '1');
    return seen;
  } catch {
    return false;
  }
}
const SHOW_SPLASH = SPLASH_ENABLED && OPENS_AT_ROOT;
const WARM = SHOW_SPLASH && seenThisSession();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PublicSans_400Regular,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
  });

  const ready = loaded || !!error;
  const [splashDone, setSplashDone] = useState(!SHOW_SPLASH);

  // Without the animated splash, the native one hides once the fonts are in. With
  // it, the native one hides as soon as the animated one has laid out — no gap.
  useEffect(() => {
    if (ready && !SHOW_SPLASH) SplashScreen.hideAsync();
  }, [ready]);

  return (
    <View style={styles.root}>
      {ready ? <App /> : null}
      {ready ? <PreviewNoticeHost /> : null}
      {splashDone ? null : (
        <AnimatedSplash ready={ready} warm={WARM} onMounted={() => SplashScreen.hideAsync()} onDone={() => setSplashDone(true)} />
      )}
    </View>
  );
}

function App() {
  return (
    <SessionProvider>
      <ProfileProvider>
        <LegalNoticeProvider>
          <FirProvider>
            <PropertySearchProvider>
              <DocumentForensicProvider>
                <KycProvider>
                  <LegalAdviceProvider>
                    <StatusBar style="dark" />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.screenBg },
                      }}
                    />
                  </LegalAdviceProvider>
                </KycProvider>
              </DocumentForensicProvider>
            </PropertySearchProvider>
          </FirProvider>
        </LegalNoticeProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
