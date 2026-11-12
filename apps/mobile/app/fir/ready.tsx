import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, Check, CheckCircle2, Download, Eye, FileText, Gavel } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { backend } from '../../lib/auth';
import { type FirFlowView } from '@legalitt/shared';

import ConfirmModal from '../../components/ConfirmModal';
import FirResultHeader from '../../components/FirResultHeader';
import FirTimeline, { type TimelineItem } from '../../components/FirTimeline';
import RequestIdCard from '../../components/RequestIdCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firResult as t, font, ink } from '../../constants/theme';
import { backOr, copyText, firHref, firPdfName, formatSize, shareStatus, useFirFlow, viewDocument } from '../../features/fir/flow';
import { downloadDocument } from '../../features/fir/client/api';
import { errorText, goHome } from '../../features/fir/client/format';
import { InlineError, LoadingState, StatePanel } from '../../features/fir/client/ui';

// C11 Your FIR Draft Is Ready. Two drawn versions of one screen:
//  • F6 (design/client/fir-draft/F6-draft-ready-decision.png) while the client's
//    decision is due (status client_review): Approve → / Request For Changes.
//  • design/49 when no decision is pending — after approval, or while requested
//    changes are being made: View FIR Draft / Back to Dashboard.
// Left out per flow C11 [REMOVE]: "BNSS Compliant", "Certified", "compiled and
// certified", "IPC" (BNS only) and design/49's encrypted / Bar Council footer.
// "securely logged" on the first progress row is reworded without the claim.

const ROWS: [string, string][] = [
  ['Request Submitted', 'Incident details & statements received'],
  ['Information Reviewed', 'Examined by specialized legal drafting panel'],
  ['FIR Draft Prepared', 'Statutory sections mapped under BNS framework'],
  ['Ready for Your Review', 'Inspect facts, examine particulars, and download official PDF'],
];

/** Progress rows: stage 4 = row 4 active; stage 5 = all done; earlier = row 3 being updated. */
function progress(flow: FirFlowView): { items: TimelineItem[]; stage: number } {
  const c = flow.stage.client;
  const current = c.stage >= 5 ? 5 : c.stage === 4 ? 4 : 3;
  const items = ROWS.map(([title, description], i): TimelineItem => {
    const n = i + 1;
    const tone = n < current ? 'done' : n === current ? 'active' : 'pending';
    return { title, description, tone, state: tone === 'active' ? 'ACTIVE' : '', footnote: tone === 'active' && current === 3 ? c.note : null };
  });
  return { items, stage: Math.min(current, 4) };
}

export default function FirReadyScreen() {
  const { caseId } = useLocalSearchParams<{ caseId?: string }>();
  const insets = useSafeAreaInsets();
  const f = useFirFlow(caseId);
  const flow = f.flow;
  const [confirming, setConfirming] = useState(false);
  const [fileError, setFileError] = useState('');
  const [shareNote, setShareNote] = useState('');

  const decision = !!flow?.stage.client.decision_due;
  const back = () => { if (caseId) backOr(firHref('status', caseId)); else goHome(); };
  const share = async () => {
    if (!flow) return;
    setShareNote('');
    try { await shareStatus(flow); }
    catch {
      const c = flow.stage.client;
      const ok = await copyText(`FIR Draft request ${flow.reference}: ${c.status} (Stage ${c.stage} of 5, ${c.label}).`);
      setShareNote(ok ? 'Sharing isn’t available here, so the status was copied instead.' : 'Sharing isn’t available on this device.');
    }
  };
  const header = <FirResultHeader title="Fir Draft" onBack={back} {...(flow && !decision ? { action: 'share' as const, onAction: () => void share() } : {})} />;

  if (f.loading && !flow) return <View style={styles.screen}>{header}<LoadingState label="Loading your FIR draft…" /></View>;
  if (!flow)
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          <StatePanel tone="error" title="We couldn’t load your FIR draft" body={f.error || 'Something went wrong loading your request.'}
            actions={[...(caseId ? [{ label: 'Try again', onPress: f.reload, primary: true }] : []), { label: 'Back to Dashboard', onPress: goHome }]} />
        </ScrollView>
      </View>
    );

  const draft = flow.draft;
  if (!draft)
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          {decision
            ? <StatePanel tone="error" title="Your draft file couldn’t be loaded" body="Your FIR draft is waiting for your review, but its PDF isn’t available right now. Try again, or contact Legalitt Support if this continues."
                actions={[{ label: 'Try again', onPress: f.reload, primary: true }, { label: 'Contact Support', onPress: () => router.push((`/support?caseId=${encodeURIComponent(flow.case_id)}`) as Href) }]} />
            : <StatePanel title="Your FIR draft isn’t ready yet" body="It appears here once your advocate has prepared it and it has been checked by Legalitt. We’ll notify you in the app."
                actions={[{ label: 'Track Request', onPress: () => router.replace(firHref('status', flow.case_id)), primary: true }]} />}
        </ScrollView>
      </View>
    );

  const c = flow.stage.client;
  const updating = !decision && c.stage < 5;
  const name = firPdfName(flow.reference, draft.version);
  const size = formatSize(draft.document.size_bytes);
  const { items, stage } = progress(flow);
  const open = async (action: () => Promise<void>, failed: string) => {
    setFileError('');
    try { await action(); } catch (e) { setFileError(`${failed} ${errorText(e, '')}`.trim()); }
  };
  const approve = async () => {
    setConfirming(false);
    const result = await f.run(() => backend.firClientApprove(flow.case_id, draft.draft_id));
    if (result) router.replace(firHref('approved', flow.case_id));
  };

  return (
    <View style={styles.screen}>
      {header}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.contentTop }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {updating ? c.status.toUpperCase() : 'DRAFT READY'}
            </Text>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroCircle}>
              <FileText size={t.heroDocGlyph} color={colors.brandDark} />
            </View>
            {!updating && (
              <View style={styles.heroBadge}>
                <Check size={t.heroBadgeGlyph} color={ink.onBrand} strokeWidth={3} />
              </View>
            )}
          </View>

          <Text style={styles.heading} {...shrinkToFit(0.75)}>
            {updating ? 'Your FIR Draft Is Being Updated' : 'Your FIR Draft Is Ready'}
          </Text>
          <Text style={styles.body}>
            {updating
              ? 'Your advocate is updating your draft. The version you reviewed stays available below.'
              : 'Your formal First Information Report dossier has been prepared for your preliminary inspection.'}
          </Text>

          <RequestIdCard requestId={flow.reference} style={styles.idCard} />
          {!!shareNote && <Text accessibilityLiveRegion="polite" style={styles.shareNote}>{shareNote}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            FINALIZED DRAFT DOSSIER
          </Text>

          <View style={styles.file}>
            <View style={styles.fileIcon}>
              <FileText size={t.dossierIconGlyph} color={colors.textBody} />
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                {name}
              </Text>
              <Text style={styles.fileCaption} {...shrinkToFit(0.8)}>
                Prepared for your verification
              </Text>
              <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                {size ? `PDF Dossier · ${size}` : 'PDF Dossier'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${name}`}
              onPress={() => void open(() => viewDocument(draft.document.id), 'The draft couldn’t be opened.')}
              style={styles.eye}
            >
              <Eye size={t.dossierEyeIcon} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => void open(() => downloadDocument(draft.document.id, name), 'The draft couldn’t be downloaded.')}
            accessibilityRole="button"
            style={styles.download}
          >
            <Download size={t.downloadIcon} color={t.downloadColour} />
            <Text style={styles.downloadLabel} {...shrinkToFit(0.8)}>
              Download PDF
            </Text>
          </Pressable>
          <InlineError style={styles.fileError} message={fileError} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
              Request Progress
            </Text>
            <View style={styles.stageChip}>
              <Text style={styles.stageChipText} {...shrinkToFit(0.8)}>
                Stage {stage} of 4
              </Text>
            </View>
          </View>

          <FirTimeline items={items} variant="ready" />
        </View>

        <View style={styles.caution}>
          <View style={styles.cautionHead}>
            <Gavel size={t.helpIconGlyph} color={colors.textPrimary} style={styles.cautionIcon} />
            <View style={styles.cautionText}>
              <Text style={styles.cautionTitle} {...shrinkToFit(0.8)}>
                Please review your draft carefully
              </Text>
              <Text style={styles.cautionBody}>
                Cross-verify dates, timeline of occurrence, named parties, and stolen/affected
                property details before physical submission.
              </Text>
            </View>
          </View>

          <View style={styles.statutory}>
            <Text style={styles.statutoryText}>
              <Text style={styles.statutoryLead}>Statutory Notice: </Text>
              This document represents a vetted legal complaint draft. It becomes an official
              statutory FIR upon physical acceptance, verification, and registration by the Station
              House Officer (SHO) at your designated police station.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {!!f.error && <InlineError style={styles.actionError} message={f.error} retryLabel="Reload" onRetry={f.reload} />}

        {decision ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: f.busy, busy: f.busy }}
              disabled={f.busy}
              onPress={() => setConfirming(true)}
              style={({ pressed }) => [styles.button, f.busy && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.buttonLabel}>{f.busy ? 'Approving…' : 'Approve'}</Text>
              {!f.busy && <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={f.busy}
              onPress={() => router.push(firHref('request-changes', flow.case_id))}
              style={({ pressed }) => [styles.button, styles.buttonLight, f.busy && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={[styles.buttonLabel, styles.buttonLightLabel]}>Request For Changes</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => void open(() => viewDocument(draft.document.id), 'The draft couldn’t be opened.')}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonLabel}>View FIR Draft</Text>
              <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={goHome}
              style={({ pressed }) => [styles.button, styles.buttonLight, pressed && styles.pressed]}
            >
              <Text style={[styles.buttonLabel, styles.buttonLightLabel]}>Back to Dashboard</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        visible={confirming}
        icon={CheckCircle2}
        tone="neutral"
        title="Approve this FIR draft?"
        body="Your advocate will be notified."
        confirmLabel="Approve"
        onConfirm={() => void approve()}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: t.padX,
    paddingTop: t.contentTop,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  pill: {
    alignSelf: 'center',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    marginRight: t.pillDotGap,
    backgroundColor: t.pillText,
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: t.pillText,
  },
  hero: {
    marginTop: t.heroTop,
    alignSelf: 'center',
  },
  heroCircle: {
    width: t.heroDocCircle,
    height: t.heroDocCircle,
    borderRadius: t.heroDocCircle / 2,
    backgroundColor: t.heroCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: t.heroBadge,
    height: t.heroBadge,
    borderRadius: t.heroBadge / 2,
    backgroundColor: t.heroBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  idCard: {
    marginTop: t.idGap,
  },
  shareNote: {
    marginTop: 8,
    fontFamily: font.appBody,
    fontSize: 12,
    color: colors.textBody,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textBody,
  },
  file: {
    marginTop: t.dossierRowGap,
    borderRadius: t.idRadius,
    backgroundColor: t.idBg,
    padding: t.idPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: t.dossierIcon,
    height: t.dossierIcon,
    borderRadius: t.dossierIconRadius,
    backgroundColor: t.dossierIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.dossierIconGap,
  },
  fileName: {
    fontFamily: font.appHeading,
    fontSize: t.dossierNameSize,
    color: colors.textPrimary,
  },
  fileCaption: {
    marginTop: t.dossierCaptionGap,
    fontFamily: font.appBody,
    fontSize: t.dossierCaptionSize,
    color: colors.textBody,
  },
  fileMeta: {
    marginTop: t.dossierMetaGap,
    fontFamily: font.appSemi,
    fontSize: t.dossierMetaSize,
    color: t.downloadColour,
  },
  eye: {
    marginLeft: 10,
    width: t.dossierEye,
    height: t.dossierEye,
    borderRadius: t.dossierEye / 2,
    backgroundColor: t.dossierChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  download: {
    marginTop: t.downloadGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadLabel: {
    marginLeft: t.downloadIconGap,
    fontFamily: font.appSemi,
    fontSize: t.downloadSize,
    color: t.downloadColour,
  },
  fileError: {
    marginTop: 10,
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  stageChip: {
    marginLeft: 8,
    minHeight: t.stageChipHeight,
    borderRadius: t.stageChipRadius,
    paddingHorizontal: t.stageChipPadX,
    backgroundColor: t.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageChipText: {
    fontFamily: font.appBody,
    fontSize: t.stageChipSize,
    color: t.pillText,
  },
  caution: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
  },
  cautionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cautionIcon: {
    marginTop: 2,
  },
  cautionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.noteIconGap,
  },
  cautionTitle: {
    fontFamily: font.appHeading,
    fontSize: t.helpTitleSize,
    color: colors.textPrimary,
  },
  cautionBody: {
    marginTop: t.helpBodyGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  statutory: {
    marginTop: t.statutoryGap,
    borderRadius: t.statutoryRadius,
    backgroundColor: t.statutoryBg,
    padding: t.statutoryPad,
  },
  statutoryText: {
    fontFamily: font.appBody,
    fontSize: t.statutorySize,
    lineHeight: t.statutoryLineHeight,
    color: colors.textBody,
  },
  statutoryLead: {
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
    minHeight: t.buttonGap,
  },
  actionError: {
    marginBottom: 4,
  },
  button: {
    marginTop: t.buttonStackGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLight: {
    backgroundColor: t.buttonLightBg,
  },
  buttonLightLabel: {
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
});
