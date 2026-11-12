import {useCallback, useEffect, useRef, useState} from 'react';
import {KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {router, useFocusEffect, useLocalSearchParams, type Href} from 'expo-router';
import {AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, Clock, Headset, Info, Lock, Mic, Paperclip, Send, ShieldCheck, UploadCloud} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MESSAGES_PRIVACY_LINE, SERVICE_NAMES, SUPPORT_CONTACT_METHODS, SUPPORT_RELATED_TO, SUPPORT_SUBJECTS, type ServiceCode, type SupportTicketView} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {useSession} from '../../context/session';
import {supportContactCopy as copy} from '../../copy/supportContact';
import {supportHours} from '../../copy/support';
import {speechRecognition} from '../fir/flow';
import {Header, Loading, Notice, PrimaryButton, SecondaryButton, dayLabel, errorText, s, time, tone} from './ui';
import {buttonShadow, callback as k, colors, font, ink, supportChat as c} from '../../constants/theme';

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
  // Opened from a request (e.g. FIR status "Contact Legalitt Support"): the ticket is linked to that request.
  const {caseId} = useLocalSearchParams<{caseId?: string}>(), [about, setAbout] = useState<{reference: string} | null>(null), [aboutError, setAboutError] = useState(false);
  useEffect(() => { let live = true; if (!caseId) return; setAboutError(false);
    backend.request<{reference: string}>(`/cases/${encodeURIComponent(caseId)}`).then(c => { if (live) setAbout({reference: c.reference}); }).catch(() => { if (live) setAboutError(true); });
    return () => { live = false; }; }, [caseId]);
  const problems = [!subject && 'Choose a subject.', description.trim().length < 10 && 'Describe the issue in at least 10 characters.'].filter(Boolean) as string[];
  const submit = async () => {
    setTouched(true); if (problems.length) return;
    setBusy(true); setError('');
    try { setSubmitted(await backend.createSupportTicket({subject: subject!, related_to: related, description: description.trim(), contact_method: method, ...(caseId && !aboutError ? {case_id: caseId} : {})})); }
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
      {!!caseId && (about ? <View style={s.input}><Text style={s.muted}>About your request</Text><Text style={{fontFamily: font.appSemi, fontSize: 16, color: tone.ink}}>{about.reference}</Text></View>
        : aboutError ? <Notice>We couldn’t load that request, so this message won’t be linked to it. Mention the request ID in your description.</Notice>
        : <Text role="status" style={s.muted}>Loading your request…</Text>)}
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

/**
 * Legal Support chat (F2, Figma 163; flow C1b). Opens the person's support
 * thread — the same one shown under Messages → Support — and, when reached from
 * a service screen, says which service it is about ("Regarding: FIR Draft
 * Service"). Removed per the flow: the "Available to assist" presence dot. The
 * mic shows only where speech-to-text works. The drawn paperclip stays as a
 * disabled control because support threads cannot carry files yet (D-58); a tap
 * says so beside the composer instead of opening a file picker.
 */
export function SupportChat({service}: {service?: ServiceCode} = {}) {
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<SupportTicketView | null>(null), [loaded, setLoaded] = useState(false), [error, setError] = useState('');
  const [draft, setDraft] = useState(''), [pending, setPending] = useState<Pending[]>([]), [info, setInfo] = useState(false), [attachNote, setAttachNote] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const load = useCallback(async () => {
    try {
      const t = (await backend.supportChat()).chat;
      setTicket(t); setError('');
      if (t && t.messages.some(m => m.from === 'support' && !m.read_at)) await backend.readSupport(t.id);
    } catch (e) { setError(errorText(e)); } finally { setLoaded(true); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  // New replies appear while the chat is open; this never navigates.
  useFocusEffect(useCallback(() => { const t = setInterval(() => void load(), 10000); return () => clearInterval(t); }, [load]));
  const send = async (p: Pending) => {
    setPending(list => list.map(x => x.key === p.key ? {...x, status: 'sending'} : x));
    try { setTicket(await backend.sendSupportChat(p.body, service)); setPending(list => list.filter(x => x.key !== p.key)); }
    catch { setPending(list => list.map(x => x.key === p.key ? {...x, status: 'failed'} : x)); }
  };
  const submit = (text = draft) => {
    const body = text.trim(); if (!body) return;
    const p: Pending = {key: `${Date.now()}`, body, status: 'sending'};
    if (text === draft) setDraft('');
    setPending(l => [...l, p]); void send(p);
  };

  // Speech-to-text for the composer, where the browser offers it.
  const Speech = speechRecognition();
  const recognizer = useRef<{stop(): void} | null>(null);
  const [listening, setListening] = useState(false), [micError, setMicError] = useState('');
  useEffect(() => () => recognizer.current?.stop(), []);
  const dictate = () => {
    if (!Speech) return;
    if (listening) { recognizer.current?.stop(); return; }
    setMicError('');
    try {
      const r = new Speech();
      r.lang = 'en-IN'; r.interimResults = false; r.continuous = false;
      r.onresult = e => { const said = e.results[e.results.length - 1]?.[0]?.transcript?.trim(); if (said) setDraft(d => `${d}${d && !/\s$/.test(d) ? ' ' : ''}${said}`.slice(0, 2000)); };
      r.onerror = () => setMicError('Voice input stopped. Allow microphone access, or type your message.');
      r.onend = () => setListening(false);
      recognizer.current = r; r.start(); setListening(true);
    } catch { setListening(false); setMicError('Voice input couldn’t start here. Type your message instead.'); }
  };

  const regarding = serviceLabel(service ?? ticket?.service_code);
  const fresh = !ticket?.messages.length && !pending.length;
  const asked = !!ticket?.messages.some(m => m.from === 'requester') || pending.length > 0;
  let lastDay = '';
  return <KeyboardAvoidingView style={chat.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[chat.header, {paddingTop: insets.top + c.headerTop}]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/messages' as Href))}>
        <ArrowLeft size={c.backIcon + 2} color={colors.textPrimary}/>
      </Pressable>
      <View style={chat.headerText}>
        <View style={chat.titleRow}>
          <Text style={chat.title}>Legal Support</Text>
          <View style={chat.assisted}><Text style={chat.assistedText}>Assisted</Text></View>
        </View>
        <Text style={chat.subtitle}>Legalitt Support Team</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="About this chat" accessibilityState={{expanded: info}} hitSlop={10} onPress={() => setInfo(v => !v)}>
        <Info size={c.infoIcon} color={colors.textPrimary}/>
      </Pressable>
    </View>
    {info && <View style={chat.info}><Text style={chat.infoText}>Legalitt Support replies here during support hours ({supportHours.hours}). {MESSAGES_PRIVACY_LINE} This is not a chat with an advocate.</Text></View>}
    {regarding && <View style={chat.bar}>
      <Clock size={c.barIcon} color={ink.accent}/>
      <Text style={chat.barText} numberOfLines={1}>Regarding: <Text style={chat.barStrong}>{regarding}</Text></Text>
      <View style={chat.barChip}><Text style={chat.barChipText}>Non-Advocate Chat</Text></View>
    </View>}

    <ScrollView ref={scroll} style={{flex: 1}} contentContainerStyle={chat.content} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({animated: false})}>
      {!loaded ? <Loading label="Loading your support chat…"/> : error && !ticket ? <Notice tone="error" action={{label: 'Try again', onPress: () => void load()}}>Your support chat couldn’t be loaded. {error}</Notice> : <>
        {fresh && <>
          <DayChip label="Today"/>
          <Sender/>
          <View style={chat.supportBubble}><Text style={chat.bubbleText}>Hello! Welcome to Legalitt Support. How can we help you{service ? ` with your ${SERVICE_NAMES[service]} requirement` : ''}?</Text></View>
        </>}
        {!asked && <View style={chat.suggest}>
          <Text style={chat.suggestLabel}>Suggested quick questions:</Text>
          <View style={chat.pills}>{QUICK_QUESTIONS.map(q => <Pressable key={q} accessibilityRole="button" onPress={() => submit(q)} style={chat.pill}><Text style={chat.pillText}>{q}</Text></Pressable>)}</View>
        </View>}
        {fresh && <View style={[chat.supportBubble, chat.block]}><Text style={chat.bubbleText}>Please tell us briefly what you need help with.</Text></View>}
        {ticket?.messages.map((m, i) => {
          const mine = m.from === 'requester', day = chatDay(m.created_at), showDay = day !== lastDay; lastDay = day;
          const firstOfRun = !mine && (i === 0 || ticket.messages[i - 1]!.from !== 'support' || showDay);
          return <View key={m.id} style={chat.block}>
            {showDay && <DayChip label={day}/>}
            {firstOfRun && <Sender/>}
            <View style={mine ? chat.userBubble : chat.supportBubble}><Text style={mine ? chat.userText : chat.bubbleText}>{m.body}</Text></View>
            <View style={[chat.timeRow, mine && chat.timeRowUser]}><Text style={chat.time}>{time(m.created_at)}</Text>{mine && <Check size={c.timeIcon} color={c.time}/>}</View>
          </View>;
        })}
        {pending.map(p => <View key={p.key} style={chat.block}>
          <View style={[chat.userBubble, p.status === 'failed' && chat.failedBubble]}><Text style={chat.userText}>{p.body}</Text></View>
          {p.status === 'sending' ? <Text style={[chat.time, chat.timeRowUser, {textAlign: 'right', marginTop: 6}]}>Sending…</Text>
            : <View style={[chat.timeRow, chat.timeRowUser]}><AlertCircle size={14} color={tone.danger}/><Text style={{color: tone.danger, fontFamily: font.appBody, fontSize: 12}}>Message didn’t send ·</Text><Pressable accessibilityRole="button" onPress={() => void send(p)}><Text style={s.noticeAction}>Retry</Text></Pressable></View>}
        </View>)}
        {!!error && !!ticket && <Notice tone="error" action={{label: 'Try again', onPress: () => void load()}}>New messages couldn’t be loaded. {error}</Notice>}
      </>}
    </ScrollView>

    <View style={[chat.composer, {paddingBottom: insets.bottom + c.composerBottom}]}>
      <View style={chat.caution}><ShieldCheck size={c.cautionIcon} color={colors.textBody}/><Text style={chat.cautionText}>Please avoid sharing unnecessary sensitive information.</Text></View>
      {!!micError && <Text accessibilityRole="alert" style={chat.micError}>{micError}</Text>}
      {attachNote && <Text role="status" style={chat.attachNote}>{copy.attachmentsUnavailable}</Text>}
      <View style={chat.composerRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Attach a file (not available yet)" accessibilityState={{disabled: true}} hitSlop={4} onPress={() => setAttachNote(true)} style={[chat.attach, chat.attachOff]}>
          <Paperclip size={c.controlIcon} color={ink.accent}/>
        </Pressable>
        <View style={chat.inputWrap}>
          <TextInput accessibilityLabel="Message to Legalitt Support" placeholder="Type your message..." placeholderTextColor={ink.hint} value={draft} onChangeText={setDraft} multiline maxLength={2000} style={chat.input}/>
          {Speech && <Pressable accessibilityRole="button" accessibilityLabel={listening ? 'Stop voice input' : 'Speak your message'} accessibilityState={{selected: listening}} hitSlop={8} onPress={dictate}>
            <Mic size={c.controlIcon} color={listening ? tone.danger : colors.textMuted}/>
          </Pressable>}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Send" accessibilityState={{disabled: !draft.trim()}} disabled={!draft.trim()} onPress={() => submit()} style={[chat.send, !draft.trim() && {opacity: 0.55}]}>
          <Send size={c.controlIcon} color={ink.onBrand}/>
        </Pressable>
      </View>
    </View>
  </KeyboardAvoidingView>;
}

const QUICK_QUESTIONS = ['What documents do I need?', 'How does the process work?', 'I need help choosing a service', 'I have a question'];
const serviceLabel = (code?: string | null) => code && code in SERVICE_NAMES ? `${SERVICE_NAMES[code as ServiceCode]} Service` : null;
const chatDay = (iso: string) => { const d = dayLabel(iso); return d === 'TODAY' ? 'Today' : d === 'YESTERDAY' ? 'Yesterday' : d.charAt(0) + d.slice(1).toLowerCase(); };
function DayChip({label}: {label: string}) { return <View style={chat.today}><Text style={chat.todayText}>{label}</Text></View>; }
function Sender() {
  return <View style={chat.senderRow}><View style={chat.avatar}><Text style={chat.avatarText}>L</Text></View><Text style={chat.senderName}>Legalitt Support</Text></View>;
}

const chat = StyleSheet.create({
  screen: {flex: 1, backgroundColor: c.chatBg},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: c.padX, paddingBottom: c.headerBottom, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border},
  headerText: {flex: 1, minWidth: 0, marginLeft: c.backGap},
  titleRow: {flexDirection: 'row', alignItems: 'center'},
  title: {fontFamily: font.appHeading, fontSize: c.titleSize, lineHeight: c.titleLineHeight, color: colors.textPrimary},
  assisted: {marginLeft: c.chipGap, height: c.chipHeight, borderRadius: 6, paddingHorizontal: c.chipPadX, backgroundColor: ink.badgeBg, justifyContent: 'center'},
  assistedText: {fontFamily: font.appBody, fontSize: c.chipTextSize, color: colors.textBody},
  subtitle: {fontFamily: font.appBody, fontSize: c.subtitleSize, lineHeight: c.subtitleLineHeight, color: c.sender},
  info: {paddingHorizontal: c.padX, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border},
  infoText: {fontFamily: font.appBody, fontSize: 12.5, lineHeight: 18, color: colors.textBody},
  bar: {minHeight: c.barHeight, paddingHorizontal: c.padX, paddingVertical: 6, backgroundColor: c.barBg, flexDirection: 'row', alignItems: 'center'},
  barText: {flex: 1, minWidth: 0, marginLeft: c.barIconGap, fontFamily: font.appBody, fontSize: c.barTextSize + 1, color: colors.textBody},
  barStrong: {fontFamily: font.appSemi, color: colors.textPrimary},
  barChip: {height: c.barChipHeight, borderRadius: c.barChipRadius, paddingHorizontal: c.barChipPadX, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', marginLeft: 8},
  barChipText: {fontFamily: font.appBody, fontSize: c.barChipTextSize, color: colors.textBody},
  content: {paddingHorizontal: c.padX - 2, paddingTop: c.todayGap, paddingBottom: c.blockGap},
  today: {alignSelf: 'center', height: c.todayHeight, borderRadius: c.todayHeight / 2, paddingHorizontal: c.todayPadX, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', marginBottom: 16},
  todayText: {fontFamily: font.appBody, fontSize: c.todayTextSize, color: colors.textBody},
  block: {marginTop: c.blockGap},
  senderRow: {flexDirection: 'row', alignItems: 'center', marginBottom: c.bubbleGap},
  avatar: {width: c.avatar, height: c.avatar, borderRadius: c.avatar / 2, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginRight: c.avatarGap},
  avatarText: {fontFamily: font.appSemi, fontSize: c.avatarTextSize, color: ink.onBrand},
  senderName: {fontFamily: font.appBody, fontSize: c.senderSize, color: c.sender},
  supportBubble: {alignSelf: 'flex-start', maxWidth: '85%', borderRadius: c.bubbleRadius + 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: c.bubblePadX, paddingVertical: c.bubblePadY},
  userBubble: {alignSelf: 'flex-end', maxWidth: '85%', borderRadius: c.bubbleRadius + 6, backgroundColor: colors.brand, paddingHorizontal: c.bubblePadX, paddingVertical: c.bubblePadY},
  failedBubble: {opacity: 0.7},
  bubbleText: {fontFamily: font.appBody, fontSize: c.bubbleTextSize + 1, lineHeight: c.bubbleLineHeight, color: c.bubbleText},
  userText: {fontFamily: font.appBody, fontSize: c.bubbleTextSize + 1, lineHeight: c.bubbleLineHeight, color: ink.onBrand},
  timeRow: {marginTop: c.timeGap, marginLeft: 4, flexDirection: 'row', alignItems: 'center', gap: c.timeIconGap},
  timeRowUser: {justifyContent: 'flex-end', marginRight: 8},
  time: {fontFamily: font.appBody, fontSize: c.timeSize + 1, color: c.time},
  suggest: {marginTop: c.suggestGap},
  suggestLabel: {marginLeft: 3, fontFamily: font.appBody, fontSize: c.suggestSize + 1, color: c.sender},
  pills: {marginTop: c.pillsGap, flexDirection: 'row', flexWrap: 'wrap', columnGap: c.pillColGap, rowGap: c.pillRowGap},
  pill: {minHeight: c.pillHeight + 3, borderRadius: (c.pillHeight + 3) / 2, paddingHorizontal: c.pillPadX + 2, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center'},
  pillText: {fontFamily: font.appBody, fontSize: c.pillTextSize + 1, color: c.pillText},
  composer: {backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: c.composerTop, paddingHorizontal: c.composerPadX},
  caution: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: c.cautionIconGap},
  cautionText: {fontFamily: font.appBody, fontSize: c.cautionSize, color: colors.textBody},
  micError: {marginTop: 6, textAlign: 'center', fontFamily: font.appBody, fontSize: 12, color: tone.danger},
  composerRow: {marginTop: c.cautionGap, flexDirection: 'row', alignItems: 'center', gap: c.controlGap},
  attach: {width: c.control, height: c.control, borderRadius: c.control / 2, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'},
  attachOff: {opacity: 0.5},
  attachNote: {marginTop: 6, textAlign: 'center', fontFamily: font.appBody, fontSize: 12, lineHeight: 17, color: colors.textBody},
  inputWrap: {flex: 1, minWidth: 0, minHeight: c.control, borderRadius: c.inputRadius, backgroundColor: c.chatBg, borderWidth: 1, borderColor: colors.border, paddingLeft: c.inputPadX, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 8},
  input: {flex: 1, minWidth: 0, maxHeight: 110, paddingVertical: 10, fontFamily: font.appBody, fontSize: c.inputTextSize + 1, color: colors.textPrimary, outlineWidth: 0},
  send: {width: c.control + 4, height: c.control + 4, borderRadius: (c.control + 4) / 2, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'},
});

// F1's note takes its hours from the support-hours constant (flow C1a [DECIDE]).
const CALLBACK_HOURS = /(\d+)\s*hours?/i.exec(supportHours.callbackResponse)?.[1];
const CALLBACK_NOTE = CALLBACK_HOURS ? `Our team will review your request and contact you in ${CALLBACK_HOURS} hours` : supportHours.callbackResponse;

/**
 * D-26 Request a Callback (F1, Figma 162; flow C1a), prefilled from the profile.
 * A service screen passes its service (FIR Draft), which is stored on the ticket
 * so the admin Support inbox shows where the request came from.
 */
export function RequestCallback({service}: {service?: ServiceCode} = {}) {
  const {user} = useSession(), insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name ?? ''), [mobile, setMobile] = useState((user?.phone ?? '').replace(/^\+91\s*/, ''));
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState<SupportTicketView | null>(null), [touched, setTouched] = useState(false);
  useEffect(() => { if (user) { setName(n => n || user.name); setMobile(m => m || (user.phone ?? '').replace(/^\+91\s*/, '')); } }, [user?.id]);
  const nameOk = name.trim().length > 0, mobileOk = /^[0-9 ]{10,14}$/.test(mobile.trim()) && mobile.replace(/\D/g, '').length === 10;
  const leave = () => (router.canGoBack() ? router.back() : router.replace((service === 'fir_draft' ? '/fir' : '/profile') as Href));
  const submit = async () => {
    setTouched(true); if (!nameOk || !mobileOk) return; setBusy(true); setError('');
    try { setDone(await backend.requestCallback({name: name.trim(), phone: `+91 ${mobile.trim()}`, ...(service ? {service_code: service} : {})})); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  if (done) return <View style={s.screen}><Header title="Request a Callback" onBack={leave}/><ScrollView contentContainerStyle={s.content}>
    <View style={[s.card, {alignItems: 'center', paddingVertical: 28}]}><CheckCircle2 size={48} color={tone.ok}/><Text style={s.h2}>Callback requested</Text>
      <Text style={[s.body, {textAlign: 'center'}]}>We’ll call {done.contact_name} on {done.contact_phone}. {CALLBACK_NOTE}.</Text></View>
    <PrimaryButton title="View in Messages" onPress={() => router.replace(`/messages/support?ticketId=${done.id}` as Href)}/>
    <SecondaryButton title="Done" onPress={leave}/>
  </ScrollView></View>;
  return <View style={cb.screen}>
    <ScrollView contentContainerStyle={[cb.content, {paddingTop: insets.top + k.top, paddingBottom: insets.bottom + 32}]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={cb.headerRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={leave} style={cb.back}><ArrowLeft size={k.backIcon} color={colors.textPrimary}/></Pressable>
        <View style={cb.headerText}>
          <Text style={cb.title}>Request a Callback</Text>
          <Text style={cb.subtitle}>Get expert assistance from our Legal Support Team.</Text>
        </View>
      </View>
      <View style={cb.divider}/>
      <View style={cb.card}>
        <View style={cb.iconBox}><Headset size={k.icon + 5} color={ink.accent}/></View>
        <View style={cb.cardText}>
          <Text style={cb.cardTitle}>Need a little help?</Text>
          <Text style={cb.cardBody}>Our Legal Support Team will contact you to understand your requirement and guide you through the next steps.</Text>
        </View>
      </View>
      <View style={cb.sectionRow}><Text style={cb.sectionLabel}>YOUR DETAILS</Text><Text style={cb.sectionNote}>* Required fields</Text></View>
      <Text style={cb.label}>Full Name <Text style={cb.star}>*</Text></Text>
      <TextInput accessibilityLabel="Full Name" placeholder="Enter your full name" placeholderTextColor={ink.hint} value={name} onChangeText={setName} autoComplete="name" style={[cb.field, touched && !nameOk && cb.invalid]}/>
      {touched && !nameOk && <Text accessibilityRole="alert" style={cb.error}>Enter your full name.</Text>}
      <Text style={[cb.label, cb.labelAfter]}>Mobile Number <Text style={cb.star}>*</Text></Text>
      <View style={cb.mobileRow}>
        <View style={[cb.prefix, touched && !mobileOk && cb.invalid]}><Text style={cb.prefixText}>+91</Text></View>
        <TextInput accessibilityLabel="Mobile Number" placeholder="Enter your mobile number" placeholderTextColor={ink.hint} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" autoComplete="tel" style={[cb.field, cb.mobileField, touched && !mobileOk && cb.invalid]}/>
      </View>
      {touched && !mobileOk && <Text accessibilityRole="alert" style={cb.error}>Enter a 10-digit mobile number.</Text>}
      <View style={cb.info}><Headset size={k.infoIcon} color={ink.accent}/><Text style={cb.infoText}>{CALLBACK_NOTE}</Text></View>
      {!!error && <View style={{marginTop: 14}}><Notice tone="error" action={{label: 'Try again', onPress: () => void submit()}}>Your callback request wasn’t sent. {error}</Notice></View>}
      <Pressable accessibilityRole="button" accessibilityState={{disabled: busy, busy}} disabled={busy} onPress={() => void submit()} style={({pressed}) => [cb.button, (pressed || busy) && {opacity: 0.8}]}>
        <Text style={cb.buttonText}>{busy ? 'Sending request…' : 'Request Callback'}</Text>
        {!busy && <ArrowRight size={k.buttonIcon} color={ink.onBrand}/>}
      </Pressable>
      <Text style={cb.footer}>Your information will be used only to process your callback request.</Text>
    </ScrollView>
  </View>;
}

const cb = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.appBg},
  content: {paddingHorizontal: k.padX},
  headerRow: {flexDirection: 'row', alignItems: 'flex-start'},
  back: {paddingTop: 4},
  headerText: {flex: 1, minWidth: 0, marginLeft: k.backGap},
  title: {fontFamily: font.appHeading, fontSize: k.titleSize, lineHeight: k.titleLineHeight, color: colors.textPrimary},
  subtitle: {marginTop: k.subtitleGap, fontFamily: font.appBody, fontSize: k.subtitleSize, lineHeight: k.subtitleLineHeight, color: colors.textBody},
  divider: {marginTop: k.dividerGap, height: 1, backgroundColor: colors.border},
  card: {marginTop: k.cardGap, borderRadius: k.cardRadius, backgroundColor: k.cardBg, borderWidth: 1, borderColor: colors.border, padding: k.cardPad, paddingBottom: k.cardPadBottom, flexDirection: 'row', alignItems: 'flex-start'},
  iconBox: {width: k.iconBox, height: k.iconBox, borderRadius: k.iconBoxRadius, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: k.iconGap},
  cardText: {flex: 1, minWidth: 0},
  cardTitle: {marginTop: k.cardTitleGap, fontFamily: font.appHeading, fontSize: k.cardTitleSize, color: colors.textPrimary},
  cardBody: {marginTop: k.cardBodyGap, fontFamily: font.appBody, fontSize: k.cardBodySize, lineHeight: k.cardBodyLineHeight, color: colors.textBody},
  sectionRow: {marginTop: k.sectionGap, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  sectionLabel: {fontFamily: font.appSemi, fontSize: k.sectionSize, letterSpacing: k.sectionSpacing, color: ink.accent},
  sectionNote: {fontFamily: font.appBody, fontSize: k.sectionNoteSize, color: k.note},
  label: {marginTop: k.labelGap, fontFamily: font.appSemi, fontSize: k.labelSize, color: k.label},
  labelAfter: {marginTop: k.labelGapAfter},
  star: {color: colors.brand},
  field: {marginTop: k.fieldGap, height: k.fieldHeight, borderRadius: k.fieldRadius, backgroundColor: k.fieldBg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: k.fieldPadX, fontFamily: font.appBody, fontSize: k.fieldTextSize, color: colors.textPrimary, outlineWidth: 0},
  invalid: {borderColor: tone.danger},
  error: {marginTop: 6, fontFamily: font.appBody, fontSize: 12.5, color: tone.danger},
  mobileRow: {flexDirection: 'row', alignItems: 'flex-start'},
  prefix: {marginTop: k.fieldGap, width: k.prefixWidth + 6, height: k.fieldHeight, borderTopLeftRadius: k.fieldRadius, borderBottomLeftRadius: k.fieldRadius, backgroundColor: k.prefixBg, borderWidth: 1, borderRightWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'},
  prefixText: {fontFamily: font.appBody, fontSize: k.prefixTextSize, color: colors.textPrimary},
  mobileField: {flex: 1, minWidth: 0, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0},
  info: {marginTop: k.infoGap, minHeight: k.infoHeight, borderRadius: k.fieldRadius, backgroundColor: k.infoBg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: k.infoPadX, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: k.infoIconGap},
  infoText: {flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: k.infoTextSize + 1, lineHeight: 16, color: colors.textBody},
  button: {marginTop: k.buttonGap, height: k.buttonHeight, borderRadius: k.buttonRadius, backgroundColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: k.buttonIconGap, ...buttonShadow},
  buttonText: {fontFamily: font.appSemi, fontSize: k.buttonTextSize + 1, color: ink.onBrand},
  footer: {marginTop: k.footerGap, alignSelf: 'center', maxWidth: k.footerMaxWidth, textAlign: 'center', fontFamily: font.appBody, fontSize: k.footerSize, lineHeight: k.footerLineHeight, color: k.footer},
});
