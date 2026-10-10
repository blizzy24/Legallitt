import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Landmark,
  RefreshCw,
  ShieldCheck,
  SquareCheckBig,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { AS_BANK_VERIFY } from '../../../../data/advocateSettings';
import { advForensicRed, advBank as t, colors, font, ink, status } from '../../../../constants/theme';

// Advocate settings — verify bank details (design/259).
//
// ⚠ THE SWITCHER IS CLIENT UI, NOT A DEV TOGGLE. Checking / Verified / Failed
// is drawn in the export as part of the screen, so it is wired as part of the
// screen: all three segments are reachable and none of it sits behind
// DEV_PREVIEW_TOGGLES.
//
// ⚠ WHAT THE EXPORT DRAWS, AND WHAT IT DOES NOT. design/259 draws the CHECKING
// state only. The Verified and Failed segments appear on the switcher but no
// export shows either screen. Both are therefore rendered through the SAME
// drawn layout, changing only the mark, the two lines of copy, the tracker's
// current step and the button label — the Verified wording follows design/260,
// which is the success screen. No new component, card or control is invented
// for them. If those two screens exist, they replace the copy in
// data/advocateSettings.ts and nothing else.
//
// STATIC, NOT WIRED: nothing is being checked. The switcher changes what is
// drawn; it does not start, succeed or fail a verification, because there is
// no penny drop and no payment rail in this project.

export default function AdvocateBankVerifyScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_BANK_VERIFY;
  const [segment, setSegment] = useState<'Checking' | 'Verified' | 'Failed'>('Checking');
  const s = d.states[segment];
  const failed = segment === 'Failed';
  const verified = segment === 'Verified';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings/bank' as Href))}
        >
          <ArrowLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.switcher}>
          {d.segments.map((seg) => (
            <Pressable
              key={seg}
              accessibilityRole="tab"
              accessibilityState={{ selected: segment === seg }}
              style={[styles.segment, segment === seg && styles.segmentOn]}
              onPress={() => setSegment(seg as typeof segment)}
            >
              <Text style={[styles.segmentText, segment === seg && styles.segmentTextOn]}>
                {seg}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.bankRow}>
            <View style={styles.bankTile}>
              <Landmark size={24} color="#8C6B3F" strokeWidth={1.8} />
            </View>
            <View style={styles.col}>
              <Text style={styles.bankLabel}>{d.bankLabel}</Text>
              <Text style={styles.bankName} {...shrinkToFit(0.8)}>
                {d.bankName}
              </Text>
            </View>
            <View style={styles.typePill}>
              <Text style={styles.typePillText} {...shrinkToFit(0.8)}>
                {d.typePill}
              </Text>
            </View>
          </View>
          <View style={styles.bankRule} />
          <View style={styles.pairRow}>
            <View style={[styles.pair, { marginRight: 11 }]}>
              <Text style={styles.pairLabel}>{d.holder.label}</Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.8)}>
                {d.holder.value}
              </Text>
            </View>
            <View style={styles.pair}>
              <Text style={styles.pairLabel}>{d.account.label}</Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.8)}>
                {d.account.value}
              </Text>
            </View>
          </View>
          <View style={styles.ifscBox}>
            <View style={styles.col}>
              <Text style={styles.pairLabel}>{d.ifsc.label}</Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.8)}>
                {d.ifsc.value}
              </Text>
            </View>
            <ShieldCheck size={17} color="#4D463D" strokeWidth={1.8} />
            <Text style={styles.branchText} {...shrinkToFit(0.8)}>
              {d.ifsc.pill}
            </Text>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View
            style={[
              styles.markOuter,
              verified && styles.markOuterOk,
              failed && styles.markOuterBad,
            ]}
          >
            <View
              style={[
                styles.markInner,
                verified && styles.markInnerOk,
                failed && styles.markInnerBad,
              ]}
            >
              {verified ? (
                <Check size={t.markGlyph} color="#FFFFFF" strokeWidth={3} />
              ) : failed ? (
                <CircleAlert size={t.markGlyph} color="#FFFFFF" strokeWidth={2.2} />
              ) : (
                <RefreshCw size={t.markGlyph} color="#4D463D" strokeWidth={2.4} />
              )}
            </View>
          </View>
          <Text style={styles.h1} {...shrinkToFit(0.8)}>
            {s.h1}
          </Text>
          <Text style={styles.sub}>{s.sub}</Text>

          <View style={styles.tracker}>
            {d.tracker.map((label, i) => (
              <View key={label} style={styles.trackCol}>
                <View style={styles.trackRow}>
                  {i > 0 ? (
                    <View style={[styles.trackLine, i <= s.step && styles.trackLineOn]} />
                  ) : (
                    <View style={styles.trackSpacer} />
                  )}
                  <View
                    style={[
                      styles.trackDot,
                      i < s.step && styles.trackDotDone,
                      i === s.step && styles.trackDotNow,
                    ]}
                  >
                    {i === 0 ? (
                      <Check
                        size={t.trackerGlyph}
                        color={i <= s.step ? '#FFFFFF' : '#9A938A'}
                        strokeWidth={3}
                      />
                    ) : i === 1 ? (
                      <RefreshCw
                        size={t.trackerGlyph}
                        color={i === s.step ? '#FFFFFF' : i < s.step ? '#FFFFFF' : '#9A938A'}
                        strokeWidth={2.4}
                      />
                    ) : (
                      <SquareCheckBig
                        size={t.trackerGlyph}
                        color={i <= s.step ? '#FFFFFF' : '#9A938A'}
                        strokeWidth={2.2}
                      />
                    )}
                  </View>
                  {i < d.tracker.length - 1 ? (
                    <View style={[styles.trackLine, i < s.step && styles.trackLineOn]} />
                  ) : (
                    <View style={styles.trackSpacer} />
                  )}
                </View>
                <Text
                  style={[styles.trackLabel, i === s.step && styles.trackLabelNow]}
                  {...shrinkToFit(0.8)}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.note}>
          <View style={styles.noteTile}>
            <ShieldCheck size={t.noteGlyph} color="#4D463D" strokeWidth={1.8} />
          </View>
          <View style={styles.col}>
            <Text style={styles.noteTitle}>{d.note.title}</Text>
            <Text style={styles.noteText}>{d.note.body}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.cta,
            verified && styles.ctaOk,
            failed && styles.ctaBad,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            verified ? router.push('/advocate/settings/bank/updated' as Href) : undefined
          }
        >
          <RefreshCw
            size={19}
            color={verified || failed ? ink.onBrand : '#9A938A'}
            strokeWidth={2.2}
          />
          <Text
            style={[styles.ctaLabel, (verified || failed) && styles.ctaLabelOn]}
            {...shrinkToFit(0.8)}
          >
            {s.cta}
          </Text>
        </Pressable>
        <Text style={styles.ctaNote}>{s.ctaNote}</Text>
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
    borderBottomColor: '#EFEBE8',
  },
  title: {
    flex: 1,
    marginLeft: 16,
    fontFamily: font.appHeading,
    fontSize: t.plainTitleSize,
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

  switcher: {
    marginTop: 14,
    marginHorizontal: t.padX,
    height: t.switchH,
    borderRadius: t.switchRadius,
    backgroundColor: t.switchBg,
    padding: t.switchPad,
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    borderRadius: t.switchRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  segmentOn: { backgroundColor: colors.card },
  segmentText: { fontFamily: font.appSemi, fontSize: t.switchSize, color: '#6B6B6B' },
  segmentTextOn: { fontFamily: font.appHeading, color: '#1B1C1C' },

  card: {
    marginTop: t.cardTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  bankRow: { flexDirection: 'row', alignItems: 'center' },
  bankTile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F6E8D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  col: { flex: 1 },
  bankLabel: {
    fontFamily: font.appSemi,
    fontSize: 12.5,
    letterSpacing: 0.9,
    color: '#8C6B3F',
  },
  bankName: { marginTop: 3, fontFamily: font.appHeading, fontSize: 20, color: '#1B1C1C' },
  typePill: {
    marginLeft: 8,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#EFECEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillText: { fontFamily: font.appSemi, fontSize: 15, color: '#4D463D' },
  bankRule: { marginTop: 14, height: 1, backgroundColor: '#EFEBE8' },

  pairRow: { marginTop: 14, flexDirection: 'row' },
  pair: { flex: 1, backgroundColor: '#F6F2F1', borderRadius: 12, padding: 13 },
  pairLabel: { fontFamily: font.appBody, fontSize: 14, color: '#8C6B3F' },
  pairValue: { marginTop: 4, fontFamily: font.appHeading, fontSize: 17, color: '#1B1C1C' },
  ifscBox: {
    marginTop: 11,
    backgroundColor: '#F6F2F1',
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchText: { marginLeft: 7, fontFamily: font.appSemi, fontSize: 15, color: '#4D463D' },

  statusCard: {
    marginTop: t.cardTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: 24,
    alignItems: 'center',
  },
  markOuter: {
    width: t.markOuter,
    height: t.markOuter,
    borderRadius: t.markOuter / 2,
    backgroundColor: '#F3EBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOuterOk: { backgroundColor: '#D9F3E5' },
  markOuterBad: { backgroundColor: '#FBDFDF' },
  markInner: {
    width: t.markInner,
    height: t.markInner,
    borderRadius: t.markInner / 2,
    backgroundColor: '#B7A488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markInnerOk: { backgroundColor: status.active },
  markInnerBad: { backgroundColor: advForensicRed.declineColour },
  h1: { marginTop: 18, fontFamily: font.appHeading, fontSize: 26, color: '#1B1C1C' },
  sub: {
    marginTop: 9,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: 16,
    lineHeight: 22,
    color: '#4D463D',
  },

  tracker: { marginTop: t.trackerTop, alignSelf: 'stretch', flexDirection: 'row' },
  trackCol: { flex: 1, alignItems: 'center' },
  trackRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  trackSpacer: { flex: 1 },
  trackLine: { flex: 1, height: 2, backgroundColor: '#E6E2DF' },
  trackLineOn: { backgroundColor: '#1F5E3C' },
  trackDot: {
    width: t.trackerDot,
    height: t.trackerDot,
    borderRadius: t.trackerDot / 2,
    backgroundColor: '#EFECEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackDotDone: { backgroundColor: '#1F5E3C' },
  trackDotNow: { backgroundColor: '#6C5C45' },
  trackLabel: {
    marginTop: t.trackerLabelTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.trackerLabelSize,
    color: '#9A938A',
  },
  trackLabelNow: { fontFamily: font.appHeading, color: '#1B1C1C' },

  note: {
    marginTop: t.noteTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTile / 2,
    backgroundColor: '#E6E2DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteTitle: { fontFamily: font.appHeading, fontSize: t.noteTitleSize, color: '#1B1C1C' },
  noteText: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: 21,
    color: '#4D463D',
  },

  cta: {
    marginTop: 20,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: '#E6E2DF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOk: { backgroundColor: status.active },
  ctaBad: { backgroundColor: advForensicRed.declineColour },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    marginLeft: 11,
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: '#9A938A',
  },
  ctaLabelOn: { color: ink.onBrand },
  ctaNote: {
    marginTop: 13,
    fontFamily: font.appBody,
    fontSize: 15,
    color: '#4D463D',
  },
});
