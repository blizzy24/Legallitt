import {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {completionHeadline, formatPaise, type AdvocateCompletion} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Button, Card, ErrorBox, openDocument, s} from '../fir/shared';

// D-07 / D-84: the advocate's completed-case view. No design exists; built from
// the existing advocate card layout. Every row appears only when its value exists.
const when = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-IN', {day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'}) : null;

export function AdvocateCompletionCard({caseId}: {caseId: string}) {
  const [data, setData] = useState<AdvocateCompletion | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [attempt, setAttempt] = useState(0);
  const [docError, setDocError] = useState('');
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    backend.advocateCompletion(caseId).then(r => {if (alive) setData(r);}).catch(e => {if (alive) setError(e instanceof Error ? e.message : 'Could not load the completed case.');}).finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [caseId, attempt]);
  if (loading && !data) return <Card><Text role="status" style={s.body}>Loading completion details…</Text></Card>;
  if (error) return <ErrorBox error={`${error} Retry, or open My Cases.`} retry={() => setAttempt(n => n + 1)}/>;
  if (!data || !data.completed) return null;
  const completed = when(data.completed_at), delivered = data.delivery ? when(data.delivery.delivered_at) : null;
  const rows: [string, string | null][] = [
    ['Completed', completed],
    ['Delivered', delivered],
    ['Received by', data.delivery?.received_by ?? null],
    ['Courier', [data.delivery?.carrier, data.delivery?.waybill].filter(Boolean).join(' · ') || null],
  ];
  return <>
    <Card title={completionHeadline(data.service_code)}>
      <Text style={s.body}>{data.reference}</Text>
      {rows.filter(([, v]) => v).map(([label, value]) => <View key={label} style={s.row}><Text style={s.muted}>{label}</Text><Text style={s.label}>{value}</Text></View>)}
    </Card>
    <Card title="Documents">
      {data.documents.length ? data.documents.map(d => <View key={d.id} style={{gap: 4}}>
        <Text style={s.label}>{d.label}</Text>
        <Text style={s.muted}>{d.filename}{d.page_count ? ` · ${d.page_count} page${d.page_count > 1 ? 's' : ''}` : ''}{d.simulated ? ' · Simulated placeholder' : ''}</Text>
        <Button title={`View ${d.label.toLowerCase()}`} onPress={() => {setDocError(''); void openDocument(d.id).catch(e => setDocError(e instanceof Error ? e.message : 'Could not open the document. Retry.'));}}/>
      </View>) : <Text style={s.body}>No final documents are attached to this case.</Text>}
      {!!docError && <Text accessibilityRole="alert" style={s.error}>{docError}</Text>}
    </Card>
    <Card title="Your entitlement">
      {data.entitlement_paise ? <>
        <Text style={s.heading}>{formatPaise(data.entitlement_paise)}</Text>
        <Text style={s.muted}>Your share recorded from the price the client paid{data.entitlement_complete ? '' : ' (an older payment on this case has no recorded breakdown, so this may be incomplete)'}. Legalitt pays advocates manually; this is not a payout confirmation.</Text>
      </> : <Text style={s.body}>No entitlement is recorded for this case. Contact Legalitt support if you expected one.</Text>}
    </Card>
  </>;
}

/** Full screen used where the completed state has no other content (Legal Notice). */
export function AdvocateCompletionScreen() {
  const params = useLocalSearchParams<{id?: string; caseId?: string}>(), id = params.caseId ?? params.id, insets = useSafeAreaInsets();
  return <ScrollView style={s.screen} contentContainerStyle={[s.content, {paddingTop: insets.top + 16}]}>
    <Button title="My Cases" onPress={() => router.replace('/matters')}/>
    {id ? <AdvocateCompletionCard caseId={id}/> : <Card><Text style={s.body}>No case selected. Open a case from My Cases.</Text></Card>}
  </ScrollView>;
}
