import { router } from 'expo-router';
import { Check, Clock, Lock, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, dlChecking as t, font, ink } from '../../../constants/theme';

// Checking Details (design/94).
//
// The progress bar is indeterminate and really animates; the "check" is a 3s timer,
// after which the screen advances to the verified state. Nothing is verified.

const STAGES = [
  {
    title: 'DigiLocker Connected',
    body: 'Official government locker linked safely',
    state: 'done' as const,
    label: 'Verified',
  },
  {
    title: 'Checking Details',
    body: 'Reading your name, photo, and identity document',
    state: 'active' as const,
    label: 'In progress…',
  },
  {
    title: 'Verification Complete',
    body: 'Ready to proceed to your legal notice',
    state: 'pending' as const,
    label: 'Upcoming',
  },
];

export default function DigilockerCheckingScreen() {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(slide, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    loop.start();
    const done = setTimeout(() => router.replace('/kyc/digilocker/verified'), 3000);
    return () => {
      loop.stop();
      clearTimeout(done);
    };
  }, [slide]);

  const left = slide.interpolate({
    inputRange: [0, 1],
    outputRange: ['-42%', '100%'],
  });

  return (
    <View style={styles.screen}>
      <KycHeader title="Checking Details" sub="256-BIT ENCRYPTED" subIcon={Lock} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.noteGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            STEP 2 OF 3 • ENCRYPTED CHECK
          </Text>
        </View>

        <View style={styles.artWrap}>
          <View style={styles.ring} />
          {/* Placeholder — sized to design/94's artwork box. */}
          <View style={styles.art} />
          <View style={styles.badge}>
            <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>

        <Text style={styles.heading}>Checking Your Details</Text>
        <Text style={styles.body}>
          Please wait while we check the information shared from DigiLocker.
        </Text>

        <View style={styles.wait}>
          <View style={styles.waitHead}>
            <View style={styles.waitIcon}>
              <Clock size={t.waitIconGlyph} color={ink.accent} />
            </View>
            <View style={styles.waitText}>
              <Text style={styles.waitTitle} {...shrinkToFit(0.8)}>
                Please Wait
              </Text>
              <Text style={styles.waitBody}>
                This may take a little time. Please keep this screen open while we verify your
                details.
              </Text>
            </View>
          </View>

          <View style={styles.bar}>
            <Animated.View style={[styles.barFill, { left }]} />
          </View>
        </View>

        <View style={styles.timeline}>
          {STAGES.map((s, i) => {
            const last = i === STAGES.length - 1;
            const done = s.state === 'done';
            const active = s.state === 'active';
            return (
              <View key={s.title} style={styles.row}>
                <View style={styles.rail}>
                  <View
                    style={[styles.marker, done && styles.markerDone, active && styles.markerActive]}
                  >
                    {done && <Check size={t.markerGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {active && <View style={styles.markerCore} />}
                  </View>
                  {!last && <View style={[styles.line, done && styles.lineDone]} />}
                </View>
                <View style={[styles.itemText, !last && styles.itemGap]}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle} {...shrinkToFit(0.8)}>
                      {s.title}
                    </Text>
                    <Text
                      style={[
                        styles.state,
                        done && styles.stateDone,
                        active && styles.stateActive,
                      ]}
                      {...shrinkToFit(0.8)}
                    >
                      {s.label}
                    </Text>
                  </View>
                  <Text style={styles.itemBody}>{s.body}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteIcon} color={t.noteText} />
          <Text style={styles.noteText} {...shrinkToFit(0.75)}>
            256-bit encryption protects all your records
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          hitSlop={8}
          style={styles.help}
        >
          <Text style={styles.helpText} {...shrinkToFit(0.8)}>
            Having trouble? <Text style={styles.helpLink}>Live Chat is available</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: '#F6EFE6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 7,
    backgroundColor: t.done,
  },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: 11,
    letterSpacing: 0.7,
    color: colors.textBody,
  },
  artWrap: {
    marginTop: t.artTop,
    alignSelf: 'center',
    width: t.ring,
    height: t.ring,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: t.ringColour,
  },
  art: {
    width: t.art,
    height: t.art,
    borderRadius: 20,
    backgroundColor: '#FBF3EF',
  },
  badge: {
    position: 'absolute',
    left: 6,
    top: 18,
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
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  wait: {
    marginTop: t.waitGap,
    borderRadius: t.waitRadius,
    backgroundColor: colors.card,
    padding: t.waitPad,
  },
  waitHead: { flexDirection: 'row' },
  waitIcon: {
    width: t.waitIcon,
    height: t.waitIcon,
    borderRadius: t.waitIconRadius,
    backgroundColor: t.waitIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitText: { flex: 1, minWidth: 0, marginLeft: t.waitIconGap },
  waitTitle: { fontFamily: font.appHeading, fontSize: t.waitTitleSize, color: colors.textPrimary },
  waitBody: {
    marginTop: t.waitBodyGap,
    fontFamily: font.appBody,
    fontSize: t.waitBodySize,
    lineHeight: t.waitBodyLineHeight,
    color: colors.textBody,
  },
  bar: {
    marginTop: t.barGap,
    height: t.barHeight,
    borderRadius: t.barRadius,
    backgroundColor: t.barTrack,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '42%',
    borderRadius: t.barRadius,
    backgroundColor: colors.brand,
  },
  timeline: {
    marginTop: t.timelineGap,
    borderRadius: t.timelineRadius,
    backgroundColor: colors.card,
    padding: t.timelinePad,
  },
  row: { flexDirection: 'row' },
  rail: { alignItems: 'center' },
  marker: {
    width: t.marker,
    height: t.marker,
    borderRadius: t.marker / 2,
    borderWidth: 1.5,
    borderColor: t.pending,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { backgroundColor: t.done, borderColor: t.done },
  markerActive: { borderWidth: 5, borderColor: t.activeRing, backgroundColor: colors.card },
  markerCore: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: t.active },
  line: { flex: 1, width: t.line, marginVertical: t.lineGap, backgroundColor: t.pending },
  lineDone: { backgroundColor: t.done },
  itemText: { flex: 1, minWidth: 0, marginLeft: t.markerGap },
  itemGap: { marginBottom: t.itemGap },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.itemTitleSize,
    color: colors.textPrimary,
  },
  state: {
    marginLeft: 10,
    fontFamily: font.appSemi,
    fontSize: t.stateSize,
    color: t.pendingText,
  },
  stateDone: { color: t.done },
  stateActive: { color: t.active },
  itemBody: {
    marginTop: t.itemBodyGap,
    fontFamily: font.appBody,
    fontSize: t.itemBodySize,
    color: colors.textBody,
  },
  note: {
    marginTop: t.noteGap,
    alignSelf: 'center',
    minHeight: t.noteHeight,
    borderRadius: t.noteRadius,
    paddingHorizontal: t.notePadX,
    backgroundColor: t.noteBg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  noteText: {
    marginLeft: t.noteIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.noteSize,
    color: t.noteText,
  },
  help: { marginTop: t.helpGap, alignItems: 'center' },
  helpText: { fontFamily: font.appBody, fontSize: t.helpSize, color: colors.textBody },
  helpLink: {
    fontFamily: font.appSemi,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
});
