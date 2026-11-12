import {acceptedFirIdentity,firIntakeErrors} from '@legalitt/shared';
import {
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  FolderOpen,
  Gavel,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firStep5 as t, font, ink } from '../../constants/theme';
import { contactPhone, useFir } from '../../context/fir';
import {designSubstitutions as copy} from '../../copy/substitutions';
import {identityMask,identityTypeLabel,useFirIdentityPolicy} from '../../features/fir/IdentityEvidence';
import {IntakeBoundary,IntakeStatus} from '../../features/fir/IntakeBoundary';
import {formatSize} from '../../features/fir/flow';
import {openDocument} from '../../features/fir/shared';
import {firErrorStep} from '../../features/fir/intake/draft';
import type {FirDocument} from '../../features/fir/intake/upload';
import {ContinueButton,InlineError} from '../../features/fir/intake/ui';

// FIR step 5 — Review & Submit (design/46, flow C7). Each card's link edits that
// step and Continue there comes straight back here (returnTo=review). Removed per
// the flow: "Verified KYC", "Validated", "Legal Privilege Protected" and the
// "SHA-256 Validated • End-to-End Encrypted" line.

const TAGS: Record<string, { label: string; bg: string; text: string }> = {
  'application/pdf': { label: 'PDF', bg: t.pdfBg, text: t.pdfText },
  'image/jpeg': { label: 'IMG', bg: t.imgBg, text: t.imgText },
  'image/png': { label: 'IMG', bg: t.imgBg, text: t.imgText },
  'video/mp4': { label: 'VID', bg: t.imgBg, text: t.imgText },
  'audio/mpeg': { label: 'AUD', bg: t.docBg, text: t.docText },
};
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "14 Oct 2024" from DD/MM/YYYY or YYYY-MM-DD; anything else as typed. */
function displayDate(value: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value), local = /^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(value);
  const [y, mo, d] = iso ? [+iso[1]!, +iso[2]!, +iso[3]!] : local ? [+local[3]!, +local[2]!, +local[1]!] : [0, 0, 0];
  if (!y) return value;
  return new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString('en-IN', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' });
}

function FirStep5Screen() {
  const m = useFir(), { form } = m;
  const docs = (m.record?.documents ?? []) as FirDocument[];
  const identity = useFirIdentityPolicy();
  const [expanded, setExpanded] = useState(false), [tried, setTried] = useState(false), [viewError, setViewError] = useState('');

  const issues = firIntakeErrors(form);
  const stepIssue = (step: 1 | 2 | 3) => Object.keys(issues).some((k) => firErrorStep(k) === step);
  const primaryOk = docs.some((d) => d.kind === 'fir_primary');
  const idOk = docs.some((d) => d.kind === 'id_proof' && (!identity.policy || acceptedFirIdentity(identity.policy, d)));
  const ready = !Object.keys(issues).length && primaryOk && idOk;
  const edit = (step: number) => void m.go(step, { returnTo: 'review' });
  const proceed = () => { setTried(true); if (ready) void m.submit(); };

  const phone = contactPhone(form.contact);
  const accused = form.people.filter((p) => p.kind === 'accused').length;
  const witnesses = form.people.filter((p) => p.kind === 'witness').length;
  const hasComplainant = form.people.some((p) => p.kind === 'complainant' && p.name.trim());
  const people = (hasComplainant ? 1 : 0) + accused + witnesses;
  const statement = form.incident.description.trim();
  const long = statement.length > 160;
  const dateTime = [form.incident.date ? displayDate(form.incident.date) : '', form.incident.time].filter(Boolean).join(', ');
  const incidentEmpty = !dateTime && !form.incident.location && !form.jurisdiction.policeStation && !statement;

  return (
    <FirShell step={5} title="Review & Submit">
      <IntakeStatus step={5} />
      <Text style={styles.heading}>Review Your Request</Text>
      <Text style={styles.subtitle}>{copy[46].review}</Text>

      <Card icon={CircleUserRound} title="Basic Details" link="Edit" onLink={() => edit(1)} first>
        <View style={styles.panel}>
          {!form.contact.fullName && !phone && !form.contact.email ? (
            <Text style={styles.empty}>No contact details yet. Tap Edit to add them.</Text>
          ) : (
            <>
              <Field label="COMPLAINANT NAME" value={form.contact.fullName} big />
              <View style={styles.cols}>
                <Field label="MOBILE NUMBER" value={phone} />
                <Field label="OFFICIAL EMAIL" value={form.contact.email} wide />
              </View>
            </>
          )}
        </View>
        {stepIssue(1) ? <InlineError text="Some basic details are missing or need fixing. Tap Edit to complete them." /> : null}
      </Card>

      <Card icon={Gavel} title="Incident Details" link="Edit" onLink={() => edit(2)}>
        <View style={styles.panel}>
          {incidentEmpty ? <Text style={styles.empty}>No incident details yet. Tap Edit to add them.</Text> : (
            <>
              <View style={styles.colsFirst}>
                <Field label="DATE & TIME" value={dateTime} />
                <Field label="LOCATION / POLICE PS" value={[form.incident.location, form.jurisdiction.policeStation].filter(Boolean).join('\n')} wide />
              </View>
              {statement ? (
                <>
                  <Text style={[styles.label, styles.summaryLabel]}>REPORTED OFFENSE SUMMARY</Text>
                  <Text style={styles.summary} numberOfLines={expanded ? undefined : 3}>{statement}</Text>
                  {long ? (
                    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((v) => !v)} style={styles.more} hitSlop={6}>
                      <Text style={styles.moreText}>{expanded ? 'Show less' : 'Show more'}</Text>
                      {expanded ? <ChevronUp size={t.moreIcon} color={colors.textBody} /> : <ChevronDown size={t.moreIcon} color={colors.textBody} />}
                    </Pressable>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </View>
        {stepIssue(2) ? <InlineError text="Some incident details are missing or need fixing. Tap Edit to complete them." /> : null}
      </Card>

      <Card icon={UsersRound} title="People Involved" link="View / Edit" onLink={() => edit(3)}>
        <View style={styles.panel}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>REGISTRY ENTRIES</Text>
            <View style={styles.countChip}><Text style={styles.countChipText}>{plural(people, 'Person Added', 'People Added')}</Text></View>
          </View>
          {hasComplainant ? <Pill dot={colors.brandCheck} text="1 Complainant (Self)" /> : null}
          <Pill dot="#C0392B" text={plural(accused, 'Suspect / Accused', 'Suspects / Accused')} />
          <Pill dot={colors.textMuted} text={plural(witnesses, 'Witness', 'Witnesses')} />
        </View>
        {stepIssue(3) ? <InlineError text="Some people details are missing. Tap View / Edit to complete them." /> : null}
      </Card>

      <Card icon={FolderOpen} title="Documents & Evidence" link="Manage" onLink={() => edit(4)}>
        <View style={styles.panel}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>ATTACHED DOCUMENTS</Text>
            <Text style={styles.dossierText}>{plural(docs.length, 'File Attached', 'Files Attached')}</Text>
          </View>
          {!docs.length ? <Text style={[styles.empty, styles.emptySpaced]}>No files yet. Tap Manage to upload your primary documents and identity proof.</Text> : null}
          {docs.map((d) => {
            const isId = d.kind === 'id_proof', tag = TAGS[d.mime_type] ?? { label: 'DOC', bg: t.docBg, text: t.docText };
            const name = isId ? [identityTypeLabel(identity.policy, d), identityMask(d)].filter(Boolean).join(' · ') : d.filename;
            return (
              <Pressable key={d.id} accessibilityRole="button" accessibilityLabel={`View ${name}`} onPress={() => { setViewError(''); void openDocument(d.id).catch(() => setViewError(`“${name}” couldn’t be opened. Check your connection and tap it again.`)); }} style={styles.file}>
                <View style={[styles.tag, { backgroundColor: tag.bg }]}><Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text></View>
                <Text style={styles.fileName} numberOfLines={1} {...shrinkToFit(0.8)}>{name}</Text>
                <Text style={styles.fileSize}>{formatSize(d.size_bytes)}</Text>
              </Pressable>
            );
          })}
        </View>
        <InlineError text={viewError} />
        {!primaryOk || !idOk ? (
          <InlineError text={`Still needed: ${[!primaryOk && 'a primary document', !idOk && 'your identity proof'].filter(Boolean).join(' and ')}. Tap Manage to upload.`} />
        ) : null}
      </Card>

      <View style={styles.declaration}>
        <Text style={styles.declarationBody}>{copy[46].declaration}</Text>
      </View>

      {tried && !ready ? <InlineError style={styles.blocked} text="Complete the items marked above before you pay." /> : null}
      <InlineError style={styles.blocked} text={m.error && !m.conflict && m.saveState !== 'Not saved' ? `${m.error} Your answers are saved; tap Proceed To Pay to try again.` : ''} />
      <ContinueButton label="Proceed To Pay" busy={m.busy} busyLabel="Submitting…" onPress={proceed} style={styles.button} />
    </FirShell>
  );
}

function Card({ icon: Icon, title, link, onLink, first, children }: {
  icon: LucideIcon; title: string; link: string; onLink: () => void; first?: boolean; children: ReactNode;
}) {
  return (
    <View style={[styles.card, first && styles.firstCard]}>
      <View style={styles.head}>
        <View style={styles.headIcon}><Icon size={t.headIconGlyph} color={colors.textPrimary} /></View>
        <Text style={styles.headTitle} {...shrinkToFit(0.8)}>{title}</Text>
        <Pressable onPress={onLink} accessibilityRole="link" accessibilityLabel={`${link} ${title}`} hitSlop={8}>
          <Text style={styles.link}>{link}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

// A missing value takes its label with it (AGENTS.md five states).
function Field({ label, value, wide, big }: { label: string; value: string; wide?: boolean; big?: boolean }) {
  if (!value.trim()) return null;
  return (
    <View style={[styles.col, { flex: wide ? t.colWide : t.colNarrow }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={big ? styles.name : styles.value}>{value}</Text>
    </View>
  );
}

function Pill({ dot, text }: { dot: string; text: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: dot }]} />
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: t.headingTop, fontFamily: font.appHeading, fontSize: t.headingSize, lineHeight: t.headingLineHeight, color: colors.textPrimary },
  subtitle: { marginTop: t.subtitleGap, fontFamily: font.appBody, fontSize: t.subtitleSize, lineHeight: t.subtitleLineHeight, color: colors.textBody },
  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: colors.card, paddingHorizontal: t.cardPad, paddingTop: t.cardPadTop, paddingBottom: t.cardPadBottom },
  firstCard: { marginTop: t.cardGap + 4 },
  head: { flexDirection: 'row', alignItems: 'center' },
  headIcon: { width: t.headIcon, height: t.headIcon, borderRadius: t.headIconRadius, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  headTitle: { flex: 1, minWidth: 0, marginLeft: t.headIconGap, fontFamily: font.appHeading, fontSize: t.headTitleSize, color: colors.textPrimary },
  link: { marginLeft: 10, fontFamily: font.appSemi, fontSize: t.linkSize, color: ink.accent },
  panel: { marginTop: t.panelGap, borderRadius: t.panelRadius, backgroundColor: t.panelBg, padding: t.panelPad },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.labelSize, letterSpacing: t.labelSpacing, color: colors.textBody },
  name: { marginTop: t.valueGap, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  value: { marginTop: t.valueGap, fontFamily: font.appSemi, fontSize: t.valueSize, lineHeight: 18, color: colors.textPrimary },
  empty: { fontFamily: font.appBody, fontSize: 13, lineHeight: 19, color: colors.textBody },
  emptySpaced: { marginTop: 10 },
  cols: { marginTop: t.rowGap, flexDirection: 'row', gap: t.colGap },
  colsFirst: { flexDirection: 'row', gap: t.colGap },
  col: { minWidth: 0 },
  summaryLabel: { marginTop: t.rowGap },
  summary: { marginTop: t.summaryGap, fontFamily: font.appBody, fontSize: t.summarySize, lineHeight: t.summaryLineHeight, color: colors.textPrimary },
  more: { marginTop: t.moreGap, flexDirection: 'row', alignItems: 'center', gap: t.moreIconGap, alignSelf: 'flex-start' },
  moreText: { fontFamily: font.appBody, fontSize: t.moreSize, color: colors.textBody },
  countChip: { marginLeft: 8, minHeight: t.countChipHeight, borderRadius: t.countChipRadius, paddingHorizontal: t.countChipPadX, backgroundColor: colors.brandCheck, alignItems: 'center', justifyContent: 'center' },
  countChipText: { fontFamily: font.appSemi, fontSize: t.countChipSize, color: ink.onBrand },
  pill: { marginTop: t.pillGap, alignSelf: 'flex-start', maxWidth: '100%', minHeight: t.pillHeight, borderRadius: t.pillRadius, paddingHorizontal: t.pillPadX, backgroundColor: t.pillBg, flexDirection: 'row', alignItems: 'center' },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2 },
  pillText: { flexShrink: 1, marginLeft: t.pillDotGap, fontFamily: font.appSemi, fontSize: t.pillSize, color: colors.textPrimary },
  dossierText: { marginLeft: 8, fontFamily: font.appSemi, fontSize: t.dossierSize, color: colors.textPrimary },
  file: { marginTop: t.fileGap, minHeight: t.fileHeight, borderRadius: t.fileRadius, backgroundColor: t.fileBg, paddingHorizontal: t.filePadX, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' },
  tag: { width: t.tagWidth, minHeight: t.tagHeight, borderRadius: t.tagRadius, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontFamily: font.appHeading, fontSize: t.tagSize, letterSpacing: t.tagSpacing },
  fileName: { flex: 1, minWidth: 0, marginLeft: t.tagGap, fontFamily: font.appSemi, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileSize: { marginLeft: 8, fontFamily: font.appBody, fontSize: t.fileSizeSize, color: colors.textBody },
  declaration: { marginTop: t.privilegeGap + 4, borderRadius: t.privilegeRadius, backgroundColor: t.privilegeBg, padding: t.privilegePad, alignItems: 'center' },
  declarationBody: { textAlign: 'center', fontFamily: font.appBody, fontSize: t.privilegeBodySize, lineHeight: t.privilegeBodyLineHeight, color: colors.textBody },
  blocked: { marginTop: 16 },
  button: { marginTop: t.buttonGap },
});
export default function LiveFirScreen() { return <IntakeBoundary step={5} title="Review & Submit"><FirStep5Screen/></IntakeBoundary>; }
