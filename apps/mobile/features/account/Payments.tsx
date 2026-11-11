import {router, useLocalSearchParams} from 'expo-router';
import {ChevronRight, CreditCard, Download, FileText, Scale, Wallet} from 'lucide-react-native';
import {useMemo, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {formatPaise, type AccountPayment} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {colors} from '../../constants/theme';
import {Button, Card, Empty, ErrorState, Filters, IconChip, Loading, Note, Pill, Row, Screen, SectionLabel, date, dateTime, openBase64Pdf, s, useLoad} from './ui';

// D-18 Payments (profile-9) and Payment Details (profile-10); D-19 receipt.
// D-01: no escrow, bank-settlement or "verified VPA" claims; simulated payments say so.

const STATUS: Record<string, {label: string; tone: 'good' | 'warn' | 'bad' | 'neutral'}> = {
  captured: {label: 'Paid', tone: 'good'}, pending: {label: 'Pending', tone: 'warn'}, created: {label: 'Not completed', tone: 'neutral'},
  failed: {label: 'Failed', tone: 'bad'}, refunded: {label: 'Refunded', tone: 'neutral'},
};
const purpose = (p: string) => ({service_fee: 'Service fee', court_fee: 'Court fee', process_fee: 'Process fee', courier: 'Courier', follow_up: 'Follow-up'} as Record<string, string>)[p] ?? 'Payment';
type Filter = 'all' | 'paid' | 'other';

export function PaymentsLive() {
  const q = useLoad(() => backend.accountPayments());
  const [filter, setFilter] = useState<Filter>('all');
  const items = q.data?.items ?? [];
  const shown = useMemo(() => items.filter(p => filter === 'all' || (filter === 'paid' ? p.status === 'captured' : p.status !== 'captured')), [items, filter]);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = items.filter(p => p.status === 'captured' && (p.captured_at ?? p.created_at).slice(0, 7) === month).reduce((n, p) => n + BigInt(p.total_paise), 0n);
  return <Screen title="Payments" subtitle="Your payment history" fallback="/(tabs)/profile">
    {q.loading && !q.data ? <Loading what="your payments"/> : q.error && !q.data ? <ErrorState what="your payments" message={q.error} retry={q.reload}/> : !items.length ?
      <Empty icon={Wallet} title="No payments yet" body="When you pay for a service, the payment and its receipt appear here." action={{title: 'Browse services', onPress: () => router.push('/(tabs)/services')}}/> : <>
      <Card>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}><IconChip icon={CreditCard}/><Text style={s.section}>ACCOUNT OVERVIEW</Text></View>
        <Text style={s.body}>Total paid</Text>
        <Text style={{...s.heading, fontSize: 34}}>{formatPaise(q.data!.totals.captured_paise)}</Text>
        <Text style={s.body}>{q.data!.totals.captured_count} completed {q.data!.totals.captured_count === 1 ? 'payment' : 'payments'}{thisMonth ? ` · ${formatPaise(thisMonth.toString())} this month` : ''}</Text>
        {items.some(p => p.simulated) && <Text style={s.body}>Payments in this demo are simulated — no money moved.</Text>}
      </Card>
      <Card style={{backgroundColor: '#F3EEE8'}}>
        <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}><IconChip icon={FileText}/><View style={{flex: 1}}><Text style={s.strong}>Need GST invoices?</Text>
          <Text style={s.body}>Tax invoices will be available once Legalitt’s GST details are added. Until then, download a payment receipt from any payment below.</Text></View></View>
      </Card>
      <Filters<Filter> value={filter} onChange={setFilter} options={[{id: 'all', label: 'All', count: items.length}, {id: 'paid', label: 'Paid', count: items.filter(p => p.status === 'captured').length}, {id: 'other', label: 'Other', count: items.filter(p => p.status !== 'captured').length}]}/>
      <SectionLabel right={<Text style={{...s.body, color: colors.brandDark}}>{shown.length} {shown.length === 1 ? 'transaction' : 'transactions'}</Text>}>RECENT PAYMENTS</SectionLabel>
      {q.error && <Text style={s.error} accessibilityRole="alert">Couldn’t refresh: {q.error}</Text>}
      {!shown.length ? <Text style={s.body}>No payments match this filter.</Text> : shown.map(p => <PaymentCard key={p.id} p={p}/>)}
    </>}
  </Screen>;
}

function PaymentCard({p}: {p: AccountPayment}) {
  const st = STATUS[p.status] ?? STATUS.created;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${p.case.service_name} ${formatPaise(p.total_paise)}`} onPress={() => router.push(`/payments/${p.id}` as never)}>
    <Card><View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}><IconChip icon={Scale}/>
      <View style={{flex: 1, gap: 3}}><Text style={s.strong}>{p.case.service_name}</Text><Text style={s.body}>{purpose(p.purpose)} · {p.case.reference}</Text><Text style={s.body}>{date(p.captured_at ?? p.created_at)}</Text></View>
      <View style={{alignItems: 'flex-end', gap: 6}}><Text style={s.strong}>{formatPaise(p.total_paise)}</Text><Pill label={st.label} tone={st.tone}/></View>
      <ChevronRight size={18} color={colors.textMuted}/></View></Card>
  </Pressable>;
}

export function PaymentDetailLive() {
  const {id} = useLocalSearchParams<{id: string}>();
  const q = useLoad(() => backend.accountPayment(String(id)), [id]);
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const p = q.data, b = p?.breakdown;
  const download = async () => { if (!p) return; setBusy(true); setErr(''); try { await openBase64Pdf(await backend.accountReceipt(p.id)); } catch (e) { setErr(e instanceof Error ? e.message : 'Receipt could not be generated.'); } finally { setBusy(false); } };
  return <Screen title="Payment Details" subtitle={p ? `REQUEST ${p.case.reference}` : undefined} fallback="/payments"
    footer={p && p.status === 'captured' ? <>{!!err && <Text style={s.error} accessibilityRole="alert">{err} Try again.</Text>}<Button title={busy ? 'Preparing receipt…' : 'Download Receipt'} icon={Download} disabled={busy} onPress={download}/></> : undefined}>
    {q.loading && !p ? <Loading what="payment details"/> : q.error && !p ? <ErrorState what="this payment" message={q.error} retry={q.reload}/> : p && <>
      <Card style={{alignItems: 'center'}}><Pill label={p.status === 'captured' ? 'Payment received' : (STATUS[p.status] ?? STATUS.created).label} tone={(STATUS[p.status] ?? STATUS.created).tone}/>
        <Text style={{...s.heading, fontSize: 36}}>{formatPaise(p.total_paise)}</Text>
        {p.simulated && <Text style={s.body}>Demo payment (simulated) — no money moved.</Text>}</Card>
      <Card><SectionLabel>PAYMENT SUMMARY</SectionLabel>
        <Text style={s.strong}>{p.case.service_name}</Text>
        {b ? <>
          <Row label="Service fee" value={formatPaise(b.service_fee_paise)}/>
          {BigInt(b.platform_fee_paise) > 0n && <Row label="Platform fee" value={formatPaise(b.platform_fee_paise)}/>}
          {BigInt(b.delivery_fee_paise) > 0n && <Row label="Delivery fee" value={formatPaise(b.delivery_fee_paise)}/>}
          <Row label="GST (18%)" value={formatPaise(b.gst_paise)}/>
          {BigInt(b.page_overage_paise) > 0n && <Row label={`Additional pages (${b.charged_pages}, no GST)`} value={formatPaise(b.page_overage_paise)}/>}
        </> : <><Row label="Amount" value={formatPaise(p.base_amount_paise)}/>{BigInt(p.gst_paise) > 0n && <Row label="GST" value={formatPaise(p.gst_paise)}/>}</>}
        <View style={s.divider}/><Row label="Total paid" value={formatPaise(p.total_paise)}/></Card>
      <Card><SectionLabel>PAYMENT INFORMATION</SectionLabel>
        <Row label="Payment date" value={dateTime(p.captured_at ?? p.created_at)}/>
        <Row label="Purpose" value={purpose(p.purpose)}/>
        <Row label="Transaction ID" value={p.reference} chip/></Card>
      <Card><SectionLabel>RELATED CASE</SectionLabel>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/requests/${p.case.id}` as never)} style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View style={{flex: 1}}><Text style={s.strong}>{p.case.reference}</Text><Text style={s.body}>{p.case.service_name}</Text></View><ChevronRight size={18} color={colors.textMuted}/></Pressable></Card>
      {p.status !== 'captured' && <Note>A receipt is available once a payment is completed.</Note>}
    </>}
  </Screen>;
}
