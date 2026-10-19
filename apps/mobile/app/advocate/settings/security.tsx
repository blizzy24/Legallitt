import { router, type Href } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Gavel,
  KeyRound,
  Lock,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AS_SECURITY } from '../../../data/advocateSettings';
import { advForensicRed, advSecurity as t, colors, font, ink, status } from '../../../constants/theme';

// Advocate settings — login & security (design/249).
//
// STATIC, NOT WIRED, AND THAT MATTERS HERE. Two-step verification and login
// alerts are drawn toggles that do not toggle and authenticate nothing.
// "Sign Out of All Devices" signs nothing out — there is no session store, no
// auth and no backend in this project.
//
// ⚠ The destructive row is #BA1A1A, which this project already carries as
// advForensicRed. Reused rather than re-added.
//
// ⚠ NEVER ELLIPSIZE. The export clips two subtitles, at "(Court Rec" and
// "companio". Both are stored and rendered whole.

export default function AdvocateSecurityScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_SECURITY;

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
        <View style={styles.shield}>
          <Lock size={t.shieldGlyph} color={ink.accent} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroPin}>
            <Lock size={t.heroGlyph - 18} color={ink.accent} strokeWidth={1.6} />
          </View>
          <View style={styles.heroTick}>
            <CircleCheck size={16} color="#FFFFFF" fill={status.active} strokeWidth={2} />
          </View>
        </View>

        <View style={styles.pill}>
          <ShieldCheck size={t.pillGlyph} color="#8C6B3F" strokeWidth={2} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.pill}
          </Text>
        </View>

        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <Text style={styles.section}>{d.loginTitle}</Text>
        <View style={styles.card}>
          {d.login.map((r, i) => (
            <Fragment key={r.label}>
              {i > 0 ? <View style={styles.rule} /> : null}
              <View style={[styles.loginRow, i > 0 && { marginTop: t.rowGap }]}>
                <View style={styles.loginCol}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                    {r.value}
                  </Text>
                </View>
                <View style={styles.vpill}>
                  <CircleCheck size={t.vpillGlyph} color={status.active} strokeWidth={2} />
                  <Text style={styles.vpillText} {...shrinkToFit(0.8)}>
                    {r.pill}
                  </Text>
                </View>
              </View>
            </Fragment>
          ))}
        </View>

        <Text style={styles.section}>{d.controlsTitle}</Text>
        <View style={styles.card}>
          {d.controls.map((r, i) => (
            <Fragment key={r.title}>
              {i > 0 ? <View style={styles.rule} /> : null}
              <View style={[styles.ctrlRow, i > 0 && { marginTop: t.rowGap }]}>
                <View style={styles.tile}>
                  {i === 0 ? (
                    <Smartphone size={t.tileGlyph} color="#4D463D" strokeWidth={1.8} />
                  ) : (
                    <Bell size={t.tileGlyph} color="#4D463D" strokeWidth={1.8} />
                  )}
                </View>
                <View style={styles.ctrlCol}>
                  <Text style={styles.ctrlTitle} {...shrinkToFit(0.8)}>
                    {r.title}
                  </Text>
                  <Text style={styles.ctrlSub}>{r.sub}</Text>
                </View>
                <View style={styles.toggle}>
                  <View style={styles.knob} />
                </View>
              </View>
            </Fragment>
          ))}
        </View>

        <Text style={styles.section}>{d.passwordTitle}</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.card}
          onPress={() => router.push('/advocate/settings/password' as Href)}
        >
          <View style={styles.ctrlRow}>
            <View style={styles.tile}>
              <KeyRound size={t.tileGlyph} color="#4D463D" strokeWidth={1.8} />
            </View>
            <View style={styles.ctrlCol}>
              <Text style={styles.ctrlTitle} {...shrinkToFit(0.8)}>
                {d.password.title}
              </Text>
              <Text style={styles.ctrlSub} {...shrinkToFit(0.8)}>
                {d.password.sub}
              </Text>
            </View>
            <ChevronRight size={t.chevron} color="#4D463D" strokeWidth={2.2} />
          </View>
        </Pressable>

        <Text style={styles.section}>{d.sessionsTitle}</Text>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            style={styles.ctrlRow}
            onPress={() => router.push('/advocate/settings/devices' as Href)}
          >
            <View style={styles.tile}>
              <MonitorSmartphone size={t.tileGlyph} color="#4D463D" strokeWidth={1.8} />
            </View>
            <View style={styles.ctrlCol}>
              <View style={styles.titleRow}>
                <Text style={styles.ctrlTitle} {...shrinkToFit(0.8)}>
                  {d.devices.title}
                </Text>
                <View style={styles.greenDot} />
              </View>
              <Text style={styles.ctrlSub}>{d.devices.sub}</Text>
            </View>
            <ChevronRight size={t.chevron} color="#4D463D" strokeWidth={2.2} />
          </Pressable>
          <View style={styles.rule} />
          <View style={[styles.ctrlRow, { marginTop: t.rowGap }]}>
            <View style={[styles.tile, styles.tileDanger]}>
              <LogOut size={t.tileGlyph} color={advForensicRed.declineColour} strokeWidth={1.8} />
            </View>
            <View style={styles.ctrlCol}>
              <Text style={[styles.ctrlTitle, styles.danger]} {...shrinkToFit(0.8)}>
                {d.signOut.title}
              </Text>
              <Text style={[styles.ctrlSub, styles.dangerSub]} {...shrinkToFit(0.8)}>
                {d.signOut.sub}
              </Text>
            </View>
            <ChevronRight size={t.chevron} color={advForensicRed.declineColour} strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.note}>
          <View style={styles.noteTile}>
            <Gavel size={t.noteGlyph} color="#4D463D" strokeWidth={1.8} />
          </View>
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
  },
  headCol: { flex: 1, marginLeft: 14 },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: '#6B6B6B',
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  shield: {
    width: t.shieldBtn,
    height: t.shieldBtn,
    borderRadius: 10,
    backgroundColor: '#F2EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 30, alignItems: 'center' },

  hero: {
    marginTop: t.heroTop,
    width: t.heroW,
    height: t.heroH,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPin: {
    width: t.heroGlyph,
    height: t.heroGlyph,
    borderTopLeftRadius: t.heroGlyph / 2,
    borderTopRightRadius: t.heroGlyph / 2,
    borderBottomLeftRadius: t.heroGlyph / 2,
    borderBottomRightRadius: 6,
    borderWidth: 1.4,
    borderColor: '#DED2C0',
    backgroundColor: '#FBF8F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTick: { position: 'absolute', right: 32, bottom: 32 },
  pill: {
    marginTop: t.pillTop,
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillTrack,
    color: '#8C6B3F',
  },
  h1: {
    marginTop: t.h1Top,
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    color: '#1B1C1C',
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

  section: {
    marginTop: t.sectionTop,
    marginBottom: t.sectionGap,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: '#6B6B6B',
  },
  card: {
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  rule: { marginTop: t.rowRuleTop, height: 1, backgroundColor: '#EFEBE8' },

  loginRow: { flexDirection: 'row', alignItems: 'center' },
  loginCol: { flex: 1 },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: '#6B6B6B' },
  rowValue: {
    marginTop: t.rowValueTop,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    color: '#1B1C1C',
  },
  vpill: {
    marginLeft: 10,
    height: t.vpillH,
    borderRadius: t.vpillRadius,
    paddingHorizontal: t.vpillPadX,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vpillText: {
    marginLeft: 5,
    fontFamily: font.appSemi,
    fontSize: t.vpillSize,
    color: '#0F7A4F',
  },

  ctrlRow: { flexDirection: 'row', alignItems: 'center' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  tileDanger: { backgroundColor: t.dangerTileBg },
  ctrlCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  greenDot: {
    marginLeft: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: status.active,
  },
  ctrlTitle: { fontFamily: font.appHeading, fontSize: t.ctrlTitleSize, color: '#1B1C1C' },
  ctrlSub: {
    marginTop: t.ctrlSubTop,
    fontFamily: font.appBody,
    fontSize: t.ctrlSubSize,
    lineHeight: t.ctrlSubLine,
    color: '#4D463D',
  },
  danger: { color: advForensicRed.declineColour },
  dangerSub: { color: advForensicRed.declineColour },

  toggle: {
    marginLeft: 10,
    width: t.toggleW,
    height: t.toggleH,
    borderRadius: t.toggleH / 2,
    backgroundColor: t.toggleOn,
    padding: t.togglePad,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  knob: {
    width: t.toggleKnob,
    height: t.toggleKnob,
    borderRadius: t.toggleKnob / 2,
    backgroundColor: '#FFFFFF',
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
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTile / 2,
    backgroundColor: '#E8E4E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#1B1C1C',
  },
});
