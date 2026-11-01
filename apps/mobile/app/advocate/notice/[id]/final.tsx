import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Download,
  Flag,
  Info,
  Mail,
  MapPin,
  FileText,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_FINAL, ADV_NOTICE_RECIPIENT } from '../../../../data/advocateSide';
import { advNoticeFinal as t, colors, font, ink } from '../../../../constants/theme';

// Final notice ready (design/192).
//
// ⚠ The caption under the primary button reads "Takes you to Send via Blue Dart",
// but design/194 still offers a CHOICE between sending the notice yourself and using
// the Legalitt partner — and design/200 then tracks the shipment under DHL Express.
// The caption promises a courier before the choice exists, and names a different one
// from the screen that does the tracking. Built as drawn and flagged.
//
// Download PDF is inert — the prototype has no file output.

export function AdvocateNoticeFinalScreenView({ data, navigate, onDownload }: { onDownload?: (id?: string) => void; data: { ADV_NOTICE_FINAL: typeof ADV_NOTICE_FINAL; ADV_NOTICE_RECIPIENT: typeof ADV_NOTICE_RECIPIENT }; navigate: typeof router }) {
  const { ADV_NOTICE_FINAL, ADV_NOTICE_RECIPIENT } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const f = ADV_NOTICE_FINAL;

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
          {f.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.ok]}>
          <View style={styles.okIcon}>
            <Check size={t.okIconGlyph} color={ink.onBrand} />
          </View>
          <View style={styles.okText}>
            <View style={styles.okTitleRow}>
              <Text style={styles.okTitle} {...shrinkToFit(0.75)}>
                {f.approved.title}
              </Text>
              <View style={styles.okChip}>
                <Text style={styles.okChipText} {...shrinkToFit(0.8)}>
                  {f.approved.chip}
                </Text>
              </View>
            </View>
            <Text style={styles.okBody}>{f.approved.body}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <UserRound size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {f.clientLabel}
            </Text>
            <View style={styles.verified}>
              <View style={styles.verifiedDot} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                {f.verifiedChip}
              </Text>
            </View>
          </View>
          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {f.clientName}
          </Text>
          <Text style={styles.sign} {...shrinkToFit(0.7)}>
            {f.signOff}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Mail size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {f.sendToLabel}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {f.sendToChip}
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
            <FileText size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {f.docLabel}
            </Text>
            <View style={styles.verified}>
              <CircleCheck size={t.labelIcon} color={t.verifiedColour} />
              <Text style={[styles.verifiedText, styles.docChip]} {...shrinkToFit(0.8)}>
                {f.docChip}
              </Text>
            </View>
          </View>

          <View style={styles.doc}>
            <View style={styles.docIcon}>
              <FileText size={t.docIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.docText}>
              <Text style={styles.docName} {...shrinkToFit(0.7)}>
                {f.doc.name}
              </Text>
              <Text style={styles.docMeta} {...shrinkToFit(0.75)}>
                {f.doc.meta}
              </Text>
            </View>
            <CircleCheck size={t.docTick} color={colors.textPrimary} />
          </View>

          {/* Inert — the prototype has no file output. */}
          <Pressable onPress={() => onDownload ? onDownload() : previewNotice(f.download)} accessibilityRole="button" style={styles.dl}>
            <Download size={t.dlIcon} color={colors.textPrimary} />
            <Text style={styles.dlText} {...shrinkToFit(0.8)}>
              {f.download}
            </Text>
          </Pressable>
          <Text style={styles.dlNote}>{f.downloadNote}</Text>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.labelRow}>
            <Flag size={t.nextIcon} color={colors.brandDark} />
            <Text style={styles.nextTitle} {...shrinkToFit(0.75)}>
              {f.nextStep.title}
            </Text>
          </View>
          <Text style={styles.nextBody}>{f.nextStep.body}</Text>
          <View style={styles.nextNote}>
            <Info size={t.nextNoteIcon} color={colors.brandDark} />
            <Text style={styles.nextNoteText}>{f.nextStep.note}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/dispatch` as Href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.75)}>
            {f.cta}
          </Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} style={styles.ctaIcon} />
        </Pressable>
        {/* ⚠ Names a courier the next screen still lets you choose. */}
        <Text style={styles.cap} {...shrinkToFit(0.75)}>
          {f.ctaCaption}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.headerBg,
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

  ok: { backgroundColor: t.okBg, flexDirection: 'row' },
  okIcon: {
    width: t.okIcon,
    height: t.okIcon,
    borderRadius: t.okIcon / 2,
    backgroundColor: t.okIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: { flex: 1, minWidth: 0, marginLeft: t.okIconGap },
  okTitleRow: { flexDirection: 'row', alignItems: 'center' },
  okTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.okTitleSize, color: t.okColour },
  okChip: {
    marginLeft: t.okChipGap,
    minHeight: t.okChipHeight,
    borderRadius: t.okChipRadius,
    paddingHorizontal: t.okChipPadX,
    backgroundColor: t.okChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okChipText: { fontFamily: font.appBody, fontSize: t.okChipSize, color: t.okChipColour },
  okBody: {
    marginTop: t.okBodyGap,
    fontFamily: font.appBody,
    fontSize: t.okBodySize,
    lineHeight: t.okBodyLineHeight,
    color: colors.textPrimary,
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
  verified: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  verifiedDot: {
    width: t.verifiedDot,
    height: t.verifiedDot,
    borderRadius: t.verifiedDot / 2,
    marginRight: t.verifiedDotGap,
    backgroundColor: t.verifiedColour,
  },
  verifiedText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.verifiedSize, color: t.verifiedColour },
  docChip: { marginLeft: t.verifiedDotGap },

  name: { marginTop: t.nameGap, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  sign: { marginTop: t.signGap, fontFamily: font.appBody, fontSize: t.signSize, color: colors.textBody },

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
    color: colors.textBody,
  },

  next: { backgroundColor: t.nextBg },
  nextTitle: {
    marginLeft: t.nextIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.nextTitleSize,
    color: colors.textPrimary,
  },
  nextBody: {
    marginTop: t.nextBodyGap,
    fontFamily: font.appBody,
    fontSize: t.nextBodySize,
    lineHeight: t.nextBodyLineHeight,
    color: colors.textPrimary,
  },
  nextNote: {
    marginTop: t.nextNoteGap,
    borderRadius: t.nextNoteRadius,
    backgroundColor: t.nextNoteBg,
    padding: t.nextNotePad,
    flexDirection: 'row',
  },
  nextNoteText: {
    marginLeft: t.nextNoteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.nextNoteSize,
    lineHeight: t.nextNoteLineHeight,
    color: colors.textPrimary,
  },

  bar: {
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
    backgroundColor: t.barBg,
  },
  cta: {
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
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeFinalScreen() {
  const model = useAdvocateNoticeModel("final");
  return <NoticeScreenFeedback error={model.error}><AdvocateNoticeFinalScreenView data={model.data} navigate={model.navigate} onDownload={model.onViewDocument} /></NoticeScreenFeedback>;
}
