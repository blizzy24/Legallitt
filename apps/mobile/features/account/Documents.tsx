import {router, useLocalSearchParams} from 'expo-router';
import {Download, Eye, FileImage, FileText, FolderOpen, Minus, Plus, Trash2} from 'lucide-react-native';
import {createElement, useEffect, useMemo, useState} from 'react';
import {Image, Linking, Platform, Pressable, Text, TextInput, View} from 'react-native';
import type {AccountDocument} from '@legalitt/shared';
import ConfirmModal from '../../components/ConfirmModal';
import {backend} from '../../lib/auth';
import {colors, font} from '../../constants/theme';
import {Button, Card, Empty, ErrorState, Filters, Loading, Note, Row, Screen, SectionLabel, date, s, size, useLoad} from './ui';

// D-17 My Documents (profile-7), Case Documents (profile-3), viewer (profile-8).
// D-01: no "encrypted / Evidence Act / e-sign / vault" claims; no Share (no external sharing exists).

type Origin = 'all' | 'client' | 'advocate' | 'legalitt';
const ORIGIN: Record<Exclude<Origin, 'all'>, string> = {client: 'Uploaded by you', advocate: 'From your advocate', legalitt: 'From Legalitt'};
export const PRIVACY_LINE = 'Stored encrypted. Visible only to you, your assigned advocate and Legalitt’s team.';

function DocCard({d, onDeleted, showCase}: {d: AccountDocument; onDeleted(): void; showCase: boolean}) {
  const [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [why, setWhy] = useState(false);
  const Icon = d.mime_type === 'application/pdf' ? FileText : FileImage;
  const remove = async () => { setConfirm(false); setBusy(true); setErr(''); try { await backend.deleteDocument(d.id); onDeleted(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not remove this file.'); } finally { setBusy(false); } };
  return <Card>
    <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
      <View style={{width: 46, height: 46, borderRadius: 12, backgroundColor: '#FBE9E6', alignItems: 'center', justifyContent: 'center'}}><Icon size={22} color="#C2483A"/></View>
      <View style={{flex: 1, gap: 2}}><Text style={s.strong} numberOfLines={2}>{d.filename}</Text>
        <Text style={s.body}>{[d.page_count ? `${d.page_count} ${d.page_count === 1 ? 'page' : 'pages'}` : null, size(d.size_bytes), date(d.created_at)].filter(Boolean).join(' · ')}</Text>
        <Text style={{...s.body, color: colors.brandDark}}>{ORIGIN[d.origin]}{showCase ? ` · ${d.case.reference}` : ''}</Text></View>
    </View>
    <View style={{flexDirection: 'row', gap: 10}}>
      <View style={{flex: 1}}><Button title="View" icon={Eye} variant="quiet" onPress={() => router.push(`/documents/${d.id}` as never)}/></View>
      <View style={{flex: 1}}><Button title={busy ? 'Removing…' : 'Remove'} icon={Trash2} variant="danger" disabled={busy} onPress={() => d.deletable ? setConfirm(true) : setWhy(v => !v)}/></View>
    </View>
    {why && !d.deletable && <Text style={s.body} accessibilityRole="alert">{d.delete_blocked_reason}</Text>}
    {!!err && <Text style={s.error} accessibilityRole="alert">{err}</Text>}
    <ConfirmModal visible={confirm} icon={Trash2} title="Remove this file?" body={`${d.filename} will be removed from ${d.case.reference}. This can’t be undone.`} confirmLabel="Remove" onConfirm={remove} onCancel={() => setConfirm(false)}/>
  </Card>;
}

export function DocumentsLive({caseOnly = false}: {caseOnly?: boolean}) {
  const {caseId} = useLocalSearchParams<{caseId?: string}>();
  const scoped = caseOnly && caseId ? caseId : undefined;
  const q = useLoad(() => backend.accountDocuments(scoped), [scoped]);
  const [origin, setOrigin] = useState<Origin>('all'), [search, setSearch] = useState('');
  const items = q.data?.items ?? [];
  const shown = useMemo(() => items.filter(d => (origin === 'all' || d.origin === origin) &&
    (!search.trim() || `${d.filename} ${d.case.reference} ${d.case.service_name}`.toLowerCase().includes(search.trim().toLowerCase()))), [items, origin, search]);
  const title = scoped ? 'Case Documents' : 'My Documents';
  const caseRef = scoped ? items[0]?.case : undefined;
  if (caseOnly && !caseId) return <Screen title={title} fallback="/documents"><Empty icon={FolderOpen} title="No case selected" body="Open Case Documents from one of your cases, or see every file in My Documents." action={{title: 'My Documents', onPress: () => router.replace('/documents')}}/></Screen>;
  return <Screen title={title} subtitle={caseRef ? caseRef.reference : undefined} fallback={scoped ? `/requests/${scoped}` : '/(tabs)/profile'}>
    {q.loading && !q.data ? <Loading what="your documents"/> : q.error && !q.data ? <ErrorState what="your documents" message={q.error} retry={q.reload}/> : !items.length ?
      <Empty icon={FolderOpen} title={scoped ? 'No documents on this case yet' : 'No documents yet'} body={scoped ? 'Files you upload for this request, and files your advocate or Legalitt share with you, will appear here.' : 'Files you upload when requesting a service, and files your advocate or Legalitt share with you, will appear here.'}
        action={scoped ? undefined : {title: 'Browse services', onPress: () => router.push('/(tabs)/services')}}/> : <>
      {caseRef && <Card><Text style={s.strong}>{caseRef.service_name}</Text><Row label="Request" value={caseRef.reference}/></Card>}
      <TextInput accessibilityLabel="Search documents" placeholder="Search by file name or request" placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch}
        style={{backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, fontFamily: font.appBody, fontSize: 15, color: colors.textPrimary}}/>
      <Filters<Origin> value={origin} onChange={setOrigin} options={[{id: 'all', label: 'All', count: items.length},
        ...(['client', 'advocate', 'legalitt'] as const).filter(o => items.some(d => d.origin === o)).map(o => ({id: o, label: ORIGIN[o], count: items.filter(d => d.origin === o).length}))]}/>
      <SectionLabel>{`${shown.length} ${shown.length === 1 ? 'FILE' : 'FILES'}`}</SectionLabel>
      {q.error && <Text style={s.error} accessibilityRole="alert">Couldn’t refresh: {q.error}</Text>}
      {!shown.length ? <Text style={s.body}>No documents match. Clear the search or choose another filter.</Text> : shown.map(d => <DocCard key={d.id} d={d} showCase={!scoped} onDeleted={q.reload}/>)}
      <Note>{PRIVACY_LINE}</Note>
    </>}
  </Screen>;
}

export function DocumentViewerLive() {
  const {id} = useLocalSearchParams<{id: string}>();
  const meta = useLoad(async () => (await backend.accountDocuments()).items.find(d => d.id === id) ?? null, [id]);
  const [url, setUrl] = useState<string | null>(null), [blob, setBlob] = useState<string | null>(null), [err, setErr] = useState(''), [attempt, setAttempt] = useState(0), [zoom, setZoom] = useState(1);
  const d = meta.data;
  useEffect(() => {
    if (!d) return; let alive = true, made: string | null = null; setErr(''); setUrl(null); setBlob(null);
    backend.documentUrl(d.id).then(async r => {
      if (!alive) return; setUrl(r.url);
      if (Platform.OS === 'web') {
        // Show inline from a typed blob; fall back to Open file if storage refuses a browser read.
        try { const res = await fetch(r.url); if (!res.ok) throw new Error(); made = URL.createObjectURL(new Blob([await res.arrayBuffer()], {type: d.mime_type})); if (alive) setBlob(made); } catch { /* Open file remains available */ }
      }
    }).catch(e => { if (alive) setErr(e instanceof Error ? e.message : 'The file could not be opened.'); });
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [d?.id, attempt]);
  const pdf = d?.mime_type === 'application/pdf';
  return <Screen title="Document" subtitle={d?.case.reference} fallback="/documents"
    footer={d && url ? <Button title="Download" icon={Download} onPress={() => void Linking.openURL(url)}/> : undefined}>
    {meta.loading && !meta.data ? <Loading what="the document"/> : meta.error ? <ErrorState what="the document" message={meta.error} retry={meta.reload}/> : !d ?
      <Empty icon={FolderOpen} title="Document not available" body="This file doesn’t exist, was removed, or isn’t shared with you yet." action={{title: 'My Documents', onPress: () => router.replace('/documents')}}/> : <>
      <Card><Text style={s.strong}>{d.filename}</Text>
        <Row label="Type" value={pdf ? 'PDF' : d.mime_type === 'image/png' ? 'PNG image' : 'JPEG image'}/>
        <Row label="Size" value={size(d.size_bytes)}/><Row label="Pages" value={d.page_count ? String(d.page_count) : null}/>
        <Row label="Added" value={date(d.created_at)}/><Row label="Request" value={`${d.case.reference} · ${d.case.service_name}`}/><Row label="Source" value={ORIGIN[d.origin]}/></Card>
      {err ? <ErrorState what="the file" message={err} retry={() => setAttempt(n => n + 1)}/> : !url ? <Loading what="the file"/> :
        Platform.OS === 'web' && blob ? (pdf
          ? <View style={{height: 640, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border}}>{createElement('iframe', {src: blob, title: d.filename, style: {width: '100%', height: '100%', border: 0}})}</View>
          : <><View style={{flexDirection: 'row', gap: 10, justifyContent: 'center'}}>
              <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => setZoom(z => Math.max(.5, z - .25))} style={s.round}><Minus size={18} color={colors.textPrimary}/></Pressable>
              <Text style={{...s.body, alignSelf: 'center'}}>{Math.round(zoom * 100)}%</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => setZoom(z => Math.min(3, z + .25))} style={s.round}><Plus size={18} color={colors.textPrimary}/></Pressable></View>
            <View style={{overflow: 'scroll' as never, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff'}}><Image source={{uri: blob}} accessibilityLabel={d.filename} resizeMode="contain" style={{width: '100%', height: 480 * zoom}}/></View></>)
        : <Card><Text style={s.body}>{pdf ? 'Open the PDF to read it page by page and zoom in your viewer.' : 'Open the image to view it full size.'}</Text><Button title="Open file" icon={Eye} onPress={() => void Linking.openURL(url)}/></Card>}
      {pdf && Platform.OS === 'web' && blob && <Text style={s.body}>Use the viewer’s page and zoom controls to move through the document.</Text>}
      <Note>{PRIVACY_LINE}</Note>
    </>}
  </Screen>;
}
