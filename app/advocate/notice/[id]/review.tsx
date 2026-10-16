import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  CircleCheck,
  Clock,
  Copy,
  EllipsisVertical,
  Eye,
  FileText,
  MessageSquare,
  MessageSquareText,
  SquarePen,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_PREVIEW_TOGGLES } from '../../../../constants/dev';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_REVIEW } from '../../../../data/advocateSide';
import { advNoticeReview as t, colors, font, ink } from '../../../../constants/theme';

// Client review (designs 190 and 191) — one screen, two states.
//
// design/191 is identical to design/190 above the awaiting card. It differs in
// exactly two ways: the "Client Approved" outcome row is REMOVED, and the "Changes
// Requested" row gains a note box. Nothing in the prototype can make a client
// respond, so the state toggle sits behind DEV_PREVIEW_TOGGLES.
//
// ⚠ design/190 clips its filename to "Legal_Notice_Rahul_Sharm" — no extension, and
// the last letter of the surname missing. ⚠ design/191's note reads "Client
// Suggestion recieve here." Both kept as drawn.
//
// Every control is inert except the state toggle and navigation (including the
// two outcome rows).

export default function AdvocateNoticeReviewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = ADV_NOTICE_REVIEW;
  const [changesRequested, setChangesRequested] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <Pressable onPress={() => previewNotice("More")} accessibilityRole="button" accessibilityLabel="More" hitSlop={8}>
          <EllipsisVertical size={t.kebab} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Neutral placeholder — design/190's illustration, at the drawn size. */}
        <View style={styles.illo}>
          <FileText size={t.illoGlyph} color={colors.brandDark} />
        </View>

        <View style={styles.chip}>
          <View style={styles.chipDot} />
          <Text style={styles.chipText} {...shrinkToFit(0.75)}>
            {r.stateChip}
          </Text>
        </View>

        <Text style={styles.heading} {...shrinkToFit(0.75)}>
          {r.heading}
        </Text>
        <Text style={styles.body}>{r.body}</Text>

        <View style={styles.card}>
          <View style={styles.refRow}>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText} {...shrinkToFit(0.8)}>
                {r.typeChip}
              </Text>
            </View>
            <Text style={styles.ref} {...shrinkToFit(0.75)}>
              {r.ref}
            </Text>
            <Pressable onPress={() => previewNotice("Copy reference")} accessibilityRole="button" accessibilityLabel="Copy reference" hitSlop={8}>
              <Copy size={t.refCopy} color={colors.textPrimary} style={styles.refCopy} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {[0, 2].map((start) => (
              <View key={start} style={[styles.gridRow, start > 0 && styles.gridRowNext]}>
                {r.cells.slice(start, start + 2).map((c) => (
                  <View key={c.label} style={styles.cell}>
                    <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                      {c.label}
                    </Text>
                    <View style={styles.cellValueRow}>
                      {c.dot && <View style={styles.cellDot} />}
                      <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                        {c.value}
                      </Text>
                      {c.verified && (
                        <BadgeCheck size={t.cellTick} color="#1E9E4A" style={styles.cellTick} />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.section} {...shrinkToFit(0.8)}>
          {r.progressLabel}
        </Text>

        <View style={styles.card}>
          {r.progress.map((s, i) => (
            <View key={s.title} style={[styles.step, i > 0 && styles.stepNext]}>
              <View style={styles.stepRailCol}>
                <View
                  style={[
                    styles.stepDot,
                    s.state === 'done' && styles.stepDone,
                    s.state === 'active' && styles.stepActive,
                  ]}
                >
                  {s.state === 'done' && <Check size={t.stepDotIcon} color={ink.onBrand} />}
                  {s.state === 'active' && <Clock size={t.stepDotIcon} color={ink.onBrand} />}
                  {s.state === 'upcoming' && <View style={styles.stepPip} />}
                </View>
                {i < r.progress.length - 1 && <View style={styles.stepRail} />}
              </View>
              <View style={styles.stepText}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitle} {...shrinkToFit(0.75)}>
                    {s.title}
                  </Text>
                  {s.chip && (
                    <View style={styles.stepChip}>
                      <Text style={styles.stepChipText} {...shrinkToFit(0.8)}>
                        {s.chip}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stepStatus} {...shrinkToFit(0.7)}>
                  {s.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.section} {...shrinkToFit(0.8)}>
          {r.draftLabel}
        </Text>

        <View style={[styles.card, styles.fileCard]}>
          <View style={styles.fileIcon}>
            <FileText size={t.fileIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.fileText}>
            <Text style={styles.fileName} {...shrinkToFit(0.7)}>
              {r.draftFile.name}
            </Text>
            <View style={styles.fileMetaRow}>
              <Text style={styles.fileMeta} {...shrinkToFit(0.75)}>
                {r.draftFile.size} •
              </Text>
              <CircleCheck size={t.fileTick} color={t.fileStatusColour} style={styles.fileTick} />
              <Text style={styles.fileStatus} {...shrinkToFit(0.75)}>
                {r.draftFile.status}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => router.push(`/advocate/notice/${id}/draft` as Href)} accessibilityRole="button" style={styles.fileBtn}>
            <Text style={styles.fileBtnText} {...shrinkToFit(0.8)}>
              {r.viewDraft}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.msgHead}>
            <MessageSquare size={t.msgIcon} color={colors.textPrimary} />
            <Text style={[styles.section, styles.msgLabel]} {...shrinkToFit(0.75)}>
              {r.messageLabel}
            </Text>
            <Text style={styles.msgMeta} {...shrinkToFit(0.8)}>
              {r.messageMeta}
            </Text>
          </View>
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>{r.message}</Text>
          </View>
        </View>

        <View style={styles.await}>
          <View style={styles.awaitHead}>
            <View style={styles.awaitIcon}>
              <Clock size={t.awaitIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.awaitText}>
              <Text style={styles.awaitTitle} {...shrinkToFit(0.75)}>
                {r.awaiting.title}
              </Text>
              <Text style={styles.awaitBody}>{r.awaiting.body}</Text>
            </View>
          </View>

          {/* design/191 removes this row entirely. */}
          {/* The two outcome rows lead to what each outcome implies: approval to
              design/192 (final notice ready), changes to design/267's response
              editor (Confirm & Upload). */}
          {!changesRequested && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/advocate/notice/${id}/final` as Href)}
              style={styles.outcome}
            >
              <View style={styles.outcomeRow}>
                <CircleCheck size={t.outcomeIcon} color="#1E9E4A" />
                <Text style={styles.outcomeText}>{r.awaiting.approved}</Text>
              </View>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/advocate/notice/response-editor' as Href)}
            style={styles.outcome}
          >
            <View style={styles.outcomeRow}>
              <SquarePen size={t.outcomeIcon} color={colors.textPrimary} />
              <Text style={styles.outcomeText}>{r.awaiting.changes}</Text>
            </View>
            {/* design/191 only. Static — the prototype has no text entry. */}
            {changesRequested && (
              <View style={styles.note}>
                <Text style={styles.noteText}>{r.awaiting.note}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Development only — nothing in the prototype can make a client respond. */}
        {DEV_PREVIEW_TOGGLES && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setChangesRequested((v) => !v)}
            style={styles.devLink}
          >
            <Text style={styles.devLinkText}>
              {changesRequested
                ? 'Preview state: awaiting review (design/190)'
                : 'Preview state: changes requested (design/191)'}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.barRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/notice/${id}/response` as Href)}
            style={({ pressed }) => [styles.barBtn, styles.barBrand, pressed && styles.pressed]}
          >
            <Eye size={t.barBtnIcon} color={ink.onBrand} />
            <Text style={styles.barBrandText} {...shrinkToFit(0.75)}>
              {r.viewDraft}
            </Text>
          </Pressable>
          <Pressable onPress={() => previewNotice(r.messageClient)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.barBtn, styles.barLight, pressed && styles.pressed]}
          >
            <MessageSquareText size={t.barBtnIcon} color={colors.textPrimary} />
            <Text style={styles.barLightText} {...shrinkToFit(0.7)}>
              {r.messageClient}
            </Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/fee` as Href)}
          style={styles.barLink}
        >
          <Text style={styles.barLinkText} {...shrinkToFit(0.8)}>
            {r.backToRequest}
          </Text>
        </Pressable>
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
    marginLeft: t.kebabGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28, alignItems: 'center' },
  illo: {
    marginTop: t.illoTop,
    width: t.illo,
    height: t.illo,
    borderRadius: t.illoRadius,
    backgroundColor: t.illoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    marginTop: t.chipGap,
    minHeight: t.chipHeight,
    maxWidth: '100%',
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    marginRight: t.chipDotGap,
    backgroundColor: t.chipColour,
  },
  chipText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    letterSpacing: t.chipSpacing,
    color: t.chipColour,
  },
  heading: {
    marginTop: t.headingGap,
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

  card: {
    alignSelf: 'stretch',
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  refRow: { flexDirection: 'row', alignItems: 'center' },
  typeChip: {
    minHeight: t.typeChipHeight,
    borderRadius: t.typeChipRadius,
    paddingHorizontal: t.typeChipPadX,
    backgroundColor: t.typeChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  typeChipText: { fontFamily: font.appBody, fontSize: t.typeChipSize, color: t.typeChipColour },
  ref: {
    marginLeft: 'auto',
    paddingLeft: 8,
    flexShrink: 1,
    fontFamily: font.mono,
    fontSize: t.refSize,
    letterSpacing: t.refSpacing,
    color: colors.textPrimary,
  },
  refCopy: { marginLeft: t.refCopyGap },

  grid: {
    marginTop: t.gridGap,
    borderRadius: t.gridRadius,
    backgroundColor: t.gridBg,
    padding: t.gridPad,
  },
  gridRow: { flexDirection: 'row' },
  gridRowNext: { marginTop: t.gridRowGap },
  cell: { flex: 1, minWidth: 0, paddingRight: 8 },
  cellLabel: {
    fontFamily: font.appSemi,
    fontSize: t.cellLabelSize,
    letterSpacing: t.cellLabelSpacing,
    color: colors.textBody,
  },
  cellValueRow: { marginTop: t.cellValueGap, flexDirection: 'row', alignItems: 'center' },
  cellValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },
  cellTick: { marginLeft: t.cellTickGap },
  cellDot: {
    width: t.cellDot,
    height: t.cellDot,
    borderRadius: t.cellDot / 2,
    marginRight: t.cellDotGap,
    backgroundColor: '#1E9E4A',
  },

  section: {
    alignSelf: 'flex-start',
    marginTop: t.sectionGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textPrimary,
  },

  step: { flexDirection: 'row' },
  stepNext: { marginTop: 0 },
  stepRailCol: { alignItems: 'center' },
  stepDot: {
    width: t.stepDot,
    height: t.stepDot,
    borderRadius: t.stepDot / 2,
    backgroundColor: t.stepUpcomingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: t.stepDoneBg },
  stepActive: { backgroundColor: t.stepActiveBg },
  stepPip: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#B6AE9F' },
  stepRail: { flex: 1, width: t.stepRailW, minHeight: t.stepGapY, backgroundColor: t.stepRail },
  stepText: { flex: 1, minWidth: 0, marginLeft: t.stepGapX, paddingBottom: t.stepGapY },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center' },
  stepTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.stepTitleSize, color: colors.textPrimary },
  stepChip: {
    marginLeft: t.stepChipGap,
    minHeight: t.stepChipHeight,
    borderRadius: t.stepChipRadius,
    paddingHorizontal: t.stepChipPadX,
    backgroundColor: t.stepChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepChipText: { fontFamily: font.appBody, fontSize: t.stepChipSize, color: t.stepChipColour },
  stepStatus: {
    marginTop: t.stepStatusGap,
    fontFamily: font.appBody,
    fontSize: t.stepStatusSize,
    color: colors.textBody,
  },

  fileCard: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap, marginRight: 8 },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMetaRow: { marginTop: t.fileMetaGap, flexDirection: 'row', alignItems: 'center' },
  fileMeta: { fontFamily: font.appBody, fontSize: t.fileMetaSize, color: colors.textBody },
  fileTick: { marginLeft: t.fileTickGap },
  fileStatus: {
    marginLeft: t.fileTickGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.fileMetaSize,
    color: t.fileStatusColour,
  },
  fileBtn: {
    minHeight: t.fileBtnHeight,
    borderRadius: t.fileBtnRadius,
    paddingHorizontal: t.fileBtnPadX,
    backgroundColor: t.fileBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileBtnText: { fontFamily: font.appBody, fontSize: t.fileBtnSize, color: colors.textPrimary },

  msgHead: { flexDirection: 'row', alignItems: 'center' },
  msgLabel: { marginTop: 0, marginLeft: t.msgIconGap, flex: 1, minWidth: 0, marginRight: 8 },
  msgMeta: { fontFamily: font.appBody, fontSize: t.msgMetaSize, color: colors.textBody },
  msgBox: {
    marginTop: t.msgBoxGap,
    borderRadius: t.msgBoxRadius,
    backgroundColor: t.msgBoxBg,
    padding: t.msgBoxPad,
  },
  msgText: {
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.msgSize,
    lineHeight: t.msgLineHeight,
    color: colors.textPrimary,
  },

  await: {
    alignSelf: 'stretch',
    marginTop: t.cardGap,
    borderRadius: t.awaitRadius,
    backgroundColor: t.awaitBg,
    padding: t.awaitPad,
  },
  awaitHead: { flexDirection: 'row' },
  awaitIcon: {
    width: t.awaitIcon,
    height: t.awaitIcon,
    borderRadius: t.awaitIcon / 2,
    backgroundColor: t.awaitIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  awaitText: { flex: 1, minWidth: 0, marginLeft: t.awaitIconGap },
  awaitTitle: { fontFamily: font.appHeading, fontSize: t.awaitTitleSize, color: colors.textPrimary },
  awaitBody: {
    marginTop: t.awaitBodyGap,
    fontFamily: font.appBody,
    fontSize: t.awaitBodySize,
    lineHeight: t.awaitBodyLineHeight,
    color: colors.textBody,
  },
  outcome: {
    marginTop: t.outcomeGap,
    marginLeft: t.awaitIcon + t.awaitIconGap,
    borderRadius: t.outcomeRadius,
    backgroundColor: t.outcomeBg,
    padding: t.outcomePad,
  },
  outcomeRow: { flexDirection: 'row' },
  outcomeText: {
    marginLeft: t.outcomeIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appSemi,
    fontSize: t.outcomeSize,
    lineHeight: t.outcomeLineHeight,
    color: colors.textPrimary,
  },
  note: {
    marginTop: t.noteGap,
    minHeight: t.noteMinHeight,
    borderRadius: t.noteRadius,
    borderWidth: 1,
    borderColor: t.noteBorder,
    backgroundColor: t.noteBg,
    padding: t.notePad,
  },
  noteText: { fontFamily: font.appBody, fontSize: t.noteSize, color: colors.textBody },

  devLink: { marginTop: 22, alignItems: 'center' },
  devLinkText: { fontFamily: font.appBody, fontSize: 12, color: colors.textBody },

  bar: {
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
    backgroundColor: t.bg,
    borderTopWidth: 1,
    borderTopColor: t.barBorder,
  },
  barRow: { flexDirection: 'row', gap: t.barGapX },
  barBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.barBtnHeight,
    borderRadius: t.barBtnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  barBrand: { backgroundColor: '#6B5A45' },
  barBrandText: {
    marginLeft: t.barBtnIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.barBtnSize,
    color: ink.onBrand,
  },
  barLight: { backgroundColor: t.barLightBg },
  barLightText: {
    marginLeft: t.barBtnIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.barBtnSize,
    color: colors.textPrimary,
  },
  barLink: { marginTop: t.barLinkGap, alignItems: 'center' },
  barLinkText: { fontFamily: font.appSemi, fontSize: t.barLinkSize, color: colors.textPrimary },
  pressed: { opacity: 0.85 },
});
