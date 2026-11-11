import {useCallback, useEffect, useRef, useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {router, useFocusEffect, useLocalSearchParams, type Href} from 'expo-router';
import {AlertCircle, CheckCircle2, ChevronDown, Headset, Info, Lock, Send, UploadCloud} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MESSAGES_PRIVACY_LINE, SUPPORT_CONTACT_METHODS, SUPPORT_RELATED_TO, SUPPORT_SUBJECTS, type SupportTicketView} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
import {supportContactCopy as copy} from '../../copy/supportContact';
import {Header, Loading, Notice, PrimaryButton, SecondaryButton, dayLabel, errorText, s, time, tone} from './ui';
import {font} from '../../constants/theme';

type Pending = {key: string; body: string; status: 'sending' | 'failed'};

/** Shared support conversation body: a ticket by id, or the person's open support chat. */
function SupportConversation({mode}: {mode: 'ticket' | 'chat'}) {
  const {ticketId} = useLocalSearchParams<{ticketId?: string}>(), insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<SupportTicketView | null>(null), [loaded, setLoaded] = useState(false), [error, setError] = useState('');
  const [draft, setDraft] = useState(''), [pending, setPending] = useState<Pending[]>([]);
  const scroll = useRef<ScrollView>(null);
  const load = useCallback(async () => {
    try {
      const t = mode === 'chat' ? (await backend.supportChat()).chat : ticketId ? await backend.supportTicket(ticketId) : null;
      setTicket(t); setError('');
      if (t && t.messages.some(m => m.from === 'support' && !m.read_at)) await backend.readSupport(t.id);
    } catch (e) { setError(errorText(e)); } finally { setLoaded(true); }
  }, [mode, ticketId]);
  useEffect(() => { void load(); }, [load]);
  useFocusEffect(useCallback(() => { const t = setInterval(() => void load(), 10000); return () => clearInterval(t); }, [load]));
  const send = async (p: Pending) => {
    setPending(list => list.map(x => x.key === p.key ? {...x, status: 'sending'} : x));
    try {
      const t = mode === 'chat' || !ticket ? await backend.sendSupportChat(p.body) : await backend.replySupport(ticket.id, p.body);
      setTicket(t); setPending(list => list.filter(x => x.key !== p.key));
    } catch { setPending(list => list.map(x => x.key === p.key ? {...x, status: 'failed'} : x)); }
  };
  const submit = () => { const body = draft.trim(); if (!body) return; const p: Pending = {key: `${Date.now()}`, body, status: 'sending'}; setDraft(''); setPending(l => [...l, p]); void send(p); };
  const closed = ticket?.status === 'closed';
  const title = mode === 'chat' ? 'Support Chat' : ticket?.kind === 'callback' ? 'Callback request' : ticket?.subject ?? 'Support request';
  let lastDay = '';
  return <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Header title={title} subtitle="Legalitt Support"/>
    <ScrollView ref={scroll} contentContainerStyle={[s.content, {paddingBottom: 24}]} onContentSizeChange={() => scroll.current?.scrollToEnd({animated: false})}>
      {!loaded ? <Loading label="Loading conversation…"/> : error && !ticket ? <Notice tone="error" action={{label: 'Retry', onPress: () => void load()}}>This conversation couldn’t be loaded. {error}</Notice> : <>
        {mode === 'ticket' && !ticket ? <Notice tone="error" action={{label: 'Back to Messages', onPress: () => router.replace('/messages' as Href)}}>This support request wasn’t found.</Notice> : null}
        {mode === 'chat' && !ticket?.messages.length && !pending.length && <View style={[s.card, {alignItems: 'center'}]}><Headset size={28} color={tone.brandDark}/><Text style={s.h2}>How can we help?</Text><Text style={[s.body, {textAlign: 'center'}]}>{copy.chatResponse}</Text></View>}
        {ticket?.messages.map(m => {
          const mine = m.from === 'requester', day = dayLabel(m.created_at), showDay = day !== lastDay; lastDay = day;
          return <View key={m.id} style={{gap: 6}}>
            {showDay && <View style={{alignSelf: 'center', borderWidth: 1, borderColor: tone.line, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6, marginVertical: 8}}><Text style={[s.label, {fontSize: 12}]}>{day}</Text></View>}
            <Text style={[s.muted, {alignSelf: mine ? 'flex-end' : 'flex-start'}]}>{mine ? 'You' : 'Legalitt Support'}</Text>
            <View style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', backgroundColor: mine ? '#fff' : '#F3ECE3', borderWidth: 1, borderColor: tone.line, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 13}}>
              <Text style={{fontFamily: font.appBody, fontSize: 16, lineHeight: 23, color: tone.ink}}>{m.body}</Text></View>
            <Text style={[s.muted, {alignSelf: mine ? 'flex-end' : 'flex-start'}]}>{time(m.created_at)}</Text>
          </View>;
        })}
        {pending.map(p => <View key={p.key} style={{alignItems: 'flex-end', gap: 6}}>
          <View style={{maxWidth: '82%', backgroundColor: '#fff', borderWidth: 1, borderColor: p.status === 'failed' ? '#EBB4AD' : tone.line, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 13}}><Text style={{fontFamily: font.appBody, fontSize: 16, color: tone.ink}}>{p.body}</Text></View>
          {p.status === 'sending' ? <Text style={s.muted}>Sending…</Text> : <View style={{flexDirection: 'row', gap: 6, alignItems: 'center'}}><AlertCircle size={14} color={tone.danger}/><Text style={{color: tone.danger, fontFamily: font.appBody}}>Message failed to send ·</Text><Pressable accessibilityRole="button" onPress={() => void send(p)}><Text style={s.noticeAction}>Retry</Text></Pressable></View>}
        </View>)}
        {closed && <Notice action={{label: 'Start a new support chat', onPress: () => router.push('/support-chat' as Href)}}>This request is closed. If you still need help, start a new chat.</Notice>}
        {!!error && !!ticket && <Notice tone="error" action={{label: 'Retry', onPress: () => void load()}}>{error}</Notice>}
        <View style={{flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center'}}><Lock size={14} color={tone.muted}/><Text style={s.muted}>{MESSAGES_PRIVACY_LINE}</Text></View>
      </>}
    </ScrollView>
    {(mode === 'chat' || ticket) && !closed && <View style={{borderTopWidth: 1, borderTopColor: tone.line, backgroundColor: '#fff', padding: 14, paddingBottom: insets.bottom + 14}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: tone.line, borderRadius: 26, paddingLeft: 18, paddingRight: 6, paddingVertical: 6}}>
        <TextInput accessibilityLabel="Message to support" placeholder="Type your message…" placeholderTextColor={tone.muted} value={draft} onChangeText={setDraft} multiline maxLength={2000}
          style={{flex: 1, fontFamily: font.appBody, fontSize: 16, color: tone.ink, maxHeight: 110, paddingVertical: 8}}/>
        <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!draft.trim()} onPress={submit} style={{width: 44, height: 44, borderRadius: 22, backgroundColor: tone.brand, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() ? 1 : 0.5}}><Send size={20} color="#fff"/></Pressable>
      </View>
    </View>}
  </KeyboardAvoidingView>;
}
export function SupportTicketThread() { return <SupportConversation mode="ticket"/>; }
export function SupportChat() { return <SupportConversation mode="chat"/>; }

function Choice({label, hint, active, onPress, wide}: {label: string; hint?: string; active: boolean; onPress: () => void; wide?: boolean}) {
  return <Pressable accessibilityRole="radio" accessibilityState={{checked: active}} onPress={onPress}
    style={{flexGrow: wide ? 2 : 1, flexBasis: wide ? '60%' : '30%', alignItems: 'center', paddingVertical: hint ? 10 : 15, borderRadius: 16, borderWidth: 1.5, borderColor: active ? tone.brand : tone.line, backgroundColor: active ? '#F4EEE6' : '#fff'}}>
    <Text style={{fontFamily: font.appSemi, fontSize: 15, color: active ? tone.brandDark : tone.ink}}>{label}</Text>{!!hint && <Text style={s.muted}>{hint}</Text>}
  </Pressable>;
}

/** D-26 Contact Support (profile-21), with its drawn submitted state. */
export function ContactSupport() {
  const {user} = useSession(), insets = useSafeAreaInsets();
  const [subject, setSubject] = useState<string | null>(null), [related, setRelated] = useState('case'), [description, setDescription] = useState('');
  const [method, setMethod] = useState('email'), [picking, setPicking] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<SupportTicketView | null>(null), [touched, setTouched] = useState(false);
  const problems = [!subject && 'Choose a subject.', description.trim().length < 10 && 'Describe the issue in at least 10 characters.'].filter(Boolean) as string[];
  const submit = async () => {
    setTouched(true); if (problems.length) return;
    setBusy(true); setError('');
    try { setSubmitted(await backend.createSupportTicket({subject: subject!, related_to: related, description: description.trim(), contact_method: method})); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  if (submitted) return <View style={s.screen}><Header title="Contact Support" onBack={() => router.canGoBack() ? router.back() : router.replace('/profile' as Href)}/>
    <ScrollView contentContainerStyle={[s.content, {alignItems: 'stretch'}]}>
      <View style={[s.card, {alignItems: 'center', paddingVertical: 28}]}><CheckCircle2 size={48} color={tone.ok}/><Text style={s.h2}>Request submitted</Text>
        <Text style={[s.body, {textAlign: 'center'}]}>We’ve received your request about “{submitted.subject}”. Replies from Legalitt Support appear in Messages under Support{method === 'email' && user?.email ? ` and we may also email ${user.email}` : ''}.</Text></View>
      <PrimaryButton title="View in Messages" onPress={() => router.replace(`/messages/support?ticketId=${submitted.id}` as Href)}/>
      <SecondaryButton title="Back to Profile" onPress={() => router.replace('/profile' as Href)}/>
    </ScrollView></View>;
  const subjectLabel = SUPPORT_SUBJECTS.find(x => x.code === subject)?.label;
  return <View style={s.screen}><Header title="Contact Support"/>
    <ScrollView contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 40}]} keyboardShouldPersistTaps="handled">
      <Text style={[s.h1, {fontSize: 26}]}>Tell us how we can help.</Text>
      <Text style={s.body}>{copy.ticketResponse}</Text>
      <Text style={s.label}>Subject</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Subject" onPress={() => setPicking(true)} style={[s.input, {flexDirection: 'row', alignItems: 'center'}]}>
        <Text style={{flex: 1, fontFamily: font.appBody, fontSize: 16, color: subject ? tone.ink : tone.ink}}>{subjectLabel ?? 'Select an issue'}</Text><ChevronDown size={20} color={tone.body}/></Pressable>
      {touched && !subject && <Text style={{color: tone.danger, fontFamily: font.appBody}}>Choose a subject.</Text>}
      <Text style={s.label}>Related to</Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>{SUPPORT_RELATED_TO.map(r => <Choice key={r.code} label={r.label} active={related === r.code} onPress={() => setRelated(r.code)} wide={r.code === 'other'}/>)}</View>
      <Text style={s.label}>Description</Text>
      <TextInput accessibilityLabel="Description" placeholder="Describe your issue..." placeholderTextColor={tone.muted} value={description} onChangeText={setDescription} multiline maxLength={4000}
        style={[s.input, {minHeight: 140, textAlignVertical: 'top'}]}/>
      {touched && description.trim().length < 10 && <Text style={{color: tone.danger, fontFamily: font.appBody}}>Describe the issue in at least 10 characters.</Text>}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}><Text style={s.label}>Upload document</Text><Text style={[s.muted, {backgroundColor: '#F4EEE6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8}]}>Not available yet</Text></View>
      <View style={{borderWidth: 1.5, borderStyle: 'dashed', borderColor: tone.line, borderRadius: 16, padding: 18, alignItems: 'center', gap: 6, opacity: 0.8}}>
        <UploadCloud size={22} color={tone.muted}/><Text style={[s.body, {textAlign: 'center', fontSize: 14}]}>{copy.attachmentsUnavailable}</Text></View>
      <Text style={s.label}>Preferred contact method</Text>
      <View style={{flexDirection: 'row', gap: 10}}>{SUPPORT_CONTACT_METHODS.map(m => <Choice key={m.code} label={m.label} hint={m.hint} active={method === m.code} onPress={() => setMethod(m.code)}/>)}</View>
      {method === 'email' && (user?.email ? <><Text style={s.label}>Registered email</Text><View style={s.input}><Text style={{fontFamily: font.appBody, fontSize: 16, color: tone.ink}}>{user.email}</Text></View></>
        : <Notice>Your account has no email address. We’ll reply in Messages under Support.</Notice>)}
      {method === 'phone' && (user?.phone ? <><Text style={s.label}>Registered mobile</Text><View style={s.input}><Text style={{fontFamily: font.appBody, fontSize: 16, color: tone.ink}}>{user.phone}</Text></View></>
        : <Notice action={{label: 'Request a callback instead', onPress: () => router.push('/callback' as Href)}}>Your account has no mobile number, so we’ll reply in Messages.</Notice>)}
      {!!error && <Notice tone="error" action={{label: 'Retry', onPress: () => void submit()}}>Your request wasn’t sent. {error}</Notice>}
      {touched && !!problems.length && <Text accessibilityRole="alert" style={{color: tone.danger, fontFamily: font.appBody}}>Fix the highlighted fields to submit: {problems.join(' ')}</Text>}
      <PrimaryButton title="Submit Request" busy={busy} onPress={() => void submit()}/>
      <View style={{alignItems: 'center', gap: 4}}><Text style={[s.label, {color: tone.brandDark}]}>Legalitt Support</Text><Text style={s.muted}>Support requests are reviewed by our support team.</Text></View>
    </ScrollView>
    <Modal visible={picking} transparent animationType="slide" onRequestClose={() => setPicking(false)}>
      <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'flex-end'}}><View style={{backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, gap: 4}}>
        <Text style={[s.h2, {marginBottom: 8}]}>Select an issue</Text>
        {SUPPORT_SUBJECTS.map(x => <Pressable key={x.code} accessibilityRole="button" onPress={() => { setSubject(x.code); setPicking(false); }} style={{paddingVertical: 15}}><Text style={[s.body, {color: tone.ink}]}>{x.label}</Text></Pressable>)}
        <SecondaryButton title="Cancel" onPress={() => setPicking(false)}/>
      </View></View>
    </Modal>
  </View>;
}

/** D-26 Request a Callback (design 36), prefilled from the profile. */
export function RequestCallback() {
  const {user} = useSession(), insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? ''), [mobile, setMobile] = useState((user?.phone ?? '').replace(/^\+91\s*/, ''));
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState<SupportTicketView | null>(null), [touched, setTouched] = useState(false);
  useEffect(() => { if (user) { setName(n => n || user.name); setMobile(m => m || (user.phone ?? '').replace(/^\+91\s*/, '')); } }, [user?.id]);
  const valid = name.trim().length > 0 && /^[0-9 ]{10,14}$/.test(mobile.trim());
  const submit = async () => {
    setTouched(true); if (!valid) return; setBusy(true); setError('');
    try { setDone(await backend.requestCallback({name: name.trim(), phone: `+91 ${mobile.trim()}`})); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  if (done) return <View style={s.screen}><Header title="Request a Callback"/><ScrollView contentContainerStyle={s.content}>
    <View style={[s.card, {alignItems: 'center', paddingVertical: 28}]}><CheckCircle2 size={48} color={tone.ok}/><Text style={s.h2}>Callback requested</Text>
      <Text style={[s.body, {textAlign: 'center'}]}>We’ll call {done.contact_name} on {done.contact_phone}. {copy.callbackResponse}.</Text></View>
    <PrimaryButton title="View in Messages" onPress={() => router.replace(`/messages/support?ticketId=${done.id}` as Href)}/>
    <SecondaryButton title="Done" onPress={() => router.canGoBack() ? router.back() : router.replace('/profile' as Href)}/>
  </ScrollView></View>;
  return <View style={s.screen}><Header title="Request a Callback" subtitle="Get assistance from our Legal Support Team."/>
    <ScrollView contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 40}]} keyboardShouldPersistTaps="handled">
      <View style={[s.card, {flexDirection: 'row', gap: 14, backgroundColor: '#F4EEE6'}]}><Headset size={26} color={tone.brandDark}/><View style={{flex: 1, gap: 4}}><Text style={[s.h2, {fontSize: 18}]}>Need a little help?</Text>
        <Text style={s.body}>Our Legal Support Team will contact you to understand your requirement and guide you through the next steps.</Text></View></View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}><Text style={[s.label, {color: tone.brandDark}]}>Your details</Text><Text style={s.muted}>* Required fields</Text></View>
      <Text style={[s.body, {color: tone.ink}]}>Full Name *</Text>
      <TextInput accessibilityLabel="Full name" placeholder="Enter your full name" placeholderTextColor={tone.muted} value={name} onChangeText={setName} style={s.input}/>
      {touched && !name.trim() && <Text style={{color: tone.danger, fontFamily: font.appBody}}>Enter your full name.</Text>}
      <Text style={[s.body, {color: tone.ink}]}>Mobile Number *</Text>
      <View style={[s.input, {flexDirection: 'row', alignItems: 'center', padding: 0}]}><Text style={{paddingHorizontal: 16, fontFamily: font.appBody, fontSize: 16, color: tone.body, borderRightWidth: 1, borderRightColor: tone.line, paddingVertical: 15}}>+91</Text>
        <TextInput accessibilityLabel="Mobile number" placeholder="Enter your mobile number" placeholderTextColor={tone.muted} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" style={{flex: 1, paddingHorizontal: 14, fontFamily: font.appBody, fontSize: 16, color: tone.ink}}/></View>
      {touched && !/^[0-9 ]{10,14}$/.test(mobile.trim()) && <Text style={{color: tone.danger, fontFamily: font.appBody}}>Enter a 10-digit mobile number.</Text>}
      <View style={[s.notice, {flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#fff'}]}><Info size={16} color={tone.brandDark}/><Text style={[s.noticeText, {flex: 1}]}>{copy.callbackResponse}</Text></View>
      {!!error && <Notice tone="error" action={{label: 'Retry', onPress: () => void submit()}}>Your callback request wasn’t sent. {error}</Notice>}
      <PrimaryButton title="Request Callback" busy={busy} onPress={() => void submit()}/>
      <Text style={[s.muted, {textAlign: 'center'}]}>Your information will be used only to process your callback request.</Text>
    </ScrollView></View>;
}
