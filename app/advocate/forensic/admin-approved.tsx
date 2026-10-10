import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Info,
  MailCheck,
  TrendingUp,
  UserRound,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_ADMIN_APPROVED, DF_ADMIN_SHARED } from '../../../data/advocateForensic';
import { advForensicApproved as t, colors, font, ink } from '../../../constants/theme';

// Report approved (design/230).
//
// NOT the same shell as design/231 — measured before building, as asked. design/230
// has a CENTRED header title, a 72pt green success mark in a pale halo, and no
// status chip; design/231 has a LEFT-ALIGNED title, no success mark, and opens on
// a card carrying a chip and a gavel icon. Different chrome, built separately.
//
// ⚠ CASE PROGRESS IS A THIRD TRACKER. design/219 has no rail; design/229 has a
// grey rail and brown dots; this has 26pt PALE GREEN dots with green checks, a
// GREEN rail between completed steps and a TAN rail into the active one. Three
// trackers, three chromes, one flow. Nothing reused between them.
//
// ⚠ "your payout will be added to your Legalitt wallet" — the wallet is an
// unscoped capability the designs now assume twice (design/220 pays into it too).
// Static string; no wallet, balance or ledger is built.
//
// The advocate has no action here beyond View Case and Back to Cases. There is no
// admin role or admin screen in this prototype.

export default function AdvocateForensicAdminApprovedScreen() {
  const insets = useSafeAreaInsets();
  const a = DF_ADMIN_APPROVED;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {a.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.markHalo}>
          <View style={styles.mark}>
            <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.headline} {...shrinkToFit(0.75)}>
          {a.headline}
        </Text>
        <Text style={styles.sub}>{a.sub}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <FolderOpen size={t.cdIcon} color={colors.brandDark} />
            <Text style={styles.cdTitle} {...shrinkToFit(0.75)}>
              {a.caseTitle}
            </Text>
            <View style={styles.ok}>
              <View style={styles.okDot} />
              <Text style={styles.okText} {...shrinkToFit(0.8)}>
                {a.okChip}
              </Text>
            </View>
          </View>
          <View style={styles.rule} />
          {a.rows.map((r, i) => (
            <View key={r.label} style={[styles.cdRow, i === 0 && styles.cdRowFirst]}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              {'pill' in r && r.pill ? (
                <View style={styles.pill}>
                  <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                    {r.value}
                  </Text>
                </View>
              ) : (
                <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                  {r.value}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <BadgeCheck size={t.afIcon} color={colors.brandDark} />
            <Text style={styles.cdTitle} {...shrinkToFit(0.75)}>
              {a.filesTitle}
            </Text>
            <View style={styles.afChip}>
              <Text style={styles.afChipText} {...shrinkToFit(0.8)}>
                {a.filesChip}
              </Text>
            </View>
          </View>
          {[DF_ADMIN_SHARED.report, DF_ADMIN_SHARED.affidavit].map((f, i) => (
            <View key={f.name} style={[styles.file, i === 0 && styles.fileFirst]}>
              <View style={styles.fileIcon}>
                {i === 0 ? (
                  <FileText size={t.fileIconGlyph} color={colors.textPrimary} />
                ) : (
                  <ClipboardCheck size={t.fileIconGlyph} color={colors.textPrimary} />
                )}
              </View>
              <View style={styles.fileText}>
                <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                  {f.name}
                </Text>
                <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                  {f.meta}
                </Text>
              </View>
              <View style={styles.okTag}>
                <Check size={t.okTagIcon} color={t.okColour} strokeWidth={3} />
                <Text style={styles.okTagText} {...shrinkToFit(0.8)}>
                  {a.fileTag}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.sendIcon}>
              <MailCheck size={t.sendIconGlyph} color={colors.brandDark} />
            </View>
            <Text style={styles.sendTitle} {...shrinkToFit(0.75)}>
              {a.sending.title}
            </Text>
          </View>
          <Text style={styles.sendBody}>{a.sending.body}</Text>
          {/* ⚠ The wallet is unscoped — static string only. */}
          <View style={styles.sendNote}>
            <Info size={t.sendNoteIcon} color={colors.textPrimary} style={styles.sendNoteIcon} />
            <Text style={styles.sendNoteText}>{a.sending.note}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <TrendingUp size={t.cpIcon} color={colors.brandDark} />
            <Text style={styles.cdTitle} {...shrinkToFit(0.75)}>
              {a.progressTitle}
            </Text>
          </View>
          <View style={styles.cpRule} />
          <View style={styles.cp}>
            {a.progress.map((item, i) => {
              const next = a.progress[i + 1];
              return (
                <Fragment key={item.title}>
                  <View style={styles.cpRow}>
                    <View style={styles.cpCol}>
                      {item.tone === 'now' ? (
                        <View style={styles.cpHalo}>
                          <View style={styles.cpCentre} />
                        </View>
                      ) : (
                        <View style={styles.cpDone}>
                          <Check size={t.cpDotGlyph} color={t.cpDoneColour} strokeWidth={3} />
                        </View>
                      )}
                      {next && (
                        <View style={styles.cpRailWrap}>
                          <View
                            style={[styles.cpRail, next.tone === 'now' ? styles.cpRailNext : styles.cpRailDone]}
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.cpText}>
                      <Text style={styles.cpItemTitle} {...shrinkToFit(0.75)}>
                        {item.title}
                      </Text>
                      <Text style={['subOk' in item && item.subOk ? styles.cpSubOk : styles.cpSub]}>
                        {item.sub}
                      </Text>
                    </View>
                  </View>
                </Fragment>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/advocate/forensic/df-2026-1048' as Href)}
          style={({ pressed }) => [styles.view, pressed && styles.pressed]}
        >
          <Text style={styles.viewText} {...shrinkToFit(0.8)}>
            {a.viewCase}
          </Text>
          <ArrowRight size={t.viewArrow} color={ink.onBrand} style={styles.viewArrow} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/matters' as Href)}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText} {...shrinkToFit(0.8)}>
            {a.back}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
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
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center' },

  markHalo: {
    marginTop: t.markGap,
    alignSelf: 'center',
    width: t.markHalo,
    height: t.markHalo,
    borderRadius: t.markHalo / 2,
    backgroundColor: t.markHaloBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: t.mark, height: t.mark, borderRadius: t.mark / 2, backgroundColor: t.markBg, alignItems: 'center', justifyContent: 'center' },
  headline: { marginTop: t.headlineGap, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, color: t.subColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  cdTitle: { marginLeft: t.cdIconGap, flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.cdTitleSize, color: colors.textPrimary },
  ok: {
    marginLeft: 'auto',
    minHeight: t.okHeight,
    borderRadius: t.okRadius,
    backgroundColor: t.okBg,
    paddingHorizontal: t.okPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  okDot: { width: t.okDot, height: t.okDot, borderRadius: t.okDot / 2, backgroundColor: t.okColour, marginRight: t.okDotGap },
  okText: { fontFamily: font.appSemi, fontSize: t.okSize, color: t.okColour },
  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: t.ruleColour },
  cdRow: { marginTop: t.rowGapY, flexDirection: 'row', alignItems: 'center' },
  cdRowFirst: { marginTop: t.rowGap },
  rowLabel: { flexShrink: 1, marginRight: 12, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.rowLabelColour },
  rowValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rowValueSize, color: colors.textPrimary },
  pill: {
    marginLeft: 'auto',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    backgroundColor: t.pillBg,
    paddingHorizontal: t.pillPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  pillText: { fontFamily: font.appHeading, fontSize: t.pillSize, color: colors.textPrimary },

  afChip: {
    marginLeft: 'auto',
    minHeight: t.afChipHeight,
    borderRadius: t.afChipRadius,
    backgroundColor: t.afChipBg,
    paddingHorizontal: t.afChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  afChipText: { fontFamily: font.appSemi, fontSize: t.afChipSize, color: t.afChipColour },
  file: { marginTop: t.fileGapY, borderRadius: t.fileRadius, backgroundColor: t.fileBg, padding: t.filePad, flexDirection: 'row', alignItems: 'center' },
  fileFirst: { marginTop: t.fileGap },
  fileIcon: { width: t.fileIcon, height: t.fileIcon, borderRadius: t.fileIconRadius, backgroundColor: t.fileIconBg, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0, marginHorizontal: t.fileIconGap },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, color: t.fileMetaColour },
  okTag: {
    minHeight: t.okTagHeight,
    borderRadius: t.okTagRadius,
    backgroundColor: t.okBg,
    paddingHorizontal: t.okTagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  okTagText: { marginLeft: t.okTagIconGap, fontFamily: font.appSemi, fontSize: t.okTagSize, color: t.okColour },

  sendIcon: { width: t.sendIcon, height: t.sendIcon, borderRadius: t.sendIconRadius, backgroundColor: t.sendIconBg, alignItems: 'center', justifyContent: 'center' },
  sendTitle: { marginLeft: t.sendIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.sendTitleSize, color: colors.textPrimary },
  sendBody: { marginTop: t.sendBodyGap, fontFamily: font.appBody, fontSize: t.sendBodySize, lineHeight: t.sendBodyLineHeight, color: colors.textPrimary },
  sendNote: { marginTop: t.sendNoteGap, borderRadius: t.sendNoteRadius, backgroundColor: t.sendNoteBg, padding: t.sendNotePad, flexDirection: 'row', alignItems: 'flex-start' },
  sendNoteIcon: { marginTop: 1 },
  sendNoteText: { flex: 1, minWidth: 0, marginLeft: t.sendNoteIconGap, fontFamily: font.appBody, fontSize: t.sendNoteSize, lineHeight: t.sendNoteLineHeight, color: colors.textPrimary },

  cpRule: { marginTop: t.cpRuleGap, height: 1, backgroundColor: t.ruleColour },
  cp: { marginTop: t.cpGap },
  cpRow: { flexDirection: 'row', alignItems: 'stretch' },
  cpCol: { alignItems: 'center', width: t.cpNowHalo },
  cpDone: { width: t.cpDot, height: t.cpDot, borderRadius: t.cpDot / 2, backgroundColor: t.cpDoneBg, alignItems: 'center', justifyContent: 'center' },
  cpHalo: { width: t.cpNowHalo, height: t.cpNowHalo, borderRadius: t.cpNowHalo / 2, backgroundColor: t.cpNowHaloBg, alignItems: 'center', justifyContent: 'center' },
  cpCentre: { width: t.cpNowCentre, height: t.cpNowCentre, borderRadius: t.cpNowCentre / 2, backgroundColor: t.cpNowColour },
  cpRailWrap: { flex: 1, alignItems: 'center' },
  cpRail: { flex: 1, width: t.cpRailW },
  cpRailDone: { backgroundColor: t.cpRailDone },
  cpRailNext: { backgroundColor: t.cpRailNext },
  cpText: { flex: 1, minWidth: 0, marginLeft: t.cpDotGapX, paddingBottom: t.cpPitch - t.cpDot },
  cpItemTitle: { fontFamily: font.appHeading, fontSize: t.cpTitleItemSize, color: colors.textPrimary },
  cpSub: { marginTop: t.cpSubGap, fontFamily: font.appBody, fontSize: t.cpSubSize, color: t.cpSubColour },
  cpSubOk: { marginTop: t.cpSubGap, fontFamily: font.appBody, fontSize: t.cpSubSize, color: t.cpSubOk },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  view: {
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    backgroundColor: t.viewBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewText: { fontFamily: font.appHeading, fontSize: t.viewSize, color: ink.onBrand, flexShrink: 1 },
  viewArrow: { marginLeft: t.viewArrowGap },
  back: { marginTop: t.backGap, alignItems: 'center', justifyContent: 'center' },
  backText: { fontFamily: font.appHeading, fontSize: t.backSize, color: t.backColour },
  pressed: { opacity: 0.85 },
});
