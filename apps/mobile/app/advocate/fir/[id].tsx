import { router } from 'expo-router';
import {
  CalendarDays, Check, ChevronLeft, Coins, Eye, FileText, Gavel, Image as ImageIcon, Mail, MapPin,
  Phone, Quote, Shield, ShieldCheck, TriangleAlert, UserRound, Wallet, X,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmModal from '../../../components/ConfirmModal';
import { shrinkToFit } from '../../../constants/textFit';
import { FIR_REQUEST as c } from '../../../data/advocateFir';
import { incidentLabel } from '../../../data/fir';
import { advFirRequest as t, colors, font, ink, status } from '../../../constants/theme';
import { backend } from '../../../lib/auth';
import { rupees, useFirFlow, viewDocument } from '../../../features/fir/flow';
import {
  clientDocuments, dayTime, docName, docType, firRoute, formatSize, incidentWhen, InlineError, intakeOf, joinDot,
  MovedOn, Sheet, SheetButton, StateCard, s as ui, toCases, useAction, useAdvocateCaseId, useFirRecord,
} from '../../../features/fir/advocate/common';

// FIR request details (design/215, flow A2), live in every data mode.
// [REMOVE] KYC Verified, the fee split and Escrow line, "All Verified" and "Signed".
// [DECIDE] The fee shows only what the advocate receives, from the price snapshot.
// Accept confirms, then opens Review Documents (A3). Reject needs a reason; the
// request returns to the admin and the advocate loses access, so it goes to Cases.

export default function AdvocateFirRequestScreen() {
  const insets = useSafeAreaInsets();
  const caseId = useAdvocateCaseId();
  const f = useFirFlow(caseId);
  const rec = useFirRecord(caseId);
  const flow = f.flow, intake = intakeOf(rec.record);
  const act = useAction(), rejectAct = useAction();
  const [confirming, setConfirming] = useState(false), [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(''), [reasonError, setReasonError] = useState('');
  const open = !!flow && flow.status === 'assigned';

  const received = flow ? [...flow.events].reverse().find(e => e.type === 'status_changed' && e.label.startsWith('Advocate assigned'))?.created_at ?? flow.paid_at : null;
  const cells = flow?.client ? [
    { label: c.client.name, value: flow.client.name },
    { label: c.client.city, value: flow.client.city ?? flow.city },
    { label: c.client.mobile, value: flow.client.mobile, icon: Phone },
    { label: c.client.email, value: flow.client.email, icon: Mail },
  ].filter(x => x.value?.trim()) : [];
  const incident = [
    { icon: TriangleAlert, label: c.incident.type, value: incidentLabel(flow?.incident_type || intake?.incident.type || null) || flow?.incident_type || intake?.incident.type },
    { icon: CalendarDays, label: c.incident.when, value: incidentWhen(intake?.incident) },
    { icon: MapPin, label: c.incident.where, value: intake?.incident.location },
  ].filter(x => x.value?.trim());
  const docs = clientDocuments(rec.record);
  const statement = intake ? [intake.incident.description, intake.incident.additional].map(v => v?.trim()).filter(Boolean) : [];

  const accept = () => { setConfirming(false); void act.run(async () => { await backend.request(`/cases/${caseId}/accept`, {}); router.replace(firRoute(caseId!, 'documents')); }); };
  const reject = () => {
    if (!reason.trim()) { setReasonError(c.rejectSheet.required); return; }
    void rejectAct.run(async () => { await backend.firReject(caseId!, reason.trim()); setRejecting(false); toCases(); });
  };

  let content;
  if (!caseId) content = <StateCard title="This link is missing its request ID." actionLabel="Back to Cases" onAction={toCases} />;
  else if (!flow) content = f.error ? <StateCard title="Couldn’t load this request." error={f.error} actionLabel="Retry" onAction={f.reload} secondaryLabel="Back to Cases" onSecondary={toCases} />
    : <StateCard loading title="Loading the request…" />;
  else if (!open) content = <MovedOn caseId={caseId} stage={flow.stage} />;
  else content = <>
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.chip}><View style={styles.chipDot} /><Text style={styles.chipText} {...shrinkToFit(0.75)}>{c.statusChip}</Text></View>
        {!!received && <Text style={styles.recv} {...shrinkToFit(0.75)}>{c.recv} {dayTime(received)}</Text>}
      </View>
      <View style={styles.idRow}><Shield size={t.idIcon} color={colors.textPrimary} /><Text style={styles.id} {...shrinkToFit(0.7)}>{c.idLabel} {flow.reference}</Text></View>
      {!!flow.police_station && <Text style={styles.station}>{c.stationLabel} {flow.police_station}</Text>}
    </View>

    {!!cells.length && <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>{c.client.title}</Text>
        <View style={styles.sectionAvatar}><UserRound size={t.sectionAvatarGlyph} color={colors.textPrimary} /></View>
      </View>
      <View style={styles.grid}>{cells.map(cell => {
        const Icon = cell.icon;
        return <View key={cell.label} style={styles.cell}>
          <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>{cell.label}</Text>
          <View style={styles.cellValueRow}>{Icon && <Icon size={t.cellIcon} color={colors.textPrimary} style={styles.cellIcon} />}<Text style={styles.cellValue} {...shrinkToFit(0.6)}>{cell.value}</Text></View>
        </View>;
      })}</View>
    </View>}

    {!rec.record ? (rec.error
      ? <StateCard title="Couldn’t load the client’s filing." error={rec.error} actionLabel="Retry" onAction={rec.reload} />
      : <StateCard loading title="Loading the client’s filing…" />) : <>
      {!!incident.length && <View style={styles.card}>
        <View style={styles.row}><Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>{c.incident.title}</Text><Gavel size={t.sectionIcon} color={colors.textPrimary} style={styles.sectionIcon} /></View>
        {incident.map(row => <View key={row.label} style={styles.incRow}>
          <row.icon size={t.rowIcon} color={colors.brandDark} style={styles.rowIcon} />
          <View style={styles.incText}><Text style={styles.rowLabel} {...shrinkToFit(0.8)}>{row.label}</Text><Text style={styles.rowValue}>{row.value}</Text></View>
        </View>)}
      </View>}

      {!!statement.length && <View style={styles.card}>
        <View style={styles.row}><Quote size={t.quoteMark} color={colors.brandDark} style={styles.quoteMark} /><Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>{c.statement.title}</Text></View>
        <View style={styles.quote}>{statement.map((para, n) => <Text key={n} style={[styles.quoteText, n > 0 && { marginTop: 10 }]}>{n === 0 ? `“${para}${statement.length === 1 ? '”' : ''}` : `${para}”`}</Text>)}</View>
      </View>}
    </>}

    <View style={styles.card}>
      <View style={styles.row}><Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>{c.fee.title}</Text><Wallet size={t.sectionIcon} color={colors.textPrimary} style={styles.sectionIcon} /></View>
      {flow.share_paise ? <View style={styles.advBox}><View style={styles.advTop}>
        <View style={styles.advText}>
          <Text style={styles.advLabel} {...shrinkToFit(0.75)}>{c.fee.advocateLabel}</Text>
          <Text style={styles.advAmount} {...shrinkToFit(0.7)}>{rupees(flow.share_paise)}</Text>
        </View>
        <View style={styles.advCoin}><Coins size={t.advCoinGlyph} color={colors.brandDark} /></View>
      </View></View> : <Text style={[styles.rowValue, { marginTop: 12, color: colors.textBody }]}>{c.fee.missing}</Text>}
    </View>

    {rec.record && <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>{c.documents.title}</Text>
        {!!docs.length && <View style={styles.docsChip}><Text style={styles.docsChipText} {...shrinkToFit(0.75)}>{c.documents.files(docs.length)}</Text></View>}
      </View>
      {!docs.length && <Text style={[styles.rowValue, { marginTop: 12, color: colors.textBody }]}>{c.documents.none}</Text>}
      {docs.map(d => {
        const Icon = d.mime_type.startsWith('image/') || d.mime_type.startsWith('video/') ? ImageIcon : FileText;
        return <View key={d.id} style={styles.docRow}>
          <View style={styles.docIconBox}><Icon size={t.docIconGlyph} color={colors.textPrimary} /></View>
          <View style={styles.docText}>
            <Text style={styles.docName}>{docName(d)}</Text>
            <Text style={styles.docMeta} {...shrinkToFit(0.8)}>{joinDot(formatSize(d.size_bytes), docType(d.mime_type))}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${docName(d)}`} hitSlop={8} onPress={() => void act.run(() => viewDocument(d.id))}><Eye size={t.docEye} color={colors.textPrimary} /></Pressable>
        </View>;
      })}
      <View style={styles.warn}><ShieldCheck size={t.warnIcon} color={colors.brandDark} style={styles.warnIcon} /><Text style={styles.warnText}>{c.documents.warn}</Text></View>
    </View>}
  </>;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={toCases}><ChevronLeft size={t.backIcon} color={colors.textPrimary} /></Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>{c.title}</Text>
        <View style={styles.avatar}><UserRound size={t.avatarGlyph} color={ink.onBrand} /></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{content}</ScrollView>

      {open && <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <InlineError error={act.error} />
        <View style={[styles.barRow, !!act.error && { marginTop: 10 }]}>
          <Pressable accessibilityRole="button" disabled={act.busy} onPress={() => { setReason(''); setReasonError(''); rejectAct.setError(''); setRejecting(true); }}
            style={({ pressed }) => [styles.btn, styles.reject, pressed && styles.pressed]}>
            <X size={t.btnIcon} color={status.onRedContainer} /><Text style={styles.rejectText} {...shrinkToFit(0.8)}>{c.reject}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={act.busy} onPress={() => setConfirming(true)} style={({ pressed }) => [styles.btn, styles.accept, pressed && styles.pressed, act.busy && { opacity: 0.6 }]}>
            <Check size={t.btnIcon} color={ink.onBrand} /><Text style={styles.acceptText} {...shrinkToFit(0.8)}>{act.busy ? 'Accepting…' : c.accept}</Text>
          </Pressable>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.capReject} {...shrinkToFit(0.75)}>{c.rejectCaption}</Text>
          <Text style={styles.capAccept} {...shrinkToFit(0.75)}>{c.acceptCaption}</Text>
        </View>
      </View>}

      <ConfirmModal visible={confirming} icon={Check} tone="neutral" title={c.acceptConfirm.title} body={c.acceptConfirm.body}
        confirmLabel={c.acceptConfirm.confirm} cancelLabel={c.acceptConfirm.cancel} onConfirm={accept} onCancel={() => setConfirming(false)} />

      <Sheet visible={rejecting} title={c.rejectSheet.title} body={c.rejectSheet.body} onClose={() => !rejectAct.busy && setRejecting(false)}>
        <Text style={ui.label}>{c.rejectSheet.label}</Text>
        <TextInput accessibilityLabel={c.rejectSheet.label} value={reason} onChangeText={v => { setReason(v); setReasonError(''); }} multiline maxLength={2000}
          placeholder={c.rejectSheet.placeholder} placeholderTextColor={colors.textMuted} style={[ui.input, { minHeight: 110, textAlignVertical: 'top' }]} />
        {!!reasonError && <Text style={[ui.error, { marginTop: 8 }]} accessibilityRole="alert">{reasonError}</Text>}
        <InlineError error={rejectAct.error} />
        <SheetButton label={rejectAct.busy ? 'Rejecting…' : c.rejectSheet.confirm} tone="danger" disabled={rejectAct.busy} onPress={reject} />
        <SheetButton label={c.rejectSheet.cancel} tone="neutral" disabled={rejectAct.busy} onPress={() => setRejecting(false)} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, minWidth: 0, marginHorizontal: 10, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  avatar: { width: t.avatar, height: t.avatar, borderRadius: t.avatar / 2, backgroundColor: t.avatarBg, alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  row: { flexDirection: 'row', alignItems: 'center' },

  chip: { minHeight: t.chipHeight, borderRadius: t.chipRadius, backgroundColor: t.chipBg, paddingHorizontal: t.chipPadX, flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  chipDot: { width: t.chipDot, height: t.chipDot, borderRadius: t.chipDot / 2, backgroundColor: t.chipColour, marginRight: t.chipDotGap },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipColour, flexShrink: 1 },
  recv: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appBody, fontSize: t.recvSize, color: t.recvColour, flexShrink: 1 },

  idRow: { marginTop: t.idGap, flexDirection: 'row', alignItems: 'center' },
  id: { marginLeft: t.idIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.idSize, color: colors.textPrimary },
  station: { marginTop: t.stationGap, marginLeft: t.stationIndent, fontFamily: font.appBody, fontSize: t.stationSize, color: t.stationColour },

  sectionTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.sectionTitleSize, color: colors.textPrimary },
  sectionIcon: { marginLeft: 'auto' },
  sectionAvatar: { marginLeft: 'auto', width: t.sectionAvatar, height: t.sectionAvatar, borderRadius: t.sectionAvatar / 2, backgroundColor: t.sectionAvatarBg, alignItems: 'center', justifyContent: 'center' },

  grid: { marginTop: t.gridGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.gridGapY },
  cell: { width: '48%', flexGrow: 1, borderRadius: t.cellRadius, backgroundColor: t.cellBg, padding: t.cellPad },
  cellLabel: { fontFamily: font.appSemi, fontSize: t.cellLabelSize, letterSpacing: t.cellLabelSpacing, color: t.cellLabelColour },
  cellValueRow: { marginTop: t.cellValueGap, flexDirection: 'row', alignItems: 'center' },
  /** flexShrink 0: the icon keeps its size when a long address wraps beside it. */
  cellIcon: { marginRight: t.cellIconGap, flexShrink: 0 },
  cellValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },

  incRow: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'flex-start' },
  rowIcon: { marginTop: 2 },
  incText: { flex: 1, minWidth: 0, marginLeft: t.rowIconGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.rowLabelColour },
  rowValue: { marginTop: t.rowValueGap, fontFamily: font.appBody, fontSize: t.rowValueSize, lineHeight: t.rowValueLineHeight, color: colors.textPrimary },

  quoteMark: { marginRight: t.quoteMarkGap },
  quote: { marginTop: t.quoteGap, borderRadius: t.quoteRadius, backgroundColor: t.quoteBg, padding: t.quotePad },
  quoteText: { fontFamily: font.appBody, fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: colors.textPrimary },

  advBox: { marginTop: t.advBoxGap, borderRadius: t.advBoxRadius, backgroundColor: t.advBoxBg, padding: t.advBoxPad },
  advTop: { flexDirection: 'row', alignItems: 'center' },
  advText: { flex: 1, minWidth: 0, marginRight: 10 },
  advLabel: { fontFamily: font.appSemi, fontSize: t.advLabelSize, letterSpacing: t.advLabelSpacing, color: t.advLabelColour },
  advAmount: { marginTop: t.advAmountGap, fontFamily: font.appHeading, fontSize: t.advAmountSize, color: colors.textPrimary },
  advCoin: { width: t.advCoin, height: t.advCoin, borderRadius: t.advCoin / 2, backgroundColor: t.advCoinBg, alignItems: 'center', justifyContent: 'center' },

  docsChip: { marginLeft: t.docsChipGap, minHeight: t.docsChipHeight, borderRadius: t.docsChipRadius, backgroundColor: t.docsChipBg, paddingHorizontal: t.docsChipPadX, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  docsChipText: { fontFamily: font.appSemi, fontSize: t.docsChipSize, color: t.docsChipColour },
  docRow: { marginTop: t.docRowGapY, borderRadius: t.docRowRadius, backgroundColor: t.docRowBg, padding: t.docRowPad, flexDirection: 'row', alignItems: 'center' },
  docIconBox: { width: t.docIconBox, height: t.docIconBox, borderRadius: t.docIconRadius, backgroundColor: t.docIconBg, alignItems: 'center', justifyContent: 'center' },
  docText: { flex: 1, minWidth: 0, marginHorizontal: t.docIconGap },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: t.docMetaColour },

  warn: { marginTop: t.warnGap, borderRadius: t.warnRadius, backgroundColor: t.warnBg, padding: t.warnPad, flexDirection: 'row', alignItems: 'flex-start' },
  warnIcon: { marginTop: 1 },
  warnText: { flex: 1, minWidth: 0, marginLeft: t.warnIconGap, fontFamily: font.appBody, fontSize: t.warnSize, lineHeight: t.warnLineHeight, color: t.warnColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: t.barGapX },
  btn: { minHeight: t.btnHeight, borderRadius: t.btnRadius, paddingHorizontal: t.btnPadX, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  /** The shared tinted-red container. See constants/theme.ts. */
  reject: { backgroundColor: status.redContainer },
  rejectText: { marginLeft: t.btnIconGap, fontFamily: font.appHeading, fontSize: t.btnSize, color: status.onRedContainer, flexShrink: 1 },
  accept: { flex: 1, backgroundColor: t.acceptBg },
  acceptText: { marginLeft: t.btnIconGap, fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand, flexShrink: 1 },
  capReject: { marginTop: t.capGap, fontFamily: font.appSemi, fontSize: t.capSize, color: t.capRejectColour, flexShrink: 1 },
  capAccept: { marginTop: t.capGap, marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.capSize, color: t.capAcceptColour, flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
