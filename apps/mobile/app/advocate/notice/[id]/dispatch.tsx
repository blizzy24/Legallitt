import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { previewNotice } from '../../../../components/PreviewNotice';
import DemoPressable from '../../../../components/DemoPressable';
import { router, router as appRouter, useLocalSearchParams, type Href } from 'expo-router';
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
import { CO_SELF_DETAILS } from '../../../../data/courier';
import { TRACKING_STEPS } from '../../../../data/legalNotice';
import { advNoticeDispatch as t, colors, font, ink } from '../../../../constants/theme';

// Prepare for dispatch (design/193).
//
// The two primary actions (architecture line 1636): Continue to Send opens the
// courier-details form (286), which returns here; Confirm Dispatch dispatches.
// Owner decision, 4 November 2026: in API mode the screen shows the case's real state.
// Once the courier details are booked they appear here (in 286's own labels) and
// Confirm Dispatch is enabled; until then it is disabled with 286's required-fields
// line. A dispatched case shows "Notice Dispatched" and offers neither action.
// Back returns to Final (192), the screen before this one.
//
// The drawn "Takes you to Send via Blue Dart" caption is not shown: no delivery
// partner exists (§9.1).
//
// ⚠ design/193 draws two Done and two Pending checklist rows but NO INTERACTION for
// completing them. The pending rows are made tappable here, since a checklist you
// cannot check is not a checklist — the design shows states but not the transition.

export type DispatchState = {loaded: boolean; dispatched: boolean; canConfirm: boolean; courier: {carrier: string; waybill: string; dispatchDate: string} | null};
export function AdvocateNoticeDispatchScreenView({ data, navigate, onDownload, onConfirm, state }: { onDownload?: (id?: string) => void; onConfirm?: () => void; state?: DispatchState; data: { ADV_NOTICE_DISPATCH: typeof ADV_NOTICE_DISPATCH; ADV_NOTICE_RECIPIENT: typeof ADV_NOTICE_RECIPIENT }; navigate: typeof router }) {
  const { ADV_NOTICE_DISPATCH, ADV_NOTICE_RECIPIENT } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_NOTICE_DISPATCH;
  const [done, setDone] = useState<string[]>(
    d.checklist.filter((c) => c.done).map((c) => c.id),
  );
  const dispatched = state?.dispatched ?? false;
  const canConfirm = state ? state.canConfirm : true;
  const courierRows = state?.courier ? [
    { label: CO_SELF_DETAILS.trackRows[0].label, value: state.courier.carrier },
    { label: CO_SELF_DETAILS.trackRows[1].label, value: state.courier.waybill },
    { label: CO_SELF_DETAILS.fields[2].label.toUpperCase(), value: state.courier.dispatchDate },
  ].filter((row) => row.value) : [];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          // Straight to expo-router (the model's guarded navigate waits for the case to
          // load); pops back to Final when it is in the stack, otherwise replaces this screen.
          onPress={() => appRouter.dismissTo(`/advocate/notice/${id}/final` as Href)}
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
                {dispatched ? TRACKING_STEPS[5].title : d.ready.title}
              </Text>
              {dispatched ? null : <View style={styles.readyChip}>
                <Text style={styles.readyChipText} {...shrinkToFit(0.8)}>
                  {d.ready.chip}
                </Text>
              </View>}
            </View>
            {dispatched ? null : <Text style={styles.readyBody}>{d.ready.body}</Text>}
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
          <Pressable onPress={() => onDownload ? onDownload() : previewNotice(d.download)} accessibilityRole="button" style={styles.dl}>
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

        {courierRows.length ? <View style={styles.card}>
          <View style={styles.labelRow}>
            <Truck size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {CO_SELF_DETAILS.formTitle.toUpperCase()}
            </Text>
          </View>
          {courierRows.map((row) => (
            <View key={row.label} style={styles.courierRow}>
              <Text style={styles.courierLabel} {...shrinkToFit(0.8)}>{row.label}</Text>
              <Text selectable style={styles.courierValue}>{row.value}</Text>
            </View>
          ))}
        </View> : null}

        {dispatched ? null : <>
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
        </>}
      </ScrollView>

      {dispatched ? null : <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <DemoPressable
          // Keep the real handler: DemoPressable treats a missing onPress as a demo advance.
          onPress={onConfirm}
          disabled={!canConfirm}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canConfirm }}
          style={({ pressed }) => [styles.confirm, !canConfirm && styles.confirmOff, pressed && styles.pressed]}
        >
          <SendHorizontal size={t.confirmIcon} color={ink.onBrand} />
          <Text style={styles.confirmText} {...shrinkToFit(0.75)}>
            {d.confirm}
          </Text>
        </DemoPressable>
        {canConfirm || !(state?.loaded ?? true) ? null : <Text style={styles.cap}>{CO_SELF_DETAILS.foot}</Text>}
      </View>}
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
  confirmOff: { opacity: 0.45 },
  courierRow: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'center' },
  courierLabel: { width: '40%', fontFamily: font.appSemi, fontSize: t.rowSubSize, letterSpacing: t.labelSpacing, color: colors.textBody },
  courierValue: { flex: 1, minWidth: 0, fontFamily: font.appHeading, fontSize: t.rowTitleSize, color: colors.textPrimary },
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeDispatchScreen() {
  const model = useAdvocateNoticeModel("dispatch");
  return <NoticeScreenFeedback error={model.error} state={model.screenState}><AdvocateNoticeDispatchScreenView data={model.data} navigate={model.navigate} onDownload={model.onViewDocument} onConfirm={model.onConfirmDispatch} state={model.dispatchState} /></NoticeScreenFeedback>;
}
