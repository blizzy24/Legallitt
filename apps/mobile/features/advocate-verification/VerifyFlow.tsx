import {useEffect, useState} from 'react';
import {Linking, Platform, Pressable, Text, View} from 'react-native';
import {router, usePathname, type Href} from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {BadgeCheck, CircleAlert, Clock, FileText, ShieldCheck, Upload} from 'lucide-react-native';
import {PRACTICE_AREAS, VERIFICATION_DOCUMENTS, type VerificationDetails, type VerificationState} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Body, Button, Card, ErrorState, Field, Loading, Note, Row, Screen, SectionLabel, errorText, ink, s, useLoad} from '../account/ui';

// D-35 advocate verification (designs 233–244), API mode. One flow, one step per
// route; the status decides which outcome screen a finished submission shows.
const STEPS = [
  {route: 'personal', title: 'Personal Details', n: 1}, {route: 'professional', title: 'Professional Details', n: 2},
  {route: 'bar-council', title: 'Bar Council Details', n: 3}, {route: 'practice', title: 'Practice Areas & City', n: 4},
  {route: 'documents', title: 'Documents', n: 5}, {route: 'review', title: 'Review & Submit', n: 6},
] as const;
type Step = typeof STEPS[number]['route'];
const go = (route: string) => router.push(`/advocate/verify/${route}` as Href);
const list = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean);
const num = (v: string) => { const n = Number(v); return v.trim() && Number.isInteger(n) ? n : null; };

export default function VerifyFlow() {
  const path = usePathname(), segment = path.split('/').pop() ?? 'intro';
  const load = useLoad(() => backend.verification(), []);
  const [draft, setDraft] = useState<VerificationDetails | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirm, setConfirm] = useState(false);
  useEffect(() => { if (load.data) setDraft(load.data.details); }, [load.data]);
  const state = load.data;
  if (load.loading && !state) return <Screen title="Advocate Verification" fallback="/dashboard"><Loading label="Loading your verification…"/></Screen>;
  if (!state || !draft) return <Screen title="Advocate Verification" fallback="/dashboard"><ErrorState message={load.error || 'Your verification could not be loaded.'} retry={load.reload}/></Screen>;
  const editable = ['not_started', 'needs_update', 'rejected'].includes(state.status);
  const run = async (fn: () => Promise<VerificationState | void>, next?: string) => {
    if (busy) return; setBusy(true); setError('');
    try { const r = await fn(); if (r) { load.setData(r); setDraft(r.details); } if (next) go(next); }
    catch (e) { setError(errorText(e, 'That did not save. Your entries are still here. Retry.')); } finally { setBusy(false); }
  };
  const save = (next?: string) => run(() => backend.saveVerification(draft), next);
  const set = <K extends keyof VerificationDetails>(k: K, patch: Partial<VerificationDetails[K]>) => setDraft({...draft, [k]: {...draft[k], ...patch}});

  // Outcome screens follow the status, whichever step URL was opened (no timers).
  if (state.status === 'in_review') return <Screen title="Verification Submitted" fallback="/dashboard">
    <Card style={{alignItems: 'center', paddingVertical: 26}}><Clock size={34} color={ink.brown}/><Text style={[s.title, {textAlign: 'center'}]}>Under review</Text>
      <Body muted>Submitted {state.submitted_at ? new Date(state.submitted_at).toLocaleString('en-IN') : ''}. Legalitt reviews your Bar Council details and documents. You'll get a notification in the app when there's a decision.</Body></Card>
    <Note>Until you're approved you can't be assigned cases or booked for consultations. Your details can't be edited while they're under review.</Note>
    <Button title="Refresh status" variant="secondary" onPress={load.reload}/><Button title="Back to Dashboard" onPress={() => router.replace('/dashboard' as Href)}/>
  </Screen>;
  if (state.status === 'approved') return <Screen title="Verification Complete" fallback="/dashboard">
    <Card style={{alignItems: 'center', paddingVertical: 26}}><BadgeCheck size={36} color={ink.green}/><Text style={[s.title, {textAlign: 'center'}]}>You're verified</Text>
      <Body muted>Legalitt approved your profile{state.decision ? ` on ${new Date(state.decision.decided_at).toLocaleDateString('en-IN')}` : ''}. You can now be assigned cases and booked for consultations.</Body></Card>
    <Summary details={state.details}/>
    <Button title="Go to Dashboard" onPress={() => router.replace('/dashboard' as Href)}/>
  </Screen>;

  const step = STEPS.find(x => x.route === segment);
  const banner = state.status === 'needs_update' || state.status === 'rejected' ? <Card style={{borderColor: '#F3C9C5'}}>
    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}><CircleAlert size={20} color={ink.danger}/><Text style={s.rowTitle}>{state.status === 'needs_update' ? 'Legalitt needs an update' : 'Verification not approved'}</Text></View>
    {state.decision?.reason ? <Body>{state.decision.reason}</Body> : null}
    <Body muted>Update the details or documents below and submit again.</Body></Card> : null;
  const footer = (next: string, label = 'Save & Continue') => <>
    {!!error && <ErrorState message={error}/>}
    <Button title={busy ? 'Saving…' : label} disabled={busy || !editable} onPress={() => void save(next)}/>
    <Button title="Save draft" variant="secondary" disabled={busy || !editable} onPress={() => void save()}/>
  </>;

  if (!step) { // 233 intro, and 241 "incomplete" as the same hub
    const done = (r: Step) => r === 'documents' ? VERIFICATION_DOCUMENTS.every(d => state.documents.some(x => x.kind === d.kind)) : !state.problems.some(p => p.field.startsWith(r === 'bar-council' ? 'bar_council' : r));
    return <Screen title="Advocate Verification" subtitle="Verify your profile to receive cases and consultations" fallback="/dashboard">
      {banner}
      <Card><View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}><ShieldCheck size={22} color={ink.brown}/><Text style={s.rowTitle}>Why we verify advocates</Text></View>
        <Body muted>Legalitt checks your Bar Council enrolment and documents before you can be assigned cases or booked for consultations. Partial progress is saved.</Body></Card>
      <SectionLabel meta={`${STEPS.filter(x => x.route !== 'review' && done(x.route)).length} of 5 complete`}>STEPS</SectionLabel>
      <Card>{STEPS.map(x => <Row key={x.route} title={`${x.n}. ${x.title}`} badge={x.route !== 'review' && done(x.route) ? 'Done' : undefined} onPress={() => go(x.route)}/>)}</Card>
      <Button title={state.problems.length ? 'Continue verification' : 'Review & Submit'} onPress={() => go(state.problems.length ? (STEPS.find(x => x.route !== 'review' && !done(x.route))?.route ?? 'review') : 'review')}/>
    </Screen>;
  }
  const title = `${step.title} · Step ${step.n} of 6`;
  if (step.route === 'personal') return <Screen title={title} fallback="/advocate/verify/intro">{banner}
    <Field label="Full name (as enrolled)" value={draft.personal.full_name ?? ''} onChange={v => set('personal', {full_name: v})}/>
    <Field label="Mobile number" value={draft.personal.phone ?? ''} onChange={v => set('personal', {phone: v})} placeholder="+91"/>
    <Field label="Date of birth (YYYY-MM-DD, optional)" value={draft.personal.date_of_birth ?? ''} onChange={v => set('personal', {date_of_birth: v})}/>
    <Field label="Gender (optional)" value={draft.personal.gender ?? ''} onChange={v => set('personal', {gender: v})}/>
    {footer('professional')}</Screen>;
  if (step.route === 'professional') return <Screen title={title} fallback="/advocate/verify/personal">{banner}
    <Field label="Years of practice" value={draft.professional.years_experience == null ? '' : String(draft.professional.years_experience)} onChange={v => set('professional', {years_experience: num(v)})}/>
    <Field label="Education (optional)" value={draft.professional.education ?? ''} onChange={v => set('professional', {education: v})} placeholder="e.g. LL.B., LL.M."/>
    <Field label="Courts you practise in (comma-separated, optional)" value={(draft.professional.courts ?? []).join(', ')} onChange={v => set('professional', {courts: list(v)})}/>
    <Field label="Languages (comma-separated, optional)" value={(draft.professional.languages ?? []).join(', ')} onChange={v => set('professional', {languages: list(v)})}/>
    {footer('bar-council')}</Screen>;
  if (step.route === 'bar-council') return <Screen title={title} fallback="/advocate/verify/professional">{banner}
    <Field label="State Bar Council" value={draft.bar_council.state ?? ''} onChange={v => set('bar_council', {state: v})} placeholder="e.g. Madhya Pradesh"/>
    <Field label="Enrolment number" value={draft.bar_council.number ?? ''} onChange={v => set('bar_council', {number: v})} placeholder="As printed on your certificate"/>
    <Field label="Enrolment year" value={draft.bar_council.enrolment_year == null ? '' : String(draft.bar_council.enrolment_year)} onChange={v => set('bar_council', {enrolment_year: num(v)})}/>
    <Note>Your enrolment number is a public professional identifier and is stored as you enter it.</Note>
    {footer('practice')}</Screen>;
  if (step.route === 'practice') return <Screen title={title} fallback="/advocate/verify/bar-council">{banner}
    <SectionLabel>PRACTICE AREAS</SectionLabel>
    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14}}>{PRACTICE_AREAS.map(a => { const on = (draft.practice.areas ?? []).includes(a);
      return <Pressable key={a} accessibilityRole="checkbox" accessibilityState={{checked: on}} disabled={!editable}
        onPress={() => set('practice', {areas: on ? (draft.practice.areas ?? []).filter(x => x !== a) : [...(draft.practice.areas ?? []), a]})}
        style={{paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: on ? ink.brown : ink.border, backgroundColor: on ? ink.chip : '#fff'}}>
        <Text style={{color: on ? ink.title : ink.muted}}>{a}</Text></Pressable>; })}</View>
    <Field label="City" value={draft.practice.city ?? ''} onChange={v => set('practice', {city: v})}/>
    <Field label="State (optional)" value={draft.practice.state ?? ''} onChange={v => set('practice', {state: v})}/>
    <Field label="About you (optional)" value={draft.practice.bio ?? ''} onChange={v => set('practice', {bio: v})} multiline/>
    {footer('documents')}</Screen>;
  if (step.route === 'documents') return <Screen title={title} fallback="/advocate/verify/practice">{banner}
    <Note>PDF, JPG or PNG up to 25 MB each. Files are visible only to you and Legalitt's review team. No numbers are read from your identity document.</Note>
    {VERIFICATION_DOCUMENTS.map(k => { const doc = state.documents.find(d => d.kind === k.kind);
      return <Card key={k.kind}><Row icon={doc ? FileText : Upload} title={k.label} subtitle={doc ? `${doc.filename}${doc.page_count ? ` · ${doc.page_count} page${doc.page_count > 1 ? 's' : ''}` : ''}` : k.hint} badge={doc ? 'Uploaded' : undefined}/>
        {doc && <Button title="View" variant="secondary" onPress={() => void run(async () => { const r = await backend.verificationDocumentUrl(doc.id); await Linking.openURL(r.url); })}/>}
        {editable && <Button title={doc ? 'Replace' : 'Upload'} disabled={busy} onPress={() => void run(async () => { if (await pickAndUpload(k.kind)) return backend.verification(); })}/>}
      </Card>; })}
    {!!error && <ErrorState message={error}/>}
    <Button title="Continue to Review" onPress={() => go('review')}/>
  </Screen>;
  // 239 review & submit
  return <Screen title={title} fallback="/advocate/verify/documents">{banner}
    <Summary details={state.details}/>
    <SectionLabel>DOCUMENTS</SectionLabel>
    <Card>{VERIFICATION_DOCUMENTS.map(k => { const doc = state.documents.find(d => d.kind === k.kind); return <Row key={k.kind} title={k.label} subtitle={doc?.filename} badge={doc ? 'Uploaded' : 'Missing'}/>; })}</Card>
    {state.problems.length ? <Card style={{borderColor: '#F3C9C5'}}><Text style={s.rowTitle}>Complete these before submitting</Text>
      {state.problems.map(p => <Body key={p.field}>• {p.message}</Body>)}<Button title="Go to steps" variant="secondary" onPress={() => go('intro')}/></Card> : null}
    {!!error && <ErrorState message={error}/>}
    {!confirm ? <Button title="Submit for verification" disabled={busy || !!state.problems.length || !editable} onPress={() => setConfirm(true)}/> : <Card>
      <Body>Submit for review? You can't edit your details or documents while Legalitt reviews them.</Body>
      <Button title={busy ? 'Submitting…' : 'Yes, submit'} disabled={busy} onPress={() => void run(() => backend.submitVerification()).then(() => setConfirm(false))}/>
      <Button title="Not yet" variant="secondary" onPress={() => setConfirm(false)}/></Card>}
  </Screen>;
}

function Summary({details: d}: {details: VerificationDetails}) {
  const rows: [string, string | null | undefined][] = [['Name', d.personal.full_name], ['Mobile', d.personal.phone],
    ['Years of practice', d.professional.years_experience == null ? null : String(d.professional.years_experience)], ['Education', d.professional.education],
    ['Bar Council', [d.bar_council.state, d.bar_council.number].filter(Boolean).join(' · ')], ['Enrolment year', d.bar_council.enrolment_year == null ? null : String(d.bar_council.enrolment_year)],
    ['Practice areas', d.practice.areas?.join(', ')], ['City', [d.practice.city, d.practice.state].filter(Boolean).join(', ')]];
  const shown = rows.filter(([, v]) => v && v.trim());
  return <><SectionLabel>YOUR DETAILS</SectionLabel><Card>{shown.length ? shown.map(([k, v]) => <Row key={k} title={v!} subtitle={k}/>) : <Body muted>No details entered yet.</Body>}</Card></>;
}

async function pickAndUpload(kind: string) {
  const picked = await DocumentPicker.getDocumentAsync({type: ['application/pdf', 'image/png', 'image/jpeg'], copyToCacheDirectory: true});
  if (picked.canceled) return false;
  const file = picked.assets[0], mime = file.mimeType ?? 'application/pdf';
  const ticket = await backend.presignVerificationDocument({kind, filename: file.name, mime});
  const form = new FormData();
  for (const [key, value] of Object.entries(ticket.upload.fields)) form.append(key, value as string);
  if (Platform.OS === 'web') form.append('file', await (await fetch(file.uri)).blob(), ticket.document.filename);
  else form.append('file', {uri: file.uri, name: ticket.document.filename, type: mime} as unknown as Blob);
  const response = await fetch(ticket.upload.url, {method: 'POST', body: form});
  if (!response.ok) throw new Error('Upload failed. Check your connection and retry.');
  await backend.completeVerificationDocument(ticket.document.id);
  return true;
}
