import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  CircleHelp,
  Download,
  Eye,
  FileText,
  Fingerprint,
  FolderOpen,
  Highlighter,
  Scale,
  Target,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_DOCUMENTS } from '../../../data/advocateForensic';
import { advForensicDocuments as t, colors, font, ink, status } from '../../../constants/theme';

// Questioned & reference documents (design/224).
//
// REUSED THE SHAPE, NOT THE CODE. The FIR document rows (design/216) are a flat
// name + meta + View row inside one card. design/224's rows are a different
// component: a coloured band above each card, a tag chip on the name line, a target
// focus box, a hash strip and a two-button action row. Built here rather than
// bending advFirDocuments into a third variant.
//
// ⚠ "2 Documents" and "2 Evidentiary Files" (design/223) against this screen's own
// "3 of 3 Ready". Three counts for two files.
//
// ⚠ The header reads "Request Details" — the same title as design/223, the screen
// immediately before it.
//
// SHA-256 values are static strings. Nothing is hashed and no file is read.

const STAT_ICONS = { file: FileText, book: BookOpen, seal: BadgeCheck };

function DocBlock({
  band,
  note,
  questioned,
  name,
  tag,
  meta,
  focusLabel,
  focusValue,
  hash,
  view,
  download,
}: {
  band: string;
  note: string;
  questioned: boolean;
  name: string;
  tag: string;
  meta: string;
  focusLabel: string;
  focusValue: string;
  hash: string;
  view: string;
  download: string;
}) {
  return (
    <>
      <View style={styles.bandRow}>
        <View style={[styles.band, questioned ? styles.bandQ : styles.bandR]}>
          <Text
            style={[styles.bandText, questioned ? styles.bandTextQ : styles.bandTextR]}
            {...shrinkToFit(0.7)}
          >
            {band}
          </Text>
        </View>
        {questioned ? (
          <Highlighter size={t.bandIcon} color={status.onRedContainer} style={styles.bandIcon} />
        ) : (
          <BadgeCheck size={t.bandIcon} color={colors.textPrimary} style={styles.bandIcon} />
        )}
        <Text style={styles.bandNote} {...shrinkToFit(0.75)}>
          {note}
        </Text>
      </View>

      <View style={styles.docCard}>
        <View style={styles.row}>
          <View style={[styles.docIcon, questioned ? styles.docIconQ : styles.docIconR]}>
            <FileText size={t.docIconGlyph} color={questioned ? status.onRedContainer : colors.textPrimary} />
          </View>
          <View style={styles.docText}>
            <View style={styles.row}>
              <Text style={styles.docName} {...shrinkToFit(0.7)}>
                {name}
              </Text>
              <View style={styles.docTag}>
                <View style={styles.docTagDot} />
                <Text style={styles.docTagText} {...shrinkToFit(0.75)}>
                  {tag}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.docMeta}>{meta}</Text>

        <View style={styles.focus}>
          {questioned ? (
            <Target size={t.focusIcon} color={status.onRedContainer} />
          ) : (
            <Highlighter size={t.focusIcon} color={colors.brandDark} />
          )}
          <Text style={styles.focusText}>
            <Text style={styles.focusLabel}>{focusLabel} </Text>
            <Text style={questioned ? styles.focusValueQ : styles.focusValueR}>{focusValue}</Text>
          </Text>
        </View>

        <View style={styles.hash}>
          {/* Static string — nothing is hashed. */}
          <Fingerprint size={t.hashIcon} color={t.hashColour} />
          <Text style={styles.hashText} {...shrinkToFit(0.75)}>
            {hash}
          </Text>
        </View>

        <View style={styles.actRow}>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.act, pressed && styles.pressed]}>
            <Eye size={t.actIcon} color={colors.textPrimary} />
            <Text style={styles.actText} {...shrinkToFit(0.8)}>
              {view}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.act, pressed && styles.pressed]}>
            <Download size={t.actIcon} color={colors.textPrimary} />
            <Text style={styles.actText} {...shrinkToFit(0.8)}>
              {download}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

export default function AdvocateForensicDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const d = DF_DOCUMENTS;

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
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <FolderOpen size={t.caseIcon} color={colors.textPrimary} />
            <Text style={styles.case} {...shrinkToFit(0.7)}>
              {d.caseFile}
            </Text>
            <Text style={styles.caseDot}>·</Text>
            <Text style={styles.case} {...shrinkToFit(0.7)}>
              {d.client}
            </Text>
            <View style={styles.caseChip}>
              <View style={styles.caseChipDot} />
              <Text style={styles.caseChipText} {...shrinkToFit(0.75)}>
                {d.verified}
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            {d.stats.map((s, i) => {
              const Icon = STAT_ICONS[s.icon];
              return (
                <View key={s.label} style={[styles.stat, i > 0 && styles.statNext]}>
                  <Icon size={t.statIcon} color={colors.textPrimary} />
                  <Text style={styles.statText}>
                    {s.value ? `${s.value}\n` : ''}
                    {s.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <DocBlock
          band={d.questioned.band}
          note={d.questioned.note}
          questioned
          name={d.questioned.name}
          tag={d.questioned.tag}
          meta={d.questioned.meta}
          focusLabel={d.questioned.focusLabel}
          focusValue={d.questioned.focusValue}
          hash={d.questioned.hash}
          view={d.view}
          download={d.download}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.divider}>
            <Scale size={t.bandIcon} color={colors.brandDark} />
            <Text style={styles.dividerText} {...shrinkToFit(0.7)}>
              {d.reference.divider}
            </Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <DocBlock
          band={d.reference.band}
          note={d.reference.note}
          questioned={false}
          name={d.reference.name}
          tag={d.reference.tag}
          meta={d.reference.meta}
          focusLabel={d.reference.focusLabel}
          focusValue={d.reference.focusValue}
          hash={d.reference.hash}
          view={d.view}
          download={d.download}
        />

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.readyTitle} {...shrinkToFit(0.75)}>
              {d.ready.title}
            </Text>
            {/* ⚠ "3 of 3" against "2 Documents" above. */}
            <Text style={styles.readyNote} {...shrinkToFit(0.8)}>
              {d.ready.note}
            </Text>
          </View>
          <Text style={styles.readyBody}>{d.ready.body}</Text>
          {d.ready.rows.map((r) => (
            <View key={r.title} style={styles.checkRow}>
              <View style={styles.check}>
                <Check size={t.checkGlyph} color={ink.onBrand} strokeWidth={3} />
              </View>
              <View style={styles.checkText}>
                <Text style={styles.checkTitle} {...shrinkToFit(0.75)}>
                  {r.title}
                </Text>
                <Text style={styles.checkSub}>{r.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/forensic/waiting?id=${id ?? ''}` as Href)}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        >
          <Text style={styles.continueText} {...shrinkToFit(0.8)}>
            {d.continue}
          </Text>
          <ArrowRight size={t.continueArrow} color={ink.onBrand} style={styles.continueArrow} />
        </Pressable>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.more, pressed && styles.pressed]}>
          <CircleHelp size={t.moreIcon} color={colors.textPrimary} />
          <Text style={styles.moreText} {...shrinkToFit(0.8)}>
            {d.more}
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
  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  row: { flexDirection: 'row', alignItems: 'center' },

  case: { marginLeft: t.caseIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.caseSize, lineHeight: t.caseLineHeight, color: colors.textPrimary },
  caseDot: { marginHorizontal: t.caseDotGap, fontFamily: font.appBody, fontSize: t.caseSize, color: colors.textBody },
  caseChip: {
    marginLeft: 'auto',
    minHeight: t.caseChipHeight,
    borderRadius: t.caseChipRadius,
    backgroundColor: t.caseChipBg,
    paddingHorizontal: t.caseChipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  caseChipDot: { width: t.caseChipDot, height: t.caseChipDot, borderRadius: t.caseChipDot / 2, backgroundColor: t.caseChipColour, marginRight: t.caseChipDotGap },
  caseChipText: { fontFamily: font.appSemi, fontSize: t.caseChipSize, color: t.caseChipColour },

  stats: { marginTop: t.statGap, flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'flex-start', flexShrink: 1 },
  statNext: { marginLeft: t.statGapX },
  statText: { marginLeft: t.statIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.statSize, lineHeight: t.statLineHeight, color: colors.textPrimary },

  bandRow: { marginTop: t.bandGap, flexDirection: 'row', alignItems: 'center' },
  band: {
    minHeight: t.bandHeight,
    borderRadius: t.bandRadius,
    paddingHorizontal: t.bandPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  bandQ: { backgroundColor: t.bandQBg },
  bandR: { backgroundColor: t.bandRBg },
  bandText: { fontFamily: font.appSemi, fontSize: t.bandSize, letterSpacing: t.bandSpacing },
  bandTextQ: { color: t.bandQColour },
  bandTextR: { color: t.bandRColour },
  bandIcon: { marginLeft: t.bandIconGap },
  bandNote: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appBody, fontSize: t.bandNoteSize, color: t.bandNoteColour, flexShrink: 1 },

  docCard: { marginTop: t.docGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  docIcon: { width: t.docIcon, height: t.docIcon, borderRadius: t.docIconRadius, alignItems: 'center', justifyContent: 'center' },
  docIconQ: { backgroundColor: status.redContainer },
  docIconR: { backgroundColor: t.bandRBg },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap },
  docName: { flexShrink: 1, marginRight: 8, fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docTag: {
    marginLeft: 'auto',
    minHeight: t.docTagHeight,
    borderRadius: t.docTagRadius,
    backgroundColor: t.bandRBg,
    paddingHorizontal: t.docTagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docTagDot: { width: t.docTagDot, height: t.docTagDot, borderRadius: t.docTagDot / 2, backgroundColor: colors.brandDark, marginRight: t.docTagDotGap },
  docTagText: { fontFamily: font.appSemi, fontSize: t.docTagSize, color: t.bandRColour },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, lineHeight: t.docMetaLineHeight, color: t.docMetaColour },

  focus: { marginTop: t.focusGap, borderRadius: t.focusRadius, backgroundColor: t.focusBg, padding: t.focusPad, flexDirection: 'row', alignItems: 'center' },
  focusText: { flex: 1, minWidth: 0, marginLeft: t.focusIconGap, fontFamily: font.appBody, fontSize: t.focusSize, color: colors.textPrimary },
  focusLabel: { fontFamily: font.appHeading },
  focusValueQ: { fontFamily: font.appHeading, color: status.onRedContainer },
  focusValueR: { fontFamily: font.appHeading, color: colors.brandDark },

  hash: { marginTop: t.hashGap, borderRadius: t.hashRadius, backgroundColor: t.hashBg, padding: t.hashPad, flexDirection: 'row', alignItems: 'center' },
  hashText: { marginLeft: t.hashIconGap, flexShrink: 1, fontFamily: font.mono, fontSize: t.hashSize, color: t.hashColour },

  actRow: { marginTop: t.actGap, flexDirection: 'row', gap: t.actGapX },
  act: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actHeight,
    borderRadius: t.actRadius,
    backgroundColor: t.actBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actText: { marginLeft: t.actIconGap, fontFamily: font.appHeading, fontSize: t.actSize, color: colors.textPrimary, flexShrink: 1 },

  dividerRow: { marginTop: t.bandGap, flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: 1, backgroundColor: t.bandRuleColour },
  divider: {
    marginHorizontal: 10,
    minHeight: t.bandHeight,
    borderRadius: t.bandRadius,
    backgroundColor: t.bandRBg,
    paddingHorizontal: t.bandPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  dividerText: { marginLeft: t.bandIconGap, fontFamily: font.appSemi, fontSize: t.bandSize, letterSpacing: t.bandSpacing, color: t.bandRColour, flexShrink: 1 },

  readyTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.readyTitleSize, color: colors.textPrimary },
  readyNote: { marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.readyNoteSize, color: t.readyNoteColour, flexShrink: 1 },
  readyBody: { marginTop: t.readyBodyGap, fontFamily: font.appBody, fontSize: t.readyBodySize, lineHeight: t.readyBodyLineHeight, color: t.readyBodyColour },
  checkRow: { marginTop: t.checkGap, flexDirection: 'row', alignItems: 'flex-start' },
  check: { width: t.check, height: t.check, borderRadius: t.check / 2, backgroundColor: t.checkBg, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, minWidth: 0, marginLeft: t.checkGapX },
  checkTitle: { fontFamily: font.appHeading, fontSize: t.checkTitleSize, color: colors.textPrimary },
  checkSub: { marginTop: t.checkSubGap, fontFamily: font.appBody, fontSize: t.checkSubSize, color: t.checkSubColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  continue: {
    minHeight: t.continueHeight,
    borderRadius: t.continueRadius,
    backgroundColor: t.continueBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { fontFamily: font.appHeading, fontSize: t.continueSize, color: ink.onBrand, flexShrink: 1 },
  continueArrow: { marginLeft: t.continueArrowGap },
  more: {
    marginTop: t.moreGap,
    minHeight: t.moreHeight,
    borderRadius: t.moreRadius,
    backgroundColor: t.moreBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  moreText: { marginLeft: t.moreIconGap, fontFamily: font.appHeading, fontSize: t.moreSize, color: colors.textPrimary, flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
