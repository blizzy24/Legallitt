import DemoPressable from '../../../../components/DemoPressable';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Info,
  ListChecks,
  Mail,
  MapPin,
  SendHorizontal,
  Truck,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_DISPATCH, ADV_NOTICE_RECIPIENT } from '../../../../data/advocateSide';
import { advNoticeDispatch as t, colors, font, ink } from '../../../../constants/theme';

// Prepare for dispatch (design/193).
//
// ⚠ TWO PRIMARY ACTIONS, no stated relationship. The screen ends with "Continue to
// Send →" and then "Confirm Dispatch", both styled as the primary. Nothing says
// which advances the flow, whether Confirm Dispatch is terminal, or what happens to
// the other. Built as drawn, with Continue to Send routing onward and Confirm
// Dispatch inert.
//
// ⚠ The caption again hardcodes Blue Dart, where design/194 still offers a choice
// and design/200 tracks under DHL Express.
//
// ⚠ design/193 draws two Done and two Pending checklist rows but NO INTERACTION for
// completing them. The pending rows are made tappable here, since a checklist you
// cannot check is not a checklist — the design shows states but not the transition.

export default function AdvocateNoticeDispatchScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_NOTICE_DISPATCH;
  const [done, setDone] = useState<string[]>(
    d.checklist.filter((c) => c.done).map((c) => c.id),
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.readyCard]}>
          <View style={styles.readyIcon}>
            <Truck size={t.readyIconGlyph} color="#1E7A44" />
          </View>
          <View style={styles.readyText}>
            <View style={styles.readyTitleRow}>
              <Text style={styles.readyTitle} {...shrinkToFit(0.7)}>
                {d.ready.title}
              </Text>
              <View style={styles.readyChip}>
                <Text style={styles.readyChipText} {...shrinkToFit(0.8)}>
                  {d.ready.chip}
                </Text>
              </View>
            </View>
            <Text style={styles.readyBody}>{d.ready.body}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <FileText size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {d.docLabel}
            </Text>
          </View>

          <View style={styles.doc}>
            <View style={styles.docIcon}>
              <FileText size={t.docIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.docText}>
              <Text style={styles.docName} {...shrinkToFit(0.7)}>
                {d.doc.name}
              </Text>
              <Text style={styles.docMeta} {...shrinkToFit(0.7)}>
                {d.doc.meta}
              </Text>
            </View>
            <View style={styles.docChip}>
              <Check size={t.docChipIcon} color={t.docChipColour} />
              <Text style={styles.docChipText} {...shrinkToFit(0.8)}>
                {d.doc.chip}
              </Text>
            </View>
          </View>

          {/* Inert — the prototype has no file output. */}
          <Pressable accessibilityRole="button" style={styles.dl}>
            <Download size={t.dlIcon} color={colors.textPrimary} />
            <Text style={styles.dlText} {...shrinkToFit(0.8)}>
              {d.download}
            </Text>
          </Pressable>
          <Text style={styles.dlNote}>{d.downloadNote}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Mail size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {d.noticeToLabel}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {d.noticeToChip}
              </Text>
            </View>
          </View>
          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {ADV_NOTICE_RECIPIENT.name}
          </Text>
          <View style={styles.addr}>
            <MapPin size={t.addrIcon} color={colors.textBody} />
            <Text style={styles.addrText}>{ADV_NOTICE_RECIPIENT.address}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <ListChecks size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {d.checklistLabel}
            </Text>
          </View>
          <Text style={styles.intro}>{d.checklistIntro}</Text>

          {d.checklist.map((c) => {
            const isDone = done.includes(c.id);
            return (
              <Pressable
                key={c.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                // design/193 shows both states but no transition; tapping toggles.
                onPress={() =>
                  setDone((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))
                }
                style={styles.row}
              >
                <View style={[styles.rowDot, isDone && styles.rowDotDone]}>
                  {isDone ? <Check size={t.rowDotIcon} color={ink.onBrand} /> : <View style={styles.rowPip} />}
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} {...shrinkToFit(0.75)}>
                    {c.title}
                  </Text>
                  <Text style={styles.rowSub}>{c.sub}</Text>
                </View>
                <View style={[styles.rowChip, isDone ? styles.rowChipDone : styles.rowChipPend]}>
                  <Text
                    style={[styles.rowChipText, isDone ? styles.rowChipTextDone : styles.rowChipTextPend]}
                    {...shrinkToFit(0.8)}
                  >
                    {isDone ? 'Done' : 'Pending'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.note]}>
          <Info size={t.noteIcon} color={colors.brandDark} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/send` as Href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.75)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} style={styles.ctaIcon} />
        </Pressable>
        {/* ⚠ Names a courier design/194 still lets you choose. */}
        <Text style={styles.cap} {...shrinkToFit(0.75)}>
          {d.ctaCaption}
        </Text>
      </ScrollView>

      {/* ⚠ Second primary action; see the note at the top of this file. Inert. */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <DemoPressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
        >
          <SendHorizontal size={t.confirmIcon} color={ink.onBrand} />
          <Text style={styles.confirmText} {...shrinkToFit(0.75)}>
            {d.confirm}
          </Text>
        </DemoPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 28 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  readyCard: { flexDirection: 'row' },
  readyIcon: {
    width: t.readyIcon,
    height: t.readyIcon,
    borderRadius: t.readyIcon / 2,
    backgroundColor: t.readyIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyText: { flex: 1, minWidth: 0, marginLeft: t.readyIconGap },
  readyTitleRow: { flexDirection: 'row', alignItems: 'center' },
  readyTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.readyTitleSize, color: colors.textPrimary },
  readyChip: {
    marginLeft: t.readyChipGap,
    minHeight: t.readyChipHeight,
    borderRadius: t.readyChipRadius,
    paddingHorizontal: t.readyChipPadX,
    backgroundColor: t.readyChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyChipText: { fontFamily: font.appBody, fontSize: t.readyChipSize, color: t.readyChipColour },
  readyBody: {
    marginTop: t.readyBodyGap,
    fontFamily: font.appBody,
    fontSize: t.readyBodySize,
    lineHeight: t.readyBodyLineHeight,
    color: colors.textBody,
  },

  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    marginLeft: t.labelIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textPrimary,
  },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textPrimary },

  doc: {
    marginTop: t.docGap,
    borderRadius: t.docRadius,
    backgroundColor: t.docBg,
    padding: t.docPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: t.docIcon,
    height: t.docIcon,
    borderRadius: t.docIconRadius,
    backgroundColor: t.docIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap, marginRight: 8 },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: colors.textBody },
  docChip: {
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docChipText: {
    marginLeft: t.docChipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.docChipSize,
    color: t.docChipColour,
  },

  dl: {
    marginTop: t.dlGap,
    minHeight: t.dlHeight,
    borderRadius: t.dlRadius,
    backgroundColor: t.dlBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dlText: { marginLeft: t.dlIconGap, fontFamily: font.appHeading, fontSize: t.dlSize, color: colors.textPrimary },
  dlNote: {
    marginTop: t.dlNoteGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.dlNoteSize,
    lineHeight: t.dlNoteLineHeight,
    color: colors.textBody,
  },

  name: { marginTop: t.nameGap, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  addr: {
    marginTop: t.addrGap,
    borderRadius: t.addrRadius,
    backgroundColor: t.addrBg,
    padding: t.addrPad,
    flexDirection: 'row',
  },
  addrText: {
    marginLeft: t.addrIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.addrSize,
    lineHeight: t.addrLineHeight,
    color: colors.textPrimary,
  },

  intro: { marginTop: t.introGap, fontFamily: font.appBody, fontSize: t.introSize, color: colors.textBody },
  row: {
    marginTop: t.rowGap,
    borderRadius: t.rowRadius,
    backgroundColor: t.rowBg,
    padding: t.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDot: {
    width: t.rowDot,
    height: t.rowDot,
    borderRadius: t.rowDot / 2,
    backgroundColor: t.rowPendingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDotDone: { backgroundColor: t.rowDoneBg },
  rowPip: {
    width: t.rowPip,
    height: t.rowPip,
    borderRadius: t.rowPip / 2,
    backgroundColor: '#C9C1B4',
  },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowGapX, marginRight: 8 },
  rowTitle: { fontFamily: font.appHeading, fontSize: t.rowTitleSize, color: colors.textPrimary },
  rowSub: {
    marginTop: t.rowSubGap,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    lineHeight: t.rowSubLineHeight,
    color: colors.textBody,
  },
  rowChip: {
    minHeight: t.rowChipHeight,
    borderRadius: t.rowChipRadius,
    paddingHorizontal: t.rowChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowChipDone: { backgroundColor: t.rowChipDoneBg },
  rowChipPend: { backgroundColor: t.rowChipPendBg },
  rowChipText: { fontFamily: font.appSemi, fontSize: t.rowChipSize },
  rowChipTextDone: { color: t.rowChipDoneColour },
  rowChipTextPend: { color: t.rowChipPendColour },

  note: { backgroundColor: t.noteBg, flexDirection: 'row' },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },

  cta: {
    marginTop: t.ctaGap - t.cardGap,
    minHeight: t.ctaHeight,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ctaText: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.ctaSize, color: ink.onBrand },
  ctaIcon: { marginLeft: t.ctaIconGap },
  cap: {
    marginTop: t.capGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.capSize,
    color: colors.textBody,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  confirm: {
    minHeight: t.confirmHeight,
    borderRadius: t.confirmRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmText: {
    marginLeft: t.confirmIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.confirmSize,
    color: ink.onBrand,
  },
  pressed: { opacity: 0.85 },
});
