import { router, type Href } from 'expo-router';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, FilePen, FolderOpen, IdCard, Plus, ShieldCheck, SquarePen, UserRound, UserRoundX } from 'lucide-react-native';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { answerText, FirDraftEditableSchema, firEditableContent, type FirDraftContext, firLetterStatement } from '@legalitt/shared';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_GENERATOR as c } from '../../../data/advocateFir';
import { advFirGenerator as t, colors, font, ink, status } from '../../../constants/theme';
import { backend } from '../../../lib/auth';
import { backOr, useFirFlow } from '../../../features/fir/flow';
import {
  docSlot, draftListed, firRoute, incidentDate, incidentTime, InlineError, MovedOn, StateCard, toCases, useAction, useAdvocateCaseId, useFirRecord, withoutIdentity,
} from '../../../features/fir/advocate/common';

// FIR draft generator (design/217, flow A4), live in every data mode.
// Everything is pre-filled from the client's filing. [DECIDE] Generate with AI is
// disabled until FIR AI drafting (D-08) exists. Create Manually opens the proforma
// (A5); edits to What Happened and Other Information are saved as the draft's
// Statement of Facts first, so nothing typed here is lost. No identity document is
// listed or attached (ISHAAN-ANSWERS 2026-11-12 Q114).
const EDITABLE = ['advocate_accepted', 'in_progress', 'changes_requested'];

export default function AdvocateFirGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const caseId = useAdvocateCaseId();
  const f = useFirFlow(caseId);
  const rec = useFirRecord(caseId);
  const act = useAction();
  const flow = f.flow;
  const editable = !!flow && EDITABLE.includes(flow.status) && flow.sub_status !== 'awaiting_admin_approval';
  const [context, setContext] = useState<FirDraftContext | null>(null), [ctxError, setCtxError] = useState(''), [attempt, setAttempt] = useState(0);
  const [what, setWhat] = useState(''), [other, setOther] = useState(''), [seed, setSeed] = useState('');

  useEffect(() => {
    if (!caseId || !editable) return;
    let alive = true; setCtxError('');
    backend.firDraftContext(caseId).then(ctx => {
      if (!alive) return;
      // A4 shows the client's own words ("Client's original description"); a saved draft shows the advocate's text.
      const start = ctx.latest_content ? ctx.latest_content.statement_of_facts
        : [ctx.intake.incident.description, ctx.intake.incident.additional].map(v => v.trim()).filter(Boolean).join('\n\n');
      setContext(ctx); setSeed(start); setWhat(start); setOther('');
    }).catch(e => { if (alive) setCtxError(e instanceof Error ? e.message : 'Couldn’t load the client’s filing.'); });
    return () => { alive = false; };
  }, [caseId, editable, attempt]);

  const intake = context?.intake;
  const p = intake?.people.find(x => x.kind === 'complainant'), pd = p?.personal_details;
  const complainant = [
    { label: c.complainant.name, value: p?.name },
    { label: c.complainant.father, value: answerText(pd?.father_name) },
    { label: c.complainant.address, value: answerText(pd?.present_address) || p?.residence },
    { label: c.complainant.mobile, value: p?.phone || intake?.contact.mobile },
  ].filter(x => x.value?.trim());
  const cells = [
    { label: c.incident.date, value: incidentDate(intake?.incident.date), half: true },
    { label: c.incident.time, value: incidentTime(intake?.incident.time), half: true },
    { label: c.incident.place, value: intake?.incident.location, half: false },
    { label: c.incident.station, value: intake?.jurisdiction.policeStation || flow?.police_station, half: false },
  ].filter(x => x.value?.trim());
  const people = (intake?.people ?? []).map((person, n) => ({
    key: person.id ?? `${person.kind}-${n}`, kind: person.kind,
    name: person.unknown || !person.name.trim() ? c.people.unknown : person.name.trim(),
    role: person.kind === 'complainant' ? c.people.complainantRole : person.kind === 'accused' ? c.people.accused : person.role?.trim() || c.people.witness,
    chip: person.kind === 'complainant' ? c.people.complainant : person.kind === 'accused' ? c.people.accused : c.people.witness,
  }));
  const docs = useMemo(() => (rec.record?.documents ?? []).filter(draftListed), [rec.record]);
  const slots = [...new Set(docs.map(docSlot).filter(Boolean))].join(', ');
  const changed = what.trim() !== seed.trim() || !!other.trim();

  const create = () => void act.run(async () => {
    if (!caseId || !context) return;
    if (!changed) { router.push(firRoute(caseId, 'draft')); return; }
    const base = context.latest_content ? firEditableContent(context.latest_content) : context.initial_content;
    // A first version becomes the letter-style Statement of Facts (A5 section 6) around the advocate's edited text.
    const text = { ...base, statement_of_facts: context.latest_content ? [what.trim(), other.trim()].filter(Boolean).join('\n\n')
      : firLetterStatement({ ...context.intake, incident: { ...context.intake.incident, description: what.trim(), additional: other.trim() } }) };
    // A first version lists every upload, as the editor does; never an identity document.
    const draft = withoutIdentity(context.latest_content ? text : { ...text, attachment_ids: docs.map(d => d.id) }, rec.record ? docs : null);
    const parsed = FirDraftEditableSchema.safeParse(draft);
    if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join('\n'));
    await backend.saveFirDraft(caseId, { base_draft_id: context.latest_draft_id, filing_hash: context.filing_hash, content: parsed.data });
    router.push(firRoute(caseId, 'draft'));
  });

  let content;
  if (!caseId) content = <StateCard title="This link is missing its request ID." actionLabel="Back to Cases" onAction={toCases} />;
  else if (!flow) content = f.error ? <StateCard title="Couldn’t load this request." error={f.error} actionLabel="Retry" onAction={f.reload} secondaryLabel="Back to Cases" onSecondary={toCases} />
    : <StateCard loading title="Loading the request…" />;
  else if (!editable) content = <MovedOn caseId={caseId} stage={flow.stage} />;
  else if (!context) content = ctxError ? <StateCard title="Couldn’t load the client’s filing." error={ctxError} actionLabel="Retry" onAction={() => setAttempt(n => n + 1)} />
    : <StateCard loading title="Loading the client’s filing…" />;
  else content = <>
    <View style={styles.ready}><View style={styles.readyDot} /><Text style={styles.readyText} {...shrinkToFit(0.8)}>{c.readyChip}</Text></View>
    <Text style={styles.lead}>{c.lead}</Text>

    {!!complainant.length && <View style={styles.card}>
      <View style={styles.titleRow}><Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.complainant.title}</Text><IdCard size={t.titleIcon} color={colors.brandDark} /></View>
      {complainant.map((fl, i) => <Fragment key={fl.label}>
        {i > 0 && <View style={styles.divider} />}
        <View style={styles.field}><Text style={styles.fieldLabel} {...shrinkToFit(0.75)}>{fl.label}</Text><Text style={styles.fieldValue}>{fl.value}</Text></View>
      </Fragment>)}
    </View>}

    {!!cells.length && <View style={styles.card}>
      <View style={styles.titleRow}><Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.incident.title}</Text><CalendarDays size={t.titleIcon} color={colors.brandDark} /></View>
      <View style={styles.cells}>{cells.map(cell => <View key={cell.label} style={[styles.cell, cell.half ? styles.cellHalf : styles.cellFull]}>
        <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>{cell.label}</Text><Text style={styles.cellValue}>{cell.value}</Text>
      </View>)}</View>
    </View>}

    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.people.title}</Text>
        {!!people.length && <View style={styles.addedChip}><Text style={styles.addedChipText} {...shrinkToFit(0.8)}>{c.people.added(people.length)}</Text></View>}
      </View>
      {people.map((person, i) => {
        const accused = person.kind === 'accused';
        return <View key={person.key} style={[styles.person, i === 0 ? styles.personFirst : styles.personNext]}>
          <View style={[styles.personAvatar, accused && styles.personAvatarAccused]}>
            {accused ? <UserRoundX size={t.personAvatarGlyph} color={status.onRedContainer} /> : <UserRound size={t.personAvatarGlyph} color={colors.brandDark} />}
          </View>
          <View style={styles.personText}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={[styles.personRole, accused && styles.personRoleAccused]} {...shrinkToFit(0.8)}>{person.role}</Text>
          </View>
          <View style={[styles.personChip, accused && styles.personChipAccused]}><Text style={[styles.personChipText, accused && styles.personChipTextAccused]} {...shrinkToFit(0.75)}>{person.chip}</Text></View>
        </View>;
      })}
      {/* People are added in the proforma itself (A5 sections 4 and 7), so this opens it. */}
      <Pressable onPress={create} disabled={act.busy} accessibilityRole="button" accessibilityHint="Opens the FIR proforma, where accused persons and witnesses are added" style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
        <Plus size={t.addIcon} color={t.addColour} /><Text style={styles.addText} {...shrinkToFit(0.8)}>{c.people.add}</Text>
      </Pressable>
    </View>

    <View style={styles.card}>
      <View style={styles.titleRow}><Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.happened.title}</Text><SquarePen size={t.titleIcon} color={colors.brandDark} /></View>
      <Text style={styles.sub}>{context.latest_content ? c.happened.savedSub(context.latest_version) : c.happened.sub}</Text>
      <View style={styles.box}><TextInput accessibilityLabel={c.happened.title} style={[styles.boxInput, styles.statementInput]} value={what} onChangeText={setWhat} multiline maxLength={10000} textAlignVertical="top" /></View>
      <Text style={styles.count} {...shrinkToFit(0.8)}>{what.length} {c.happened.countSuffix}</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.other.title}</Text>
      <Text style={styles.sub}>{c.other.sub}</Text>
      <View style={styles.box}><TextInput accessibilityLabel={c.other.title} style={styles.boxInput} value={other} onChangeText={setOther} multiline maxLength={4000} textAlignVertical="top" placeholder={c.other.placeholder} placeholderTextColor={t.boxPlaceholderColour} /></View>
    </View>

    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.documents.title}</Text>
        {rec.record && <View style={styles.addedChip}><Text style={styles.addedChipText} {...shrinkToFit(0.8)}>{c.documents.attached(docs.length)}</Text></View>}
      </View>
      {rec.record ? (!!slots && <Text style={styles.sub}>{slots}</Text>) : rec.error ? <InlineError error={rec.error} onRetry={rec.reload} /> : <Text style={styles.sub}>Loading documents…</Text>}
      {/* from=generator: A3's Back and Continue return here, keeping the edits above. */}
      <Pressable accessibilityRole="button" onPress={() => router.push(`${firRoute(caseId, 'documents')}&from=generator` as Href)} style={({ pressed }) => [styles.viewDoc, pressed && styles.pressed]}>
        <FolderOpen size={t.viewDocIcon} color={colors.brandDark} />
        <Text style={styles.viewDocText} {...shrinkToFit(0.8)}>{c.documents.view}</Text>
        <ChevronRight size={t.viewDocChevron} color={colors.textPrimary} style={styles.viewDocChevron} />
      </Pressable>
    </View>

    <View style={styles.card}>
      <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>{c.create.title}</Text>
      <Text style={styles.sub}>{c.create.sub}</Text>
      <View style={styles.rules}>
        <View style={styles.rulesHead}><ShieldCheck size={t.rulesIcon} color={t.rulesTitleColour} /><Text style={styles.rulesTitle} {...shrinkToFit(0.8)}>{c.create.rulesTitle}</Text></View>
        {c.create.rules.map((r, i) => <View key={r} style={i === 0 ? styles.ruleFirst : styles.ruleNext}><Text style={styles.bullet}>•</Text><Text style={styles.ruleText}>{r}</Text></View>)}
      </View>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: true }} disabled style={[styles.action, styles.ai, styles.aiDisabled]}>
        <Text style={styles.aiText} {...shrinkToFit(0.8)}>{c.create.ai}</Text>
        <ArrowRight size={t.actionIcon} color={ink.onBrand} style={styles.actionIcon} />
      </Pressable>
      <Text style={styles.actionCap}>{c.create.aiSoon}</Text>
      <Pressable accessibilityRole="button" disabled={act.busy} onPress={create} style={({ pressed }) => [styles.action, styles.manual, styles.actionPair, pressed && styles.pressed, act.busy && { opacity: 0.6 }]}>
        <FilePen size={t.actionIcon} color={t.manualColour} />
        <Text style={styles.manualText} {...shrinkToFit(0.8)}>{act.busy ? 'Saving…' : c.create.manual}</Text>
      </Pressable>
      <Text style={styles.actionCap}>{c.create.manualCaption}</Text>
      <InlineError error={act.error} />
    </View>
  </>;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => caseId ? backOr(firRoute(caseId, 'documents')) : toCases()}>
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>{c.title}</Text>
        <View style={styles.avatar}><UserRound size={t.avatarGlyph} color={ink.onBrand} /></View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{content}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },

  ready: {
    marginTop: t.readyGap,
    alignSelf: 'flex-start',
    minHeight: t.readyHeight,
    borderRadius: t.readyRadius,
    backgroundColor: t.readyBg,
    paddingHorizontal: t.readyPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyDot: {
    width: t.readyDot,
    height: t.readyDot,
    borderRadius: t.readyDot / 2,
    backgroundColor: t.readyColour,
    marginRight: t.readyDotGap,
  },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, color: t.readyColour },
  lead: { marginTop: t.leadGap, fontFamily: font.appBody, fontSize: t.leadSize, color: t.leadColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, minWidth: 0, marginRight: 10, fontFamily: font.appHeading, fontSize: t.titleRowSize, color: colors.textPrimary },

  field: { marginTop: t.fieldGap },
  fieldLabel: {
    fontFamily: font.appSemi,
    fontSize: t.fieldLabelSize,
    letterSpacing: t.fieldLabelSpacing,
    color: t.fieldLabelColour,
  },
  fieldValue: {
    marginTop: t.fieldValueGap,
    fontFamily: font.appBody,
    fontSize: t.fieldValueSize,
    lineHeight: t.fieldValueLineHeight,
    color: colors.textPrimary,
  },
  divider: { marginTop: t.fieldDividerGap, height: 1, backgroundColor: t.fieldDivider },

  cells: { marginTop: t.cellGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.cellGapY },
  cell: { borderRadius: t.cellRadius, backgroundColor: t.cellBg, padding: t.cellPad },
  cellHalf: { width: '48%', flexGrow: 1 },
  cellFull: { width: '100%' },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: t.cellLabelColour },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    lineHeight: t.cellValueLineHeight,
    color: colors.textPrimary,
  },

  addedChip: {
    minHeight: t.addedChipHeight,
    borderRadius: t.addedChipRadius,
    backgroundColor: t.addedChipBg,
    paddingHorizontal: t.addedChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  addedChipText: { fontFamily: font.appSemi, fontSize: t.addedChipSize, color: t.addedChipColour },

  person: {
    borderRadius: t.personRadius,
    backgroundColor: t.personBg,
    padding: t.personPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personFirst: { marginTop: t.personGap },
  personNext: { marginTop: t.personGapY },
  personAvatar: {
    width: t.personAvatar,
    height: t.personAvatar,
    borderRadius: t.personAvatar / 2,
    backgroundColor: t.personAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarAccused: { backgroundColor: status.redContainer },
  personText: { flex: 1, minWidth: 0, marginHorizontal: t.personAvatarGap },
  personName: { fontFamily: font.appHeading, fontSize: t.personNameSize, color: colors.textPrimary },
  personRole: { marginTop: t.personRoleGap, fontFamily: font.appSemi, fontSize: t.personRoleSize, color: t.personRoleColour },
  personRoleAccused: { color: status.onRedContainer },
  personChip: {
    minHeight: t.personChipHeight,
    borderRadius: t.personChipRadius,
    backgroundColor: t.personChipBg,
    paddingHorizontal: t.personChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  personChipAccused: { backgroundColor: status.redContainer },
  personChipText: { fontFamily: font.appSemi, fontSize: t.personChipSize, color: t.personChipColour },
  personChipTextAccused: { color: status.onRedContainer },

  add: {
    marginTop: t.addGap,
    minHeight: t.addHeight,
    borderRadius: t.addRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.addBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { marginLeft: t.addIconGap, fontFamily: font.appHeading, fontSize: t.addSize, color: t.addColour },

  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: t.subColour },

  box: { marginTop: t.boxGap, borderRadius: t.boxRadius, backgroundColor: t.boxBg, padding: t.boxPad },
  boxInput: {
    minHeight: t.boxMinHeight,
    fontFamily: font.appBody,
    fontSize: t.boxSize,
    lineHeight: t.boxLineHeight,
    color: colors.textPrimary,
    padding: 0,
    outlineWidth: 0,
  },
  /** What Happened? is drawn about 5–6 lines tall (design 217); Other Information stays on boxMinHeight. */
  statementInput: { minHeight: t.statementMinHeight },
  count: { marginTop: t.countGap, alignSelf: 'flex-end', fontFamily: font.appSemi, fontSize: t.countSize, color: t.countColour },

  viewDoc: {
    marginTop: t.viewDocGap,
    minHeight: t.viewDocHeight,
    borderRadius: t.viewDocRadius,
    backgroundColor: t.viewDocBg,
    paddingHorizontal: t.viewDocPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDocText: { marginLeft: t.viewDocIconGap, flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: t.viewDocSize, color: colors.textPrimary },
  viewDocChevron: { marginLeft: 8 },

  rules: { marginTop: t.rulesGap, borderRadius: t.rulesRadius, backgroundColor: t.rulesBg, padding: t.rulesPad },
  rulesHead: { flexDirection: 'row', alignItems: 'center' },
  rulesTitle: { marginLeft: t.rulesIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rulesTitleSize, color: t.rulesTitleColour },
  ruleFirst: { marginTop: t.rulesListGap, flexDirection: 'row', alignItems: 'flex-start' },
  ruleNext: { marginTop: t.rulesItemGap, flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { width: t.rulesBulletGap + 4, fontFamily: font.appBody, fontSize: t.rulesSize, lineHeight: t.rulesLineHeight, color: t.rulesColour },
  ruleText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.rulesSize,
    lineHeight: t.rulesLineHeight,
    color: t.rulesColour,
  },

  action: {
    marginTop: t.actionGap,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionPair: { marginTop: t.actionPairGap },
  ai: { backgroundColor: t.aiBg },
  aiDisabled: { opacity: 0.45 },
  aiText: { fontFamily: font.appHeading, fontSize: t.actionSize, color: ink.onBrand, flexShrink: 1 },
  actionIcon: { marginLeft: t.actionIconGap },
  manual: { borderWidth: 1, borderColor: t.manualBorder },
  manualText: { marginLeft: t.actionIconGap, fontFamily: font.appHeading, fontSize: t.actionSize, color: t.manualColour, flexShrink: 1 },
  actionCap: {
    marginTop: t.actionCapGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.actionCapSize,
    lineHeight: t.actionCapLineHeight,
    color: t.actionCapColour,
  },
  pressed: { opacity: 0.85 },
});
