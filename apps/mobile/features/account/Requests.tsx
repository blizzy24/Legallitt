import {router, useLocalSearchParams} from 'expo-router';
import {CalendarDays, ChevronRight, CircleX, ClipboardList, FileText, Headset, Landmark, MapPin, Scale, UserRound} from 'lucide-react-native';
import {useMemo, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {SERVICE_NAMES, type ApiCase, type ApiEvent, type CaseStatus} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {colors} from '../../constants/theme';
import {caseDestination, caseTitle} from '../cases/case-list';
import {Button, Card, Empty, ErrorState, Filters, IconChip, Loading, Note, Pill, Row, Screen, SectionLabel, date, dateTime, s, size, useLoad} from './ui';

// D-16 My Requests (profile-4) and Request Details (profile-5).
// D-01: "You'll be notified in the app." (no push/SMS claim). D-02: advocate facts only from data.

type Group = 'all' | 'pending' | 'accepted' | 'completed';
const PENDING: CaseStatus[] = ['draft', 'submitted', 'payment_pending', 'paid', 'assigning', 'assigned', 'advocate_declined'] as CaseStatus[];
export function groupOf(status: CaseStatus): Exclude<Group, 'all'> | 'closed' {
  if (status === 'completed') return 'completed';
  if (status === 'cancelled' || status === 'refunded') return 'closed';
  return PENDING.includes(status) ? 'pending' : 'accepted';
}
const LABEL: Record<string, string> = {
  draft: 'Draft', submitted: 'Submitted', payment_pending: 'Payment pending', paid: 'Finding an advocate', assigning: 'Finding an advocate',
  assigned: 'Awaiting advocate review', advocate_declined: 'Finding another advocate', advocate_accepted: 'Accepted', in_progress: 'In progress',
  client_review: 'Ready for your review', changes_requested: 'Changes requested', approved: 'Approved', dispatching: 'Preparing dispatch',
  dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled', refunded: 'Refunded',
};
const tone = (st: CaseStatus) => ({completed: 'good', cancelled: 'bad', refunded: 'neutral', client_review: 'warn', payment_pending: 'warn', draft: 'neutral'} as Record<string, 'good' | 'bad' | 'neutral' | 'warn'>)[st] ?? (groupOf(st) === 'accepted' ? 'good' : 'warn');
export const statusLabel = (r: ApiCase) => r.sub_status === 'awaiting_admin_approval' ? 'Under Legalitt review' : LABEL[r.status] ?? r.status.replaceAll('_', ' ');
const text = (v: unknown) => typeof v === 'string' && v.trim() ? v.trim() : null;
/** Forum or location the client entered, where the service records one. */
function forum(r: ApiCase) {
  const d = r.details ?? {}, j = (d.jurisdiction ?? {}) as Record<string, unknown>;
  return text(d.court) ?? text((d as {forum?: unknown}).forum) ?? ([text(j.district), text(j.state)].filter(Boolean).join(', ') || null);
}

async function allCases() {
  const out: ApiCase[] = []; let cursor: string | undefined;
  do { const page = await backend.cases(cursor); out.push(...page.items); cursor = page.next_cursor ?? undefined; } while (cursor);
  return out.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export function RequestsLive() {
  const q = useLoad(allCases);
  const [group, setGroup] = useState<Group>('all');
  const items = q.data ?? [];
  const count = (g: Group) => g === 'all' ? items.length : items.filter(r => groupOf(r.status) === g).length;
  const shown = useMemo(() => items.filter(r => group === 'all' || groupOf(r.status) === group), [items, group]);
  return <Screen title="My Requests" fallback="/(tabs)/profile">
    <Text style={s.body}>Track your consultation and representation requests.</Text>
    {q.loading && !q.data ? <Loading what="your requests"/> : q.error && !q.data ? <ErrorState what="your requests" message={q.error} retry={q.reload}/> : !items.length ?
      <Empty icon={ClipboardList} title="No requests yet" body="When you request a service — a legal notice, consultation or representation — you can follow it here." action={{title: 'Browse services', onPress: () => router.push('/(tabs)/services')}}/> : <>
      <Filters<Group> value={group} onChange={setGroup} options={(['all', 'pending', 'accepted', 'completed'] as Group[]).map(g => ({id: g, label: g[0].toUpperCase() + g.slice(1), count: count(g)}))}/>
      {q.error && <Text style={s.error} accessibilityRole="alert">Couldn’t refresh: {q.error}</Text>}
      {!shown.length ? <Text style={s.body}>No {group} requests right now.</Text> : shown.map(r => <RequestCard key={r.id} r={r}/>)}
    </>}
  </Screen>;
}

function RequestCard({r}: {r: ApiCase}) {
  return <Card>
    <View style={{flexDirection: 'row', gap: 12, alignItems: 'flex-start'}}><IconChip icon={Scale}/>
      <View style={{flex: 1}}><Text style={{...s.section, color: colors.brandDark}}>SERVICE TYPE</Text><Text style={s.strong}>{SERVICE_NAMES[r.service_code]}</Text></View>
      <Pill label={statusLabel(r)} tone={tone(r.status)}/></View>
    <View style={s.divider}/>
    <Row icon={UserRound} label="Assigned advocate" value={r.advocate?.full_name ?? null}/>
    <Row icon={MapPin} label="Forum / location" value={forum(r)} chip/>
    <Row icon={CalendarDays} label="Requested date" value={date(r.created_at)}/>
    <View style={s.divider}/>
    <Pressable accessibilityRole="button" accessibilityLabel={`View request ${r.reference}`} onPress={() => router.push(`/requests/${r.id}` as never)} style={{flexDirection: 'row', alignItems: 'center'}}>
      <Text style={{...s.body, flex: 1}}>Reference {r.reference}</Text><Text style={{...s.strong, color: colors.brandDark}}>View Request</Text><ChevronRight size={18} color={colors.brandDark}/></Pressable>
  </Card>;
}

function eventLabel(e: ApiEvent) {
  if (e.to_status && e.from_status !== e.to_status) return LABEL[e.to_status] ?? e.to_status.replaceAll('_', ' ');
  return null;
}

export function RequestDetailLive() {
  const {id} = useLocalSearchParams<{id: string}>();
  const q = useLoad(() => backend.case(String(id)), [id]);
  const r = q.data;
  const steps = (r?.events ?? []).map(e => ({e, label: e.type === 'case_created' ? 'Request created' : eventLabel(e)})).filter((x): x is {e: ApiEvent; label: string} => !!x.label);
  const closed = r ? ['completed', 'cancelled', 'refunded'].includes(r.status) : true;
  const profile = r?.advocate?.profile;
  const place = profile ? [profile.city, profile.state].filter(Boolean).join(', ') : '';
  const destination = r ? caseDestination(r) : null;
  return <Screen title="Request Details" subtitle={r ? `REFERENCE ${r.reference}` : undefined} fallback="/requests">
    {q.loading && !r ? <Loading what="this request"/> : q.error && !r ? <ErrorState what="this request" message={q.error} retry={q.reload}/> : r && <>
      <Card><Pill label={statusLabel(r)} tone={tone(r.status)}/>
        <Text style={s.heading}>{SERVICE_NAMES[r.service_code]}</Text>
        {caseTitle(r) !== SERVICE_NAMES[r.service_code] && <Text style={s.body}>{caseTitle(r)}</Text>}
        <View style={{flexDirection: 'row', gap: 10, flexWrap: 'wrap'}}>
          {[{icon: CalendarDays, label: 'Requested', value: date(r.created_at)}, {icon: Landmark, label: 'Forum', value: forum(r)}].filter(c => c.value).map(c =>
            <View key={c.label} style={{flexGrow: 1, minWidth: 130, backgroundColor: '#F7F3EE', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4}}><c.icon size={18} color={colors.brandDark}/><Text style={s.body}>{c.label}</Text><Text style={s.strong}>{c.value}</Text></View>)}
        </View></Card>
      <SectionLabel>{r.advocate ? 'SELECTED ADVOCATE' : 'ADVOCATE'}</SectionLabel>
      {r.advocate ? <Card><Text style={s.strong}>{r.advocate.full_name}</Text>
        {profile?.verification === 'approved' && <Pill label="Verified by Legalitt" tone="good"/>}
        <Row label="Experience" value={profile?.years_experience ? `${profile.years_experience} years` : null}/>
        <Row label="Practice areas" value={profile?.practice_areas?.length ? profile.practice_areas.join(', ') : null}/>
        <Row label="Location" value={place || null}/>
        {r.advocate && <Button title="View advocate profile" variant="quiet" onPress={() => router.push(`/advocates/${r.advocate!.id}?caseId=${r.id}` as never)}/>}
      </Card> : <Card><Text style={s.body}>{closed ? 'No advocate was assigned to this request.' : 'Legalitt is assigning an advocate. You’ll see their name here once they’re assigned.'}</Text></Card>}
      {(r.subject_matter || r.subject_line) && <><SectionLabel>CASE INFORMATION</SectionLabel><Card>
        {r.subject_line && <><Text style={s.body}>Case subject</Text><Text style={s.strong}>{r.subject_line}</Text></>}
        {r.subject_matter && <><Text style={s.body}>Brief description</Text><Text style={s.body}>{r.subject_matter}</Text></>}
      </Card></>}
      <SectionLabel right={(r.documents?.length ?? 0) > 0 ? <Pressable accessibilityRole="button" onPress={() => router.push(`/documents/case?caseId=${r.id}` as never)}><Text style={{...s.body, color: colors.brandDark}}>All case documents</Text></Pressable> : undefined}>{`DOCUMENTS ATTACHED (${r.documents?.length ?? 0})`}</SectionLabel>
      {r.documents?.length ? r.documents.map(d => <Pressable key={d.id} accessibilityRole="button" accessibilityLabel={`View ${d.filename}`} onPress={() => router.push(`/documents/${d.id}` as never)}>
        <Card style={{flexDirection: 'row', alignItems: 'center', gap: 12}}><FileText size={22} color={colors.brandDark}/><View style={{flex: 1}}><Text style={s.strong} numberOfLines={1}>{d.filename}</Text><Text style={s.body}>{size(d.size_bytes)}</Text></View><ChevronRight size={18} color={colors.textMuted}/></Card></Pressable>)
        : <Card><Text style={s.body}>No documents on this request yet.</Text></Card>}
      <SectionLabel>REQUEST TIMELINE</SectionLabel>
      <Card>{steps.length ? steps.map(({e, label}, i) => <View key={e.id} style={{flexDirection: 'row', gap: 12}}>
        <View style={{alignItems: 'center'}}><View style={{width: 14, height: 14, borderRadius: 7, backgroundColor: i === steps.length - 1 ? colors.brandDark : '#3BA776', marginTop: 4}}/>{i < steps.length - 1 && <View style={{width: 2, flex: 1, backgroundColor: colors.border}}/>}</View>
        <View style={{flex: 1, paddingBottom: 14}}><Text style={s.strong}>{label}</Text><Text style={s.body}>{dateTime(e.created_at)}</Text></View></View>)
        : <Text style={s.body}>No updates yet.</Text>}</Card>
      {destination && <Button title="Open case" variant="quiet" onPress={() => router.push(destination as never)}/>}
      <Button title="Contact Legalitt Support" variant="dark" icon={Headset} onPress={() => router.push('/support')}/>
      {!closed ? <Button title="Cancel Request" variant="danger" icon={CircleX} onPress={() => router.push(`/cases/cancel?caseId=${r.id}` as never)}/>
        : r.status === 'completed' ? <Note>This request is complete, so it can’t be cancelled. Contact Legalitt Support if something isn’t right.</Note> : null}
      {!closed && <Note>You’ll be notified in the app when your request is updated.</Note>}
    </>}
  </Screen>;
}
