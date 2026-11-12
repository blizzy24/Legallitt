import { router } from 'expo-router';
import { ArrowRight, Bookmark, ChevronLeft, Eye, FolderOpen, Save, SquarePen, UserRound } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  acceptedFirIdentity, assembleFirDraft, firDraftProblems, FirDraftContentSchema, FirDraftEditableSchema, firEditableContent, firSectionLabel, maskedIdentity,
  type FirDraftContext, type FirDraftEditable,
} from '@legalitt/shared';

import { shrinkToFit } from '../../../constants/textFit';
import { advFirDraft as t, colors, ink } from '../../../constants/theme';
import { FIR_DRAFT as copy } from '../../../data/advocateFir';
import { backend } from '../../../lib/auth';
import { styles } from '../../../features/fir/draftStyles';
import { DraftEditor, DRAFT_SECTIONS } from '../../../features/fir/DraftEditor';
import { useFirFlow, viewDocument } from '../../../features/fir/flow';
import { hashRef } from '../../../features/fir/client/format';
import {
  compactReviewRoute, dayTime, InlineError, MovedOn, openPdf, pickAndUpload, Sheet, SheetButton, StateCard, toCases,
  useAction, useAdvocateCaseId, useAgo, useFirRecord, type FirDoc,
} from '../../../features/fir/advocate/common';

// FIR proforma editor (design/218, flow A5), live in every data mode.
// Save Draft (or the bookmark) saves a new version. Auto-save runs ~30 s after the
// last edit when the changes are well-formed: it updates this advocate's own unsent
// version in place (a first draft, or the first edit after a sent version, is saved
// as a new version), and never touches a version that was sent. Send for Review
// validates, saves if needed, sends and opens A6. Leaving with unsaved edits asks first.
const EDITABLE = ['advocate_accepted', 'in_progress', 'changes_requested'];
const AUTOSAVE_MS = 30_000;
const LISTED = (d: FirDoc) => d.status === 'uploaded' && !['fir_draft', 'fir_police_receipt'].includes(d.kind);
const issueText = (path: PropertyKey[], message: string) => `${path.map(String).join(' › ').replaceAll('_', ' ')}: ${message}`;

export default function AdvocateFirDraftScreen() {
  const insets = useSafeAreaInsets();
  const caseId = useAdvocateCaseId();
  const f = useFirFlow(caseId);
  const rec = useFirRecord(caseId);
  const flow = f.flow;
  const editable = !!flow && EDITABLE.includes(flow.status) && flow.sub_status !== 'awaiting_admin_approval';

  const [context, setContext] = useState<FirDraftContext | null>(null);
  const [value, setValue] = useState<FirDraftEditable | null>(null);
  const [ctxLoading, setCtxLoading] = useState(false), [ctxError, setCtxError] = useState('');
  const [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [autoSaving, setAutoSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null), [savedKind, setSavedKind] = useState<'manual' | 'auto'>('manual');
  const [problems, setProblems] = useState<string[]>([]);
  const [leaving, setLeaving] = useState(false), [reloading, setReloading] = useState(false), [outline, setOutline] = useState(false);
  const [attaching, setAttaching] = useState(false), [sending, setSending] = useState(false);
  const act = useAction(), sheetAct = useAction();
  const ago = useAgo(savedAt);
  const scroll = useRef<ScrollView>(null), cardY = useRef(0), sectionY = useRef<Record<number, number>>({});
  const generation = useRef(0), edits = useRef(0), seeded = useRef(false);
  // The context every save builds on, current even inside a save that waited for another.
  const ctxRef = useRef<FirDraftContext | null>(null), inflight = useRef<Promise<unknown> | null>(null);
  const putContext = (c: FirDraftContext | null) => { ctxRef.current = c; setContext(c); };

  const load = useCallback(async () => {
    if (!caseId) return;
    const token = ++generation.current;
    setCtxLoading(true); setCtxError('');
    try {
      const c = await backend.firDraftContext(caseId);
      if (token !== generation.current) return;
      ctxRef.current = c; setContext(c); setValue(c.latest_content ? firEditableContent(c.latest_content) : c.initial_content);
      seeded.current = !!c.latest_content; setDirty(false); setProblems([]);
      setSavedAt(c.latest_content?.filing_snapshot.captured_at ?? null); setSavedKind('manual');
    } catch (e) { if (token === generation.current) setCtxError(e instanceof Error ? e.message : 'Couldn’t load the draft.'); }
    finally { if (token === generation.current) setCtxLoading(false); }
  }, [caseId]);
  useEffect(() => { if (editable && !context && !ctxLoading && !ctxError) void load(); }, [editable, context, ctxLoading, ctxError, load]);
  useEffect(() => () => { generation.current++; }, []);
  useEffect(() => {
    if (Platform.OS !== 'web' || !dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    globalThis.addEventListener('beforeunload', warn);
    return () => globalThis.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const documents = useMemo(() => (rec.record?.documents ?? []).filter(LISTED), [rec.record]);
  const identityDocs = useMemo(() => context ? documents.filter(d => acceptedFirIdentity(context.identity_policy, d)) : [], [context, documents]);
  // A first draft lists every upload; the advocate unticks what stays out of the dossier.
  useEffect(() => {
    if (seeded.current || !context || !rec.record) return;
    seeded.current = true;
    setValue(v => v && !v.attachment_ids.length ? { ...v, attachment_ids: documents.map(d => d.id) } : v);
  }, [context, rec.record, documents]);
  // The single accepted identity upload is the draft's ID; it is always attached.
  const effective = useMemo(() => {
    if (!value) return null;
    let v = value;
    if (!v.identity_document_id && identityDocs.length === 1) v = { ...v, identity_document_id: identityDocs[0].id };
    if (v.identity_document_id && !v.attachment_ids.includes(v.identity_document_id)) v = { ...v, attachment_ids: [...v.attachment_ids, v.identity_document_id] };
    return v;
  }, [value, identityDocs]);
  const identityLabel = useCallback((doc: FirDoc) => {
    const type = context?.identity_policy.accepted_documents.find(x => x.code === doc.identity_evidence?.document_type)?.label ?? 'Identity Proof';
    return `${type} (${maskedIdentity(doc.identity_last4) ?? 'masked'})`;
  }, [context]);

  const edit = (patch: Partial<FirDraftEditable>) => { edits.current++; setValue(v => v ? { ...v, ...patch } : v); setDirty(true); setProblems([]); };

  function computeProblems(): string[] {
    if (!caseId || !context || !effective || !rec.record) return ['The draft is still loading.'];
    const parsed = FirDraftEditableSchema.safeParse(effective);
    if (!parsed.success) return parsed.error.issues.map(i => issueText(i.path, i.message));
    const out: string[] = [];
    const docs = rec.record.documents ?? [];
    const attachments = parsed.data.attachment_ids.flatMap(id => {
      const doc = docs.find(d => d.id === id && d.status === 'uploaded');
      return doc ? [{ document_id: doc.id, filename: doc.filename, mime_type: doc.mime_type as 'application/pdf' }] : [];
    });
    if (attachments.length !== parsed.data.attachment_ids.length) out.push('Untick documents that are no longer available.');
    if (parsed.data.identity_document_id && !docs.some(d => d.id === parsed.data.identity_document_id && acceptedFirIdentity(context.identity_policy, d)))
      out.push('The selected identity document isn’t an accepted identity upload.');
    try { out.push(...firDraftProblems(assembleFirDraft(caseId, context.intake, context.filing_hash, new Date().toISOString(), parsed.data, attachments)).map(p => p.message)); }
    catch (e) { out.push(e instanceof Error ? e.message : 'The draft couldn’t be checked.'); }
    return out;
  }
  const showProblems = (list: string[]) => { setProblems(list); setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60); };

  /** Saves the editor. `auto`: the flow A5 auto-save, in place when the working version allows it. */
  async function save(auto = false): Promise<{ id: string; version: number }> {
    // One save at a time: a tap waits for an auto-save in flight, then builds on its result.
    while (inflight.current) await inflight.current.catch(() => undefined);
    const ctx = ctxRef.current;
    if (!caseId || !ctx || !effective) throw new Error('The draft is still loading.');
    const parsed = FirDraftEditableSchema.safeParse(effective);
    if (!parsed.success) throw new Error(parsed.error.issues.map(i => issueText(i.path, i.message)).join('\n'));
    const unchanged = !!ctx.latest_draft_id && !!ctx.latest_content && !ctx.requires_new_version
      && JSON.stringify(firEditableContent(ctx.latest_content)) === JSON.stringify(parsed.data);
    if (unchanged) { setDirty(false); return { id: ctx.latest_draft_id!, version: ctx.latest_version }; }
    // In place only for this advocate's own version that was never sent (the API checks again).
    const inPlace = auto && !!ctx.latest_draft_id && !!ctx.latest_content && !ctx.requires_new_version && ctx.legacy_content === null;
    const started = edits.current;
    const run = (async () => {
      const saved = await backend.saveFirDraft(caseId, {
        base_draft_id: ctx.latest_draft_id, filing_hash: ctx.filing_hash, content: parsed.data,
        ...(inPlace ? { autosave: true, base_saved_at: ctx.latest_content!.filing_snapshot.captured_at } : {}),
      });
      // Parsed so the stored JSON compares key-for-key with the editor next time.
      const stored = FirDraftContentSchema.safeParse(saved.content);
      putContext({ ...ctx, latest_draft_id: saved.id, latest_version: saved.version, latest_content: stored.success ? stored.data : saved.content, legacy_content: null, requires_new_version: false });
      setSavedAt(saved.content.filing_snapshot.captured_at); setSavedKind(auto ? 'auto' : 'manual');
      if (edits.current === started) setDirty(false);
      f.reload();
      return saved;
    })();
    inflight.current = run;
    if (auto) setAutoSaving(true); else setSaving(true);
    try { return await run; }
    finally { if (inflight.current === run) inflight.current = null; if (auto) setAutoSaving(false); else setSaving(false); }
  }
  async function autosave() {
    if (!effective || act.busy || leaving || !FirDraftEditableSchema.safeParse(effective).success) return;
    try { await save(true); if (act.error.startsWith('Auto-save')) act.setError(''); }
    catch (e) { act.setError(`Auto-save didn’t complete. ${e instanceof Error ? e.message : 'Use Save Draft.'}`); }
  }
  const autosaveRef = useRef(autosave); autosaveRef.current = autosave;
  const ready = editable && !!context && !!effective && !!rec.record;
  // Flow A5: ~30 s after the last edit. Any new edit, or a tap in progress, restarts the wait.
  useEffect(() => {
    if (!dirty || !ready || act.busy) return;
    const timer = setTimeout(() => void autosaveRef.current(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [dirty, effective, ready, act.busy]);

  const onSave = () => void act.run(() => save());
  const onPreview = () => void act.run(async () => {
    const list = computeProblems(); if (list.length) { showProblems(list); return; }
    const saved = await save(); const pdf = await backend.previewFirDraft(caseId!, saved.id); await openPdf(pdf.filename, pdf.pdf_base64);
  });
  // Flow A5: straight to A6. The Preview eye is where the PDF is checked before sending.
  const onSend = () => void act.run(async () => {
    const list = computeProblems(); if (list.length) { showProblems(list); return; }
    setSending(true);
    try {
      const saved = await save();
      await backend.sendFirDraft(caseId!, saved.id);
      setDirty(false); router.replace(compactReviewRoute(caseId!));
    } finally { setSending(false); }
  });
  const attach = () => void act.run(async () => {
    if (!caseId || !effective) return;
    setAttaching(true);
    try {
      const doc = await pickAndUpload(caseId, 'supporting_document');
      if (!doc) return;
      rec.setRecord(r => r ? { ...r, documents: [...(r.documents ?? []), doc] } : r);
      edit({ attachment_ids: [...effective.attachment_ids, doc.id] });
    } finally { setAttaching(false); }
  });
  const back = () => { if (dirty) { sheetAct.setError(''); setLeaving(true); } else toCases(); };
  const jump = (n: number) => { setOutline(false); scroll.current?.scrollTo({ y: Math.max(0, cardY.current + (sectionY.current[n] ?? 0) - 12), animated: true }); };

  // The latest return or change request stays at the top until the next version is sent (A5).
  const feedback = flow && editable ? flow.reviews[flow.reviews.length - 1] : undefined;
  const showFeedback = feedback && feedback.decision !== 'approved' ? feedback : undefined;

  let body: ReactNode;
  if (!caseId) body = <StateCard title="This link is missing its request ID." actionLabel="Back to Cases" onAction={toCases} />;
  else if (!flow) body = f.error ? <StateCard title="Couldn’t load this request." error={f.error} actionLabel="Retry" onAction={f.reload} secondaryLabel="Back to Cases" onSecondary={toCases} />
    : <StateCard loading title="Loading the FIR draft…" />;
  else if (!editable) body = <MovedOn caseId={caseId} stage={flow.stage} />;
  else if (!context || !rec.record) body = ctxError || (rec.error && !rec.record)
    ? <StateCard title="Couldn’t load the draft." error={ctxError || rec.error} actionLabel="Retry" onAction={() => { rec.reload(); setCtxError(''); }} />
    : <StateCard loading title="Loading the draft and the client’s filing…" />;
  else body = <>
    {showFeedback && <View style={styles.feedback}>
      <Text style={styles.feedbackTitle}>{showFeedback.role === 'client' ? 'Client requested changes' : 'Returned by Legalitt admin'}</Text>
      <Text style={styles.feedbackMeta}>{[showFeedback.version ? `Draft v${showFeedback.version}` : '', dayTime(showFeedback.created_at)].filter(Boolean).join(' • ')}</Text>
      {!!showFeedback.sections.length && <Text style={styles.feedbackMeta}>Sections: {showFeedback.sections.map(firSectionLabel).join(' · ')}</Text>}
      {!!showFeedback.comment?.trim() && <Text style={styles.feedbackBody}>{showFeedback.comment.trim()}</Text>}
      {showFeedback.attachment && <Pressable accessibilityRole="button" onPress={() => void act.run(() => viewDocument(showFeedback.attachment!.id))}><Text style={styles.feedbackLink}>View attachment: {showFeedback.attachment.filename}</Text></Pressable>}
    </View>}
    {context.legacy_content !== null && <StateCard title="The previous draft uses an older format" body="Review it against the form below; saving creates a new version in the current format." />}
    <View onLayout={e => { cardY.current = e.nativeEvent.layout.y; }}>
      <DraftEditor context={context} value={effective!} onChange={edit} documents={documents} identityDocs={identityDocs} identityLabel={identityLabel}
        viewDocument={id => void act.run(() => viewDocument(id))} attach={attach} attaching={attaching} onSectionLayout={(n, y) => { sectionY.current[n] = y; }} />
    </View>
    {!!problems.length && <View style={styles.problems} accessibilityLiveRegion="polite">
      <Text style={styles.problemsTitle}>Complete these before sending</Text>
      {problems.map((p, n) => <Text key={n} style={styles.problem}>• {p}</Text>)}
    </View>}
  </>;

  const status = !ready ? '' : saving ? 'Saving…' : autoSaving ? 'Auto-saving…' : dirty ? 'Unsaved changes'
    : savedAt ? (savedKind === 'auto' ? copy.autoSaved(ago) : copy.saved(ago)) : 'Not saved yet';
  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={back}><ChevronLeft size={t.backIcon} color={colors.textPrimary} /></Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow} {...shrinkToFit(0.8)}>{copy.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.75)}>{copy.title}</Text>
        </View>
        {ready && <>
          <Pressable accessibilityRole="button" accessibilityLabel="Outline" accessibilityState={{ expanded: outline }} hitSlop={8} onPress={() => setOutline(o => !o)}><SquarePen size={t.headerIcon} color={colors.textPrimary} style={styles.headerIcon} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Preview PDF" hitSlop={8} disabled={act.busy} onPress={onPreview}><Eye size={t.headerIcon} color={colors.textPrimary} style={styles.headerIcon} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Save Draft" hitSlop={8} disabled={act.busy} onPress={onSave}><Bookmark size={t.headerIcon} color={colors.textPrimary} style={styles.headerIcon} /></Pressable>
        </>}
        <View style={styles.avatar}><UserRound size={t.avatarGlyph} color={ink.onBrand} /></View>
      </View>

      <ScrollView ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {outline && ready && <View style={styles.outline}>{DRAFT_SECTIONS.map((title, i) =>
          <Pressable key={title} accessibilityRole="button" onPress={() => jump(i + 1)} style={styles.outlineRow}>
            <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{i + 1}</Text></View><Text style={styles.outlineText}>{title}</Text>
          </Pressable>)}</View>}
        {ready && flow && <>
          <View style={styles.statusRow}>
            <View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText} {...shrinkToFit(0.8)}>{flow.stage.advocate.chip}</Text></View>
            <Text style={styles.saved} accessibilityLiveRegion="polite" {...shrinkToFit(0.75)}>{status}</Text>
          </View>
          <View style={styles.docket}>
            <FolderOpen size={t.docketIcon} color={colors.brandDark} />
            <View style={styles.docketText}>
              <Text style={styles.docketTitle} {...shrinkToFit(0.75)}>{copy.docket} {hashRef(flow.reference)}</Text>
              {!!flow.police_station && <Text style={styles.docketSub} {...shrinkToFit(0.8)}>{flow.police_station}</Text>}
            </View>
          </View>
        </>}
        {body}
      </ScrollView>

      {ready && <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barError}><InlineError error={act.error} retryLabel="Reload saved draft" onRetry={/newer|another session|changed/i.test(act.error) ? () => setReloading(true) : undefined} /></View>
        <View style={styles.barRow}>
          <Pressable accessibilityRole="button" disabled={act.busy} onPress={onSave} style={({ pressed }) => [styles.btn, styles.save, pressed && styles.pressed, act.busy && { opacity: 0.6 }]}>
            <Save size={t.btnIcon} color={t.saveColour} />
            <Text style={styles.saveText} {...shrinkToFit(0.8)}>{saving ? 'Saving…' : copy.save}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={act.busy} onPress={onSend} style={({ pressed }) => [styles.btn, styles.send, pressed && styles.pressed, act.busy && { opacity: 0.6 }]}>
            <Text style={styles.sendText} {...shrinkToFit(0.75)}>{sending && !saving ? 'Sending…' : copy.send}</Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} style={styles.sendArrow} />
          </Pressable>
        </View>
        <Text style={styles.cap} {...shrinkToFit(0.75)}>{copy.caption}</Text>
      </View>}

      <Sheet visible={leaving} title="Save changes?" body="You have edits that aren’t saved yet." onClose={() => !sheetAct.busy && setLeaving(false)}>
        <InlineError error={sheetAct.error} />
        <SheetButton label={sheetAct.busy ? 'Saving…' : 'Save and leave'} disabled={sheetAct.busy} onPress={() => void sheetAct.run(async () => { await save(); setLeaving(false); toCases(); })} />
        <SheetButton label="Discard changes" tone="danger" disabled={sheetAct.busy} onPress={() => { setDirty(false); setLeaving(false); toCases(); }} />
        <SheetButton label="Keep editing" tone="neutral" disabled={sheetAct.busy} onPress={() => setLeaving(false)} />
      </Sheet>

      {/* A save refused because another session saved first offers a clean reload. */}
      <Sheet visible={reloading} title="Reload the saved draft?" body="This replaces your unsaved edits with the latest saved version." onClose={() => setReloading(false)}>
        <SheetButton label="Reload saved draft" tone="danger" onPress={() => { setReloading(false); act.setError(''); seeded.current = false; putContext(null); }} />
        <SheetButton label="Keep my edits" tone="neutral" onPress={() => setReloading(false)} />
      </Sheet>
    </View>
  );
}
