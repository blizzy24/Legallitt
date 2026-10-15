import { router, type Href } from 'expo-router';
import { ArrowLeft, Gavel, LockKeyhole, Mic, NotebookPen, Phone, UserRound, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { CourtTokensProvider, StateSwitch } from '../../../components/court/CourtKit';
import {
  advCourtCall as t,
  advCourtCallSwitch,
  advCourtPalette as q,
  advForensicRed,
  advWalletPalette as w,
  courierHeader as h,
  font,
  hcPalette as c,
  ink,
  status,
} from '../../../constants/theme';
import { COURT_CALL } from '../../../data/advocateCourt';

// Advocate — call with the client (design/369). Measured at 1.000 px/pt on a 2x
// upscale. The one dark screen in the batch; its greys, tans and waveform are
// quarantined in advCourtPalette.
//
// The drawn PREVIEW STATE switcher ships as client UI. Active Call is the
// design; Call Ended reuses the layout with drawn copy (see COURT_CALL).
//
// ⚠⚠ UNSCOPED — the voice call. No calling vendor; nothing here dials.

const KEY_ICON = { mic: Mic, speaker: Volume2, note: NotebookPen };
const WAVE = [
  [t.wave1, q.waveGreen],
  [t.wave2, q.waveTan],
  [t.wave3, q.waveGreen],
  [t.wave4, q.waveTanLight],
  [t.wave5, q.waveGreen],
  [t.wave6, q.waveTan],
  [t.wave7, q.waveGreen],
  [t.wave8, q.waveTanMid],
  [t.wave9, q.waveGreen],
] as const;

export default function AdvocateCourtCallScreen() {
  const insets = useSafeAreaInsets();
  const d = COURT_CALL;
  const [state, setState] = useState(0);
  const ended = state === 1;
  const R = t.glow / 2;

  return (
    <View style={styles.screen}>
      <View style={[styles.hdr, { paddingTop: insets.top + t.hdrPadTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.back}
        >
          <ArrowLeft size={h.backIcon} color={q.callTitle} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.title}>{d.title}</Text>
        <View style={styles.me}>
          <UserRound size={h.avatarGlyph} color={ink.onBrand} strokeWidth={1.9} />
        </View>
      </View>

      <CourtTokensProvider tokens={advCourtCallSwitch}>
        <StateSwitch label={d.switchLabel} options={d.states} value={state} onChange={setState} dark />
      </CourtTokensProvider>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + t.bottomPad }]}>
        <View style={styles.pill}>
          <LockKeyhole size={t.pillIcon} color={status.active} strokeWidth={2.2} />
          <Text style={styles.pillText}>{d.encrypted}</Text>
        </View>
        <View style={[styles.pill, styles.matter]}>
          <Gavel size={t.pillIcon} color={q.callInk} strokeWidth={2} />
          <Text style={styles.pillText}>{d.matter}</Text>
        </View>

        <View style={styles.ringBox}>
          <Svg width={t.glow} height={t.glow} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="callGlow" cx="50%" cy="50%" r="50%">
                <Stop offset={t.glowInner} stopColor={q.callGlow} stopOpacity={1} />
                <Stop offset={1} stopColor={q.callBg} stopOpacity={1} />
              </RadialGradient>
            </Defs>
            <Circle cx={R} cy={R} r={R} fill="url(#callGlow)" />
            <Circle cx={R} cy={R} r={t.ring / 2 - t.ringW / 2} stroke={q.callRing} strokeWidth={t.ringW} fill={q.callDisc} />
          </Svg>
          <Text style={styles.initials}>{d.initials}</Text>
          <Text style={styles.role}>{d.role}</Text>
          {/* ⚠ UNSCOPED — the speaker badge routes nothing. */}
          <View style={styles.badge}>
            <Volume2 size={t.badgeIcon} color={ink.onBrand} strokeWidth={2.2} />
          </View>
        </View>

        <Text style={styles.name}>{d.name}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, ended && styles.dotEnded]} />
          <Text style={[styles.status, ended && styles.statusEnded]}>{ended ? d.ended : d.connected}</Text>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerText}>{d.timer}</Text>
        </View>

        {!ended ? (
          <View style={styles.wave}>
            {WAVE.map(([hgt, col], i) => (
              <View key={i} style={[styles.bar, { height: hgt, backgroundColor: col }]} />
            ))}
          </View>
        ) : (
          <View style={styles.waveGap} />
        )}

        <View style={styles.keys}>
          {d.keys.map((k) => {
            const I = KEY_ICON[k.icon];
            return (
              // ⚠ UNSCOPED — mutes, routes and notes nothing.
              <View key={k.label} style={styles.key}>
                <View style={styles.keyDisc}>
                  <I size={t.keyIcon} color={q.callTitle} strokeWidth={2} />
                </View>
                <Text style={styles.keyLabel}>{k.label}</Text>
              </View>
            );
          })}
        </View>

        {!ended ? (
          <Pressable accessibilityRole="button" onPress={() => setState(1)} style={styles.end}>
            {/* The drawn glyph is a handset laid down, not a crossed phone. */}
            <View style={styles.handset}>
              <Phone size={t.endIcon} color={ink.onBrand} strokeWidth={2.4} />
            </View>
            <Text style={styles.endText}>{d.end}</Text>
          </Pressable>
        ) : (
          <View style={styles.endGap} />
        )}
        <Text style={styles.foot}>{d.foot}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: q.callBg },
  hdr: { height: t.hdrH, paddingHorizontal: h.padX, flexDirection: 'row', alignItems: 'center' },
  hdrInset: {},
  back: { marginLeft: h.backInset, marginRight: h.titleGap },
  title: { flex: 1, fontFamily: font.appSemi, fontSize: t.titleSize, color: q.callTitle },
  me: { width: h.avatar, height: h.avatar, borderRadius: h.avatar / 2, backgroundColor: h.avatarBg, alignItems: 'center', justifyContent: 'center' },

  body: { alignItems: 'center', paddingHorizontal: t.padX },
  pill: {
    marginTop: t.encTop,
    minHeight: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: q.callPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  matter: { marginTop: t.matterTop },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: q.callInk },

  ringBox: { marginTop: t.ringTop, width: t.glow, height: t.glow, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: font.appHeading, fontSize: t.initialsSize, letterSpacing: t.initialsSpacing, color: w.tile },
  role: { marginTop: t.roleTop, fontFamily: font.appSemi, fontSize: t.roleSize, letterSpacing: t.roleSpacing, color: q.callCaps },
  badge: {
    position: 'absolute',
    left: t.badgeX,
    top: t.badgeY,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: { marginTop: t.nameTop, fontFamily: font.appSemi, fontSize: t.nameSize, color: q.callTitle, textAlign: 'center' },
  statusRow: { marginTop: t.statusTop, flexDirection: 'row', alignItems: 'center', gap: t.statusGap },
  dot: { width: t.statusDot, height: t.statusDot, borderRadius: t.statusDot / 2, backgroundColor: status.active },
  dotEnded: { backgroundColor: advForensicRed.declineColour },
  status: { fontFamily: font.appBody, fontSize: t.statusSize, color: status.active },
  statusEnded: { color: q.callInk },
  timer: { marginTop: t.timerTop, minHeight: t.timerH, borderRadius: t.timerRadius, paddingHorizontal: t.timerPadX, backgroundColor: q.callPill, justifyContent: 'center' },
  timerText: { fontFamily: font.mono, fontWeight: '700', fontSize: t.timerSize, letterSpacing: t.timerSpacing, color: q.callInk },

  wave: { marginTop: t.waveTop, height: t.waveH, flexDirection: 'row', alignItems: 'center', gap: t.waveGap },
  waveGap: { marginTop: t.waveTop, height: t.waveH },
  bar: { width: t.waveW, borderRadius: t.waveW / 2 },

  keys: { marginTop: t.keysTop, alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: t.keysPadX },
  key: { alignItems: 'center', width: t.keyW },
  keyDisc: { width: t.key, height: t.key, borderRadius: t.key / 2, backgroundColor: q.callKey, alignItems: 'center', justifyContent: 'center' },
  keyLabel: { marginTop: t.keyLabelTop, fontFamily: font.appSemi, fontSize: t.keyLabelSize, color: q.callInk },

  end: {
    marginTop: t.endTop,
    width: t.endW,
    minHeight: t.endH,
    borderRadius: t.endH / 2,
    backgroundColor: advForensicRed.declineColour,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.endGap,
  },
  endGap: { marginTop: t.endTop, height: t.endH },
  handset: { transform: [{ rotate: '135deg' }] },
  endText: { fontFamily: font.appHeading, fontSize: t.endSize, letterSpacing: t.endSpacing, color: ink.onBrand },
  foot: { marginTop: t.footTop, fontFamily: font.appBody, fontSize: t.footSize, color: q.callMuted, textAlign: 'center' },
});
