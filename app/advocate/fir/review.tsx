import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  Eye,
  FileText,
  History,
  Hourglass,
  Info,
  Mail,
  MailPlus,
  MapPin,
  Phone,
  PhoneForwarded,
  Send,
  Share2,
  Shield,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_REVIEW } from '../../../data/advocateFir';
import { advFirReview as t, colors, font, ink } from '../../../constants/theme';

// FIR review & status (design/219).
//
// THE PREVIEW SWITCHER IS CLIENT UI, NOT A DEV AFFORDANCE. Every other preview
// switcher in this project is something we added and hid behind
// DEV_PREVIEW_TOGGLES; design/219 draws this one as screen content, with its own
// "ADVOCATE PREVIEW SWITCHER" label and an "Interactive Demo" tag. It is therefore
// ungated and always rendered.
//
// ⚠ ITS LABELS ARE "Waiting / Approved / Changes", not "Changes Needed".
//
// ⚠ ONLY THE "Waiting" STATE IS DESIGNED. design/219 is a single-state export and
// there is no Approved or Changes screen anywhere in this batch, so the other two
// segments cannot change the content without inventing it. They select; the content
// stays as drawn, and a dev-only note says so.
//
// ⚠ THE FILING TIMELINE HAS NO CONNECTOR LINES. design/219 draws five standalone
// circles, 23pt across, on a 50pt row pitch — measured from the PNG. The Property
// Search tracker's rail and line values are NOT reused: the element does not exist
// here. components/FirTimeline is also not reused for the same reason — it is built
// around a connector rail, the firResult tokens and the client-side TimelineItem
// shape, none of which apply.
//
// ⚠ "8 Legal Sections" here, "4 Sections" on design/218. "4 Files Attached" is a
// fifth count for the document set. The docket is #FIR-2026-8841 with a "#".

const TL_ICONS = { check: Check, hourglass: Hourglass, checkcheck: CheckCheck, send: Send };

export default function AdvocateFirReviewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const r = FIR_REVIEW;
  const [state, setState] = useState(r.switcher.states[0]);

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
          {r.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Drawn in design/219 as screen content — client UI, not a dev control. */}
        <View style={styles.switchLabelRow}>
          <Text style={styles.switchLabel} {...shrinkToFit(0.75)}>
            {r.switcher.label}
          </Text>
          <Eye size={t.demoIcon} color={t.demoColour} style={styles.demoIcon} />
          <Text style={styles.demo} {...shrinkToFit(0.75)}>
            {r.switcher.demo}
          </Text>
        </View>
        <View style={styles.seg}>
          {r.switcher.states.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityState={{ selected: state === s }}
              onPress={() => setState(s)}
              style={[styles.segItem, state === s && styles.segItemOn]}
            >
              <Text style={[styles.segText, state === s && styles.segTextOn]} {...shrinkToFit(0.8)}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* Kept: the other two states have no design. See data/advocateFir.ts. */}
        {state !== r.switcher.states[0] && (
          <View style={styles.devNote}>
            <Text style={styles.devNoteText}>{r.switcher.devNote}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.docket} {...shrinkToFit(0.75)}>
              {r.docket}
            </Text>
            <View style={styles.docketChip}>
              <View style={styles.docketChipDot} />
              <Text style={styles.docketChipText} {...shrinkToFit(0.75)}>
                {r.statusChip}
              </Text>
            </View>
          </View>
          <View style={styles.stationRow}>
            <Shield size={t.stationIcon} color={colors.textPrimary} />
            <Text style={styles.station} {...shrinkToFit(0.75)}>
              {r.station}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.client.label}
            </Text>
            <View style={styles.verified}>
              <ShieldCheck size={t.verifiedIcon} color={t.verifiedColour} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.75)}>
                {r.client.chip}
              </Text>
            </View>
          </View>
          <View style={styles.clientRow}>
            <View style={styles.initials}>
              <Text style={styles.initialsText} {...shrinkToFit(0.8)}>
                {r.client.initials}
              </Text>
            </View>
            <View style={styles.clientText}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {r.client.name}
              </Text>
              <View style={styles.phoneRow}>
                <Phone size={t.phoneIcon} color={colors.textPrimary} />
                <Text style={styles.phone} {...shrinkToFit(0.75)}>
                  {r.client.phone}
                </Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Call client" style={styles.callBtn}>
              <PhoneForwarded size={t.callGlyph} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.cityRow}>
            <MapPin size={t.cityIcon} color={t.cityColour} />
            <Text style={styles.city} {...shrinkToFit(0.8)}>
              {r.client.city}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.fileIcon}>
              <FileText size={t.fileIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.fileText}>
              <View style={styles.row}>
                <Text style={styles.fileTitle} {...shrinkToFit(0.75)}>
                  {r.draft.title}
                </Text>
                <View style={styles.verChip}>
                  <Text style={styles.verChipText} {...shrinkToFit(0.8)}>
                    {r.draft.version}
                  </Text>
                </View>
              </View>
              <Text style={styles.fileSub} {...shrinkToFit(0.8)}>
                {r.draft.by}
              </Text>
            </View>
          </View>

          <View style={styles.pro}>
            <View style={styles.row}>
              <Shield size={t.proIcon} color={colors.brandDark} />
              <Text style={styles.proTitle} {...shrinkToFit(0.8)}>
                {r.draft.proforma}
              </Text>
            </View>
            <View style={styles.proStats}>
              <View style={styles.row}>
                <FileText size={t.proStatIcon} color={colors.textBody} />
                <Text style={styles.proStat} {...shrinkToFit(0.8)}>
                  {r.draft.sections}
                </Text>
              </View>
              <View style={[styles.row, styles.proStatNext]}>
                <FileText size={t.proStatIcon} color={colors.textBody} />
                <Text style={styles.proStat} {...shrinkToFit(0.8)}>
                  {r.draft.files}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actRow}>
            {/* The draft has its own reader, design/218, so View opens that. */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/advocate/fir/draft?id=${id ?? ''}` as Href)}
              style={({ pressed }) => [styles.act, pressed && styles.pressed]}
            >
              <Eye size={t.actIcon} color={colors.textPrimary} />
              <Text style={styles.actText} {...shrinkToFit(0.8)}>
                {r.draft.view}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Share draft" style={styles.actShare}>
              <Share2 size={t.actIcon} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.timeline.label}
            </Text>
            <Text style={styles.tlStage} {...shrinkToFit(0.8)}>
              {r.timeline.stage}
            </Text>
          </View>
          {/* ⚠ No connector lines — design/219 draws none. */}
          <View style={styles.tl}>
            {r.timeline.rows.map((row, i) => {
              const Icon = TL_ICONS[row.icon];
              const bg =
                row.tone === 'done' ? t.tlDoneBg : row.tone === 'active' ? t.tlActiveBg : t.tlTodoBg;
              const fg = row.tone === 'done' ? ink.onBrand : colors.textPrimary;
              return (
                <View key={row.title} style={[styles.tlRow, i > 0 && styles.tlRowNext]}>
                  <View style={[styles.tlDot, { backgroundColor: bg }]}>
                    <Icon size={t.tlDotGlyph} color={fg} strokeWidth={row.tone === 'done' ? 3 : 2} />
                  </View>
                  <View style={styles.tlText}>
                    <Text style={styles.tlTitle} {...shrinkToFit(0.75)}>
                      {row.title}
                    </Text>
                    <Text style={styles.tlSub} {...shrinkToFit(0.8)}>
                      {row.sub}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.alertIcon}>
              <Mail size={t.alertIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.alertText}>
              <Text style={styles.alertTitle} {...shrinkToFit(0.75)}>
                {r.alert.title}
              </Text>
              <Text style={styles.alertBody}>{r.alert.body}</Text>
            </View>
          </View>
          <View style={styles.note}>
            <Info size={t.noteIcon} color={colors.textPrimary} style={styles.noteIcon} />
            <Text style={styles.noteText}>{r.alert.note}</Text>
          </View>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.resend, pressed && styles.pressed]}>
            <MailPlus size={t.resendIcon} color={colors.textPrimary} />
            <Text style={styles.resendText} {...shrinkToFit(0.8)}>
              {r.alert.resend}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/fir/completed?id=${id ?? ''}` as Href)}
            style={({ pressed }) => [styles.remind, pressed && styles.pressed]}
          >
            <BellRing size={t.remindIcon} color={ink.onBrand} />
            <Text style={styles.remindText} {...shrinkToFit(0.8)}>
              {r.alert.remind}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.audit.label}
            </Text>
            <History size={t.auditIcon} color={colors.textPrimary} style={styles.auditIcon} />
          </View>
          {r.audit.rows.map((row) => (
            <View key={row.text} style={styles.auditRow}>
              <View style={styles.auditDot} />
              <Text style={styles.auditText} {...shrinkToFit(0.75)}>
                {row.text}
              </Text>
              <Text style={styles.auditTime} {...shrinkToFit(0.8)}>
                {row.time}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
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

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },

  switchLabelRow: { marginTop: t.switchLabelGap, flexDirection: 'row', alignItems: 'center' },
  switchLabel: {
    flexShrink: 1,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.switchLabelSize,
    letterSpacing: t.switchLabelSpacing,
    color: t.switchLabelColour,
  },
  demoIcon: { marginLeft: 'auto' },
  demo: { marginLeft: t.demoIconGap, fontFamily: font.appBody, fontSize: t.demoSize, color: t.demoColour, flexShrink: 1 },
  seg: {
    marginTop: t.segGap,
    minHeight: t.segHeight,
    borderRadius: t.segRadius,
    backgroundColor: t.segBg,
    padding: t.segPad,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  segItem: { flex: 1, minWidth: 0, borderRadius: t.segItemRadius, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segItemOn: { backgroundColor: t.segOnBg },
  segText: { fontFamily: font.appBody, fontSize: t.segSize, color: t.segOffColour, flexShrink: 1 },
  segTextOn: { fontFamily: font.appHeading, color: t.segOnColour },
  devNote: { marginTop: t.devNoteGap, borderRadius: t.devNoteRadius, backgroundColor: t.devNoteBg, padding: t.devNotePad },
  devNoteText: { fontFamily: font.appBody, fontSize: t.devNoteSize, lineHeight: t.devNoteLineHeight, color: t.devNoteColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  row: { flexDirection: 'row', alignItems: 'center' },

  docket: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.docketSize, color: colors.textPrimary },
  docketChip: {
    marginLeft: 'auto',
    minHeight: t.docketChipHeight,
    borderRadius: t.docketChipRadius,
    backgroundColor: t.docketChipBg,
    paddingHorizontal: t.docketChipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  docketChipDot: {
    width: t.docketChipDot,
    height: t.docketChipDot,
    borderRadius: t.docketChipDot / 2,
    backgroundColor: t.docketChipColour,
    marginRight: t.docketChipDotGap,
  },
  docketChipText: {
    fontFamily: font.appSemi,
    fontSize: t.docketChipSize,
    letterSpacing: t.docketChipSpacing,
    color: t.docketChipColour,
    flexShrink: 1,
  },
  stationRow: { marginTop: t.stationGap, flexDirection: 'row', alignItems: 'center' },
  station: { marginLeft: t.stationIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.stationSize, color: colors.textPrimary },

  label: {
    flexShrink: 1,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: t.labelColour,
  },
  verified: {
    marginLeft: 'auto',
    minHeight: t.verifiedHeight,
    borderRadius: t.verifiedRadius,
    backgroundColor: t.verifiedBg,
    paddingHorizontal: t.verifiedPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  verifiedText: { marginLeft: t.verifiedIconGap, fontFamily: font.appSemi, fontSize: t.verifiedSize, color: t.verifiedColour, flexShrink: 1 },

  clientRow: { marginTop: t.clientGap, flexDirection: 'row', alignItems: 'center' },
  initials: {
    width: t.initials,
    height: t.initials,
    borderRadius: t.initials / 2,
    backgroundColor: t.initialsBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsSize, color: t.initialsColour },
  clientText: { flex: 1, minWidth: 0, marginHorizontal: t.initialsGapX },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  phoneRow: { marginTop: t.phoneGap, flexDirection: 'row', alignItems: 'center' },
  phone: { marginLeft: t.phoneIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.phoneSize, color: colors.textPrimary },
  callBtn: {
    width: t.callBtn,
    height: t.callBtn,
    borderRadius: t.callRadius,
    backgroundColor: t.callBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityRow: { marginTop: t.cityGap, flexDirection: 'row', alignItems: 'center' },
  city: { marginLeft: t.cityIconGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.citySize, color: t.cityColour },

  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap },
  fileTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.fileTitleSize, color: colors.textPrimary },
  verChip: {
    marginLeft: t.verChipGap,
    minHeight: t.verChipHeight,
    borderRadius: t.verChipRadius,
    backgroundColor: t.verChipBg,
    paddingHorizontal: t.verChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  verChipText: { fontFamily: font.appSemi, fontSize: t.verChipSize, color: t.verChipColour },
  fileSub: { marginTop: t.fileSubGap, fontFamily: font.appBody, fontSize: t.fileSubSize, color: t.fileSubColour },

  pro: { marginTop: t.proGap, borderRadius: t.proRadius, backgroundColor: t.proBg, padding: t.proPad },
  proTitle: { marginLeft: t.proIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.proTitleSize, color: colors.textPrimary },
  proStats: { marginTop: t.proStatGap, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  proStat: { marginLeft: t.proStatIconGap, fontFamily: font.appBody, fontSize: t.proStatSize, color: colors.textPrimary, flexShrink: 1 },
  proStatNext: { marginLeft: t.proStatGapX },

  actRow: { marginTop: t.actGap, flexDirection: 'row', alignItems: 'center', gap: t.actGapX },
  act: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actHeight,
    borderRadius: t.actRadius,
    backgroundColor: t.actBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actText: { marginLeft: t.actIconGap, fontFamily: font.appHeading, fontSize: t.actSize, color: colors.textPrimary, flexShrink: 1 },
  actShare: {
    width: t.actShare,
    minHeight: t.actHeight,
    borderRadius: t.actRadius,
    backgroundColor: t.actBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tlStage: { marginLeft: 'auto', fontFamily: font.appBody, fontSize: t.tlStageSize, color: t.tlStageColour, flexShrink: 1 },
  tl: { marginTop: t.tlGap },
  tlRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tlRowNext: { marginTop: t.tlPitch - t.tlDot },
  tlDot: {
    width: t.tlDot,
    height: t.tlDot,
    borderRadius: t.tlDot / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlText: { flex: 1, minWidth: 0, marginLeft: t.tlDotGap },
  tlTitle: { fontFamily: font.appHeading, fontSize: t.tlTitleSize, color: colors.textPrimary },
  tlSub: { marginTop: t.tlSubGap, fontFamily: font.appBody, fontSize: t.tlSubSize, color: t.tlSubColour },

  alertIcon: {
    width: t.alertIcon,
    height: t.alertIcon,
    borderRadius: t.alertIconRadius,
    backgroundColor: t.alertIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: { flex: 1, minWidth: 0, marginLeft: t.alertIconGap },
  alertTitle: { fontFamily: font.appHeading, fontSize: t.alertTitleSize, color: colors.textPrimary },
  alertBody: {
    marginTop: t.alertBodyGap,
    fontFamily: font.appBody,
    fontSize: t.alertBodySize,
    lineHeight: t.alertBodyLineHeight,
    color: t.alertBodyColour,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteIcon: { marginTop: 1 },
  noteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.noteIconGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },
  resend: {
    marginTop: t.resendGap,
    minHeight: t.resendHeight,
    borderRadius: t.resendRadius,
    backgroundColor: t.resendBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  resendText: { marginLeft: t.resendIconGap, fontFamily: font.appHeading, fontSize: t.resendSize, color: colors.textPrimary, flexShrink: 1 },
  remind: {
    marginTop: t.remindGap,
    minHeight: t.remindHeight,
    borderRadius: t.remindRadius,
    backgroundColor: t.remindBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  remindText: { marginLeft: t.remindIconGap, fontFamily: font.appHeading, fontSize: t.remindSize, color: ink.onBrand, flexShrink: 1 },

  auditIcon: { marginLeft: 'auto' },
  auditRow: { marginTop: t.auditRowGap, flexDirection: 'row', alignItems: 'center' },
  auditDot: {
    width: t.auditDot,
    height: t.auditDot,
    borderRadius: t.auditDot / 2,
    backgroundColor: t.auditDotColour,
    marginRight: t.auditDotGap,
  },
  auditText: { flex: 1, minWidth: 0, marginRight: 10, fontFamily: font.appBody, fontSize: t.auditSize, color: colors.textPrimary },
  auditTime: { fontFamily: font.appBody, fontSize: t.auditTimeSize, color: t.auditTimeColour, flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
