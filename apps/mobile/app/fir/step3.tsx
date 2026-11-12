import type {FirPerson} from '@legalitt/shared';
import {
  ChevronDown, ChevronRight, ChevronUp, Eye, Gavel, IdCard, MapPin, Phone,
  SquarePen, Trash2, UserPlus, UserRoundCheck, UserRoundX, UsersRound, BadgeCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ConfirmModal from '../../components/ConfirmModal';
import FirShell from '../../components/FirShell';
import { colors, firStep3 as t, font, ink } from '../../constants/theme';
import {contactPhone,newFirPersonId,useFir} from '../../context/fir';
import {useSession} from '../../context/session';
import {IntakeBoundary,IntakeStatus} from '../../features/fir/IntakeBoundary';
import {firErrorStep} from '../../features/fir/intake/draft';
import {AccusedSheet,ComplainantSheet,WitnessSheet} from '../../features/fir/intake/PersonSheets';
import {ContinueButton,InlineError} from '../../features/fir/intake/ui';

type Editing = {person: FirPerson; isNew: boolean} | null;
const answer = (a: {status: string; value?: unknown} | null | undefined) => a?.status === 'provided' ? String(a.value) : '';

// Step 3 — People Involved (design/44, flow C5). Editing happens in bottom sheets
// (undrawn; see features/fir/intake/PersonSheets.tsx). Removing anyone asks first.
function FirStep3Screen() {
  const m = useFir();
  const { user } = useSession();
  const { form, errors } = m;
  const complainant = form.people.find((p) => p.kind === 'complainant');
  const accused = form.people.filter((p) => p.kind === 'accused');
  const witnesses = form.people.filter((p) => p.kind === 'witness');
  const [editing, setEditing] = useState<Editing>(null);
  const [removing, setRemoving] = useState<FirPerson | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [continuing, setContinuing] = useState(false);

  const save = (p: FirPerson) => {
    m.savePerson(p.kind === 'complainant' && !p.phone ? { ...p, phone: contactPhone(m.form.contact) } : p);
    setEditing(null);
    void m.flush();
  };
  const confirmRemove = () => {
    if (removing?.id) m.removePerson(removing.id);
    setRemoving(null);
    setEditing(null);
    void m.flush();
  };
  const addAccused = () => setEditing({ person: { id: newFirPersonId(), kind: 'accused', name: '', details: '', phone: '', unknown: false, primary: accused.length === 0 }, isNew: true });
  const addWitness = () => setEditing({ person: { id: newFirPersonId(), kind: 'witness', name: '', details: '', phone: '', role: '', key: false }, isNew: true });
  const cont = async () => { setContinuing(true); try { await m.next(3); } finally { setContinuing(false); } };

  const c = complainant, pd = c?.personal_details;
  const phone = c?.phone || contactPhone(form.contact);
  // Design 44's tick beside Contact: only when this is the number verified with a code at sign-in.
  const digits = (v: string | null | undefined) => (v ?? '').replace(/\D/g, '').slice(-10);
  const phoneVerified = !!user?.phoneVerified && digits(user.phone).length === 10 && digits(user.phone) === digits(phone);
  const rows: [string, string][] = c ? ([
    ['Full Name', c.name],
    ['Contact', phone],
    ['Father’s / Husband’s Name', answer(pd?.father_name)],
    ['Age', answer(pd?.age)],
    ['Gender', answer(pd?.gender)],
    ['Occupation', answer(pd?.occupation)],
  ] as [string, string][]).filter(([, v]) => v.trim()) : [];
  const residence = c?.residence || answer(pd?.present_address);
  const complainantIncomplete = !!(errors.complainant || errors.residence || Object.keys(errors).some((k) => k.startsWith('complainant_')));

  return (
    <FirShell step={3} title="People Involved" showHelp>
      <IntakeStatus step={3} />

      <View style={[styles.card, styles.firstCard]}>
        <View style={styles.headRow}>
          <View style={[styles.headIcon, styles.complainantIcon]}><UserRoundCheck size={t.headIconGlyph} color={ink.accent} /></View>
          <Text style={styles.headTitle}>Complainant</Text>
          <View style={styles.primaryChip}><View style={styles.primaryDot} /><Text style={styles.primaryChipText}>Primary (You)</Text></View>
          {c && (
            <Pressable accessibilityRole="button" accessibilityLabel="Edit complainant details" onPress={() => setEditing({ person: c, isNew: false })} style={styles.edit} hitSlop={8}>
              <SquarePen size={t.editIcon} color={ink.accent} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.panel}>
          {rows.length || residence ? (
            <>
              {rows.map(([label, value], i) => (
                <View key={label} style={[styles.panelRow, i > 0 && styles.panelRowSpaced]}>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowValue}>{value}{label === 'Contact' && phoneVerified ? ' ' : ''}{label === 'Contact' && phoneVerified && <BadgeCheck accessibilityLabel="Mobile number verified at sign-in" size={14} color={ink.accent} />}</Text>
                </View>
              ))}
              {residence ? (
                <>
                  <Text style={[styles.rowLabel, rows.length > 0 && styles.panelRowSpaced]}>Registered Residence</Text>
                  <Text style={styles.address}>{residence}</Text>
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.lineText}>Tap Edit to add your name, father’s or husband’s name, age, gender, occupation and address.</Text>
          )}
        </View>
        {complainantIncomplete ? <InlineError text="Some of your details are missing. Tap Edit and fill in every field." /> : null}
        <View style={styles.footRow}>
          <Gavel size={t.footIcon} color={colors.textBody} />
          <Text style={styles.footText}>Statutory Complainant / Informant under BNSS § 173</Text>
        </View>
      </View>

      <SectionHeading title="Accused / Opposite Party" count={accused.length} tone="accused" description="Add individuals or unknown suspects involved in the incident." />
      {!accused.length && (
        <Text style={[styles.empty, !!errors.accused && styles.emptyError]}>
          No one added yet. Add at least one person — if you don’t know who it was, tick Unknown.
        </Text>
      )}
      {accused.map((a) => {
        const open = !collapsed[a.id!];
        // An unknown person is titled by their alias / description (design 44's
        // "Unknown Caller / Impersonator"); the Alias row then only shows beside a name.
        const title = a.name || (a.unknown ? (a.alias || 'Unknown person') : 'Name not entered');
        const alias = a.name ? a.alias : '';
        return (
          <View key={a.id} style={styles.sectionCard}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${title}, ${open ? 'hide' : 'show'} details`} onPress={() => setCollapsed((v) => ({ ...v, [a.id!]: open }))} style={styles.headRow}>
              <View style={[styles.headIcon, styles.accusedIcon]}><UserRoundX size={t.headIconGlyph} color={ink.accent} /></View>
              <View style={styles.headText}>
                <Text style={styles.name}>{title}</Text>
                {a.primary ? <View style={styles.tag}><Text style={styles.tagText}>Primary Accused</Text></View> : null}
              </View>
              {open ? <ChevronUp size={t.nameChevron} color={colors.textBody} /> : <ChevronDown size={t.nameChevron} color={colors.textBody} />}
            </Pressable>
            {open && (a.phone || alias || a.residence) ? (
              <View style={styles.panel}>
                {a.phone ? <View style={styles.lineRow}><Phone size={t.lineIcon} color={colors.textBody} /><Text style={styles.lineText}>{a.phone}</Text></View> : null}
                {alias ? <View style={[styles.lineRow, a.phone ? styles.lineRowSpaced : null]}><IdCard size={t.lineIcon} color={colors.textBody} /><Text style={styles.lineText}>Alias: “{alias}”</Text></View> : null}
                {a.residence ? <View style={[styles.lineRow, a.phone || alias ? styles.lineRowSpaced : null]}><MapPin size={t.lineIcon} color={colors.textBody} /><Text style={styles.lineText}>{a.residence}</Text></View> : null}
              </View>
            ) : null}
            <InlineError text={errors[a.id!]} />
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${title}`} onPress={() => setRemoving(a)} style={styles.action} hitSlop={6}>
                <Trash2 size={t.actionIcon} color={t.removeColour} />
                <Text style={[styles.actionText, styles.removeText]}>Remove</Text>
              </Pressable>
              <Text style={styles.actionSep}>•</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit details of ${title}`} onPress={() => setEditing({ person: a, isNew: false })} style={styles.action} hitSlop={6}>
                <SquarePen size={t.actionIcon} color={colors.textPrimary} />
                <Text style={styles.actionText}>Edit Details</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      <InlineError text={errors.accused} />
      <AddButton icon={UserPlus} label="+ Add Accused / Opposite Party" onPress={addAccused} />

      <SectionHeading title="Witnesses" count={witnesses.length} description="Persons present during or immediately after the incident." />
      {!witnesses.length && <Text style={styles.empty}>No witnesses added. Add anyone who saw the incident.</Text>}
      {witnesses.map((w) => (
        <View key={w.id} style={styles.sectionCard}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Edit witness ${w.name || 'details'}`} onPress={() => setEditing({ person: w, isNew: false })} style={styles.headRow}>
            <View style={styles.headIcon}><Eye size={t.headIconGlyph} color={ink.accent} /></View>
            <View style={styles.headText}>
              <Text style={styles.name}>{w.name || 'Name not entered'}</Text>
              {w.key || w.role ? (
                <View style={styles.roleRow}>
                  {w.key ? <View style={styles.keyTag}><Text style={styles.keyTagText}>Key Witness</Text></View> : null}
                  {w.role ? <Text style={styles.roleText}>{w.key ? '• ' : ''}{w.role}</Text> : null}
                </View>
              ) : null}
            </View>
            <ChevronRight size={t.nameChevron} color={colors.textBody} />
          </Pressable>
          {w.phone || w.details ? (
            <View style={[styles.panel, styles.witnessPanel]}>
              {w.phone ? <View style={styles.lineRow}><Phone size={t.lineIcon} color={colors.textBody} /><Text style={styles.lineText}>{w.phone}</Text></View> : null}
              {w.details ? <Text style={[styles.presence, w.phone ? styles.presenceRight : null]}>{w.details}</Text> : null}
            </View>
          ) : null}
          <InlineError text={errors[w.id!]} />
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => setEditing({ person: w, isNew: false })} style={styles.action} hitSlop={6}>
              <SquarePen size={t.actionIcon} color={colors.textPrimary} />
              <Text style={styles.actionText}>Edit Statement Note</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <AddButton icon={UsersRound} label="+ Add Witness" onPress={addWitness} />

      {Object.keys(errors).some((k) => firErrorStep(k) === 3) ? <InlineError text="Some details are missing or need fixing. They’re marked above." style={styles.summaryError} /> : null}
      <ContinueButton label="Continue to Evidence & Documents" busy={continuing} onPress={() => void cont()} style={styles.button} />

      {editing?.person.kind === 'complainant' && <ComplainantSheet person={editing.person} isNew={false} onClose={() => setEditing(null)} onSave={save} />}
      {editing?.person.kind === 'accused' && <AccusedSheet person={editing.person} isNew={editing.isNew} onClose={() => setEditing(null)} onSave={save} onRemove={editing.isNew ? undefined : () => { const p = editing.person; setEditing(null); setRemoving(p); }} />}
      {editing?.person.kind === 'witness' && <WitnessSheet person={editing.person} isNew={editing.isNew} onClose={() => setEditing(null)} onSave={save} onRemove={editing.isNew ? undefined : () => { const p = editing.person; setEditing(null); setRemoving(p); }} />}
      <ConfirmModal
        visible={!!removing}
        icon={Trash2}
        title="Remove this person?"
        body={`${removing?.name || (removing?.unknown ? 'This unknown person' : 'This person')} will be removed from your request.`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </FirShell>
  );
}

function SectionHeading({ title, count, description, tone }: { title: string; count: number; description: string; tone?: 'accused' }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.countChip, tone === 'accused' && styles.countChipAccused]}>
          <Text style={[styles.countChipText, tone === 'accused' && styles.countChipTextAccused]}>{count} Added</Text>
        </View>
      </View>
      <Text style={styles.sectionDesc}>{description}</Text>
    </View>
  );
}

function AddButton({ icon: Icon, label, onPress }: { icon: typeof UserPlus; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
      <Icon size={t.addIcon} color={colors.textPrimary} />
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  firstCard: { marginTop: 0 },
  sectionCard: {
    marginTop: t.sectionCardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  headText: { flex: 1, minWidth: 0 },
  headIcon: {
    width: t.headIcon,
    height: t.headIcon,
    borderRadius: t.headIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.headIconGap,
  },
  complainantIcon: { backgroundColor: '#F6DFC6' },
  accusedIcon: { backgroundColor: '#FBF0E2' },
  headTitle: { fontFamily: font.appHeading, fontSize: t.headTitleSize, color: colors.textPrimary },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  primaryChip: {
    marginLeft: t.chipGap,
    height: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.primaryBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryDot: { width: t.chipDot, height: t.chipDot, borderRadius: t.chipDot / 2, backgroundColor: t.primaryDot, marginRight: t.chipDotGap },
  primaryChipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.primaryText },
  edit: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: t.editIconGap },
  editText: { fontFamily: font.appSemi, fontSize: t.editSize, color: ink.accent },
  panel: { marginTop: t.panelGap, borderRadius: t.panelRadius, backgroundColor: t.panelBg, padding: t.panelPad },
  witnessPanel: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  panelRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  panelRowSpaced: { marginTop: t.rowGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, color: colors.textPrimary },
  address: { marginTop: t.addressGap, fontFamily: font.appBody, fontSize: t.rowValueSize, lineHeight: t.addressLineHeight, color: colors.textPrimary },
  footRow: { marginTop: t.footGap, flexDirection: 'row', alignItems: 'flex-start', gap: t.footIconGap },
  footText: { flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: t.footSize, lineHeight: t.footLineHeight, color: colors.textBody },
  section: { marginTop: t.sectionGap },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontFamily: font.appHeading, fontSize: t.sectionSize, color: colors.textPrimary },
  countChip: {
    marginLeft: t.chipGap,
    height: t.tagHeight,
    borderRadius: t.tagHeight / 2,
    paddingHorizontal: t.tagPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  countChipAccused: { backgroundColor: t.tagBg },
  countChipText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: colors.textBody },
  countChipTextAccused: { color: t.tagText },
  sectionDesc: { marginTop: t.sectionDescGap, fontFamily: font.appBody, fontSize: t.sectionDescSize, lineHeight: t.sectionDescLineHeight, color: colors.textBody },
  empty: {
    marginTop: t.sectionCardGap,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DED6CC',
    padding: 16,
    fontFamily: font.appBody,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.textBody,
  },
  emptyError: { borderColor: '#B3261E' },
  tag: {
    marginTop: t.tagGap,
    alignSelf: 'flex-start',
    height: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.tagBg,
    justifyContent: 'center',
  },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: t.tagText },
  roleRow: { marginTop: t.roleGap, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  keyTag: { height: t.tagHeight, borderRadius: t.tagRadius, paddingHorizontal: t.tagPadX, backgroundColor: colors.iconChipBg, justifyContent: 'center' },
  keyTagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: colors.textPrimary },
  roleText: { marginLeft: 7, flexShrink: 1, fontFamily: font.appBody, fontSize: t.roleSize, color: colors.textBody },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: t.lineIconGap },
  lineRowSpaced: { marginTop: t.lineGap },
  lineText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.lineSize, color: colors.textPrimary },
  presence: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, color: colors.textBody },
  presenceRight: { marginLeft: 'auto', textAlign: 'right' },
  actions: { marginTop: t.actionsGap, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  action: { flexDirection: 'row', alignItems: 'center', gap: t.actionIconGap },
  actionText: { fontFamily: font.appSemi, fontSize: t.actionSize, color: colors.textPrimary },
  removeText: { color: t.removeColour },
  actionSep: { marginHorizontal: t.actionSepGap, fontFamily: font.appBody, fontSize: t.actionSize, color: colors.textMuted },
  add: {
    marginTop: t.addGap,
    height: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.addIconGap,
  },
  addText: { fontFamily: font.appSemi, fontSize: t.addSize, color: colors.textPrimary },
  summaryError: { marginTop: 32 },
  button: { marginTop: 32 },
  pressed: { opacity: 0.85 },
});
export default function LiveFirScreen() { return <IntakeBoundary step={3} title="People Involved"><FirStep3Screen/></IntakeBoundary>; }
