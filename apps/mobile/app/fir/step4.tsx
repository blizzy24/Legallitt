import {FIR_CUSTOM_SLOT_KIND,FIR_UPLOAD_SLOTS} from '@legalitt/shared';
import {
  Camera,
  Eye,
  FileText,
  FileUp,
  FolderOpen,
  FolderPlus,
  ImagePlus,
  Images,
  MessageSquare,
  Music,
  Paperclip,
  Plus,
  Trash2,
  Video,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ConfirmModal from '../../components/ConfirmModal';
import FirShell from '../../components/FirShell';
import LabelledField from '../../components/LabelledField';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firStep4 as t, font, ink } from '../../constants/theme';
import {useFir} from '../../context/fir';
import {designSubstitutions as copy} from '../../copy/substitutions';
import {IntakeBoundary,IntakeStatus} from '../../features/fir/IntakeBoundary';
import {formatSize} from '../../features/fir/flow';
import {openDocument} from '../../features/fir/shared';
import {acceptLabel,pickAndUpload,type FirDocument} from '../../features/fir/intake/upload';
import {ContinueButton,InlineError,Sheet} from '../../features/fir/intake/ui';
import { backend } from '../../lib/auth';
import { DATA_SOURCE } from '../../lib/data-source';

// FIR step 4 — Documents & Evidence (design/45, flow C6).
//
// Removed per the flow: VERIFIED, SHA-256 / timestamp claims, the chain-of-custody
// strip ("Compliant", "AES-256 Cipher") and the encrypted-session footer; the
// subtitle drops only "verified" (copy[45].subtitle). The summary shows only the
// file count and total size; file rows show the size, as drawn.
// No identity proof is collected (ISHAAN-ANSWERS 2026-11-12 Q114: no Aadhaar /
// PAN at all), so Continue needs only a primary document and an older case's ID
// upload is never listed. Custom categories follow the four slots (5, 6, …) and
// are named by the client. Continue always reads "Continue Draft", also when
// opened from Review (Continue then returns there).

type SlotKind = (typeof FIR_UPLOAD_SLOTS)[number]['kind'];
const SLOT_ART: Record<SlotKind, {icon: LucideIcon; description: string; action: string}> = {
  fir_primary: {icon: FileText, description: 'Agreements, legal notices, receipts & stamps', action: 'Upload Document'},
  fir_scene: {icon: Camera, description: 'Geo-tagged photos, CCTV clips, or physical damage', action: 'Tap to Add Photo or Incident Media'},
  fir_communications: {icon: MessageSquare, description: 'WhatsApp logs, emails, SMS threats or notices', action: 'Upload Document'},
  fir_other: {icon: FolderOpen, description: 'Audio recordings, bank statements, affidavits', action: 'Attach Additional Documentation'},
};
const CUSTOM_ACCEPT = ['application/pdf', 'image/jpeg', 'image/png'] as const;
const FULL_ID = /(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/;
const files = (n: number) => `${n} ${n === 1 ? 'File' : 'Files'}`;
const fileIcon = (mime: string): LucideIcon => mime === 'application/pdf' ? FileText : mime === 'video/mp4' ? Video : mime === 'audio/mpeg' ? Music : Images;

/** Which card a stored document belongs to. Older "supporting_document" uploads sit in slot 4. */
function slotOf(d: FirDocument): string {
  if (d.kind === FIR_CUSTOM_SLOT_KIND) return `custom:${d.slot_label || 'Other category'}`;
  return FIR_UPLOAD_SLOTS.some((s) => s.kind === d.kind) ? d.kind : 'fir_other';
}

function FirStep4Screen() {
  const m = useFir();
  const docs = ((m.record?.documents ?? []) as FirDocument[]).filter((d) => d.kind !== 'id_proof');
  const [busySlot, setBusySlot] = useState<string | null>(null), [busyLabel, setBusyLabel] = useState(''), [slotErrors, setSlotErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<FirDocument | null>(null);
  const [customNames, setCustomNames] = useState<string[]>([]), [naming, setNaming] = useState(false);
  const [tried, setTried] = useState(false), [continuing, setContinuing] = useState(false);
  const canUpload = DATA_SOURCE === 'api' && !!m.record;

  const bySlot = (slot: string) => docs.filter((d) => slotOf(d) === slot);
  const customSlots = [...new Set([...docs.filter((d) => d.kind === FIR_CUSTOM_SLOT_KIND).map((d) => d.slot_label || 'Other category'), ...customNames])];
  const primaryOk = bySlot('fir_primary').length > 0;
  const totalBytes = docs.reduce((n, d) => n + Number(d.size_bytes ?? 0), 0);

  /** Runs one slot's upload / delete / view and keeps its error beside that slot. */
  const run = async (slot: string, action: () => Promise<unknown>, label = 'Uploading your file…', refresh = true) => {
    if (busySlot) return;
    setBusySlot(slot);
    setBusyLabel(label);
    setSlotErrors((e) => ({ ...e, [slot]: '' }));
    let done: unknown;
    try {
      done = await action();
    } catch (cause) {
      setSlotErrors((e) => ({ ...e, [slot]: `${cause instanceof Error ? cause.message : 'That didn’t work.'} Try again.` }));
      setBusySlot(null);
      return;
    }
    if (refresh && done !== null) {
      try { await m.refresh(); } catch { setSlotErrors((e) => ({ ...e, [slot]: 'The file list couldn’t be refreshed. Check your connection and reopen this step.' })); }
    }
    setBusySlot(null);
  };
  const upload = (slot: string, kind: string, accept: readonly string[], slotLabel?: string) =>
    void run(slot, () => pickAndUpload({ caseId: m.record!.id, kind, accept, slotLabel }));
  const remove = async () => {
    const d = deleting;
    setDeleting(null);
    if (d) await run(slotOf(d), () => backend.deleteDocument(d.id), 'Deleting the file…');
  };
  const cont = async () => {
    setTried(true);
    if (!primaryOk) return;
    setContinuing(true);
    try { await m.next(4); } finally { setContinuing(false); }
  };

  const rows = (list: FirDocument[], slot: string) => list.map((d) => {
    return (
      <FileRow
        key={d.id}
        icon={fileIcon(d.mime_type)}
        name={d.filename}
        meta={formatSize(d.size_bytes)}
        disabled={!!busySlot}
        onView={() => void run(slot, () => openDocument(d.id), 'Opening the file…', false)}
        onRemove={() => setDeleting(d)}
      />
    );
  });
  const busyLine = (slot: string) => busySlot === slot ? <Text role="status" style={styles.busy}>{busyLabel}</Text> : null;

  return (
    <FirShell step={4} title="FIR Draft">
      <IntakeStatus step={4} />
      <Text style={styles.heading}>Documents &amp; Evidence</Text>
      <Text style={styles.subtitle}>{copy[45].subtitle}</Text>
      {!canUpload ? <InlineError text="Uploads need a saved request. Open your request from the FIR Draft Service page to add files." /> : null}

      {FIR_UPLOAD_SLOTS.map((slot, i) => {
        const list = bySlot(slot.kind), art = SLOT_ART[slot.kind], full = list.length >= slot.max;
        const state = slot.required ? { text: 'Required', pill: true }
          : slot.kind === 'fir_scene' ? { text: `${list.length} / ${slot.max} Attached`, pill: false }
          : list.length ? { text: files(list.length), pill: true } : { text: 'Optional', pill: false };
        return (
          <Section key={slot.kind} icon={art.icon} number={i + 1} title={slot.title} description={art.description} state={state}>
            {rows(list, slot.kind)}
            {slot.required && tried && !list.length ? <InlineError text="Add at least one primary document to continue." /> : null}
            {busyLine(slot.kind)}
            <InlineError text={slotErrors[slot.kind]} />
            {slot.kind === 'fir_scene' ? (
              full ? <Text style={styles.note}>{slot.max} of {slot.max} attached. Delete one to add another.</Text> : (
                <Pressable accessibilityRole="button" accessibilityLabel="Add photo or incident media" disabled={!canUpload || !!busySlot} onPress={() => upload(slot.kind, slot.kind, slot.accept)} style={({ pressed }) => [styles.drop, (pressed || !canUpload) && styles.pressed]}>
                  <View style={styles.dropCircle}><ImagePlus size={t.dropCircleIcon} color={colors.textBody} /></View>
                  <Text style={styles.dropTitle}>{art.action}</Text>
                  <Text style={styles.dropHint}>JPEG, PNG, MP4 up to 50MB</Text>
                </Pressable>
              )
            ) : full ? <Text style={styles.note}>The most this category takes is {slot.max} files.</Text> : (
              <AttachButton label={art.action} hint={acceptLabel(slot.accept)} disabled={!canUpload || !!busySlot} onPress={() => upload(slot.kind, slot.kind, slot.accept)} />
            )}
          </Section>
        );
      })}

      {customSlots.map((label, i) => {
        const key = `custom:${label}`, list = bySlot(key);
        return (
          <Section key={key} icon={FolderPlus} number={FIR_UPLOAD_SLOTS.length + 1 + i} title={label} description="Your own category" state={list.length ? { text: files(list.length), pill: true } : { text: 'Optional', pill: false }}>
            {rows(list, key)}
            {busyLine(key)}
            <InlineError text={slotErrors[key]} />
            <AttachButton label="Upload Document" hint={acceptLabel(CUSTOM_ACCEPT)} disabled={!canUpload || !!busySlot} onPress={() => upload(key, FIR_CUSTOM_SLOT_KIND, CUSTOM_ACCEPT, label)} />
            {!list.length ? (
              <Pressable accessibilityRole="button" onPress={() => setCustomNames((n) => n.filter((x) => x !== label))} style={styles.removeCategory} hitSlop={6}>
                <Text style={styles.removeCategoryText}>Remove this category</Text>
              </Pressable>
            ) : null}
          </Section>
        );
      })}

      <Text style={styles.perPage}>₹25 per page for every page above 25 pages.</Text>
      <Pressable accessibilityRole="button" onPress={() => setNaming(true)} style={({ pressed }) => [styles.slot, pressed && styles.pressed]}>
        <Plus size={t.slotIcon} color={colors.textPrimary} />
        <Text style={styles.slotLabel}>Add Custom Category Slot</Text>
      </Pressable>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Paperclip size={t.custodyIcon} color={t.custodyStateColour} />
          <Text style={styles.summaryLabel}>{copy[45].summary}</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>{files(docs.length)}</Text><Text style={styles.statLabel}>Staged</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{formatSize(totalBytes) || '0 KB'}</Text><Text style={styles.statLabel}>Total Size</Text></View>
        </View>
      </View>

      {tried && !primaryOk ? (
        <InlineError style={styles.blocked} text="Before you continue, add a primary document. The missing slot is marked above." />
      ) : null}
      <ContinueButton label="Continue Draft" busy={continuing} onPress={() => void cont()} style={styles.button} />

      <ConfirmModal
        visible={!!deleting}
        icon={Trash2}
        title="Delete this file?"
        body={`“${deleting?.filename ?? ''}” will be removed from your request.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
      {naming ? <CustomSlotSheet existing={[...FIR_UPLOAD_SLOTS.map((s) => s.title), ...customSlots]} onClose={() => setNaming(false)} onAdd={(label) => { setCustomNames((n) => [...n, label]); setNaming(false); }} /> : null}
    </FirShell>
  );
}

/** Names a custom upload category (flow C6 "User names the slot"). Undrawn sheet. */
function CustomSlotSheet({ existing, onClose, onAdd }: { existing: string[]; onClose: () => void; onAdd: (label: string) => void }) {
  const [name, setName] = useState(''), [tried, setTried] = useState(false);
  const label = name.trim().replace(/\s+/g, ' ');
  const problem = !label ? 'Enter a name for this category.'
    : label.length > 60 ? 'Use up to 60 characters.'
    : FULL_ID.test(label) ? 'Don’t include an ID number in the name.'
    : existing.some((x) => x.toLowerCase() === label.toLowerCase()) ? 'You already have a category with this name.' : '';
  return (
    <Sheet visible title="Add a custom category" subtitle="Name a group for files that don’t fit the categories above, e.g., Medical Reports." onClose={onClose}
      footer={<ContinueButton label="Add Category" onPress={() => { setTried(true); if (!problem) onAdd(label); }} />}>
      <LabelledField label="Category name" required value={name} onChangeText={setName} placeholder="e.g., Medical Reports" maxLength={60} autoFocus />
      <InlineError text={tried ? problem : ''} />
    </Sheet>
  );
}

function Section({ icon: Icon, number, title, description, state, children }: {
  icon: LucideIcon; number: number; title: string; description: string; state: { text: string; pill: boolean }; children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headIcon}><Icon size={t.headIconGlyph} color={colors.textPrimary} /></View>
        <View style={styles.headText}>
          <Text style={styles.headTitle}>{number}. {title}</Text>
          <Text style={styles.headDesc}>{description}</Text>
        </View>
        <View style={state.pill ? styles.statePill : styles.statePlain}>
          <Text style={styles.stateText}>{state.text}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function AttachButton({ label, hint, onPress, disabled }: { label: string; hint: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityHint={hint} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.attach, (pressed || disabled) && styles.pressed]}>
      <FileUp size={t.attachIcon} color={colors.textPrimary} />
      <Text style={styles.attachLabel}>{label}</Text>
    </Pressable>
  );
}

function FileRow({ icon: Icon, name, meta, onView, onRemove, disabled }: {
  icon: LucideIcon; name: string; meta: string; onView(): void; onRemove(): void; disabled: boolean;
}) {
  return (
    <View style={styles.file}>
      <View style={styles.fileIcon}><Icon size={t.fileIconGlyph} color={colors.textBody} /></View>
      <View style={styles.fileText}>
        <Text style={styles.fileName} numberOfLines={1} {...shrinkToFit(0.8)}>{name}</Text>
        {meta ? <Text style={styles.fileMeta}>{meta}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${name}`} onPress={onView} disabled={disabled} style={styles.fileAction}>
        <Eye size={t.fileActionIcon} color={colors.textPrimary} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${name}`} onPress={onRemove} disabled={disabled} style={[styles.fileAction, styles.fileActionLast]}>
        <Trash2 size={t.fileActionIcon} color="#B3261E" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: t.headingTop, fontFamily: font.appHeading, fontSize: t.headingSize, lineHeight: t.headingLineHeight, color: colors.textPrimary },
  subtitle: { marginTop: t.subtitleGap, fontFamily: font.appBody, fontSize: t.subtitleSize, lineHeight: t.subtitleLineHeight, color: colors.textBody },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  head: { flexDirection: 'row', alignItems: 'center' },
  headIcon: { width: t.headIcon, height: t.headIcon, borderRadius: t.headIconRadius, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  headText: { flex: 1, minWidth: 0, marginLeft: t.headIconGap },
  headTitle: { fontFamily: font.appHeading, fontSize: t.headTitleSize, color: colors.textPrimary },
  headDesc: { marginTop: t.headDescGap, fontFamily: font.appBody, fontSize: t.headDescSize, lineHeight: t.headDescLineHeight, color: colors.textBody },
  statePill: {
    marginLeft: t.headStateGap,
    minHeight: t.stateChipHeight,
    borderRadius: t.stateChipRadius,
    paddingHorizontal: t.stateChipPadX,
    paddingVertical: 3,
    backgroundColor: t.stateBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statePlain: { marginLeft: t.headStateGap, maxWidth: t.stateWidth + 8, alignItems: 'center' },
  stateText: { fontFamily: font.appSemi, fontSize: t.stateSize, lineHeight: t.stateLineHeight, textAlign: 'center', color: colors.textBody },
  file: { marginTop: t.fileGap, borderRadius: t.fileRadius, backgroundColor: t.fileBg, padding: t.filePad, flexDirection: 'row', alignItems: 'center' },
  fileIcon: { width: t.fileIcon, height: t.fileIcon, borderRadius: t.fileIconRadius, backgroundColor: t.fileIconBg, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap },
  fileName: { fontFamily: font.appSemi, fontSize: t.fileNameSize + 1, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, color: colors.textBody },
  fileAction: { marginLeft: t.fileActionGap, width: t.fileAction + 4, height: t.fileAction + 4, borderRadius: t.fileActionRadius, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  fileActionLast: { marginLeft: 6 },
  drop: {
    marginTop: t.dropGap,
    minHeight: t.dropHeight,
    borderRadius: t.dropRadius,
    backgroundColor: t.dropBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.cardPad,
    paddingVertical: t.cardPad,
  },
  dropCircle: { width: t.dropCircle, height: t.dropCircle, borderRadius: t.dropCircle / 2, backgroundColor: t.dropCircleBg, alignItems: 'center', justifyContent: 'center' },
  dropTitle: { marginTop: t.dropTitleGap, fontFamily: font.appHeading, fontSize: t.dropTitleSize, color: colors.textPrimary, textAlign: 'center' },
  dropHint: { marginTop: t.dropHintGap, fontFamily: font.appBody, fontSize: t.dropHintSize, color: colors.textBody },
  attach: {
    marginTop: t.attachGap,
    minHeight: t.attachHeight,
    borderRadius: t.attachRadius,
    backgroundColor: t.attachBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.cardPad,
    gap: t.attachIconGap,
  },
  attachLabel: { fontFamily: font.appSemi, fontSize: t.attachSize, color: colors.textPrimary },
  busy: { marginTop: 10, fontFamily: font.appBody, fontSize: 12.5, color: colors.textBody },
  note: { marginTop: 12, fontFamily: font.appBody, fontSize: 12.5, lineHeight: 18, color: colors.textBody },
  removeCategory: { marginTop: 10, alignSelf: 'center' },
  removeCategoryText: { fontFamily: font.appSemi, fontSize: 12.5, color: ink.accent },
  perPage: { marginTop: t.noteGap + 4, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: t.noteColour },
  slot: {
    marginTop: t.slotGap,
    alignSelf: 'center',
    minHeight: t.slotHeight,
    borderRadius: t.slotRadius,
    paddingHorizontal: t.slotPadX,
    backgroundColor: t.slotBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.slotIconGap,
  },
  slotLabel: { fontFamily: font.appSemi, fontSize: t.slotSize, color: colors.textPrimary },
  summary: { marginTop: t.custodyGap, borderRadius: t.custodyRadius, backgroundColor: t.custodyBg, padding: t.custodyPad },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: t.custodyIconGap },
  summaryLabel: { flex: 1, minWidth: 0, fontFamily: font.appSemi, fontSize: t.custodyLabelSize, letterSpacing: t.custodyLabelSpacing, color: colors.textBody },
  stats: { marginTop: t.statGap, flexDirection: 'row', gap: t.statColGap },
  stat: { flex: 1, minWidth: 0, minHeight: t.statHeight, borderRadius: t.statRadius, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, paddingVertical: 8 },
  statValue: { fontFamily: font.appHeading, fontSize: t.statValueSize, color: colors.textPrimary },
  statLabel: { marginTop: t.statLabelGap, fontFamily: font.appBody, fontSize: t.statLabelSize, color: colors.textBody },
  blocked: { marginTop: t.buttonGap },
  button: { marginTop: t.buttonGap },
  pressed: { opacity: 0.7 },
});
export default function LiveFirScreen() { return <IntakeBoundary step={4} title="FIR Draft"><FirStep4Screen/></IntakeBoundary>; }
