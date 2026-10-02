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
import { useEffect } from 'react';

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

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

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
