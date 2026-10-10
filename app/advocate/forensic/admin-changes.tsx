import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  Eye,
  FileText,
  Gavel,
  Info,
  SquarePen,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_ADMIN_CHANGES } from '../../../data/advocateForensic';
import { advForensicChanges as t, colors, font, ink } from '../../../constants/theme';

// Changes needed (design/231).
//
// NOT design/230's shell — measured before building. This has a LEFT-ALIGNED
// header title, no success mark, opens on a card carrying a chip and a gavel
// icon, and ends with Update Report + Close rather than View Case + Back to
// Cases. Built separately; nothing merged.
//
// ⚠ design/231 CLIPS the client's service line mid-word: "Document Forensic
// (Property Sale Deed 19" with the closing "98)" cut off. Stored whole and
// allowed to shrink or wrap — the project never ellipsizes.
//
// ⚠ design/231 draws a PHOTOGRAPH as the client avatar, the only photographic
// avatar in the advocate flows. Rendered as the initials block used everywhere
// else, per the standing treatment for photographs.
//
// ⚠ The report filename loses its underscore here — "Forensic Report.pdf" against
// "Forensic_Report.pdf" on designs 228, 229, 230 and 232.
//
// The three admin suggestions are static list items. "Update Report" pushes back
// to the report form. There is no admin role or admin action in this prototype.

export default function AdvocateForensicAdminChangesScreen() {
  const insets = useSafeAreaInsets();
  const c = DF_ADMIN_CHANGES;

  const docCard = (
    name: string,
    meta: string,
    tag: string,
    action: string,
    tone: 'changes' | 'ok',
  ) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.docIcon, tone === 'changes' ? styles.docIconChanges : styles.docIconOk]}>
          {tone === 'changes' ? (
            <FileText size={t.docIconGlyph} color={colors.brandDark} />
          ) : (
            <BadgeCheck size={t.docIconGlyph} color={colors.brandDark} />
          )}
        </View>
        <View style={styles.docText}>
          <Text style={styles.docName} {...shrinkToFit(0.7)}>
            {name}
          </Text>
          <Text style={styles.docMeta} {...shrinkToFit(0.8)}>
            {meta}
          </Text>
        </View>
        <View style={[styles.docTag, tone === 'changes' ? styles.docTagChanges : styles.docTagOk]}>
          {tone === 'ok' && <Check size={t.docTagIcon} color={t.chipColour} strokeWidth={3} />}
          <Text style={[styles.docTagText, tone === 'ok' && styles.docTagTextOk]} {...shrinkToFit(0.75)}>
            {tag}
          </Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.docAct, pressed && styles.pressed]}>
        <Eye size={t.docActIcon} color={colors.textPrimary} />
        <Text style={styles.docActText} {...shrinkToFit(0.8)}>
          {action}
        </Text>
      </Pressable>
    </View>
  );

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
        {/* design/231's title is left-aligned, unlike design/230's. */}
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {c.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {c.chip}
              </Text>
            </View>
            <View style={styles.gavel}>
              <Gavel size={t.gavelGlyph} color={colors.textBody} />
            </View>
          </View>
          <View style={styles.headRow}>
            <View style={styles.headIcon}>
              <SquarePen size={t.headIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.headText}>
              <Text style={styles.headline} {...shrinkToFit(0.75)}>
                {c.headline}
              </Text>
              <Text style={styles.headBody}>{c.body}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {c.clientLabel}
            </Text>
            <View style={styles.ref}>
              <Text style={styles.refText} {...shrinkToFit(0.8)}>
                {c.ref}
              </Text>
            </View>
          </View>
          <View style={styles.cliRow}>
            {/* ⚠ A photograph in the export — rendered as initials. */}
            <View style={styles.cliAvatar}>
              <Text style={styles.cliInitials} {...shrinkToFit(0.8)}>
                {c.initials}
              </Text>
            </View>
            <View style={styles.cliText}>
              <Text style={styles.cliName} {...shrinkToFit(0.7)}>
                {c.client}
              </Text>
              {/* ⚠ Clipped in design/231. Stored and rendered whole. */}
              <Text style={styles.cliSub} {...shrinkToFit(0.65)}>
                {c.clientSub}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Info size={t.sgIcon} color={colors.brandDark} />
            <Text style={styles.sgTitle} {...shrinkToFit(0.7)}>
              {c.suggestions.title}
            </Text>
            <View style={styles.sgChip}>
              <Text style={styles.sgChipText} {...shrinkToFit(0.8)}>
                {c.suggestions.chip}
              </Text>
            </View>
          </View>
          <Text style={styles.sgBody}>{c.suggestions.body}</Text>
          {c.suggestions.items.map((item, i) => (
            <View key={item.title} style={[styles.sgItem, i === 0 && styles.sgItemFirst]}>
              <View style={styles.sgNum}>
                <Text style={styles.sgNumText} {...shrinkToFit(0.8)}>
                  {i + 1}
                </Text>
              </View>
              <View style={styles.sgItemText}>
                <Text style={styles.sgItemTitle} {...shrinkToFit(0.75)}>
                  {item.title}
                </Text>
                <Text style={styles.sgItemBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.docLabelRow}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {c.docsLabel}
          </Text>
        </View>
        {docCard(c.reportName, c.reportMeta, c.reportTag, c.viewReport, 'changes')}
        {docCard(c.affidavitName, c.affidavitMeta, c.affidavitTag, c.viewAffidavit, 'ok')}

        <View style={styles.next}>
          <Info size={t.nextIcon} color={colors.brandDark} style={styles.nextIcon} />
          <View style={styles.nextText}>
            <Text style={styles.nextTitle} {...shrinkToFit(0.8)}>
              {c.next.title}
            </Text>
            <Text style={styles.nextBody}>{c.next.body}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/advocate/forensic/report' as Href)}
          style={({ pressed }) => [styles.update, pressed && styles.pressed]}
        >
          <Text style={styles.updateText} {...shrinkToFit(0.8)}>
            {c.update}
          </Text>
          <ArrowRight size={t.updateArrow} color={ink.onBrand} style={styles.updateArrow} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/matters' as Href)}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Text style={styles.closeText} {...shrinkToFit(0.8)}>
            {c.close}
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
    marginLeft: t.titleGapX,
    marginRight: 10,
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
  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },

  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipDot: { width: t.chipDot, height: t.chipDot, borderRadius: t.chipDot / 2, backgroundColor: t.chipColour, marginRight: t.chipDotGap },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipColour, flexShrink: 1 },
  gavel: { marginLeft: 'auto', width: t.gavel, height: t.gavel, borderRadius: t.gavel / 2, backgroundColor: t.gavelBg, alignItems: 'center', justifyContent: 'center' },

  headRow: { marginTop: t.headIconGap, flexDirection: 'row', alignItems: 'flex-start' },
  headIcon: { width: t.headIcon, height: t.headIcon, borderRadius: t.headIconRadius, backgroundColor: t.headIconBg, alignItems: 'center', justifyContent: 'center' },
  headText: { flex: 1, minWidth: 0, marginLeft: t.headIconGapX },
  headline: { fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },
  headBody: { marginTop: t.headBodyGap, fontFamily: font.appBody, fontSize: t.headBodySize, lineHeight: t.headBodyLineHeight, color: t.headBodyColour },

  label: { flexShrink: 1, marginRight: 10, fontFamily: font.appSemi, fontSize: t.labelSize, letterSpacing: t.labelSpacing, color: t.labelColour },
  ref: {
    marginLeft: 'auto',
    minHeight: t.refHeight,
    borderRadius: t.refRadius,
    backgroundColor: t.refBg,
    paddingHorizontal: t.refPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  refText: { fontFamily: font.appHeading, fontSize: t.refSize, color: t.refColour },

  cliRow: { marginTop: t.cliGap, flexDirection: 'row', alignItems: 'center' },
  cliAvatar: { width: t.cliAvatar, height: t.cliAvatar, borderRadius: t.cliAvatar / 2, backgroundColor: t.cliAvatarBg, alignItems: 'center', justifyContent: 'center' },
  cliInitials: { fontFamily: font.appSemi, fontSize: t.cliInitialsSize, color: t.cliInitialsColour },
  cliText: { flex: 1, minWidth: 0, marginLeft: t.cliGapX },
  cliName: { fontFamily: font.appHeading, fontSize: t.cliNameSize, color: colors.textPrimary },
  cliSub: { marginTop: t.cliSubGap, fontFamily: font.appBody, fontSize: t.cliSubSize, color: t.cliSubColour },

  sgTitle: { marginLeft: t.sgIconGap, flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.sgTitleSize, color: colors.textPrimary },
  sgChip: {
    marginLeft: 'auto',
    minHeight: t.sgChipHeight,
    borderRadius: t.sgChipRadius,
    backgroundColor: t.sgChipBg,
    paddingHorizontal: t.sgChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  sgChipText: { fontFamily: font.appSemi, fontSize: t.sgChipSize, color: t.sgChipColour },
  sgBody: { marginTop: t.sgBodyGap, fontFamily: font.appBody, fontSize: t.sgBodySize, lineHeight: t.sgBodyLineHeight, color: t.sgBodyColour },
  sgItem: { marginTop: t.sgItemGapY, borderRadius: t.sgItemRadius, backgroundColor: t.sgItemBg, padding: t.sgItemPad, flexDirection: 'row', alignItems: 'flex-start' },
  sgItemFirst: { marginTop: t.sgItemGap },
  sgNum: { width: t.sgNum, height: t.sgNum, borderRadius: t.sgNum / 2, backgroundColor: t.sgNumBg, alignItems: 'center', justifyContent: 'center' },
  sgNumText: { fontFamily: font.appSemi, fontSize: t.sgNumSize, color: ink.onBrand },
  sgItemText: { flex: 1, minWidth: 0, marginLeft: t.sgNumGapX },
  sgItemTitle: { fontFamily: font.appHeading, fontSize: t.sgItemTitleSize, color: colors.textPrimary },
  sgItemBody: { marginTop: t.sgItemBodyGap, fontFamily: font.appBody, fontSize: t.sgItemBodySize, lineHeight: t.sgItemBodyLineHeight, color: t.sgItemBodyColour },

  docLabelRow: { marginTop: t.docLabelGap, flexDirection: 'row', alignItems: 'center' },
  docIcon: { width: t.docIcon, height: t.docIcon, borderRadius: t.docIconRadius, alignItems: 'center', justifyContent: 'center' },
  docIconChanges: { backgroundColor: t.headIconBg },
  docIconOk: { backgroundColor: t.gavelBg },
  docText: { flex: 1, minWidth: 0, marginHorizontal: t.docIconGap },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: t.docMetaColour },
  docTag: {
    minHeight: t.docTagHeight,
    borderRadius: t.docTagRadius,
    paddingHorizontal: t.docTagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docTagChanges: { backgroundColor: t.chipBg },
  docTagOk: { backgroundColor: t.gavelBg },
  docTagText: { fontFamily: font.appSemi, fontSize: t.docTagSize, color: t.chipColour, flexShrink: 1 },
  docTagTextOk: { marginLeft: t.docTagIconGap },
  docAct: {
    marginTop: t.docActGap,
    minHeight: t.docActHeight,
    borderRadius: t.docActRadius,
    backgroundColor: t.docActBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docActText: { marginLeft: t.docActIconGap, fontFamily: font.appHeading, fontSize: t.docActSize, color: colors.textPrimary, flexShrink: 1 },

  next: { marginTop: t.nextGap, borderRadius: t.nextRadius, backgroundColor: t.nextBg, padding: t.nextPad, flexDirection: 'row', alignItems: 'flex-start' },
  nextIcon: { marginTop: 1 },
  nextText: { flex: 1, minWidth: 0, marginLeft: t.nextIconGap },
  nextTitle: { fontFamily: font.appHeading, fontSize: t.nextTitleSize, color: colors.textPrimary },
  nextBody: { marginTop: t.nextBodyGap, fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: t.nextBodyColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  update: {
    minHeight: t.updateHeight,
    borderRadius: t.updateRadius,
    backgroundColor: t.updateBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: { fontFamily: font.appHeading, fontSize: t.updateSize, color: ink.onBrand, flexShrink: 1 },
  updateArrow: { marginLeft: t.updateArrowGap },
  close: {
    marginTop: t.closeGap,
    minHeight: t.closeHeight,
    borderRadius: t.closeRadius,
    backgroundColor: t.closeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontFamily: font.appHeading, fontSize: t.closeSize, color: colors.textPrimary },
  pressed: { opacity: 0.85 },
});
