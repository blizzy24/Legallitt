import {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, RefreshControl, ScrollView, Text, TextInput, View} from 'react-native';
import {router, useFocusEffect, type Href} from 'expo-router';
import {BadgeCheck, ChevronRight, Headset, Lock, Search, SquarePen} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MESSAGES_PRIVACY_LINE, SERVICE_NAMES, type MessagesInboxItem} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
import {Chip, Loading, Notice, errorText, initials, s, tone, when} from './ui';
import {font} from '../../constants/theme';

type Filter = 'all' | 'unread' | 'advocates' | 'support';

/** D-28 Messages inbox (messages-1): every case conversation plus Legalitt support. */
export default function MessagesInbox() {
  const insets = useSafeAreaInsets(), {user} = useSession(), advocate = user?.role === 'advocate';
  const [items, setItems] = useState<MessagesInboxItem[] | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all'), [query, setQuery] = useState(''), [applied, setApplied] = useState('');
  const load = useCallback(async (q = applied) => {
    try { const r = await backend.messagesInbox(q || undefined); setItems(r.items); setError(''); }
    catch (e) { setError(errorText(e)); } finally { setLoading(false); }
  }, [applied]);
  // Search runs on the server so it covers every message's text, not just the preview.
  useEffect(() => { const t = setTimeout(() => setApplied(query.trim()), 350); return () => clearTimeout(t); }, [query]);
  useEffect(() => { setLoading(true); void load(applied); }, [applied]);
  useFocusEffect(useCallback(() => { void load(); const t = setInterval(() => void load(), 15000); return () => clearInterval(t); }, [load]));
  const unread = (items ?? []).filter(i => i.unread > 0).length;
  const shown = useMemo(() => (items ?? []).filter(i => filter === 'all' || filter === 'unread' && i.unread > 0 ||
    filter === 'advocates' && i.kind === 'case' || filter === 'support' && i.kind === 'support'), [items, filter]);
  const open = (i: MessagesInboxItem) => router.push((i.kind === 'case' ? `/messages/thread?caseId=${i.case_id}` : `/messages/support?ticketId=${i.ticket_id}`) as Href);
  const filters: [Filter, string][] = advocate ? [['all', 'All Chats'], ['unread', `Unread (${unread})`], ['advocates', 'Clients'], ['support', 'Support']]
    : [['all', 'All Chats'], ['unread', `Unread (${unread})`], ['advocates', 'Advocates'], ['support', 'Support']];
  return <ScrollView style={s.screen} contentContainerStyle={[s.content, {paddingTop: insets.top + 24, paddingBottom: 140}]}
    refreshControl={<RefreshControl refreshing={false} onRefresh={() => void load()}/>} keyboardShouldPersistTaps="handled">
    <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'}}>
      <View style={{flex: 1}}><Text style={s.h1}>Messages</Text><Text style={s.body}>{advocate ? 'Chat with your clients' : 'Chat with your advocates'}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="New message to Legalitt support" onPress={() => router.push('/support-chat' as Href)}
        style={{width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: tone.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'}}><SquarePen size={22} color={tone.brandDark}/></Pressable>
    </View>
    <View style={[s.input, {flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 28, paddingVertical: 4}]}>
      <Search size={20} color={tone.muted}/>
      <TextInput accessibilityLabel="Search conversations" placeholder="Search conversations" placeholderTextColor={tone.muted} value={query} onChangeText={setQuery}
        style={{flex: 1, paddingVertical: 12, fontFamily: font.appBody, fontSize: 16, color: tone.ink}}/>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 10}}>
      {filters.map(([key, label]) => <Chip key={key} label={label} active={filter === key} onPress={() => setFilter(key)}/>)}
    </ScrollView>
    {!!error && <Notice tone="error" action={{label: 'Retry', onPress: () => { setLoading(true); void load(); }}}>Messages couldn’t be loaded. {error}</Notice>}
    {loading && !items ? <Loading label="Loading your conversations…"/> : items && !shown.length ? <Empty filter={filter} searching={!!applied} advocate={advocate}/> :
      shown.map(i => <Row key={i.key} item={i} onPress={() => open(i)} advocate={advocate}/>)}
    <View style={[s.notice, {flexDirection: 'row', alignItems: 'center', gap: 10}]}><Lock size={18} color={tone.body}/><Text style={[s.noticeText, {flex: 1}]}>{MESSAGES_PRIVACY_LINE}</Text></View>
  </ScrollView>;
}

function Row({item: i, onPress, advocate}: {item: MessagesInboxItem; onPress: () => void; advocate: boolean}) {
  const support = i.kind === 'support';
  const matter = support ? (i.matter ?? 'Support request') : [i.matter ?? (i.service_code ? SERVICE_NAMES[i.service_code] : null), i.reference].filter(Boolean).join(' · ');
  const preview = i.last_message ? (i.last_message.mine ? 'You: ' : '') + (i.last_message.body ?? (i.last_message.attachment ? `📎 ${i.last_message.attachment}` : '')) :
    support ? 'No messages yet' : advocate ? 'No messages yet. Start the conversation with your client.' : 'No messages yet. Start the conversation with your advocate.';
  return <Pressable accessibilityRole="button" accessibilityLabel={`${i.title}, ${matter}${i.unread ? `, ${i.unread} unread` : ''}`} onPress={onPress}
    style={[s.card, {flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: 22}]}>
    <View style={{width: 56, height: 56, borderRadius: 28, backgroundColor: '#F4EEE6', borderWidth: 1, borderColor: tone.line, alignItems: 'center', justifyContent: 'center'}}>
      {support ? <Headset size={24} color={tone.brandDark}/> : <Text style={{fontFamily: font.appSemi, fontSize: 18, color: tone.brandDark}}>{initials(i.title)}</Text>}
    </View>
    <View style={{flex: 1, gap: 4}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text style={{fontFamily: font.appHeading, fontSize: 17, color: tone.ink, flexShrink: 1}} numberOfLines={1}>{i.title}</Text>
        {i.verified && <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F4EEE6', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3}}><BadgeCheck size={13} color={tone.ok}/><Text style={{fontFamily: font.appSemi, fontSize: 12, color: tone.brandDark}}>Verified</Text></View>}
        <View style={{flex: 1}}/>
        {i.last_message && <Text style={s.muted}>{when(i.last_message.created_at)}</Text>}
      </View>
      {!!matter && <Text style={{fontFamily: font.appBody, fontSize: 14, color: tone.brandDark}} numberOfLines={1}>{support ? matter : `Matter: ${matter}`}</Text>}
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Text style={{flex: 1, fontFamily: i.unread ? font.appSemi : font.appBody, fontSize: 15, color: i.unread ? tone.ink : tone.body}} numberOfLines={1}>{preview}</Text>
        {i.unread ? <View style={{minWidth: 26, height: 26, borderRadius: 13, backgroundColor: tone.brand, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6}}><Text style={{fontFamily: font.appSemi, color: '#fff', fontSize: 13}}>{i.unread}</Text></View>
          : <ChevronRight size={18} color={tone.muted}/>}
      </View>
      {support && i.status === 'closed' && <Text style={s.muted}>Closed</Text>}
    </View>
  </Pressable>;
}

function Empty({filter, searching, advocate}: {filter: Filter; searching: boolean; advocate: boolean}) {
  const text = searching ? 'No conversations match your search. Try an advocate’s name, a case reference or words from a message.' :
    filter === 'unread' ? 'You’re all caught up — no unread messages.' :
    filter === 'support' ? 'No support conversations yet. Use the pencil button to message Legalitt support.' :
    advocate ? 'Conversations appear here once a case is assigned to you.' :
    'Conversations appear here once an advocate is assigned to one of your cases. You can message Legalitt support at any time.';
  return <View style={[s.card, {alignItems: 'center', paddingVertical: 28}]}>
    <Text style={[s.h2, {fontSize: 18}]}>{searching ? 'No results' : 'No conversations yet'}</Text>
    <Text style={[s.body, {textAlign: 'center'}]}>{text}</Text>
    {!searching && filter !== 'unread' && <Pressable accessibilityRole="button" onPress={() => router.push('/support-chat' as Href)}><Text style={s.noticeAction}>Message Legalitt support</Text></Pressable>}
  </View>;
}
