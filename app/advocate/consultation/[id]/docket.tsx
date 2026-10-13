import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Eye,
  FileText,
  Gavel,
  List,
  ListChecks,
  Mic,
  UserRound,
  Video,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PdfStackIcon from '../../../../components/PdfStackIcon';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_DOCKET } from '../../../../data/advocateSide';
import { advDocket as t, advRequest as h, colors, font, ink } from '../../../../constants/theme';
import { advDocHref } from '../../../../data/docLinks';

// Docket record (design/180).
//
// Measured from a 780px PNG at 2.000 px/pt (it replaced a 333×1024 JPEG).
//
// design/180 draws a photograph for the client; the photo is a neutral
// placeholder at the drawn size.
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
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Text style={styles.headerTitle} {...shrinkToFit(0.8)}>
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
        {/* design/180 wraps both the label and the reference onto two lines. */}
        <Text style={styles.crumbLabel}>{d.label}</Text>
        <View style={styles.crumbDot} />
        <Text style={styles.crumbRef}>{d.matterRef}</Text>
        <View style={styles.saved}>
          <View style={styles.savedDot} />
          <Text style={styles.savedText}>{d.autosaved}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Check size={t.bannerIconGlyph} color={t.bannerIconColour} strokeWidth={3} />
            </View>
            <Text style={styles.bannerTitle}>{d.concluded}</Text>
            <View style={styles.bannerChip}>
              <Text style={styles.bannerChipText} {...shrinkToFit(0.75)}>
                {d.verifiedChip}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.clientRow}>
              <View>
                {/* Placeholder for design/180's photograph, at the drawn size. */}
                <View style={styles.photo}>
                  <Text style={styles.photoText}>{d.client.initials}</Text>
                </View>
                <View style={styles.photoBadge}>
                  <Check size={t.photoBadgeIcon} color={ink.onBrand} strokeWidth={3} />
                </View>
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
                <View style={[styles.statValueRow, styles.statIconRow]}>
                  <Video size={t.statIcon} color={t.textBrown} />
                  <Text style={[styles.statValue, styles.statValueInline]} {...shrinkToFit(0.7)}>
                    {d.channel.value}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Gavel size={t.sectionIcon} color={t.textBrown} />
          <Text style={styles.section} {...shrinkToFit(0.7)}>
            {d.notesLabel} <Text style={styles.sectionNote}>{d.notesLabelNote}</Text>
          </Text>
          {/* Inert — speech input is implied but specified nowhere. */}
          <Pressable accessibilityRole="button" style={styles.dictate}>
            <Mic size={t.dictateIcon} color={t.textBrown} />
            <Text style={styles.dictateText} {...shrinkToFit(0.8)}>
              {d.dictate}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.sectionCard]}>
          {/* Inert — a rich-text editor is implied but not specified. design/180
              sets B and I as plain letters, not the slanted italic glyph. */}
          <View style={styles.tools}>
            <Pressable accessibilityRole="button" accessibilityLabel="Bold" style={styles.toolBtn}>
              <Text style={styles.toolBold}>B</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Italic" style={styles.toolBtn}>
              <Text style={styles.toolText}>I</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="List" style={styles.toolBtn}>
              <List size={t.toolIcon} color={colors.textPrimary} />
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.cite}>
              <Text style={styles.citeText} {...shrinkToFit(0.7)}>
                {d.citeChip}
              </Text>
            </Pressable>
          </View>

          <View style={styles.noteBody}>
            <ScrollView style={styles.noteBox} nestedScrollEnabled>
              <Text style={styles.note}>{d.note}</Text>
            </ScrollView>

            <View style={styles.noteFoot}>
              <Text style={styles.noteFootText} {...shrinkToFit(0.7)}>
                {d.notesFooter}
              </Text>
              <Text style={styles.noteFootCount} {...shrinkToFit(0.75)}>
                {d.notesDrawnCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <ListChecks size={t.sectionIcon} color={t.textBrown} />
          <Text style={styles.section} {...shrinkToFit(0.7)}>
            {d.keyPointsLabel}
          </Text>
          <Text style={styles.sectionMeta} {...shrinkToFit(0.75)}>
            {d.keyPointsMeta}
          </Text>
        </View>

        <View style={[styles.card, styles.sectionCard, styles.listCard]}>
          {d.keyPoints.map((k) => (
            <Text key={k} style={styles.bullet}>
              • {k}
            </Text>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <ClipboardCheck size={t.sectionIcon} color={t.textBrown} />
          <Text style={styles.section} {...shrinkToFit(0.7)}>
            {d.stepsLabel}
          </Text>
          <Text style={[styles.sectionMeta, styles.sectionMetaBrown]} {...shrinkToFit(0.75)}>
            {d.stepsMeta}
          </Text>
        </View>

        <View style={[styles.card, styles.sectionCard, styles.listCard]}>
          {/* Static. design/180 labels this "3 Action Items" but draws two. */}
          {d.steps.map((s, i) => (
            <Text key={s} style={[styles.step, i > 0 && styles.stepNext]}>
              {i + 1}. {s}
            </Text>
          ))}
        </View>

        <View style={[styles.card, styles.docCard]}>
          <View style={styles.docIcon}>
            <FileText size={t.docIconGlyph} color={t.textBrown} />
          </View>
          <View style={styles.docText}>
            <Text style={styles.docName} {...shrinkToFit(0.65)}>
              {d.document.name}
            </Text>
            <Text style={styles.docMeta} {...shrinkToFit(0.7)}>
              {d.document.meta}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Preview"
            onPress={() => router.push(advDocHref(d.document.name, { client: d.client.name, matter: d.matter }) as Href)}
            style={styles.docEye}
          >
            <Eye size={t.docEyeIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(`/advocate/consultation/${id}/completed` as Href)}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        >
          <CheckCircle2 size={t.continueIcon} color={ink.onBrand} />
          <Text style={styles.continueText} {...shrinkToFit(0.75)}>
            {d.continue}
          </Text>
        </Pressable>

        {/* Inert — no export flow is designed. */}
        <Pressable accessibilityRole="button" style={styles.export}>
          <PdfStackIcon size={t.exportIcon} color={t.textWarm} />
          <Text style={styles.exportText} {...shrinkToFit(0.8)}>
            {d.exportPdf}
          </Text>
          {/* Decorative — design/180 draws this dot after the label; its meaning is
              not specified. */}
          <View style={styles.exportDot} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.bg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.headerTitleSize,
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
    marginLeft: t.avatarGap,
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
    flex: 1,
    minWidth: 0,
    marginLeft: t.crumbGap,
    fontFamily: font.appSemi,
    fontSize: t.crumbLabelSize,
    lineHeight: t.crumbLineHeight,
    letterSpacing: t.crumbLabelSpacing,
    color: t.textBrown,
  },
  crumbDot: {
    width: t.crumbDot,
    height: t.crumbDot,
    borderRadius: t.crumbDot / 2,
    marginHorizontal: t.crumbDotGap,
    backgroundColor: t.crumbDotBg,
  },
  crumbRef: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.crumbRefSize,
    lineHeight: t.crumbLineHeight,
    color: t.textWarm,
  },
  saved: {
    marginLeft: t.savedGap,
    width: t.savedWidth,
    minHeight: t.savedHeight,
    borderRadius: t.savedRadius,
    paddingHorizontal: t.savedPadX,
    backgroundColor: t.savedBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedDot: {
    width: t.savedDot,
    height: t.savedDot,
    borderRadius: t.savedDot / 2,
    marginRight: t.savedDotGap,
    backgroundColor: t.textBrown,
  },
  savedText: {
    maxWidth: t.savedTextWidth,
    fontFamily: font.appBody,
    fontSize: t.savedSize,
    lineHeight: t.crumbLineHeight,
    color: t.textWarm,
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 32 },

  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  banner: {
    paddingLeft: t.bannerPadLeft,
    paddingRight: t.bannerPadRight,
    paddingVertical: t.bannerPadY,
    backgroundColor: t.bannerBg,
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
    fontFamily: font.appSemi,
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

  cardBody: { padding: t.cardPad, paddingBottom: t.cardPadBottom },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  photo: {
    width: t.photoW,
    height: t.photoH,
    borderRadius: t.photoW / 2,
    backgroundColor: t.photoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  photoBadge: {
    position: 'absolute',
    right: -t.photoBadgeRing,
    bottom: -t.photoBadgeRing,
    width: t.photoBadge,
    height: t.photoBadge,
    borderRadius: t.photoBadge / 2,
    borderWidth: t.photoBadgeRing,
    borderColor: colors.card,
    backgroundColor: t.textBrown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, color: colors.textPrimary },
  role: { marginTop: t.roleGap, fontFamily: font.appBody, fontSize: t.roleSize, color: t.textWarm },
  // design/180 hangs the disbursement from the top of the row, not its centre.
  disbCol: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  disbLabel: {
    fontFamily: font.appSemi,
    fontSize: t.disbLabelSize,
    letterSpacing: t.disbLabelSpacing,
    color: t.textWarm,
  },
  disb: { marginTop: t.disbGap, fontFamily: font.appSemi, fontSize: t.disbSize, color: t.textBrown },

  brief: {
    marginTop: t.briefGap,
    borderRadius: t.briefRadius,
    backgroundColor: t.briefBg,
    paddingHorizontal: t.briefPadX,
    paddingTop: t.briefPadTop,
    paddingBottom: t.briefPadBottom,
  },
  briefLabel: {
    fontFamily: font.appSemi,
    fontSize: t.briefLabelSize,
    letterSpacing: t.briefLabelSpacing,
    color: t.textBrown,
  },
  briefMatter: {
    marginTop: t.briefMatterGap,
    fontFamily: font.appSemi,
    fontSize: t.briefMatterSize,
    lineHeight: t.briefMatterLineHeight,
    color: colors.textPrimary,
  },

  stats: { marginTop: t.statGap, flexDirection: 'row', gap: t.statGapX },
  stat: {
    flex: 1,
    minWidth: 0,
    minHeight: t.statHeight,
    borderRadius: t.statRadius,
    backgroundColor: t.statBg,
    paddingHorizontal: t.statPadX,
    justifyContent: 'center',
  },
  statLabel: { fontFamily: font.appSemi, fontSize: t.statLabelSize, color: t.textWarm },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statIconRow: { alignItems: 'center' },
  statValue: {
    marginTop: t.statValueGap,
    fontFamily: font.appSemi,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  statValueInline: { marginLeft: t.statIconGap, flexShrink: 1, color: t.textBrown },
  statUnit: {
    marginLeft: t.statUnitGap,
    fontFamily: font.appBody,
    fontSize: t.statUnitSize,
    color: t.textWarm,
  },

  sectionRow: {
    marginTop: t.sectionGap,
    minHeight: t.sectionHeight,
    paddingLeft: t.sectionPadLeft,
    paddingRight: t.sectionPadRight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCard: { marginTop: t.sectionCardGap },
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
  sectionNote: { color: t.textWarm },
  sectionMeta: {
    fontFamily: font.appSemi,
    fontSize: t.sectionMetaSize,
    letterSpacing: t.sectionMetaSpacing,
    color: t.textWarm,
  },
  sectionMetaBrown: { color: t.textBrown },
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
    fontFamily: font.appSemi,
    fontSize: t.dictateSize,
    color: t.textBrown,
  },

  tools: {
    paddingHorizontal: t.toolsPadX,
    paddingVertical: t.toolsPadY,
    backgroundColor: t.toolsBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.toolGapX,
  },
  toolBtn: {
    width: t.toolBtn,
    height: t.toolBtn,
    borderRadius: t.toolRadius,
    backgroundColor: t.toolBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBold: { fontFamily: font.appHeading, fontSize: t.toolTextSize, color: colors.textPrimary },
  toolText: { fontFamily: font.appBody, fontSize: t.toolTextSize, color: colors.textPrimary },
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
  citeText: { fontFamily: font.appBody, fontSize: t.citeSize, color: t.textBrown },

  noteBody: { paddingHorizontal: t.notePadX, paddingTop: t.notePadTop, paddingBottom: t.notePadBottom },
  noteBox: { maxHeight: t.noteMaxH },
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
  noteFootText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.noteFootSize,
    letterSpacing: t.noteFootSpacing,
    color: t.textBrown,
  },
  noteFootCount: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.noteFootSize,
    letterSpacing: t.noteFootSpacing,
    color: t.textWarm,
  },

  listCard: { paddingHorizontal: t.notePadX, paddingTop: t.listPadTop, paddingBottom: t.listPadBottom },
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

  docCard: {
    marginTop: t.docGap,
    paddingHorizontal: t.docPadX,
    paddingVertical: t.docPadY,
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
  docName: { fontFamily: font.appSemi, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: {
    marginTop: t.docMetaGap,
    fontFamily: font.appBody,
    fontSize: t.docMetaSize,
    color: t.textWarm,
  },
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
    fontFamily: font.appSemi,
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
    color: t.textWarm,
  },
  exportDot: {
    marginLeft: t.exportDotGap,
    width: t.exportDot,
    height: t.exportDot,
    borderRadius: t.exportDot / 2,
    backgroundColor: t.crumbDotBg,
  },
  pressed: { opacity: 0.85 },
});
