import { router } from 'expo-router';
import {
  ChevronLeft,
  ClipboardCheck,
  Clock,
  PenLine,
  Scale,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfInfo as t, dfLanding as l, font, ink } from '../../constants/theme';

// Why Is Document Forensics Important? (design/83).
//
// NO PRIMARY BUTTON — REPORTED. Unlike every other info screen in the app
// (design/23 legal notice, design/41 FIR, design/73 property search), design/83 ends
// on its italic footnote with no call to action: no "Start", no "Continue", nothing
// routing onward. Nothing has been added. The only way forward from here is the back
// control, which returns to the landing screen where the flow actually starts.
//
// design/83 shipped as a 328px thumbnail (0.84px per point) and could not be
// measured; its metrics are carried from design/82.

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Scale,
    title: 'Acts as Evidence in Court',
    body: 'An expert forensic report may help document findings that can be considered as supporting material in legal proceedings.',
  },
  {
    icon: ShieldCheck,
    title: 'Prepared by Verified Experts',
    body: 'Documents are examined by qualified forensic professionals using appropriate examination methods and techniques.',
  },
  {
    icon: TriangleAlert,
    title: 'Helps Avoid Disputes',
    body: 'Identifying inconsistencies early can help clarify concerns before they develop into larger document-related disputes.',
  },
  {
    icon: PenLine,
    title: 'Detects Potential Alterations',
    body: 'Examination can help identify signs of editing, tampering, modification, or other irregularities.',
  },
  {
    icon: ClipboardCheck,
    title: 'Supports Authenticity Assessment',
    body: 'Detailed examination can help assess whether a document appears consistent with the information and characteristics available for review.',
  },
];

const WHEN = [
  'Suspected document tampering or alteration',
  'Disputed signatures or handwriting',
  'Doubts about the authenticity of an agreement',
  'Property or sale documents with inconsistencies',
  'Questionable affidavits or declarations',
  'Disputed digital documents, screenshots, or PDFs',
  'Documents involved in fraud-related disputes',
  'Any important document where authenticity is genuinely in question',
];

export default function DocumentForensicInfoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + l.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/document-forensic'))}
          style={styles.circle}
        >
          <ChevronLeft size={l.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Document Forensic
        </Text>
        <View style={styles.avatar}>
          <UserRound size={l.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.whenGap }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Why Is Document Forensics Important?</Text>
        <Text style={styles.intro}>
          Document forensic analysis provides an additional layer of scrutiny when the authenticity,
          integrity, or origin of a document is in question. It can help identify potential
          alterations, inconsistencies, or other signs that may require expert examination.
        </Text>

        {REASONS.map((r) => (
          <View key={r.title} style={styles.card}>
            <View style={styles.cardIcon}>
              <r.icon size={t.cardIconGlyph} color={ink.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                {r.title}
              </Text>
              <Text style={styles.cardBody}>{r.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.when}>
          <View style={styles.whenHead}>
            <Clock size={t.whenIcon} color={ink.accent} />
            <Text style={styles.whenTitle} {...shrinkToFit(0.8)}>
              When Should You Consider Document Forensics?
            </Text>
          </View>

          <View style={styles.whenList}>
            {WHEN.map((w) => (
              <View key={w} style={styles.whenRow}>
                <View style={styles.whenDot} />
                <Text style={styles.whenRowText}>{w}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.whenNote}>
            Whether forensic examination is appropriate depends on the nature of the document, the
            concern involved, and the available evidence.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: l.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: l.backButton,
    height: l.backButton,
    borderRadius: l.backButton / 2,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: l.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: l.avatar,
    height: l.avatar,
    borderRadius: l.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: t.padX,
  },
  heading: {
    marginTop: t.headingTop,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  intro: {
    marginTop: t.introGap,
    fontFamily: font.appBody,
    fontSize: t.introSize,
    lineHeight: t.introLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.cardPad,
    flexDirection: 'row',
  },
  cardIcon: {
    width: t.cardIcon,
    height: t.cardIcon,
    borderRadius: t.cardIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.cardIconGap,
  },
  cardTitle: {
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  when: {
    marginTop: t.whenGap,
    borderRadius: t.whenRadius,
    backgroundColor: t.whenBg,
    padding: t.whenPad,
  },
  whenHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whenTitle: {
    marginLeft: t.whenIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.whenTitleSize,
    color: colors.textPrimary,
  },
  whenList: {
    marginTop: t.whenListGap,
    gap: t.whenRowGap,
  },
  whenRow: {
    borderRadius: t.whenRowRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.whenRowPadX,
    paddingVertical: t.whenRowPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  whenDot: {
    width: t.whenDot,
    height: t.whenDot,
    borderRadius: t.whenDot / 2,
    marginTop: 7,
    marginRight: t.whenDotGap,
    backgroundColor: ink.accent,
  },
  whenRowText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.whenRowSize,
    lineHeight: t.whenRowLineHeight,
    color: colors.textPrimary,
  },
  whenNote: {
    marginTop: t.whenNoteGap,
    fontStyle: 'italic',
    fontFamily: font.appBody,
    fontSize: t.whenNoteSize,
    lineHeight: t.whenNoteLineHeight,
    color: colors.textBody,
  },
});
