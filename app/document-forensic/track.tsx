import { router } from 'expo-router';
import { Check, ChevronLeft, FileText, Headset, Lock, MessageSquare } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfTrack as t, font, ink } from '../../constants/theme';
import { DF_REQUEST_ID, DF_STAGES, DF_TRACK as d } from '../../data/documentForensic';

// Track Analysis (design/89).
//
// REPORTED — design/89's timestamps read 23 May 2026; every other dated screen in the
// app uses September 2026, so these are moved to September. Times kept.
//
// REPORTED — AN ADMIN ROLE IS ASSUMED. "Assigned by Admin" is a stage in this
// timeline, which means the service expects an internal admin with a work queue. No
// admin screen exists anywhere in the batch, and no other service's timeline names an
// internal actor. Flagged as a whole missing surface, not a copy issue.

export default function DocumentForensicTrackScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Track Analysis</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.noteGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.idCard}>
          <FileText size={t.idIcon} color={colors.textBody} />
          <View style={styles.idText}>
            <Text style={styles.idLabel} {...shrinkToFit(0.8)}>Request ID</Text>
            <Text style={styles.idValue} {...shrinkToFit(0.75)}>{DF_REQUEST_ID}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText} {...shrinkToFit(0.8)}>{d.status}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>Analysis Progress</Text>
          <View style={styles.stageChip}>
            <Text style={styles.stageChipText} {...shrinkToFit(0.8)}>{d.stageChip}</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {DF_STAGES.map((s, i) => {
            const last = i === DF_STAGES.length - 1;
            const done = s.state === 'done';
            const active = s.state === 'active';
            return (
              <View key={s.title} style={styles.row}>
                <View style={styles.rail}>
                  <View style={[styles.marker, done && styles.markerDone, active && styles.markerActive]}>
                    {done && <Check size={t.markerGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {active && <View style={styles.markerCore} />}
                  </View>
                  {!last && <View style={[styles.line, done && styles.lineDone]} />}
                </View>
                <View style={[styles.body, !last && styles.bodyGap]}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle} {...shrinkToFit(0.8)}>{s.title}</Text>
                    {s.state === 'pending' && (
                      <Text style={styles.state} {...shrinkToFit(0.8)}>Pending</Text>
                    )}
                  </View>
                  {s.state !== 'pending' && (
                    <Text style={styles.itemDetail} {...shrinkToFit(0.8)}>{s.detail}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <MessageSquare size={t.buttonIcon} color={ink.accent} />
          <Text style={styles.buttonLabel} {...shrinkToFit(0.8)}>Chat with Expert</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          style={({ pressed }) => [styles.button, styles.buttonStacked, pressed && styles.pressed]}
        >
          <Headset size={t.buttonIcon} color={ink.accent} />
          <Text style={styles.buttonLabel} {...shrinkToFit(0.8)}>Contact Support</Text>
        </Pressable>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <Lock size={t.noteIconGlyph} color={ink.accent} />
          </View>
          <View style={styles.noteText}>
            <Text style={styles.noteTitle} {...shrinkToFit(0.8)}>{d.noteTitle}</Text>
            <Text style={styles.noteBody}>{d.noteBody}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  headerSpacer: { width: t.backIcon },
  content: { paddingHorizontal: t.padX },
  idCard: {
    marginTop: t.idGap,
    borderRadius: t.idRadius,
    backgroundColor: t.idBg,
    padding: t.idPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: { flex: 1, minWidth: 0, marginLeft: t.idIconGap },
  idLabel: { fontFamily: font.appBody, fontSize: t.idLabelSize, color: colors.textBody },
  idValue: {
    marginTop: t.idValueGap,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: colors.textPrimary,
  },
  chip: {
    marginLeft: 10,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipText },
  sectionRow: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  stageChip: {
    marginLeft: 10,
    minHeight: t.stageChipHeight,
    borderRadius: t.stageChipRadius,
    paddingHorizontal: t.stageChipPadX,
    backgroundColor: t.stageChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageChipText: { fontFamily: font.appBody, fontSize: t.stageChipSize, color: colors.textBody },
  timeline: { marginTop: t.timelineTop },
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
  markerActive: { borderWidth: 4, borderColor: t.activeRing, backgroundColor: colors.card },
  markerCore: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: t.active },
  line: { flex: 1, width: t.line, marginVertical: t.lineGap, backgroundColor: t.pending },
  lineDone: { backgroundColor: t.done },
  body: { flex: 1, minWidth: 0, marginLeft: t.markerGap },
  bodyGap: { marginBottom: t.itemGap },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.itemTitleSize,
    color: colors.textPrimary,
  },
  state: { marginLeft: 10, fontFamily: font.appBody, fontSize: t.stateSize, color: t.pendingText },
  itemDetail: {
    marginTop: t.itemDetailGap,
    fontFamily: font.appBody,
    fontSize: t.itemDetailSize,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    borderWidth: 1,
    borderColor: t.buttonBorder,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStacked: { marginTop: t.buttonStackGap },
  pressed: { opacity: 0.85 },
  buttonLabel: {
    marginLeft: t.buttonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.accent,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    width: t.noteIcon,
    height: t.noteIcon,
    borderRadius: t.noteIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { flex: 1, minWidth: 0, marginLeft: t.noteIconGap },
  noteTitle: { fontFamily: font.appHeading, fontSize: t.noteTitleSize, color: colors.textPrimary },
  noteBody: {
    marginTop: t.noteBodyGap,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: colors.textBody,
  },
});
