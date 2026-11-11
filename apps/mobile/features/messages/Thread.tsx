import {useCallback, useEffect, useRef, useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {useFocusEffect, useLocalSearchParams} from 'expo-router';
import {AlertCircle, BadgeCheck, Check, Paperclip, Send} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MESSAGES_PRIVACY_LINE, SERVICE_NAMES, type ApiDocument, type MessagesInboxItem, type ThreadMessage} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
import {DocumentCard, Header, Loading, Notice, bytes, dayLabel, errorText, openDocument, s, time, tone} from './ui';
import {font} from '../../constants/theme';

type Pending = {key: string; body: string; status: 'sending' | 'failed'};

/** D-28 case conversation (messages-2). No presence or typing indicator (D-01). */
export default function CaseThread() {
  const {caseId} = useLocalSearchParams<{caseId?: string}>(), {user} = useSession(), insets = useSafeAreaInsets();
  const [threadId, setThreadId] = useState<string | null>(null), [info, setInfo] = useState<MessagesInboxItem | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[] | null>(null), [error, setError] = useState(''), [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState(''), [pending, setPending] = useState<Pending[]>([]), [attaching, setAttaching] = useState(false);
  const [docs, setDocs] = useState<ApiDocument[] | null>(null), [attempt, setAttempt] = useState(0);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    if (!caseId) return;
    let alive = true; setLoadError('');
    (async () => {
      const [thread, inbox] = await Promise.all([backend.caseThread(caseId), backend.messagesInbox()]);
      if (!alive) return;
      setThreadId(thread.id); setInfo(inbox.items.find(i => i.case_id === caseId) ?? null);
    })().catch(e => alive && setLoadError(errorText(e)));
    return () => { alive = false; };
  }, [caseId, attempt]);
  const refresh = useCallback(async (id = threadId) => {
    if (!id) return;
    try {
      const page = await backend.threadMessages(id); setMessages(page.items); setError('');
      if (page.items.some(m => m.sender_id !== user?.id && !m.read_at)) await backend.readMessages(id);
    } catch (e) { setError(errorText(e)); }
  }, [threadId, user?.id]);
  useEffect(() => { void refresh(); }, [threadId]);
  useFocusEffect(useCallback(() => { const t = setInterval(() => void refresh(), 10000); return () => clearInterval(t); }, [refresh]));

  const send = async (p: Pending) => {
    if (!threadId) return;
    setPending(list => list.map(x => x.key === p.key ? {...x, status: 'sending'} : x));
    try { await backend.sendMessage(threadId, {body: p.body}); setPending(list => list.filter(x => x.key !== p.key)); await refresh(); }
    catch { setPending(list => list.map(x => x.key === p.key ? {...x, status: 'failed'} : x)); }
  };
  const submit = () => {
    const body = draft.trim(); if (!body) return;
    const p: Pending = {key: `${Date.now()}`, body, status: 'sending'}; setDraft(''); setPending(list => [...list, p]); void send(p);
  };
  const openAttach = async () => {
    setAttaching(true); setDocs(null);
    try { const c = await backend.case(caseId!); setDocs((c.documents ?? []).filter(d => d.status === 'uploaded' && d.owner_id === user?.id)); }
    catch (e) { setError(errorText(e)); setAttaching(false); }
  };
  const share = async (doc: ApiDocument) => {
    try { await backend.sendMessage(threadId!, {document_id: doc.id}); setAttaching(false); await refresh(); }
    catch (e) { setError(errorText(e)); }
  };

  const advocate = user?.role === 'advocate';
  const title = info?.title ?? (advocate ? 'Client' : 'Your advocate');
  const matter = info ? [info.matter ?? (info.service_code ? SERVICE_NAMES[info.service_code] : null), info.reference].filter(Boolean).join(' · ') : null;
  if (!caseId) return <View style={s.screen}><Header title="Conversation"/><View style={s.content}><Notice tone="error">No conversation was selected. Go back to Messages and choose one.</Notice></View></View>;
  let lastDay = '';
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Header title={title} right={info?.verified ? <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E9F6EF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4}}><BadgeCheck size={14} color={tone.ok}/><Text style={{fontFamily: font.appSemi, fontSize: 13, color: tone.ok}}>Verified</Text></View> : undefined}/>
    {!!matter && <View style={{backgroundColor: '#F1EBE3', paddingHorizontal: 18, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8}}>
      <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: tone.brand}}/><Text style={{fontFamily: font.appSemi, fontSize: 14, color: tone.ink, flex: 1}} numberOfLines={1}>{matter}</Text></View>}
    <ScrollView ref={scroll} contentContainerStyle={[s.content, {paddingBottom: 24}]} onContentSizeChange={() => scroll.current?.scrollToEnd({animated: false})}>
      {loadError ? <Notice tone="error" action={{label: 'Retry', onPress: () => setAttempt(n => n + 1)}}>This conversation couldn’t be opened. {loadError}</Notice> :
        !messages ? <Loading label="Loading messages…"/> : <>
          {!messages.length && !pending.length && <Notice>No messages yet. Send the first message below. {MESSAGES_PRIVACY_LINE}</Notice>}
          {messages.map(m => {
            const mine = m.sender_id === user?.id, day = dayLabel(m.created_at), showDay = day !== lastDay; lastDay = day;
            return <View key={m.id} style={{gap: 6}}>
              {showDay && <View style={{alignSelf: 'center', borderWidth: 1, borderColor: tone.line, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6, marginVertical: 8}}><Text style={[s.label, {fontSize: 12}]}>{day}</Text></View>}
              <Text style={[s.muted, {alignSelf: mine ? 'flex-end' : 'flex-start'}]}>{mine ? 'You' : title}</Text>
              {m.document ? <View style={{alignSelf: mine ? 'flex-end' : 'flex-start', width: '88%'}}><DocumentCard filename={m.document.filename} size={bytes(m.document.size_bytes)} mime={m.document.mime_type} onView={() => void openDocument(m.document!.id).catch(e => setError(errorText(e)))}/></View>
                : m.document_id ? <Text style={s.muted}>Attached document unavailable.</Text> : null}
              {!!m.body && <View style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', backgroundColor: mine ? '#fff' : '#F3ECE3', borderWidth: 1, borderColor: tone.line, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 13}}>
                <Text style={{fontFamily: font.appBody, fontSize: 16, lineHeight: 23, color: tone.ink}}>{m.body}</Text></View>}
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: mine ? 'flex-end' : 'flex-start'}}><Text style={s.muted}>{time(m.created_at)}</Text>{mine && <Check size={14} color={tone.muted}/>}</View>
            </View>;
          })}
          {pending.map(p => <View key={p.key} style={{gap: 6, alignItems: 'flex-end'}}>
            <View style={{maxWidth: '82%', backgroundColor: '#fff', borderWidth: 1, borderColor: p.status === 'failed' ? '#EBB4AD' : tone.line, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 13}}>
              <Text style={{fontFamily: font.appBody, fontSize: 16, lineHeight: 23, color: tone.ink}}>{p.body}</Text></View>
            {p.status === 'sending' ? <Text style={s.muted}>Sending…</Text> :
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}><AlertCircle size={14} color={tone.danger}/><Text style={{fontFamily: font.appBody, fontSize: 14, color: tone.danger}}>Message failed to send ·</Text>
                <Pressable accessibilityRole="button" onPress={() => void send(p)}><Text style={s.noticeAction}>Retry</Text></Pressable></View>}
          </View>)}
        </>}
      {!!error && !loadError && <Notice tone="error" action={{label: 'Retry', onPress: () => void refresh()}}>{error}</Notice>}
    </ScrollView>
    <View style={{borderTopWidth: 1, borderTopColor: tone.line, backgroundColor: '#fff', padding: 14, paddingBottom: insets.bottom + 14, gap: 10}}>
      <Pressable accessibilityRole="button" disabled={!threadId} onPress={() => void openAttach()} style={{alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: tone.chip, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8}}>
        <Paperclip size={16} color={tone.brandDark}/><Text style={{fontFamily: font.appSemi, color: tone.brandDark}}>Document</Text></Pressable>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: tone.line, borderRadius: 26, paddingLeft: 18, paddingRight: 6, paddingVertical: 6}}>
        <TextInput accessibilityLabel="Message" placeholder="Type a message…" placeholderTextColor={tone.muted} value={draft} onChangeText={setDraft} multiline maxLength={2000}
          style={{flex: 1, fontFamily: font.appBody, fontSize: 16, color: tone.ink, maxHeight: 110, paddingVertical: 8}}/>
        <Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!draft.trim() || !threadId} onPress={submit}
          style={{width: 44, height: 44, borderRadius: 22, backgroundColor: tone.brand, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() && threadId ? 1 : 0.5}}><Send size={20} color="#fff"/></Pressable>
      </View>
    </View>
    <Modal visible={attaching} transparent animationType="slide" onRequestClose={() => setAttaching(false)}>
      <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'flex-end'}}><View style={{backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, gap: 12, maxHeight: '70%'}}>
        <Text style={s.h2}>Share a document</Text>
        <Text style={s.muted}>You can share files you uploaded to this case. To add a new file, upload it from the case’s documents screen first.</Text>
        <ScrollView contentContainerStyle={{gap: 10}}>
          {!docs ? <Loading label="Loading your case files…"/> : !docs.length ? <Text style={s.body}>You haven’t uploaded any files to this case yet.</Text> :
            docs.map(d => <DocumentCard key={d.id} filename={d.filename} size={bytes(d.size_bytes)} mime={d.mime_type} action="Share" onView={() => void share(d)}/>)}
        </ScrollView>
        <Pressable accessibilityRole="button" onPress={() => setAttaching(false)} style={s.secondary}><Text style={s.secondaryText}>Close</Text></Pressable>
      </View></View>
    </Modal>
  </KeyboardAvoidingView>;
}
