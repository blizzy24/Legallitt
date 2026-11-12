import { router } from 'expo-router';
import {
  BellRing, Check, CheckCheck, ChevronLeft, Eye, FileText, History, Hourglass, Info, Mail, MapPin, MessageSquareWarning,
  Phone, PhoneForwarded, Send, Share2, Shield, ShieldCheck, UserRound, type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIR_CLIENT_CHANGES, firSectionLabel, type FirFlowView } from '@legalitt/shared';

import { advFirReviewCompact as compactTokens } from '../../../constants/tokens/advFir';
import { shrinkToFit } from '../../../constants/textFit';
import { FIR_REVIEW as c } from '../../../data/advocateFir';
import { advFirReview as t, colors, font, ink } from '../../../constants/theme';
import { backend } from '../../../lib/auth';
import { formatDate, formatTime, initials, useFirFlow, viewDocument } from '../../../features/fir/flow';
import { PoliceSubmissionSheet } from '../../../features/fir/advocate/PoliceSubmissionSheet';
import { hashRef } from '../../../features/fir/client/format';
import { dayTime, firRoute, InlineError, MovedOn, StateCard, toCases, useAction, useAdvocateCaseId } from '../../../features/fir/advocate/common';

// FIR review & status (designs 219 and 449, flow A6), live in every data mode.
// [DECIDE] The Filing Timeline adds the admin step; "Submitted to Police" follows the
// case: shown once the client approved into police submission, when a submission is
// recorded, or (case not completed yet) while the advocate-submits setting is on.
// [REMOVE] Verified Complainant, Resend Review Link, SMS and the Preview Switcher.
// 449 is the compact layout opened right after sending: no status panel while
// nobody needs the advocate, and Continue returns to Cases.
const ACCESS = ['advocate_accepted', 'in_progress', 'changes_requested', 'client_review', 'approved', 'completed', 'cancelled', 'refunded'];
const DRAFTING = ['advocate_accepted', 'in_progress', 'changes_requested'];
type Tone = 'done' | 'active' | 'todo';
type Row = { title: string; sub: string; tone: Tone; icon: LucideIcon };
type Panel = { icon: LucideIcon; title: string; body?: string; note?: string; review?: FirFlowView['reviews'][number]; actionable: boolean };

const latest = (flow: FirFlowView, type: string) => [...flow.events].reverse().find(e => e.type === type)?.created_at ?? null;
const station = (value: string | null) => !value ? '' : /^(ps|police station)\b/i.test(value) ? value : `PS ${value}`;
/** "PS <station>, <district>" (design 219), named the same in the header, the status panel and the police sheet. */
const stationName = (flow: FirFlowView) => {
  const name = station(flow.police_station?.trim() || null), district = flow.district?.trim();
  return name && district && !name.toLowerCase().includes(district.toLowerCase()) ? `${name}, ${district}` : name;
};
/** "Indore (Madhya Pradesh)" when the state is known. */
const placeName = (city: string | null | undefined, state: string | null) => {
  const town = city?.trim(), region = state?.trim();
  return town && region && town.toLowerCase() !== region.toLowerCase() ? `${town} (${region})` : town || region || '';
};
/** A 10-digit Indian mobile reads "+91 98260 41298"; any other format is shown as entered. */
const mobileLabel = (value: string) => {
  const m = /^(?:\+91)?(\d{10})$/.exec(value.replace(/[\s-]/g, ''));
  return m ? `+91 ${m[1].slice(0, 5)} ${m[1].slice(5)}` : value;
};

function timeline(flow: FirFlowView) {
  // Follows the case, not today's setting: a case completed with the setting on keeps
  // its police row (it has a submission); one completed with it off never had one.
  const police = flow.status === 'approved' || !!flow.police || (flow.status !== 'completed' && flow.settings.police_submission_by_advocate);
  const steps: { title: string; icon: LucideIcon; done: string; active?: string; todo?: string }[] = [
    { title: 'Draft Created', icon: FileText, done: [flow.draft ? `v${flow.draft.version}` : '', dayTime(latest(flow, 'fir_draft_saved') ?? flow.draft?.created_at)].filter(Boolean).join(' • ') },
    { title: 'Sent to Admin', icon: Send, done: dayTime(latest(flow, 'fir_draft_submitted')) },
    { title: 'Admin Approved', icon: ShieldCheck, done: dayTime(latest(flow, 'fir_draft_approved')), active: 'Active step • Awaiting Legalitt approval' },
    { title: 'Sent to Client', icon: Mail, done: dayTime(latest(flow, 'fir_sent_to_client') ?? latest(flow, 'fir_draft_approved')) },
    { title: 'Client Approved', icon: CheckCheck, done: dayTime(latest(flow, 'fir_client_approved')), active: 'Active step • Awaiting sign-off', todo: 'Client formal consent' },
    ...(police ? [{ title: 'Submitted to Police', icon: Send, done: flow.police ? `Submitted ${formatDate(flow.police.submitted_on)}` : dayTime(latest(flow, 'fir_police_submitted')), active: 'Active step • Upload the police receipt', todo: 'Final dispatch & receipt' }] : []),
  ];
  const review = flow.reviews[flow.reviews.length - 1];
  const drafting = review && review.decision !== 'approved' ? review.role === 'client' ? 'Active step • Client requested changes' : 'Active step • Returned by admin' : 'Active step • In progress';
  const active = flow.status === 'completed' ? steps.length
    : flow.status === 'approved' ? 5
    : flow.status === 'client_review' ? 4
    : flow.status === 'in_progress' && flow.sub_status === 'awaiting_admin_approval' ? 2 : 0;
  const rows: Row[] = steps.map((step, i) => {
    const tone: Tone = i < active ? 'done' : i === active ? 'active' : 'todo';
    const sub = tone === 'done' ? step.done : tone === 'active' ? (i === 0 ? drafting : step.active ?? '') : step.todo ?? '';
    return { title: step.title, sub, tone, icon: tone === 'done' ? Check : tone === 'active' ? Hourglass : step.icon };
  });
  return { rows, stage: `Stage ${Math.min(active + 1, steps.length)} of ${steps.length}` };
}

function panelFor(flow: FirFlowView): Panel | null {
  const client = flow.client?.name ?? 'the client';
  const review = flow.reviews[flow.reviews.length - 1];
  if (DRAFTING.includes(flow.status) && flow.sub_status === 'awaiting_admin_approval')
    return { icon: Hourglass, title: 'Waiting for Admin Approval', body: 'Sent to Legalitt for approval.', actionable: false };
  if (DRAFTING.includes(flow.status)) {
    if (review && review.decision !== 'approved')
      return { icon: MessageSquareWarning, title: review.role === 'client' || flow.sub_status === FIR_CLIENT_CHANGES ? 'Client Requested Changes' : 'Returned by Admin', review, actionable: true };
    return { icon: FileText, title: 'Draft in progress', body: 'No draft has been sent for review yet.', actionable: true };
  }
  if (flow.status === 'client_review') return { icon: Mail, title: c.waitingClient.title, body: c.waitingClient.body(client), note: c.waitingClient.note, actionable: false };
  if (flow.status === 'approved') return { icon: CheckCheck, title: 'Client Approved',
    body: `Submit the FIR${stationName(flow) ? ` at ${stationName(flow)}` : ''} and upload the police receipt.`, actionable: true };
  if (flow.status === 'completed') return { icon: Check, title: 'FIR Draft Completed', body: 'The client approved your draft.', actionable: true };
  if (flow.status === 'cancelled' || flow.status === 'refunded') return { icon: Info, title: flow.stage.advocate.chip, body: 'This request was cancelled. No further work is needed.', actionable: false };
  return null;
}

export default function AdvocateFirReviewScreen({ compact = false }: { compact?: boolean }) {
  const insets = useSafeAreaInsets();
  const caseId = useAdvocateCaseId();
  const f = useFirFlow(caseId);
  const act = useAction();
  const [police, setPolice] = useState(false), [allEvents, setAllEvents] = useState(false), [reminded, setReminded] = useState(false);
  const flow = f.flow;
  const allowed = !!flow && ACCESS.includes(flow.status);

  let content;
  if (!caseId) content = <StateCard title="This link is missing its request ID." actionLabel="Back to Cases" onAction={toCases} />;
  else if (!flow) content = f.error ? <StateCard title="Couldn’t load this request." error={f.error} actionLabel="Retry" onAction={f.reload} secondaryLabel="Back to Cases" onSecondary={toCases} />
    : <StateCard loading title="Loading the request…" />;
  else if (!allowed) content = <MovedOn caseId={caseId} stage={flow.stage} />;
  else {
    const { rows, stage } = timeline(flow);
    const panel = panelFor(flow);
    const showPanel = !!panel && (!compact || panel.actionable);
    const events = [...flow.events].reverse();
    const shown = allEvents ? events : events.slice(0, 8);
    const mobile = flow.client?.mobile?.trim();
    const city = placeName(flow.client?.city ?? flow.city, flow.state);
    const stationLine = stationName(flow);
    const remind = flow.remind;
    const review = panel?.review;
    const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
    content = <>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.docket} {...shrinkToFit(0.75)}>{hashRef(flow.reference)}</Text>
          <View style={styles.docketChip}><View style={styles.docketChipDot} /><Text style={styles.docketChipText} {...shrinkToFit(0.75)}>{flow.stage.advocate.chip.toUpperCase()}</Text></View>
        </View>
        {!!stationLine && <View style={styles.stationRow}><Shield size={t.stationIcon} color={colors.textPrimary} /><Text style={styles.station}>{stationLine}</Text></View>}
      </View>

      {flow.client && <View style={styles.card}>
        <Text style={styles.label} {...shrinkToFit(0.8)}>{c.client.label}</Text>
        <View style={styles.clientRow}>
          <View style={styles.initials}><Text style={styles.initialsText} {...shrinkToFit(0.8)}>{initials(flow.client.name)}</Text></View>
          <View style={styles.clientText}>
            <Text style={styles.name} {...shrinkToFit(0.75)}>{flow.client.name}</Text>
            {!!mobile && <View style={styles.phoneRow}><Phone size={t.phoneIcon} color={colors.textPrimary} /><Text style={styles.phone} {...shrinkToFit(0.75)}>{mobileLabel(mobile)}</Text></View>}
          </View>
          {!!mobile && <Pressable accessibilityRole="button" accessibilityLabel={`Call ${flow.client.name}`} onPress={() => void act.run(() => Linking.openURL(`tel:${mobile.replace(/[^\d+]/g, '')}`))} style={styles.callBtn}>
            <PhoneForwarded size={t.callGlyph} color={colors.textPrimary} />
          </Pressable>}
        </View>
        {!!city && <View style={styles.cityRow}><MapPin size={t.cityIcon} color={t.cityColour} /><Text style={styles.city}>{city}</Text></View>}
      </View>}

      {flow.draft && <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.fileIcon}><FileText size={t.fileIconGlyph} color={colors.brandDark} /></View>
          <View style={styles.fileText}>
            <View style={styles.row}>
              <Text style={styles.fileTitle} {...shrinkToFit(0.75)}>{c.draft.title}</Text>
              <View style={styles.verChip}><Text style={styles.verChipText} {...shrinkToFit(0.8)}>v{flow.draft.version}</Text></View>
            </View>
            <Text style={styles.fileSub}>Created by {flow.draft.created_by}</Text>
          </View>
        </View>
        <View style={styles.pro}>
          <View style={styles.row}><Shield size={t.proIcon} color={colors.brandDark} /><Text style={styles.proTitle} {...shrinkToFit(0.8)}>{c.draft.proforma}</Text></View>
          <View style={styles.proStats}>
            <View style={styles.row}><FileText size={t.proStatIcon} color={colors.textBody} /><Text style={styles.proStat}>{flow.draft.sections} Legal {flow.draft.sections === 1 ? 'Section' : 'Sections'}</Text></View>
            <View style={[styles.row, styles.proStatNext]}><FileText size={t.proStatIcon} color={colors.textBody} /><Text style={styles.proStat}>{flow.draft.files} {flow.draft.files === 1 ? 'File' : 'Files'} Attached</Text></View>
          </View>
        </View>
        <View style={styles.actRow}>
          <Pressable accessibilityRole="button" onPress={() => void act.run(() => viewDocument(flow.draft!.document.id))} style={({ pressed }) => [styles.act, pressed && styles.pressed]}>
            <Eye size={t.actIcon} color={colors.textPrimary} /><Text style={styles.actText} {...shrinkToFit(0.8)}>{c.draft.view}</Text>
          </Pressable>
          {/* Shares the request ID, version and status only, never a document link. */}
          <Pressable accessibilityRole="button" accessibilityLabel="Share draft status" onPress={() => void act.run(async () => { await Share.share({ message: `FIR Draft ${flow.reference} (v${flow.draft!.version}): ${flow.stage.advocate.chip}.` }); })} style={styles.actShare}>
            <Share2 size={t.actIcon} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>}
      <InlineError error={act.error} />

      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.label} {...shrinkToFit(0.8)}>{c.timeline.label}</Text><Text style={styles.tlStage} {...shrinkToFit(0.8)}>{stage}</Text></View>
        <View style={styles.tl}>{rows.map((row, i) => {
          const bg = row.tone === 'done' ? t.tlDoneBg : row.tone === 'active' ? t.tlActiveBg : t.tlTodoBg;
          const fg = row.tone === 'done' ? ink.onBrand : colors.textPrimary;
          return <View key={row.title} style={[styles.tlRow, i > 0 && styles.tlRowNext]}>
            <View style={[styles.tlDot, { backgroundColor: bg }]}><row.icon size={t.tlDotGlyph} color={fg} strokeWidth={row.tone === 'done' ? 3 : 2} /></View>
            <View style={styles.tlText}>
              <Text style={[styles.tlTitle, row.tone === 'todo' && { color: colors.textBody }]} {...shrinkToFit(0.75)}>{row.title}</Text>
              {!!row.sub && <Text style={styles.tlSub} {...shrinkToFit(0.8)}>{row.sub}</Text>}
            </View>
          </View>;
        })}</View>
      </View>

      {showPanel && panel && <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.alertIcon}><panel.icon size={t.alertIconGlyph} color={colors.brandDark} /></View>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle} {...shrinkToFit(0.75)}>{panel.title}</Text>
            {!!panel.body && <Text style={styles.alertBody}>{panel.body}</Text>}
            {review && <Text style={styles.alertBody}>{[review.version ? `Draft v${review.version}` : '', dayTime(review.created_at)].filter(Boolean).join(' • ')}</Text>}
          </View>
        </View>
        {review && (!!review.comment?.trim() || !!review.sections.length || review.attachment) && <View style={styles.note}>
          <Info size={t.noteIcon} color={colors.textPrimary} style={styles.noteIcon} />
          <View style={{ flex: 1, minWidth: 0 }}>
            {!!review.sections.length && <Text style={[styles.noteText, { fontFamily: font.appSemi }]}>{review.sections.map(firSectionLabel).join(' · ')}</Text>}
            {!!review.comment?.trim() && <Text style={styles.noteText}>{review.comment.trim()}</Text>}
            {review.attachment && <Pressable accessibilityRole="button" onPress={() => void act.run(() => viewDocument(review.attachment!.id))}>
              <Text style={[styles.noteText, { color: colors.brandDark, textDecorationLine: 'underline' }]}>View attachment: {review.attachment.filename}</Text>
            </Pressable>}
          </View>
        </View>}
        {!!panel.note && <View style={styles.note}><Info size={t.noteIcon} color={colors.textPrimary} style={styles.noteIcon} /><Text style={styles.noteText}>{panel.note}</Text></View>}

        {DRAFTING.includes(flow.status) && flow.sub_status !== 'awaiting_admin_approval' && <Pressable accessibilityRole="button" onPress={() => router.push(firRoute(caseId, 'draft'))} style={({ pressed }) => [styles.remind, pressed && styles.pressed]}>
          <FileText size={t.remindIcon} color={ink.onBrand} /><Text style={styles.remindText}>{review && review.decision !== 'approved' ? 'Edit Draft' : 'Continue Draft'}</Text>
        </Pressable>}
        {flow.status === 'client_review' && remind && <>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !remind.allowed || act.busy }} disabled={!remind.allowed || act.busy}
            onPress={() => void act.run(async () => { const view = await backend.firRemindClient(caseId); f.setFlow(view); setReminded(true); })}
            style={({ pressed }) => [styles.remind, pressed && styles.pressed, (!remind.allowed || act.busy) && { opacity: 0.55 }]}>
            <BellRing size={t.remindIcon} color={ink.onBrand} /><Text style={styles.remindText} {...shrinkToFit(0.8)}>{act.busy ? 'Sending reminder…' : c.waitingClient.remind}</Text>
          </Pressable>
          {(reminded || !remind.allowed) && <Text style={[styles.alertBody, { marginTop: 10, textAlign: 'center' }]} accessibilityLiveRegion="polite">
            {[reminded ? 'Reminder sent to the client in the app.' : remind.last_at ? `Last reminded ${dayTime(remind.last_at)}.` : '', !remind.allowed && remind.next_at ? `You can remind again ${dayTime(remind.next_at)}.` : ''].filter(Boolean).join(' ')}
          </Text>}
        </>}
        {flow.status === 'approved' && <Pressable accessibilityRole="button" onPress={() => setPolice(true)} style={({ pressed }) => [styles.remind, pressed && styles.pressed]}>
          <Send size={t.remindIcon} color={ink.onBrand} /><Text style={styles.remindText} {...shrinkToFit(0.8)}>Mark as submitted to police</Text>
        </Pressable>}
        {flow.status === 'completed' && <Pressable accessibilityRole="button" onPress={() => router.push(firRoute(caseId, 'completed'))} style={({ pressed }) => [styles.remind, pressed && styles.pressed]}>
          <Text style={styles.remindText}>View</Text>
        </Pressable>}
      </View>}

      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.label} {...shrinkToFit(0.8)}>{c.audit.label}</Text><History size={t.auditIcon} color={colors.textPrimary} style={styles.auditIcon} /></View>
        {!events.length && <Text style={[styles.auditText, { marginTop: t.auditRowGap, color: colors.textBody }]}>No activity recorded yet.</Text>}
        {shown.map((e, i) => <View key={`${e.created_at}-${i}`} style={styles.auditRow}>
          <View style={styles.auditDot} />
          <Text style={styles.auditText}>{e.label}</Text>
          <Text style={styles.auditTime} {...shrinkToFit(0.8)}>{new Date(Date.parse(e.created_at) + 330 * 60000).toISOString().slice(0, 10) === today ? formatTime(e.created_at) : formatDate(e.created_at)}</Text>
        </View>)}
        {events.length > shown.length || allEvents && events.length > 8 ? <Pressable accessibilityRole="button" onPress={() => setAllEvents(v => !v)} style={{ marginTop: t.auditRowGap }}>
          <Text style={[styles.auditText, { color: colors.brandDark }]}>{allEvents ? 'Show fewer' : `Show all (${events.length})`}</Text>
        </Pressable> : null}
      </View>

      {compact && <Pressable accessibilityRole="button" onPress={toCases}
        style={({ pressed }) => [styles.remind, { marginTop: compactTokens.continueTop, minHeight: compactTokens.continueH, borderRadius: compactTokens.continueRadius }, pressed && styles.pressed]}>
        <Text style={styles.remindText}>{c.continue}</Text>
      </Pressable>}

      {flow.status === 'approved' && <PoliceSubmissionSheet visible={police} caseId={caseId} station={stationLine || null} approvedAt={latest(flow, 'fir_client_approved')}
        onClose={() => setPolice(false)} onDone={view => { f.setFlow(view); setPolice(false); router.replace(firRoute(caseId, 'completed')); }} />}
    </>;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={toCases}><ChevronLeft size={t.backIcon} color={colors.textPrimary} /></Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>{c.title}</Text>
        <View style={styles.avatar}><UserRound size={t.avatarGlyph} color={ink.onBrand} /></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{content}</ScrollView>
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
