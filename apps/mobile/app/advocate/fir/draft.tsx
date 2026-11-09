import { previewNotice } from '../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  Check,
  Bookmark,
  ChevronLeft,
  Copy,
  Eye,
  FileText,
  FolderOpen,
  IdCard,
  Image as ImageIcon,
  Paperclip,
  Pencil,
  Save,
  Settings,
  Shield,
  SquarePen,
  Sparkles,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
} from 'lucide-react-native';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_DRAFT } from '../../../data/advocateFir';
import { advFirDraft as t, colors, font, ink } from '../../../constants/theme';
import { advDocHref } from '../../../data/docLinks';

// FIR draft — the FORM I police proforma (design/218).
//
// ⚠ THIS IS NOT components/LegalDocumentPage. That component is the Legalitt
// letterhead legal-notice form (designs 189 and 209) — a printed page with a
// branded header, ruled blanks and a disclaimer bar. design/218 is a Madhya Pradesh
// Police FORM I proforma: a numbered, eight-section editable form with labelled
// field boxes, removable legal-section tags and attached-document rows. Nothing
// below the title is shared, so this is built separately.
//
// ⚠ THE DOCKET JUMPS TO #FIR-2026-8841, with a "#", where designs 214/215/220 read
// FIR-2026-1048 unprefixed. See data/advocateFir.ts note 3.
//
// ⚠ THE NARRATIVE IS CUT OFF IN THE EXPORT. design/218 claims "158 Words" under a
// fixed-height box that clips mid-sentence at "...along with two". About 55 words
// are legible; the rest is not in the PNG. Rendered exactly as far as the export
// shows — nothing invented.
//
// ⚠ "4 Sections" here, "8 Legal Sections" on design/219.
//
// ⚠ "4 Included" documents, with a fourth set of names — and Case Papers.pdf is
// subtitled "Lease agreement executed copy", which does not match its name.
//
// design/447 is pixel-identical to218. Fields, chips, inclusion and add controls
// now use local state. The session cache lets View Draft reopen these edits;
// it is frontend memory only, not a backend save or AI generation.

const ICONS = { id: IdCard, copy: Copy, doc: FileText, image: ImageIcon, person: UserRoundPlus };

function Section({ n, title, note, noteGreen }: { n: string; title: string; note?: string; noteGreen?: boolean }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionNum}>
        <Text style={styles.sectionNumText} {...shrinkToFit(0.8)}>
          {n}
        </Text>
      </View>
      <Text style={styles.sectionTitle} {...shrinkToFit(0.7)}>
        {title}
      </Text>
      {note && (
        <Text style={[styles.sectionNote, noteGreen && styles.sectionNoteGreen]} {...shrinkToFit(0.75)}>
          {note}
        </Text>
      )}
    </View>
  );
}

type DraftDocument = {name: string; sub: string; icon: keyof typeof ICONS};
type DraftState = {
  fields: Record<string, string>;
  tags: string[];
  narrative: string;
  witnesses: string[];
  accused: string[];
  included: string[];
  documents: DraftDocument[];
};
const sessionDrafts = new Map<string, DraftState>();
function initialDraft(): DraftState {
  return {
    fields: Object.fromEntries(FIR_DRAFT.sections.flatMap(section => section.fields.map(field => [`${section.n}:${field.label}`, field.value]))),
    tags: [...FIR_DRAFT.legal.tags], narrative: FIR_DRAFT.facts.body,
    witnesses: FIR_DRAFT.witnesses.fields.map(field => field.value), accused: [],
    included: FIR_DRAFT.attached.rows.map(row => row.name), documents: [...FIR_DRAFT.attached.rows],
  };
}
function Field({ label, value, onChange, tint, icon }: { label: string; value: string; onChange: (value: string) => void; tint?: boolean; icon?: keyof typeof ICONS }) {
  const Icon = icon ? ICONS[icon] : null;
  return <View style={styles.field}>
    <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>{label}</Text>
    <View style={[styles.fieldBox, tint && styles.fieldBoxTint]}>
      {Icon && <Icon size={t.tintBoxIcon} color={colors.brandDark} style={styles.tintIcon}/>}
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} multiline={label === 'Home & Present Address'} style={[styles.fieldValue, {padding:0}]} />
    </View>
  </View>;
}

function FixtureAdvocateFirDraftScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const d = FIR_DRAFT;
  const sessionKey = id || d.docket;
  const [draft, setDraft] = useState<DraftState>(() => sessionDrafts.get(sessionKey) ?? initialDraft());
  const [addingSection, setAddingSection] = useState(false);
  const [sectionText, setSectionText] = useState('');
  const [saved, setSaved] = useState(false);
  const narrativeInput = useRef<TextInput>(null);
  useEffect(() => { sessionDrafts.set(sessionKey, draft); setSaved(false); }, [draft, sessionKey]);
  const fieldChange = (key: string, value: string) => setDraft(current => ({...current, fields: {...current.fields, [key]: value}}));
  const addSection = () => {
    if (!addingSection) { setAddingSection(true); return; }
    const value = sectionText.trim();
    if (value && !draft.tags.includes(value)) setDraft(current => ({...current, tags: [...current.tags, value]}));
    if (value) { setSectionText(''); setAddingSection(false); }
  };
  const attachDocument = () => {
    if (typeof document === 'undefined') { previewNotice(d.attached.add); return; }
    const input = document.createElement('input'); input.type = 'file'; input.multiple = true;
    input.onchange = () => {
      const rows = Array.from(input.files ?? []).map(file => ({name:file.name, sub:'', icon:'doc' as const}));
      setDraft(current => ({...current, documents:[...current.documents, ...rows.filter(row => !current.documents.some(doc => doc.name === row.name))], included:[...new Set([...current.included, ...rows.map(row => row.name)])]}));
    };
    input.click();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow} {...shrinkToFit(0.8)}>
            {d.eyebrow}
          </Text>
          <Text style={styles.title} {...shrinkToFit(0.75)}>
            {d.title}
          </Text>
        </View>
        <SquarePen size={t.headerIcon} color={colors.textPrimary} style={styles.headerIcon} />
        <Eye size={t.headerIcon} color={colors.textPrimary} style={styles.headerIcon} />
        <Bookmark size={t.headerIcon} color={colors.textPrimary} style={styles.headerIcon} />
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.statusRow}>
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText} {...shrinkToFit(0.8)}>
              {d.statusChip}
            </Text>
          </View>
          <Text style={styles.saved} {...shrinkToFit(0.75)}>
            {d.saved}
          </Text>
        </View>

        <View style={styles.docket}>
          <FolderOpen size={t.docketIcon} color={colors.brandDark} />
          <View style={styles.docketText}>
            <Text style={styles.docketTitle} {...shrinkToFit(0.75)}>
              {d.docket}
            </Text>
            <Text style={styles.docketSub} {...shrinkToFit(0.8)}>
              {d.docketSub}
            </Text>
          </View>
          <Settings size={t.docketCog} color={colors.textBody} />
        </View>

        {/* Static. No AI call is wired anywhere in this flow. */}
        <View style={styles.ai}>
          <Sparkles size={t.aiIcon} color={colors.brandDark} />
          <View style={styles.aiText}>
            <Text style={styles.aiTitle} {...shrinkToFit(0.8)}>
              {d.ai.title}
            </Text>
            <Text style={styles.aiBody}>{d.ai.body}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.crest}>
            <Shield size={t.crestGlyph} color={colors.brandDark} />
          </View>
          <Text style={styles.command} {...shrinkToFit(0.7)}>
            {d.proforma.command}
          </Text>
          <Text style={styles.firTitle} {...shrinkToFit(0.75)}>
            {d.proforma.title}
          </Text>
          <Text style={styles.form} {...shrinkToFit(0.7)}>
            {d.proforma.form}
          </Text>
          <Text style={styles.under} {...shrinkToFit(0.75)}>
            {d.proforma.under}
          </Text>

          {d.sections.map((s) => (
            <Fragment key={s.n}>
              <Section n={s.n} title={s.title} note={'note' in s ? s.note : undefined} />
              <View style={styles.fields}>
                {s.fields.map((f) => (
                  <View key={f.label} style={'half' in f && f.half ? styles.half : styles.full}>
                    <Field label={f.label} value={draft.fields[`${s.n}:${f.label}`]} onChange={value => fieldChange(`${s.n}:${f.label}`, value)} tint={'tint' in f ? f.tint : undefined} icon={'icon' in f ? f.icon : undefined} />
                  </View>
                ))}
              </View>
              {s.n === '4' && draft.accused.map((value, i) => <View key={i} style={styles.fields}><Field label="Main Accused Name" value={value} onChange={value => setDraft(current => ({...current, accused: current.accused.map((old, n) => n === i ? value : old)}))}/></View>)}
              {'add' in s && s.add && (
                <Pressable onPress={() => setDraft(current => ({...current, accused:[...current.accused, '']}))} accessibilityRole="button" style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
                  <UserRoundPlus size={t.addIcon} color={t.addColour} />
                  <Text style={styles.addText} {...shrinkToFit(0.8)}>
                    {s.add}
                  </Text>
                </Pressable>
              )}
            </Fragment>
          ))}

          <Section n={d.legal.n} title={d.legal.title} note={`${draft.tags.length} Sections`} />
          <Text style={styles.hint}>{d.legal.hint}</Text>
          <View style={styles.tags}>
            {draft.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} {...shrinkToFit(0.75)}>
                  {tag}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${tag}`} hitSlop={8} onPress={() => setDraft(current => ({...current, tags: current.tags.filter(value => value !== tag)}))}><X size={t.tagX} color={t.tagColour} style={styles.tagX}/></Pressable>
              </View>
            ))}
          </View>
          {addingSection && <TextInput autoFocus accessibilityLabel="Add Legal Section" value={sectionText} onChangeText={setSectionText} onSubmitEditing={addSection} placeholder={d.legal.add} style={[styles.fieldBox, styles.fieldValue]}/>}
          <Pressable onPress={addSection} accessibilityRole="button" style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {d.legal.add}
            </Text>
          </Pressable>

          <Section n={d.facts.n} title={d.facts.title} note={d.facts.note} />
          <View style={styles.narrative}>
            {/* ⚠ Cut off in the export at "...along with two". Nothing invented. */}
            <TextInput ref={narrativeInput} accessibilityLabel={d.facts.title} multiline value={draft.narrative} onChangeText={value => setDraft(current => ({...current,narrative:value}))} style={[styles.narrativeText, {height:t.narrativeMaxHeight-t.narrativePad*2,padding:0,textAlignVertical:'top'}]}/>
          </View>
          <View style={styles.narrativeFoot}>
            <Text style={styles.narrativeFootText} {...shrinkToFit(0.8)}>
              {draft.narrative === d.facts.body ? d.facts.foot : `${draft.narrative.trim().split(/\s+/).filter(Boolean).length} Words • Editable`}
            </Text>
            <Pressable onPress={() => narrativeInput.current?.focus()} accessibilityRole="button" style={styles.narrativeEdit}>
              <Pencil size={t.narrativeEditIcon} color={t.narrativeEditColour} />
              <Text style={styles.narrativeEditText} {...shrinkToFit(0.8)}>
                {d.facts.edit}
              </Text>
            </Pressable>
          </View>

          <Section n={d.witnesses.n} title={d.witnesses.title} />
          <View style={styles.fields}>
            {draft.witnesses.map((value, i) => <View key={i} style={styles.full}><Field label={`Witness ${i+1}`} value={value} onChange={value => setDraft(current => ({...current, witnesses:current.witnesses.map((old,n) => n===i ? value : old)}))}/></View>)}
          </View>
          <Pressable onPress={() => setDraft(current => ({...current, witnesses:[...current.witnesses,'']}))} accessibilityRole="button" style={({pressed}) => [styles.add, pressed && styles.pressed]}><UsersRound size={t.addIcon} color={t.addColour}/><Text style={styles.addText}>{d.witnesses.add}</Text></Pressable>

          <Section n={d.attached.n} title={d.attached.title} note={`${draft.included.length} Included`} noteGreen />
          {draft.documents.map((row, i) => {
            const Icon = ICONS[row.icon];
            return (
              <View key={row.name} style={[styles.doc, i === 0 ? styles.docFirst : null]}>
                <Pressable accessibilityRole="checkbox" accessibilityLabel={row.name} accessibilityState={{checked:draft.included.includes(row.name)}} onPress={() => setDraft(current => ({...current,included:current.included.includes(row.name)?current.included.filter(name=>name!==row.name):[...current.included,row.name]}))} style={[styles.docCheck,!draft.included.includes(row.name)&&{backgroundColor:'transparent',borderWidth:1,borderColor:t.docCheckBg}]}/>
                <Icon size={t.docIcon} color={colors.textPrimary} style={styles.docIcon} />
                <View style={styles.docText}>
                  <Text style={styles.docName} {...shrinkToFit(0.75)}>
                    {row.name}
                  </Text>
                  <Text style={styles.docSub} {...shrinkToFit(0.8)}>
                    {row.sub}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`View ${row.name}`}
                  hitSlop={8}
                  onPress={() => router.push(advDocHref(row.name) as Href)}
                >
                  <Eye size={t.docEye} color={colors.textPrimary} />
                </Pressable>
              </View>
            );
          })}
          <Pressable onPress={attachDocument} accessibilityRole="button" style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
            <Paperclip size={t.addIcon} color={t.addColour} />
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {d.attached.add}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Pressable accessibilityRole="button" accessibilityState={{selected:saved}} onPress={() => {sessionDrafts.set(sessionKey,draft);setSaved(true);}} style={({ pressed }) => [styles.btn, styles.save, pressed && styles.pressed]}>
            {saved ? <Check size={t.btnIcon} color={t.saveColour}/> : <Save size={t.btnIcon} color={t.saveColour}/>}
            <Text style={styles.saveText} {...shrinkToFit(0.8)}>
              {d.save}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/fir/review?id=${id ?? ''}` as Href)}
            style={({ pressed }) => [styles.btn, styles.send, pressed && styles.pressed]}
          >
            <Text style={styles.sendText} {...shrinkToFit(0.75)}>
              {d.send}
            </Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} style={styles.sendArrow} />
          </Pressable>
        </View>
        <Text style={styles.cap} {...shrinkToFit(0.75)}>
          {d.caption}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 10 },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowSpacing,
    color: t.eyebrowColour,
  },
  title: { marginTop: t.titleGap, fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  headerIcon: { marginRight: t.headerIconGap },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },

  statusRow: { marginTop: t.statusGap, flexDirection: 'row', alignItems: 'center' },
  status: {
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    backgroundColor: t.statusBg,
    paddingHorizontal: t.statusPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusDot: { width: t.statusDot, height: t.statusDot, borderRadius: t.statusDot / 2, backgroundColor: t.statusColour, marginRight: t.statusDotGap },
  statusText: { fontFamily: font.appSemi, fontSize: t.statusSize, color: colors.textPrimary },
  saved: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appBody, fontSize: t.savedSize, color: t.savedColour, flexShrink: 1 },

  docket: {
    marginTop: t.docketGap,
    borderRadius: t.docketRadius,
    backgroundColor: t.docketBg,
    padding: t.docketPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docketText: { flex: 1, minWidth: 0, marginHorizontal: t.docketIconGap },
  docketTitle: { fontFamily: font.appHeading, fontSize: t.docketSize, color: colors.textPrimary },
  docketSub: { marginTop: t.docketSubGap, fontFamily: font.appBody, fontSize: t.docketSubSize, color: t.docketSubColour },

  ai: { marginTop: t.aiGap, borderRadius: t.aiRadius, backgroundColor: t.aiBg, padding: t.aiPad, flexDirection: 'row', alignItems: 'flex-start' },
  aiText: { flex: 1, minWidth: 0, marginLeft: t.aiIconGap },
  aiTitle: { fontFamily: font.appHeading, fontSize: t.aiTitleSize, color: colors.textPrimary },
  aiBody: { marginTop: t.aiBodyGap, fontFamily: font.appBody, fontSize: t.aiBodySize, lineHeight: t.aiBodyLineHeight, color: t.aiBodyColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  crest: {
    marginTop: t.crestGap,
    alignSelf: 'center',
    width: t.crest,
    height: t.crest,
    borderRadius: t.crest / 2,
    backgroundColor: t.crestBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  command: {
    marginTop: t.commandGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.commandSize,
    letterSpacing: t.commandSpacing,
    color: t.commandColour,
  },
  firTitle: { marginTop: t.firTitleGap, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.firTitleSize, color: colors.textPrimary },
  form: { marginTop: t.formGap, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.formSize, color: colors.textPrimary },
  under: { marginTop: t.underGap, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.underSize, color: t.underColour },

  sectionRow: { marginTop: t.sectionGap, flexDirection: 'row', alignItems: 'center' },
  sectionNum: {
    width: t.sectionNum,
    height: t.sectionNum,
    borderRadius: t.sectionNum / 2,
    backgroundColor: t.sectionNumBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumText: { fontFamily: font.appSemi, fontSize: t.sectionNumSize, color: t.sectionNumColour },
  sectionTitle: { marginLeft: t.sectionNumGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.sectionTitleSize, color: colors.textPrimary },
  sectionNote: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appSemi, fontSize: t.sectionNoteSize, color: t.sectionNoteColour, flexShrink: 1 },
  sectionNoteGreen: { color: t.sectionNoteGreen },

  fields: { marginTop: t.fieldGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.fieldGapY },
  full: { width: '100%' },
  half: { width: '48%', flexGrow: 1 },
  field: {},
  fieldLabel: { fontFamily: font.appSemi, fontSize: t.fieldLabelSize, color: t.fieldLabelColour },
  fieldBox: {
    marginTop: t.fieldBoxGap,
    borderRadius: t.fieldBoxRadius,
    borderWidth: 1,
    borderColor: t.fieldBoxBorder,
    backgroundColor: t.fieldBoxBg,
    paddingHorizontal: t.fieldBoxPadX,
    paddingVertical: t.fieldBoxPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldBoxTint: { backgroundColor: t.tintBoxBg, borderColor: t.tintBoxBg },
  tintIcon: { marginRight: t.tintBoxIconGap },
  fieldValue: { flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: t.fieldValueSize, lineHeight: t.fieldValueLineHeight, color: colors.textPrimary },

  hint: { marginTop: t.hintGap, fontFamily: font.appBody, fontSize: t.hintSize, lineHeight: t.hintLineHeight, color: t.hintColour },
  tags: { marginTop: t.tagGap, gap: t.tagGapY, alignItems: 'flex-start' },
  tag: {
    minHeight: t.tagHeight,
    borderRadius: t.tagRadius,
    backgroundColor: t.tagBg,
    paddingHorizontal: t.tagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  tagText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.tagSize, color: t.tagColour },
  tagX: { marginLeft: t.tagXGap },

  add: {
    marginTop: t.addGap,
    minHeight: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addText: { marginLeft: t.addIconGap, fontFamily: font.appHeading, fontSize: t.addSize, color: t.addColour, flexShrink: 1 },

  narrative: {
    marginTop: t.narrativeGap,
    borderRadius: t.narrativeRadius,
    borderWidth: 1,
    borderColor: t.fieldBoxBorder,
    padding: t.narrativePad,
    maxHeight: t.narrativeMaxHeight,
    overflow: 'hidden',
  },
  narrativeText: { fontFamily: font.appBody, fontSize: t.narrativeSize, lineHeight: t.narrativeLineHeight, color: colors.textPrimary },
  narrativeFoot: { marginTop: t.narrativeFootGap, flexDirection: 'row', alignItems: 'center' },
  narrativeFootText: { fontFamily: font.appBody, fontSize: t.narrativeFootSize, color: t.narrativeFootColour, flexShrink: 1 },
  narrativeEdit: { marginLeft: 'auto', paddingLeft: 8, flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  narrativeEditText: { marginLeft: t.narrativeEditIconGap, fontFamily: font.appSemi, fontSize: t.narrativeEditSize, color: t.narrativeEditColour, flexShrink: 1 },

  doc: { marginTop: t.docGapY, borderRadius: t.docRadius, backgroundColor: t.docBg, padding: t.docPad, flexDirection: 'row', alignItems: 'center' },
  docFirst: { marginTop: t.docGap },
  docCheck: { width: t.docCheck, height: t.docCheck, borderRadius: t.docCheckRadius, backgroundColor: t.docCheckBg },
  docIcon: { marginLeft: t.docCheckGap },
  docText: { flex: 1, minWidth: 0, marginHorizontal: t.docIconGap },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docSub: { marginTop: t.docSubGap, fontFamily: font.appBody, fontSize: t.docSubSize, color: t.docSubColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: t.barGapX },
  btn: {
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    paddingHorizontal: t.btnPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  save: { backgroundColor: t.saveBg },
  saveText: { marginLeft: t.btnIconGap, fontFamily: font.appHeading, fontSize: t.btnSize, color: t.saveColour, flexShrink: 1 },
  send: { flex: 1, backgroundColor: t.sendBg },
  sendText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand, flexShrink: 1 },
  sendArrow: { marginLeft: t.btnIconGap },
  cap: { marginTop: t.capGap, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, color: t.capColour },
  pressed: { opacity: 0.85 },
});
import FirAdvocate from '../../../features/fir/FirAdvocate';
import {DATA_SOURCE} from '../../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirAdvocate/> : <FixtureAdvocateFirDraftScreen/>; }
