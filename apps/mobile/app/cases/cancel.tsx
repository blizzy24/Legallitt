import {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {router, useLocalSearchParams, type Href} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArrowLeft, Check, Info, ShieldAlert, XCircle} from 'lucide-react-native';
import {CANCELLATION_REASONS, SERVICE_NAMES, formatPaise, type ApiCase, type CancellationReasonCode, type CaseCancellation} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import ConfirmModal from '../../components/ConfirmModal';
import {colors, font} from '../../constants/theme';
import {caseDestination} from '../../features/cases/case-list';
import {DATA_SOURCE} from '../../lib/data-source';

// Cancel Request (design/349), applied to every service per D-12. The API decides
// which path applies: unpaid, self-serve full refund, admin-reviewed request, or
// not cancellable. Refunds are simulated (D-13) and labelled as such.

const statusLabel = (s: string) => s.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase());

export default function CancelRequestScreen() {
  const {caseId} = useLocalSearchParams<{caseId?: string}>();
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<CaseCancellation | null>(null);
  const [record, setRecord] = useState<ApiCase | null>(null);
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
  const [reason, setReason] = useState<CancellationReasonCode | null>(null), [note, setNote] = useState('');
  const [understood, setUnderstood] = useState(false), [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');

  const load = useCallback(async () => {
    if (DATA_SOURCE !== 'api') {setLoading(false); setLoadError('Cancellation needs the live app. It is not available in the design preview.'); return;}
    if (!caseId) {setLoading(false); setLoadError('No request was selected. Open it from My Requests.'); return;}
    setLoading(true); setLoadError('');
    try {
      const [c, r] = await Promise.all([backend.caseCancellation(caseId), backend.case(caseId)]);
      setView(c); setRecord(r);
    } catch (e) {setLoadError(e instanceof Error ? e.message : 'Could not load this request.');}
    finally {setLoading(false);}
  }, [caseId]);
  useEffect(() => {void load();}, [load]);

  const back = () => router.canGoBack() ? router.back() : router.replace('/cases' as Href);
  const submit = async () => {
    if (!caseId || busy) return;
    setConfirming(false); setBusy(true); setError('');
    try {setView(await backend.cancelCase(caseId, {reason, note: note.trim() || undefined, confirm: true}));}
    catch (e) {setError(e instanceof Error ? e.message : 'Cancellation failed. Retry.');}
    finally {setBusy(false);}
  };

  const service = view ? SERVICE_NAMES[view.service_code as keyof typeof SERVICE_NAMES] ?? 'Request' : 'Request';
  const advocate = (record as unknown as {advocate?: {full_name?: string} | null} | null)?.advocate?.full_name?.trim();
  const pending = view?.request?.status === 'pending';
  const canAct = !!view && !pending && ['unpaid', 'self_serve', 'request'].includes(view.mode);
  const open = record ? caseDestination(record) : null;

  return <View style={[s.screen, {paddingTop: insets.top}]}>
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={s.back}><ArrowLeft size={22} color={colors.textPrimary}/></Pressable>
      <View><Text style={s.title}>Cancel Request</Text>{view && <Text style={s.subtitle}>{service}</Text>}</View>
    </View>
    <ScrollView contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 32}]}>
      {loading ? <Text role="status" style={s.body}>Loading your request…</Text>
      : loadError ? <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{loadError}</Text>
          <Button title="Retry" onPress={load}/><Button title="My Requests" ghost onPress={() => router.replace('/cases' as Href)}/></View>
      : view && <>
        {view.mode === 'ended' || view.mode === 'closed' || pending || view.request?.status === 'declined' && !canAct ? null :
          <View style={s.banner}><ShieldAlert size={26} color={colors.brandDark}/><View style={{flex: 1, gap: 4}}>
            <Text style={s.bannerTitle}>Cancel This Request?</Text>
            <Text style={s.body}>Are you sure you want to cancel your {service} request?</Text>
            <Text style={s.muted}>Your current request and advocate process will stop if you cancel.</Text></View></View>}

        <View style={s.card}>
          <View style={s.row}><Text style={s.cardTitle}>Your Request</Text><Text style={s.chip}>{view.reference}</Text></View>
          <Cell label="Service" value={service}/>
          {record?.tier ? <Cell label="Service speed" value={statusLabel(record.tier)}/> : null}
          <Cell label="Current Status" value={statusLabel(view.status)}/>
        </View>

        {advocate && view.mode !== 'ended' && <View style={s.card}>
          <Text style={s.cardTitle}>Current Advocate</Text><Text style={s.body}>Adv {advocate}</Text>
          <Text style={s.muted}>Will be released from this request upon cancellation.</Text></View>}

        {view.refunds.length > 0 && <View style={s.card}>
          <Text style={s.cardTitle}>Refund</Text>
          {view.refunds.map(r => <Cell key={r.id} label={new Date(r.created_at).toLocaleDateString('en-IN')} value={formatPaise(r.amount_paise)}/>)}
          <Text style={s.muted}>Demo payment: this refund is recorded but no real money moved.</Text></View>}

        {view.request && view.request.mode === 'admin_review' && <View style={s.card}>
          <Text style={s.cardTitle}>{pending ? 'Cancellation requested' : view.request.status === 'declined' ? 'Cancellation declined' : 'Cancellation approved'}</Text>
          <Text style={s.body}>{pending ? 'Your request is with Legalitt. They will decide the refund and tell you why. Your advocate may continue until a decision is made.'
            : view.request.status === 'approved' ? `Refund: ${formatPaise(view.request.refund_amount_paise ?? '0')}` : 'Your request continues as before.'}</Text>
          {view.request.decision_reason && <Text style={s.body}>Reason from Legalitt: {view.request.decision_reason}</Text>}
          <Text style={s.muted}>Requested {new Date(view.request.requested_at).toLocaleString('en-IN')}</Text></View>}

        {view.mode === 'ended' && <View style={s.card}><XCircle size={24} color={colors.textBody}/><Text style={s.cardTitle}>This request is cancelled</Text>
          <Text style={s.body}>{view.status === 'refunded' ? 'The full amount paid has been refunded.' : view.refunds.length ? 'A partial refund was recorded.' : 'No refund was due.'}</Text>
          <Text style={s.muted}>You can start a new request at any time from Services.</Text></View>}

        {view.mode === 'closed' && <View style={s.card}><Info size={22} color={colors.textBody}/><Text style={s.body}>{view.message}</Text>
          <Button title="Contact Support" onPress={() => router.push('/support' as Href)}/></View>}

        {canAct && <>
          <View style={s.card}><Text style={s.cardTitle}>Why Are You Cancelling?</Text>
            <Text style={s.muted}>You can choose a reason. This helps Legalitt improve the service. (Optional)</Text>
            {CANCELLATION_REASONS.map(r => <Pressable key={r.code} accessibilityRole="radio" accessibilityState={{checked: reason === r.code}}
              onPress={() => setReason(reason === r.code ? null : r.code)} style={s.option}>
              <Text style={s.body}>{r.label}</Text><View style={[s.radio, reason === r.code && s.radioOn]}/></Pressable>)}
          </View>
          <View style={s.card}><Text style={s.cardTitle}>Tell Us More (Optional)</Text>
            <TextInput accessibilityLabel="Tell us why you want to cancel" placeholder="Tell us why you want to cancel." value={note} onChangeText={setNote}
              multiline maxLength={1000} style={s.input}/>
            <Text style={s.muted}>Please do not share sensitive personal information, passwords, or OTPs.</Text></View>
          <View style={s.cardMuted}><Text style={s.cardTitle}>Before You Cancel</Text>
            <Text style={s.body}>• {view.message}</Text>
            {advocate ? <Text style={s.body}>• The assigned advocate will no longer be part of this request.</Text> : null}
            <Text style={s.body}>• You may need to create a new request later if you need this service again.</Text>
            {view.mode !== 'unpaid' && <Text style={s.muted}>Payments in this demo are simulated; a refund is recorded, but no real money moves.</Text>}</View>
          <Pressable accessibilityRole="checkbox" accessibilityState={{checked: understood}} onPress={() => setUnderstood(!understood)} style={[s.card, s.check]}>
            <View style={[s.box, understood && s.boxOn]}>{understood && <Check size={14} color="#fff"/>}</View>
            <View style={{flex: 1}}><Text style={s.cardTitle}>{view.mode === 'request' ? 'I understand this sends a cancellation request.' : 'I understand that this will cancel my request.'}</Text>
              <Text style={s.danger}>This action cannot be undone once confirmed.</Text></View></Pressable>
          {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
          {!understood && <Text style={s.muted}>Tick the confirmation above to continue.</Text>}
          <Button title={busy ? 'Working…' : view.mode === 'request' ? 'Request Cancellation' : 'Cancel Request'} disabled={!understood || busy} onPress={() => setConfirming(true)}/>
          <Button title="Keep My Request" ghost onPress={back}/>
        </>}
        {!canAct && open && <Button title="Back to request" ghost onPress={() => router.push(open as Href)}/>}
      </>}
    </ScrollView>
    <ConfirmModal visible={confirming} icon={ShieldAlert} title={view?.mode === 'request' ? 'Send cancellation request?' : 'Cancel this request?'}
      body={view?.mode === 'request' ? 'Legalitt will review it and decide the refund. You cannot withdraw the request once sent.'
        : view?.mode === 'self_serve' ? `Your request stops now and ${formatPaise(view.refundable_paise)} is refunded. This cannot be undone.`
        : 'Your request will be closed. This cannot be undone.'}
      confirmLabel={view?.mode === 'request' ? 'Send Request' : 'Cancel Request'} cancelLabel="Keep My Request"
      onConfirm={() => void submit()} onCancel={() => setConfirming(false)}/>
  </View>;
}

function Cell({label, value}: {label: string; value: string}) {
  return <View style={s.cell}><Text style={s.muted}>{label}</Text><Text style={s.value}>{value}</Text></View>;
}
function Button({title, onPress, disabled = false, ghost = false}: {title: string; onPress(): void; disabled?: boolean; ghost?: boolean}) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress}
    style={[s.button, ghost && s.ghost, disabled && {opacity: 0.45}]}><Text style={[s.buttonText, ghost && {color: colors.textPrimary}]}>{title}</Text></Pressable>;
}

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.appBg},
  header: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FCF8F5'},
  back: {padding: 6},
  title: {fontFamily: font.appHeading, fontSize: 20, color: colors.textPrimary},
  subtitle: {fontFamily: font.appBody, fontSize: 13, color: colors.textBody},
  content: {padding: 16, gap: 14},
  banner: {flexDirection: 'row', gap: 14, backgroundColor: '#FBE9DD', borderRadius: 18, padding: 18},
  bannerTitle: {fontFamily: font.appHeading, fontSize: 18, color: colors.textPrimary},
  card: {backgroundColor: colors.card, borderRadius: 18, padding: 18, gap: 10},
  cardMuted: {backgroundColor: '#F4F1EE', borderRadius: 18, padding: 18, gap: 8},
  cardTitle: {fontFamily: font.appSemi, fontSize: 16, color: colors.textPrimary},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  chip: {fontFamily: font.appSemi, fontSize: 12, color: colors.textPrimary, backgroundColor: '#F4F1EE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12},
  cell: {backgroundColor: '#F7F4F1', borderRadius: 12, padding: 12, gap: 3},
  value: {fontFamily: font.appSemi, fontSize: 15, color: colors.textPrimary},
  body: {fontFamily: font.appBody, fontSize: 14, lineHeight: 21, color: colors.textBody},
  muted: {fontFamily: font.appBody, fontSize: 12, lineHeight: 18, color: colors.textMuted},
  option: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7F4F1', borderRadius: 12, padding: 14},
  radio: {width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#8A8A8A'},
  radioOn: {borderWidth: 6, borderColor: colors.brandDark},
  input: {backgroundColor: '#F7F4F1', borderRadius: 12, padding: 12, minHeight: 90, textAlignVertical: 'top', fontFamily: font.appBody, fontSize: 14, color: colors.textPrimary},
  check: {flexDirection: 'row', gap: 12, alignItems: 'flex-start'},
  box: {width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: '#BDB5AC', alignItems: 'center', justifyContent: 'center'},
  boxOn: {backgroundColor: colors.brandDark, borderColor: colors.brandDark},
  danger: {fontFamily: font.appBody, fontSize: 13, color: '#B42318'},
  error: {fontFamily: font.appBody, fontSize: 14, color: '#9C2929'},
  button: {backgroundColor: colors.brand, borderRadius: 26, paddingVertical: 15, alignItems: 'center'},
  ghost: {backgroundColor: colors.card},
  buttonText: {fontFamily: font.appSemi, fontSize: 16, color: '#fff'},
});
