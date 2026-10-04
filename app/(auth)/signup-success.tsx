import { router } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authSuccess as t, colors, font, ink } from '../../constants/theme';

// Account created (design/138). A minimal header — just the LEGALITT mark and its
// status dot — then the glowing check badge and the copy.
export default function SignupSuccessScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + t.markTop }]}>
      <View style={styles.mark}>
        <View style={styles.markDot} />
        <Text style={styles.markText}>LEGALITT</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.glow}>
          <View style={styles.ring}>
            <View style={styles.disc}>
              <View style={styles.badge}>
                <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={3.5} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.heading}>You&rsquo;re All Set!</Text>
        <Text style={styles.bodyText}>
          Your Legalitt account has been created successfully.
        </Text>
        <Text style={styles.subText}>Explore legal services and get started with Legalitt.</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/role')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Get Started</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
        <Text style={styles.caption}>Continue to Legalitt</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg, paddingHorizontal: t.padX },
  mark: { flexDirection: 'row', alignItems: 'center' },
  markDot: {
    width: t.markDot,
    height: t.markDot,
    borderRadius: t.markDot / 2,
    marginRight: t.markDotGap,
    backgroundColor: t.markColour,
  },
  markText: {
    fontFamily: font.appSemi,
    fontSize: t.markSize,
    letterSpacing: t.markSpacing,
    color: t.markColour,
  },

  // Anchored rather than centred: design/138 places the badge at a fixed height.
  body: { flex: 1, alignItems: 'center' },
  glow: {
    marginTop: t.glowTop,
    width: t.glow,
    height: t.glow,
    borderRadius: t.glow / 2,
    backgroundColor: t.glowColour,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    backgroundColor: t.ringBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: t.discBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  bodyText: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textPrimary,
  },
  subText: {
    marginTop: t.subGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: colors.textBody,
  },

  footer: {},
  button: {
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
  caption: {
    marginTop: t.captionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
});
