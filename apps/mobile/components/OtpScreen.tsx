import { router, type Href } from 'expo-router';
import { ArrowRight, Lock, MessageSquareMore, Pencil } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuthHeader from './AuthHeader';
import { shrinkToFit } from '../constants/textFit';
import { authOtp as t, colors, font, ink } from '../constants/theme';

// The six-box verification screen, shared by login (design/135) and sign-up
// (design/137) — the two files are the same screen with a different header title and
// a different destination.
//
// REPLACES the previous four-box screen: the designs now show SIX digits.
//
// design/135 and /137 both draw the first three boxes filled (4, 8, 2) and elevated,
// with the last three empty. Both states are implemented: a box lifts as soon as it
// has a digit. Nothing is verified — any six digits continue, and so does none.

const LENGTH = 6;
const RESEND_SECONDS = 28;

type Props = {
  title: string;
  /** Where "Verify & Continue" goes. */
  next: Href;
  /** Where the "Change" affordance goes. */
  changeTo: Href;
};

export default function OtpScreen({ title, next, changeTo }: Props) {
  const insets = useSafeAreaInsets();
  // design/135 draws 4, 8, 2 entered and three boxes empty.
  const [digits, setDigits] = useState<string[]>(['4', '8', '2', '', '', '']);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);
  const { width } = useWindowDimensions();
  const drawnRowW = t.boxCount * t.box + (t.boxCount - 1) * t.boxGapX;
  const rowW = Math.min(drawnRowW, width - 2 * t.boxesEdge);
  const boxW = (rowW - (t.boxCount - 1) * t.boxGapX) / t.boxCount;

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const nextDigits = [...prev];
      nextDigits[i] = d;
      return nextDigits;
    });
    if (d && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const mmss = `00:${String(Math.max(seconds, 0)).padStart(2, '0')}`;

  return (
    <View style={styles.screen}>
      <AuthHeader title={title} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.chip}>
          <MessageSquareMore size={t.chipGlyph} color={t.chipColour} />
        </View>

        <Text style={styles.heading}>Verify Your Number</Text>
        <Text style={styles.sub}>We&rsquo;ve sent a 6-digit verification code to</Text>

        <View style={styles.pill}>
          <Text style={styles.pillNumber} {...shrinkToFit(0.75)}>
            +91 98765 *****
          </Text>
          <Text style={styles.pillDot}>•</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change number"
            hitSlop={8}
            onPress={() => router.replace(changeTo)}
            style={styles.change}
          >
            <Text style={styles.changeText} {...shrinkToFit(0.8)}>
              Change
            </Text>
            <Pencil size={t.pillIcon} color={t.pillChangeColour} />
          </Pressable>
        </View>

        {/* The six boxes are drawn 369pt wide at 390 — wider than the 20pt content
            inset, 10.5pt from each screen edge. On narrower screens they keep that
            edge and shrink instead of running off it (they overflowed 4.5pt a side
            at 360). */}
        <View style={[styles.boxes, { width: rowW }]}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r;
              }}
              style={[styles.box, { width: boxW }, d !== '' && styles.boxFilled]}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              keyboardType="number-pad"
              maxLength={1}
              accessibilityLabel={`Digit ${i + 1}`}
            />
          ))}
        </View>

        <Text style={styles.resendQ} {...shrinkToFit(0.8)}>
          Didn&rsquo;t receive the code?
        </Text>
        {seconds > 0 ? (
          <Text style={styles.resend} {...shrinkToFit(0.8)}>
            <Text style={styles.resendLink}>Resend OTP</Text> in {mmss}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setSeconds(RESEND_SECONDS)}
            hitSlop={8}
          >
            <Text style={[styles.resend, styles.resendActive]} {...shrinkToFit(0.8)}>
              Resend OTP
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(next)}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Verify &amp; Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <View style={styles.foot}>
          <Lock size={t.footIcon} color={colors.textBody} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            END-TO-END ENCRYPTED SESSION
          </Text>
        </View>
        <Text style={styles.terms} {...shrinkToFit(0.75)}>
          By continuing, you agree to Legalitt&rsquo;s{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> &amp;{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX, alignItems: 'center' },

  chip: {
    marginTop: t.chipGap,
    width: t.chip,
    height: t.chip,
    borderRadius: t.chip / 2,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: t.subGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },

  pill: {
    marginTop: t.pillGap,
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  pillNumber: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.pillSize,
    color: colors.textPrimary,
  },
  pillDot: { marginHorizontal: t.pillDotGap, color: colors.textMuted },
  change: { flexDirection: 'row', alignItems: 'center' },
  changeText: {
    marginRight: 4,
    fontFamily: font.appBody,
    fontSize: t.pillChangeSize,
    color: t.pillChangeColour,
  },

  boxes: { marginTop: t.boxesGap, flexDirection: 'row', gap: t.boxGapX },
  box: {
    width: t.box,
    height: t.boxHeight,
    borderRadius: t.boxRadius,
    borderWidth: 1,
    borderColor: t.boxBorder,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.boxSize,
    color: colors.textPrimary,
    backgroundColor: t.bg,
    outlineWidth: 0,
  },
  // design/135 elevates the filled boxes.
  boxFilled: {
    backgroundColor: t.boxFilledBg,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  resendQ: {
    marginTop: t.resendGap,
    fontFamily: font.appBody,
    fontSize: t.resendSize,
    color: colors.textBody,
  },
  resend: {
    marginTop: t.resendGapY,
    fontFamily: font.appBody,
    fontSize: t.resendSize,
    color: colors.textBody,
  },
  resendLink: { color: t.resendLinkColour },
  resendActive: { fontFamily: font.appHeading, color: t.resendLinkColour },

  button: {
    marginTop: t.buttonGap,
    alignSelf: 'stretch',
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

  foot: { marginTop: t.footGap, flexDirection: 'row', alignItems: 'center' },
  footText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.footSize,
    letterSpacing: t.footSpacing,
    color: colors.textBody,
  },
  terms: {
    marginTop: t.termsGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.termsSize,
    color: colors.textBody,
  },
  termsLink: { textDecorationLine: 'underline', color: colors.textPrimary },
});
