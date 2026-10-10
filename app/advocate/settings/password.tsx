import { router, type Href } from 'expo-router';
import { ChevronLeft, CircleCheck, Eye, Lock, ShieldCheck, UserRound } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AS_PASSWORD } from '../../../data/advocateSettings';
import { advPassword as t, colors, font, ink } from '../../../constants/theme';

// Advocate settings — change password (design/247).
//
// ⚠ ANOTHER FRAMED EXPORT: 812px, a 780px screen inside a 16px frame.
//
// STATIC, NOT WIRED, AND DELIBERATELY SO. There are no text inputs here, no
// password state and no validation. The brief said to validate the drawn rules
// client-side ONLY if the design shows a validation state; design/247 draws all
// three fields empty and all four requirement marks in a single state, so there
// is nothing to validate against. The eye toggles reveal nothing, "Forgot
// Password?" goes nowhere and "Update Password" updates nothing.

export default function AdvocatePasswordScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_PASSWORD;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Lock size={t.heroGlyph} color={ink.accent} strokeWidth={1.4} />
        </View>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          {d.fields.map((f, i) => (
            <View key={f.label} style={i === 0 ? undefined : { marginTop: t.fieldGap }}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.input}>
                <Text style={styles.placeholder} {...shrinkToFit(0.8)}>
                  {f.placeholder}
                </Text>
                <Eye size={t.eyeGlyph} color="#4A4A4A" strokeWidth={1.8} />
              </View>
            </View>
          ))}

          <View style={styles.req}>
            <Text style={styles.reqTitle}>{d.reqTitle}</Text>
            <View style={styles.reqGrid}>
              {d.requirements.map((r) => (
                <View key={r} style={styles.reqRow}>
                  <CircleCheck size={t.reqGlyph} color={ink.accent} strokeWidth={1.8} />
                  <Text style={styles.reqText} {...shrinkToFit(0.8)}>
                    {r}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.forgot}>{d.forgot}</Text>

          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <ShieldCheck size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2} />
            <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
              {d.cta}
            </Text>
          </Pressable>
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE5',
  },
  headCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#6C5C45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 28, alignItems: 'center' },

  hero: {
    marginTop: t.heroTop,
    width: t.heroW,
    height: t.heroH,
    borderTopLeftRadius: t.heroW / 2,
    borderTopRightRadius: t.heroW / 2,
    borderBottomLeftRadius: t.heroW / 2,
    borderBottomRightRadius: t.heroW / 2,
    backgroundColor: t.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: {
    marginTop: t.subTop,
    marginHorizontal: t.padX + 10,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: '#4D463D',
  },

  card: {
    marginTop: t.cardTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  label: { fontFamily: font.appHeading, fontSize: t.labelSize, color: '#1B1C1C' },
  input: {
    marginTop: t.labelGap,
    height: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: t.inputBg,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: { flex: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: '#9A938A' },

  req: {
    marginTop: t.reqTop,
    backgroundColor: t.reqBg,
    borderRadius: t.reqRadius,
    padding: t.reqPad,
  },
  reqTitle: {
    fontFamily: font.appSemi,
    fontSize: t.reqTitleSize,
    letterSpacing: t.reqTitleTrack,
    color: ink.accent,
  },
  reqGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  reqRow: {
    width: '50%',
    marginTop: t.reqRowTop,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqText: {
    marginLeft: t.reqGap,
    fontFamily: font.appBody,
    fontSize: t.reqSize,
    color: '#1B1C1C',
  },

  forgot: {
    marginTop: t.forgotTop,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.forgotSize,
    color: ink.accent,
  },
  cta: {
    marginTop: t.ctaTop,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    marginLeft: 9,
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: ink.onBrand,
  },

  note: {
    marginTop: t.noteTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#4D463D',
  },
});
