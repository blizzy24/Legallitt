import {router, useLocalSearchParams, type Href} from 'expo-router';
import {Banknote, CircleCheck, Clock, Landmark, Wallet as WalletIcon} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {PAYOUT_COPY, SERVICE_NAMES, formatPaise, type Wallet, type WalletPeriod} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Body, Button, Card, Empty, ErrorState, Field, Loading, Note, Pill, Row, Screen, SectionLabel, errorText, ink, s, useLoad} from '../account/ui';

// D-36/D-37, designs 356–361 and 256–260, all from real data. Copy follows D-01:
// no escrow, no automatic release, no verified bank account.
const periods: {code: WalletPeriod; label: string}[] = [{code: 'month', label: 'This Month'}, {code: 'last_month', label: 'Last Month'}, {code: 'year', label: 'This Year'}];
const day = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'}) : '';
const go = (href: string) => router.push(href as Href);

export function WalletScreen() {
  const [period, setPeriod] = useState<WalletPeriod>('month');
  const w = useLoad(() => backend.wallet(period), [period]);
  const data = w.data;
  return <Screen title="Wallet & Earnings" fallback={'/(advocate)/dashboard' as Href}>
    <View style={{flexDirection: 'row', gap: 8, marginBottom: 14}}>{periods.map(p => <Pressable key={p.code} accessibilityRole="tab" accessibilityState={{selected: period === p.code}} onPress={() => setPeriod(p.code)}
      style={{flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: period === p.code ? ink.brown : ink.chip}}>
      <Text style={{color: period === p.code ? '#fff' : ink.title, fontWeight: '600', fontSize: 13}}>{p.label}</Text></Pressable>)}</View>
    {w.loading && !data ? <Loading label="Loading your earnings…"/> : w.error && !data ? <ErrorState message={`Couldn't load your wallet. ${w.error}`} retry={w.reload}/> : data && <>
      <Card style={{backgroundColor: ink.brown, borderColor: ink.brown}}>
        <Text style={{color: '#F4EEE6', fontSize: 13}}>Ready to withdraw</Text>
        <Text style={{color: '#fff', fontSize: 30, fontWeight: '700', marginVertical: 6}}>{formatPaise(data.ready_paise)}</Text>
        <Text style={{color: '#F4EEE6', fontSize: 12}}>Earnings on completed cases that haven't been paid out yet.</Text>
        <View style={{marginTop: 12}}><Button title="Withdraw" variant="secondary" icon={Banknote} disabled={BigInt(data.ready_paise) < BigInt(data.minimum_paise)} onPress={() => go('/advocate/wallet/withdraw')}/></View>
        {BigInt(data.ready_paise) < BigInt(data.minimum_paise) && <Text style={{color: '#F4EEE6', fontSize: 12, marginTop: 6}}>You can withdraw once at least {formatPaise(data.minimum_paise)} is ready.</Text>}
      </Card>
      <Card>
        <Row title="Earned in this period" right={<Text style={s.rowTitle}>{formatPaise(data.period_earned_paise)}</Text>}/>
        {BigInt(data.requested_paise) > 0n && <Row title="Withdrawal requested" subtitle="Waiting for Legalitt to pay" right={<Text style={s.rowTitle}>{formatPaise(data.requested_paise)}</Text>}/>}
        <Row title="Paid to your bank (all time)" right={<Text style={s.rowTitle}>{formatPaise(data.paid_paise)}</Text>}/>
      </Card>
      <SectionLabel meta="Bank account">Payout account</SectionLabel>
      {data.bank ? <Card><Row icon={Landmark} title={`${data.bank.bank_name} ••••${data.bank.account_last4}`} subtitle={data.bank.holder_name} badge="Unverified" onPress={() => go('/advocate/wallet/bank')}/></Card>
        : <Card><Row icon={Landmark} title="Add your bank account" subtitle="Needed before Legalitt can pay you" onPress={() => go('/advocate/wallet/bank')}/></Card>}
      <SectionLabel>Withdrawals</SectionLabel>
      {data.requests.length ? <Card>{data.requests.map(r => <Row key={r.id} icon={r.status === 'paid' ? CircleCheck : Clock} title={formatPaise(r.amount_paise)}
        subtitle={r.status === 'paid' ? `Paid ${day(r.paid_on ?? r.paid_at)} · UTR ${r.utr}` : `Requested ${day(r.requested_at)} · waiting for Legalitt`}
        badge={r.status === 'paid' ? 'Paid' : 'Requested'} onPress={() => go(`/advocate/wallet/utr?id=${r.id}`)}/>)}</Card>
        : <Body muted>No withdrawals yet. When you withdraw, Legalitt pays your bank account and records the transfer reference here.</Body>}
      <SectionLabel meta={periods.find(p => p.code === period)?.label}>Earnings by case</SectionLabel>
      {data.entries.length ? data.entries.map(e => <Card key={e.case_id + e.source}>
        <Text style={s.rowTitle}>{SERVICE_NAMES[e.service_code as keyof typeof SERVICE_NAMES] ?? e.service_code} · {e.reference}</Text>
        {!!e.completed_at && <Body muted>{e.source === 'completed' ? 'Completed' : 'Cancelled — share set by Legalitt'} {day(e.completed_at)}</Body>}
        {e.source === 'completed' && <>
          <Row title="Client paid" right={<Text style={s.body}>{formatPaise(e.client_paid_paise)}</Text>}/>
          <Row title="Platform fee (25% of base)" right={<Text style={s.body}>{formatPaise(e.platform_fee_paise)}</Text>}/>
          <Row title="GST collected" right={<Text style={s.body}>{formatPaise(e.gst_paise)}</Text>}/>
        </>}
        <Row title="Your share" right={<Text style={s.rowTitle}>{formatPaise(e.share_paise)}</Text>}/>
      </Card>) : <Empty icon={WalletIcon} title="No earnings in this period" body="Your share of each completed case appears here once the case is complete."/>}
      <Note>{PAYOUT_COPY} Your share is your fee for the case: the base price set for the service plus any delivery reimbursement. The platform fee and GST are charged to the client on top of it.</Note>
    </>}
  </Screen>;
}

export function WithdrawScreen() {
  const w = useLoad(() => backend.wallet('all'), []);
  const [amount, setAmount] = useState(''), [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const data = w.data, paise = /^\d+(\.\d{1,2})?$/.test(amount) ? BigInt(Math.round(Number(amount) * 100)) : null;
  const tooLow = !!data && paise !== null && paise < BigInt(data.minimum_paise), tooHigh = !!data && paise !== null && paise > BigInt(data.ready_paise);
  const submit = async () => {
    if (!paise) return; setBusy(true); setError('');
    try { const r = await backend.requestPayout(paise.toString()); router.replace(`/advocate/wallet/utr?id=${r.id}` as Href); }
    catch (e) { setError(errorText(e, 'The withdrawal could not be requested. Try again.')); setConfirm(false); }
    finally { setBusy(false); }
  };
  return <Screen title="Withdraw Money" fallback={'/(advocate)/earnings' as Href}>
    {w.loading && !data ? <Loading label="Loading your balance…"/> : w.error && !data ? <ErrorState message={`Couldn't load your balance. ${w.error}`} retry={w.reload}/> : data && <>
      <Card><Text style={s.rowSub}>Ready to withdraw</Text><Text style={{fontSize: 26, fontWeight: '700', color: ink.title}}>{formatPaise(data.ready_paise)}</Text></Card>
      {!data.bank ? <Card><Body>Add your bank account first so Legalitt knows where to pay you.</Body><Button title="Add bank account" onPress={() => router.push('/advocate/wallet/bank' as Href)}/></Card> : <>
        <Card><Row icon={Landmark} title={`${data.bank.bank_name} ••••${data.bank.account_last4}`} subtitle={data.bank.holder_name} badge="Unverified" onPress={() => router.push('/advocate/wallet/bank' as Href)}/></Card>
        <Field label="Amount (₹)" value={amount} onChange={v => {setAmount(v.replace(/[^\d.]/g, '')); setConfirm(false);}} placeholder="Minimum ₹1,000"
          error={tooLow ? `The minimum withdrawal is ${formatPaise(data.minimum_paise)}.` : tooHigh ? `You can withdraw up to ${formatPaise(data.ready_paise)}.` : undefined}/>
        <Button title="Use full amount" variant="secondary" onPress={() => setAmount((Number(BigInt(data.ready_paise)) / 100).toFixed(2))}/>
        {error && <ErrorState message={error}/>}
        {!confirm ? <Button title="Continue" disabled={!paise || tooLow || tooHigh || busy} onPress={() => setConfirm(true)}/> : <Card>
          <Body>Request {paise ? formatPaise(paise.toString()) : ''} to {data.bank.bank_name} ••••{data.bank.account_last4}? Legalitt pays it to your bank account outside the app and records the UTR. A request can't be withdrawn once sent.</Body>
          <Button title="Back" variant="secondary" onPress={() => setConfirm(false)} disabled={busy}/>
          <Button title={busy ? 'Requesting…' : 'Confirm withdrawal'} disabled={busy} onPress={submit}/>
        </Card>}
        <Note>{PAYOUT_COPY}</Note>
      </>}
    </>}
  </Screen>;
}

export function PayoutDetailScreen() {
  const {id} = useLocalSearchParams<{id?: string}>();
  const r = useLoad(() => id ? backend.payoutRequest(id) : Promise.reject(new Error('No withdrawal selected.')), [id]);
  const p = r.data;
  return <Screen title="Transfer Details" fallback={'/(advocate)/earnings' as Href}>
    {r.loading && !p ? <Loading label="Loading transfer…"/> : r.error && !p ? <ErrorState message={`Couldn't load this withdrawal. ${r.error}`} retry={id ? r.reload : undefined}/> : p && <>
      <Card style={{alignItems: 'center'}}>
        {p.status === 'paid' ? <CircleCheck size={40} color={ink.green}/> : <Clock size={40} color={ink.brown}/>}
        <Text style={{fontSize: 26, fontWeight: '700', color: ink.title, marginTop: 8}}>{formatPaise(p.amount_paise)}</Text>
        <Pill tone={p.status === 'paid' ? 'green' : 'neutral'}>{p.status === 'paid' ? 'Paid' : 'Requested'}</Pill>
      </Card>
      <Card>
        <Row title="Requested" right={<Text style={s.body}>{day(p.requested_at)}</Text>}/>
        <Row title="To" right={<Text style={s.body}>{p.bank.bank_name} ••••{p.bank.account_last4}</Text>}/>
        {p.status === 'paid' && <Row title="Paid on" right={<Text style={s.body}>{day(p.paid_on ?? p.paid_at)}</Text>}/>}
        {p.utr && <Row title="UTR" right={<Text selectable style={s.rowTitle}>{p.utr}</Text>}/>}
      </Card>
      <Note>{p.status === 'paid' ? 'Legalitt recorded this transfer with the UTR above. Use it with your bank if you need to trace the payment.' : PAYOUT_COPY}</Note>
      <Button title="Back to Wallet" onPress={() => router.replace('/(advocate)/earnings' as Href)}/>
    </>}
  </Screen>;
}

export function BankAccountScreen() {
  const b = useLoad(() => backend.bankAccount(), []);
  const [editing, setEditing] = useState(false), [form, setForm] = useState({holder_name: '', bank_name: '', ifsc: '', account_number: '', confirm: ''});
  const [type, setType] = useState<'savings' | 'current' | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  const bank = b.data?.bank, set = (k: keyof typeof form) => (v: string) => setForm(f => ({...f, [k]: k === 'ifsc' ? v.toUpperCase() : v}));
  const ifscOk = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim()), numOk = /^\d{9,18}$/.test(form.account_number.trim()), match = form.account_number === form.confirm;
  const ready = form.holder_name.trim().length >= 2 && form.bank_name.trim().length >= 2 && ifscOk && numOk && match;
  const save = async () => {
    setBusy(true); setError('');
    try { const r = await backend.saveBankAccount({holder_name: form.holder_name, bank_name: form.bank_name, ifsc: form.ifsc, account_number: form.account_number, account_type: type});
      b.setData(r); setEditing(false); setSaved(true); setForm({holder_name: '', bank_name: '', ifsc: '', account_number: '', confirm: ''}); }
    catch (e) { setError(errorText(e, 'The bank account could not be saved. Check the details and try again.')); }
    finally { setBusy(false); }
  };
  return <Screen title="Bank Account" fallback={'/(advocate)/earnings' as Href}>
    {b.loading && !b.data ? <Loading label="Loading bank account…"/> : b.error && !b.data ? <ErrorState message={`Couldn't load your bank account. ${b.error}`} retry={b.reload}/> : <>
      {saved && <Note>Bank account saved. Legalitt will pay future withdrawals to this account.</Note>}
      {bank && !editing && <Card>
        <Row icon={Landmark} title={bank.bank_name} subtitle={`${bank.holder_name} · ••••${bank.account_last4}`} badge="Unverified"/>
        <Row title="IFSC" right={<Text style={s.body}>{bank.ifsc}</Text>}/>
        {bank.account_type && <Row title="Account type" right={<Text style={s.body}>{bank.account_type === 'savings' ? 'Savings' : 'Current'}</Text>}/>}
        <Body muted>Unverified: Legalitt doesn't yet confirm accounts with a test deposit. Check the details carefully — payouts go to this account.</Body>
        <Button title="Change bank account" variant="secondary" onPress={() => {setEditing(true); setSaved(false);}}/>
      </Card>}
      {(!bank || editing) && <Card>
        {!bank && <Body>Add the account Legalitt should pay your earnings into.</Body>}
        <Field label="Account holder name" value={form.holder_name} onChange={set('holder_name')}/>
        <Field label="Bank name" value={form.bank_name} onChange={set('bank_name')}/>
        <Field label="IFSC" value={form.ifsc} onChange={set('ifsc')} placeholder="e.g. SBIN0001234" error={form.ifsc && !ifscOk ? 'Enter the 11-character IFSC.' : undefined}/>
        <Field label="Account number" value={form.account_number} onChange={v => set('account_number')(v.replace(/\D/g, ''))} error={form.account_number && !numOk ? 'Enter 9–18 digits.' : undefined}/>
        <Field label="Confirm account number" value={form.confirm} onChange={v => set('confirm')(v.replace(/\D/g, ''))} error={form.confirm && !match ? "The account numbers don't match." : undefined}/>
        <View style={{flexDirection: 'row', gap: 8, marginBottom: 12}}>{(['savings', 'current'] as const).map(t => <Pressable key={t} accessibilityRole="radio" accessibilityState={{selected: type === t}} onPress={() => setType(t)}
          style={{flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', backgroundColor: type === t ? ink.brown : ink.chip}}><Text style={{color: type === t ? '#fff' : ink.title}}>{t === 'savings' ? 'Savings' : 'Current'}</Text></Pressable>)}</View>
        {error && <ErrorState message={error}/>}
        <Button title={busy ? 'Saving…' : 'Save bank account'} disabled={!ready || busy} onPress={save}/>
        {editing && <Button title="Cancel" variant="secondary" onPress={() => setEditing(false)}/>}
        <Body muted>Only the last four digits are shown in the app. Legalitt's team sees the full number to pay you.</Body>
      </Card>}
    </>}
  </Screen>;
}

export function PayoutSettingsScreen() {
  const b = useLoad(() => backend.bankAccount(), []);
  return <Screen title="Payment & Payout Settings" fallback={'/advocate/settings' as Href}>
    {b.loading && !b.data ? <Loading label="Loading payout settings…"/> : b.error && !b.data ? <ErrorState message={`Couldn't load payout settings. ${b.error}`} retry={b.reload}/> : <>
      <SectionLabel>Payout account</SectionLabel>
      <Card>{b.data?.bank ? <Row icon={Landmark} title={`${b.data.bank.bank_name} ••••${b.data.bank.account_last4}`} subtitle={b.data.bank.holder_name} badge="Unverified" onPress={() => go('/advocate/wallet/bank')}/>
        : <Row icon={Landmark} title="Add bank account" subtitle="Needed before Legalitt can pay you" onPress={() => go('/advocate/wallet/bank')}/>}</Card>
      <SectionLabel>How payouts work</SectionLabel>
      <Card><Body>When a case is complete, your share is added to your wallet. Request a withdrawal of ₹1,000 or more and Legalitt pays it to your bank account, then records the bank's UTR so you can trace it.</Body>
        <Body muted>Automatic payouts and payout schedules are not available yet.</Body>
        <Button title="Open Wallet" variant="secondary" onPress={() => go('/(advocate)/earnings')}/></Card>
    </>}
  </Screen>;
}
export type {Wallet};
