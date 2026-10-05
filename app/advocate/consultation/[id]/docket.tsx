import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bell,
  BadgeCheck,
  Bold,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileText,
  Gavel,
  Italic,
  List,
  ListChecks,
  Mic,
  UserRound,
  Video,
} from 'lucide-react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_DOCKET } from '../../../../data/advocateSide';
import { advDocket as t, advRequest as h, colors, font, ink } from '../../../../constants/theme';

// Docket record (design/180).
//
// ⚠ design/180 is a 333×1024 JPEG — 0.823 px/pt, less than one pixel per point.
// The sizing here is the loosest in the project; shared values are inherited from
// the neighbouring advocate screens where the design does not contradict them.
//
// ⚠ Its "DISBURSEMENT ₹26,000" is a bare figure with no fee behind it, and agrees
// with neither design/164's ₹25,650 nor design/181's ₹28,800. Stored as drawn, NOT
// computed. See the note in data/advocateSide.ts.
//
// The formatting toolbar, Dictate, the cite chip, the eye button and Export Client
// PDF are inert — a rich-text editor with speech input is implied but specified
// nowhere.

export default function AdvocateDocketScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_DOCKET;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + h.headerTop }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Requests
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/advocate/notifications')}
          style={styles.bellWrap}
        >
          <Bell size={h.bell} color={colors.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={h.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <View style={styles.crumb}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.crumbBtn}
        >
          <ChevronLeft size={t.crumbIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.crumbLabel} {...shrinkToFit(0.75)}>
          {d.label}
        </Text>
        <Text style={styles.crumbDot}>•</Text>
        <Text style={styles.crumbRef} {...shrinkToFit(0.7)}>
          {d.matterRef}
        </Text>
        <View style={styles.saved}>
          <View style={styles.savedDot} />
          <Text style={styles.savedText} {...shrinkToFit(0.75)}>
            {d.autosaved}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <CheckCircle2 size={t.bannerIconGlyph} color={colors.brandDark} />
          </View>
          <Text style={styles.bannerTitle} {...shrinkToFit(0.75)}>
            {d.concluded}
          </Text>
          <View style={styles.bannerChip}>
            <Text style={styles.bannerChipText} {...shrinkToFit(0.75)}>
              {d.verifiedChip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.clientRow}>
            {/* Placeholder for design/180's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{d.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <Text style={styles.name} {...shrinkToFit(0.7)}>
                {d.client.name}
              </Text>
              <Text style={styles.role} {...shrinkToFit(0.7)}>
                {d.client.title}
              </Text>
            </View>
            <View style={styles.disbCol}>
              <Text style={styles.disbLabel} {...shrinkToFit(0.75)}>
                {d.disbursementLabel}
              </Text>
              <Text style={styles.disb} {...shrinkToFit(0.75)}>
                ₹{d.disbursement.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.brief}>
            <Text style={styles.briefLabel} {...shrinkToFit(0.8)}>
              {d.briefLabel}
            </Text>
            <Text style={styles.briefMatter}>{d.matter}</Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
                {d.date.label}
              </Text>
              <Text style={styles.statValue} {...shrinkToFit(0.7)}>
                {d.date.value}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
                {d.billable.label}
              </Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue} {...shrinkToFit(0.75)}>
                  {d.billable.value}
                </Text>
                <Text style={styles.statUnit} {...shrinkToFit(0.75)}>
                  {d.billable.unit}
                </Text>
              </View>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
                {d.channel.label}
              </Text>
              <View style={styles.statValueRow}>
                <Video size={t.statIcon} color={colors.textPrimary} />
                <Text style={[styles.statValue, styles.statValueInline]} {...shrinkToFit(0.7)}>
                  {d.channel.value}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Gavel size={t.sectionIcon} color={colors.textPrimary} />
          <Text style={styles.section} {...shrinkToFit(0.7)}>
            {d.notesLabel}
          </Text>
          {/* Inert — speech input is implied but specified nowhere. */}
          <Pressable accessibilityRole="button" style={styles.dictate}>
            <Mic size={t.dictateIcon} color={t.dictateColour} />
            <Text style={styles.dictateText} {...shrinkToFit(0.8)}>
              {d.dictate}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {/* Inert — a rich-text editor is implied but not specified. */}
          <View style={styles.tools}>
            {[Bold, Italic, List].map((Icon, i) => (
              <Pressable key={i} accessibilityRole="button" style={styles.toolBtn}>
                <Icon size={t.toolSize} color={colors.textPrimary} />
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" style={styles.cite}>
              <Text style={styles.citeText} {...shrinkToFit(0.7)}>
                {d.citeChip}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.noteBox} nestedScrollEnabled>
            <Text style={styles.note}>{d.note}</Text>
          </ScrollView>

          <View style={styles.noteFoot}>
            <Text style={styles.noteFootText} {...shrinkToFit(0.7)}>
              {d.notesFooter}
            </Text>
            <Text style={styles.noteFootText} {...shrinkToFit(0.75)}>
              {d.notesDrawnCount}
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <ListChecks size={t.sectionIcon} color={colors.textPrimary} />
          <Text style={styles.section} {...shrinkToFit(0.7)}>
            {d.keyPointsLabel}
          </Text>
          <Text style={styles.sectionMeta} {...shrinkToFit(0.75)}>
            {d.keyPointsMeta}
          </Text>
        </View>

        <View style={styles.card}>
          {d.keyPoints.map((k) => (
            <Text key={k} style={styles.bullet}>
              • {k}
            </Text>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <CheckCircle2 size={t.sectionIcon} color={colors.textPrimary} />
          <Text style={styles.section} {...shrinkToFit(0.7)}>
            {d.stepsLabel}
          </Text>
          <Text style={styles.sectionMeta} {...shrinkToFit(0.75)}>
            {d.stepsMeta}
          </Text>
        </View>

        <View style={styles.card}>
          {/* Static. design/180 labels this "3 Action Items" but draws two. */}
          {d.steps.map((s, i) => (
            <Text key={s} style={[styles.step, i > 0 && styles.stepNext]}>
              {i + 1}. {s}
            </Text>
          ))}
        </View>

        <View style={[styles.card, styles.docCard]}>
          <View style={styles.docIcon}>
            <FileText size={t.docIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.docText}>
            <Text style={styles.docName} {...shrinkToFit(0.65)}>
              {d.document.name}
            </Text>
            <Text style={styles.docMeta} {...shrinkToFit(0.7)}>
              {d.document.meta}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Preview" style={styles.docEye}>
            <Eye size={t.docEyeIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(`/advocate/consultation/${id}/completed` as Href)}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        >
          <BadgeCheck size={t.continueIcon} color={ink.onBrand} />
          <Text style={styles.continueText} {...shrinkToFit(0.75)}>
            {d.continue}
          </Text>
        </Pressable>

        {/* Inert — no export flow is designed. */}
        <Pressable accessibilityRole="button" style={styles.export}>
          <Copy size={t.exportIcon} color={colors.textPrimary} />
          <Text style={styles.exportText} {...shrinkToFit(0.8)}>
            {d.exportPdf}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: h.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: h.titleSize,
    color: colors.textPrimary,
  },
  bellWrap: {},
  bellDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: h.bellDot,
    height: h.bellDot,
    borderRadius: h.bellDot / 2,
    backgroundColor: '#D64545',
  },
  avatar: {
    marginLeft: h.avatarGap,
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  crumb: {
    paddingHorizontal: t.padX,
    paddingTop: t.crumbTop,
    paddingBottom: t.crumbBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  crumbBtn: {
    width: t.crumbBtn,
    height: t.crumbBtn,
    borderRadius: t.crumbBtn / 2,
    backgroundColor: t.crumbBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crumbLabel: {
    marginLeft: t.crumbGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.crumbLabelSize,
    letterSpacing: t.crumbLabelSpacing,
    color: colors.brandDark,
  },
  crumbDot: {
    marginHorizontal: t.crumbDotGap,
    fontFamily: font.appBody,
    fontSize: t.crumbRefSize,
    color: colors.textBody,
  },
  crumbRef: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.crumbRefSize, color: colors.textPrimary },
  saved: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.savedHeight,
    borderRadius: t.savedRadius,
    paddingHorizontal: t.savedPadX,
    backgroundColor: t.savedBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  savedDot: {
    width: t.savedDot,
    height: t.savedDot,
    borderRadius: t.savedDot / 2,
    marginRight: t.savedDotGap,
    backgroundColor: colors.brandDark,
  },
  savedText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.savedSize, color: colors.textPrimary },

  content: { paddingHorizontal: t.padX, paddingBottom: 32 },

  banner: {
    borderRadius: t.bannerRadius,
    backgroundColor: t.bannerBg,
    padding: t.bannerPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: t.bannerIcon,
    height: t.bannerIcon,
    borderRadius: t.bannerIcon / 2,
    backgroundColor: t.bannerIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    marginLeft: t.bannerIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.bannerTitleSize,
    lineHeight: t.bannerTitleLineHeight,
    color: colors.textPrimary,
  },
  bannerChip: {
    minHeight: t.bannerChipHeight,
    borderRadius: t.bannerChipRadius,
    paddingHorizontal: t.bannerChipPadX,
    backgroundColor: t.bannerChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  bannerChipText: { fontFamily: font.appBody, fontSize: t.bannerChipSize, color: t.bannerChipColour },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  role: { marginTop: t.roleGap, fontFamily: font.appBody, fontSize: t.roleSize, color: colors.textBody },
  disbCol: { alignItems: 'flex-end' },
  disbLabel: {
    fontFamily: font.appSemi,
    fontSize: t.disbLabelSize,
    letterSpacing: t.disbLabelSpacing,
    color: colors.textBody,
  },
  disb: { marginTop: t.disbGap, fontFamily: font.appHeading, fontSize: t.disbSize, color: colors.textPrimary },

  brief: {
    marginTop: t.briefGap,
    borderRadius: t.briefRadius,
    backgroundColor: t.briefBg,
    padding: t.briefPad,
  },
  briefLabel: {
    fontFamily: font.appSemi,
    fontSize: t.briefLabelSize,
    letterSpacing: t.briefLabelSpacing,
    color: colors.brandDark,
  },
  briefMatter: {
    marginTop: t.briefMatterGap,
    fontFamily: font.appHeading,
    fontSize: t.briefMatterSize,
    lineHeight: t.briefMatterLineHeight,
    color: colors.textPrimary,
  },

  stats: { marginTop: t.statGap, flexDirection: 'row', gap: t.statGapX },
  stat: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.statRadius,
    backgroundColor: t.statBg,
    padding: t.statPad,
  },
  statLabel: { fontFamily: font.appBody, fontSize: t.statLabelSize, color: colors.textBody },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: {
    marginTop: t.statValueGap,
    fontFamily: font.appHeading,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  statValueInline: { marginLeft: t.statIconGap, flexShrink: 1 },
  statUnit: {
    marginLeft: t.statUnitGap,
    fontFamily: font.appBody,
    fontSize: t.statUnitSize,
    color: colors.textBody,
  },

  sectionRow: { marginTop: t.sectionGap, flexDirection: 'row', alignItems: 'center' },
  section: {
    marginLeft: t.sectionIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textPrimary,
  },
  sectionMeta: { fontFamily: font.appBody, fontSize: t.sectionMetaSize, color: colors.textBody },
  dictate: {
    minHeight: t.dictateHeight,
    borderRadius: t.dictateRadius,
    paddingHorizontal: t.dictatePadX,
    backgroundColor: t.dictateBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dictateText: {
    marginLeft: t.dictateIconGap,
    fontFamily: font.appBody,
    fontSize: t.dictateSize,
    color: t.dictateColour,
  },

  tools: { flexDirection: 'row', alignItems: 'center', gap: t.toolGapX },
  toolBtn: {
    width: t.toolBtn,
    height: t.toolBtn,
    borderRadius: t.toolRadius,
    backgroundColor: t.toolBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cite: {
    marginLeft: 'auto',
    minHeight: t.citeHeight,
    borderRadius: t.citeRadius,
    paddingHorizontal: t.citePadX,
    backgroundColor: t.citeBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  citeText: { fontFamily: font.appBody, fontSize: t.citeSize, color: t.citeColour },

  noteBox: { marginTop: t.noteGap, maxHeight: t.noteMaxH },
  note: {
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },
  noteFoot: {
    marginTop: t.noteFootGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  noteFootText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.noteFootSize, color: colors.textBody },

  bullet: {
    fontFamily: font.appBody,
    fontSize: t.bulletSize,
    lineHeight: t.bulletLineHeight,
    color: colors.textPrimary,
  },
  step: {
    fontFamily: font.appBody,
    fontSize: t.stepSize,
    lineHeight: t.stepLineHeight,
    color: colors.textPrimary,
  },
  stepNext: { marginTop: t.stepGap },

  docCard: { flexDirection: 'row', alignItems: 'center' },
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
  docEye: {
    width: t.docEye,
    height: t.docEye,
    borderRadius: t.docEye / 2,
    backgroundColor: t.docEyeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  continue: {
    marginTop: t.continueGap,
    minHeight: t.continueHeight,
    borderRadius: t.continueRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    marginLeft: t.continueIconGap,
    fontFamily: font.appHeading,
    fontSize: t.continueSize,
    color: ink.onBrand,
  },
  export: {
    marginTop: t.exportGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportText: {
    marginLeft: t.exportIconGap,
    fontFamily: font.appSemi,
    fontSize: t.exportSize,
    color: colors.textPrimary,
  },
  pressed: { opacity: 0.85 },
});
