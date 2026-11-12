import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, Check, ChevronLeft, Eye, FileText, Image as ImageIcon, UserRound } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_DOCUMENTS as c } from '../../../data/advocateFir';
import { advFirDocuments as t, colors, font, ink, status } from '../../../constants/theme';
import { backOr, initials, useFirFlow, viewDocument } from '../../../features/fir/flow';
import {
  clientDocuments, docName, docPages, formatSize, incidentWhen, InlineError, intakeOf, joinDot, MovedOn,
  peopleSummary, StateCard, toCases, useAction, useAdvocateCaseId, useFirRecord,
} from '../../../features/fir/advocate/common';

// Review documents (design/216, flow A3), live in every data mode.
// [REMOVE] "Verified Client". Page counts and sizes are the uploads' own.
// Continue opens the generator (A4); Back returns to Cases and the case stays Accepted.
// Opened from the generator's "View Documents" (from=generator), Back and Continue both
// return to that generator screen instead, so its unsaved edits are kept.
const AFTER_ACCEPT = ['advocate_accepted', 'in_progress', 'changes_requested', 'client_review', 'approved', 'completed'];
const generatorHref = (caseId: string) => `/advocate/fir/generator?caseId=${encodeURIComponent(caseId)}` as Href;

export default function AdvocateFirDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const caseId = useAdvocateCaseId();
  const fromGenerator = useLocalSearchParams<{ from?: string }>().from === 'generator';
  const back = () => { if (fromGenerator && caseId) backOr(generatorHref(caseId)); else toCases(); };
  const toGenerator = () => { if (!caseId) return; if (fromGenerator) backOr(generatorHref(caseId)); else router.push(generatorHref(caseId)); };
  const f = useFirFlow(caseId);
  const rec = useFirRecord(caseId);
  const act = useAction();
  const flow = f.flow, intake = intakeOf(rec.record);
  const allowed = !!flow && AFTER_ACCEPT.includes(flow.status);
  const docs = clientDocuments(rec.record);
  const client = flow?.client;
  const meta = joinDot(client?.mobile, client?.city ?? flow?.city);
  const info = [
    { label: c.info.date, value: incidentWhen(intake?.incident) },
    { label: c.info.place, value: intake?.incident.location },
    { label: c.info.people, value: peopleSummary(intake) },
  ].filter(row => row.value?.trim());
  const description = intake ? [intake.incident.description, intake.incident.additional].map(v => v?.trim()).filter(Boolean) : [];
  // Drafting continues through the generator only while the draft is editable.
  const drafting = !!flow && ['advocate_accepted', 'in_progress', 'changes_requested'].includes(flow.status) && flow.sub_status !== 'awaiting_admin_approval';

  let content;
  if (!caseId) content = <StateCard title="This link is missing its request ID." actionLabel="Back to Cases" onAction={toCases} />;
  else if (!flow) content = f.error ? <StateCard title="Couldn’t load this request." error={f.error} actionLabel="Retry" onAction={f.reload} secondaryLabel="Back to Cases" onSecondary={toCases} />
    : <StateCard loading title="Loading the request…" />;
  else if (!allowed) content = <MovedOn caseId={caseId} stage={flow.stage} />;
  else content = <>
    <View style={styles.accept}>
      <View style={styles.acceptHead}>
        <View style={styles.acceptTick}><Check size={t.acceptTickGlyph} color={colors.textPrimary} strokeWidth={3} /></View>
        <Text style={styles.acceptTitle} {...shrinkToFit(0.8)}>{c.accepted.title}</Text>
      </View>
      <Text style={styles.acceptBody}>{c.accepted.body}</Text>
    </View>

    {client && <View style={styles.card}>
      <Text style={styles.label} {...shrinkToFit(0.8)}>{c.client.label}</Text>
      <View style={styles.clientRow}>
        <View style={styles.initials}><Text style={styles.initialsText} {...shrinkToFit(0.8)}>{initials(client.name)}</Text></View>
        <View style={styles.clientText}>
          <Text style={styles.name} {...shrinkToFit(0.75)}>{client.name}</Text>
          {!!meta && <Text style={styles.meta}>{meta}</Text>}
        </View>
      </View>
    </View>}

    {!rec.record ? (rec.error
      ? <StateCard title="Couldn’t load the client’s documents." error={rec.error} actionLabel="Retry" onAction={rec.reload} />
      : <StateCard loading title="Loading the client’s documents…" />) : <>
      <View style={styles.headingRow}>
        <Text style={styles.heading} {...shrinkToFit(0.8)}>{c.documents.heading}</Text>
        {!!docs.length && <View style={styles.filesChip}><Text style={styles.filesChipText} {...shrinkToFit(0.8)}>{docs.length} {docs.length === 1 ? 'File' : 'Files'}</Text></View>}
      </View>
      {!docs.length && <View style={[styles.card, styles.infoCard]}><Text style={styles.infoValue}>{c.documents.none}</Text></View>}
      {docs.map(row => {
        const Icon = row.mime_type.startsWith('image/') || row.mime_type.startsWith('video/') ? ImageIcon : FileText;
        return <View key={row.id} style={styles.doc}>
          <View style={styles.docIconBox}><Icon size={t.docIconGlyph} color={status.onRedContainer} /></View>
          <View style={styles.docText}>
            <Text style={styles.docName}>{docName(row)}</Text>
            <Text style={styles.docMeta} {...shrinkToFit(0.8)}>{joinDot(docPages(row), formatSize(row.size_bytes))}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${docName(row)}`} onPress={() => void act.run(() => viewDocument(row.id))} style={({ pressed }) => [styles.docView, pressed && styles.pressed]}>
            <Eye size={t.docViewIcon} color={colors.textPrimary} /><Text style={styles.docViewText} {...shrinkToFit(0.8)}>{c.documents.view}</Text>
          </Pressable>
        </View>;
      })}
      <InlineError error={act.error} />

      {!!info.length && <>
        <View style={styles.headingRow}><Text style={styles.heading} {...shrinkToFit(0.8)}>{c.info.heading}</Text></View>
        <View style={[styles.card, styles.infoCard]}>{info.map((row, i) => <Fragment key={row.label}>
          {i > 0 && <View style={styles.divider} />}
          <View style={i > 0 ? styles.infoRowNext : undefined}>
            <Text style={styles.infoLabel} {...shrinkToFit(0.8)}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        </Fragment>)}</View>
      </>}

      {!!description.length && <>
        <View style={styles.headingRow}>
          <Text style={styles.heading} {...shrinkToFit(0.8)}>{c.description.heading}</Text>
          <View style={styles.descChip}><Text style={styles.descChipText} {...shrinkToFit(0.75)}>{c.description.chip}</Text></View>
        </View>
        <View style={[styles.card, styles.infoCard]}>{description.map((para, n) =>
          <Text key={n} style={[styles.desc, n > 0 && { marginTop: 12 }]}>{n === 0 ? `“${para}${description.length === 1 ? '”' : ''}` : `${para}”`}</Text>)}</View>
      </>}
      {!intake && <StateCard title="The client’s filing couldn’t be read." body="Reload this request. If it keeps happening, contact Legalitt support." actionLabel="Retry" onAction={rec.reload} />}
    </>}
  </>;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={back}><ChevronLeft size={t.backIcon} color={colors.textPrimary} /></Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>{c.title}</Text>
        <View style={styles.avatar}><UserRound size={t.avatarGlyph} color={ink.onBrand} /></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{content}</ScrollView>

      {allowed && drafting && caseId && <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toGenerator} style={({ pressed }) => [styles.continue, pressed && styles.pressed]}>
          <Text style={styles.continueText} {...shrinkToFit(0.8)}>{c.continue}</Text>
          <ArrowRight size={t.continueArrow} color={ink.onBrand} style={styles.continueArrow} />
        </Pressable>
        <Text style={styles.cap} {...shrinkToFit(0.75)}>{c.caption}</Text>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  /** Left-aligned next to Back, as on design 216. */
  title: { flex: 1, minWidth: 0, marginLeft: t.titleGap, marginRight: 10, textAlign: 'left', fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  avatar: { width: t.avatar, height: t.avatar, borderRadius: t.avatar / 2, backgroundColor: t.avatarBg, alignItems: 'center', justifyContent: 'center' },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },

  accept: { borderRadius: t.acceptRadius, backgroundColor: t.acceptBg, padding: t.acceptPad },
  acceptHead: { flexDirection: 'row', alignItems: 'center' },
  acceptTick: { width: t.acceptTick, height: t.acceptTick, borderRadius: t.acceptTick / 2, backgroundColor: t.acceptTickBg, alignItems: 'center', justifyContent: 'center' },
  acceptTitle: { marginLeft: t.acceptTickGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.acceptTitleSize, color: colors.textPrimary },
  acceptBody: { marginTop: t.acceptBodyGap, fontFamily: font.appBody, fontSize: t.acceptBodySize, lineHeight: t.acceptBodyLineHeight, color: t.acceptBodyColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  infoCard: { marginTop: t.docGap },
  label: { flexShrink: 1, marginRight: 10, fontFamily: font.appSemi, fontSize: t.labelSize, letterSpacing: t.labelSpacing, color: t.labelColour },

  clientRow: { marginTop: t.initialsGap, flexDirection: 'row', alignItems: 'center' },
  initials: { width: t.initials, height: t.initials, borderRadius: t.initials / 2, backgroundColor: t.initialsBg, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsSize, color: t.initialsColour },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.initialsGapX },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  meta: { marginTop: t.metaGap, fontFamily: font.appBody, fontSize: t.metaSize, color: t.metaColour },

  headingRow: { marginTop: t.headingGap, flexDirection: 'row', alignItems: 'center' },
  heading: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.headingSize, color: colors.textPrimary },
  filesChip: { marginLeft: 'auto', minHeight: t.filesChipHeight, borderRadius: t.filesChipRadius, backgroundColor: t.filesChipBg, paddingHorizontal: t.filesChipPadX, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  filesChipText: { fontFamily: font.appSemi, fontSize: t.filesChipSize, color: t.filesChipColour },

  doc: { marginTop: t.docGapY, borderRadius: t.docRadius, backgroundColor: t.cardBg, padding: t.docPad, flexDirection: 'row', alignItems: 'center' },
  docIconBox: { width: t.docIconBox, height: t.docIconBox, borderRadius: t.docIconRadius, backgroundColor: status.redContainer, alignItems: 'center', justifyContent: 'center' },
  docText: { flex: 1, minWidth: 0, marginHorizontal: t.docIconGap },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: t.docMetaColour },
  docView: { minHeight: t.docViewHeight, borderRadius: t.docViewRadius, backgroundColor: t.docViewBg, paddingHorizontal: t.docViewPadX, flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  docViewText: { marginLeft: t.docViewIconGap, fontFamily: font.appSemi, fontSize: t.docViewSize, color: colors.textPrimary, flexShrink: 1 },

  infoRowNext: { marginTop: t.infoRowGap },
  infoLabel: { fontFamily: font.appBody, fontSize: t.infoLabelSize, color: t.infoLabelColour },
  infoValue: { marginTop: t.infoValueGap, fontFamily: font.appBody, fontSize: t.infoValueSize, lineHeight: t.infoValueLineHeight, color: colors.textPrimary },
  divider: { marginTop: t.infoDividerGap, height: 1, backgroundColor: t.infoDivider },

  descChip: { marginLeft: 'auto', minHeight: t.descChipHeight, borderRadius: t.descChipRadius, backgroundColor: t.descChipBg, paddingHorizontal: t.descChipPadX, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  descChipText: { fontFamily: font.appSemi, fontSize: t.descChipSize, color: t.descChipColour },
  desc: { fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: colors.textPrimary },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  continue: { minHeight: t.continueHeight, borderRadius: t.continueRadius, backgroundColor: t.continueBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  continueText: { fontFamily: font.appHeading, fontSize: t.continueSize, color: ink.onBrand, flexShrink: 1 },
  continueArrow: { marginLeft: t.continueArrowGap },
  cap: { marginTop: t.capGap, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, color: t.capColour },
  pressed: { opacity: 0.85 },
});
