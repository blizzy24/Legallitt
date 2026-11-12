import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, Bell, ClipboardList, Headset } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FIR_CLIENT_CHANGES, FIR_CLIENT_STAGES, type FirFlowView } from '@legalitt/shared';

import FirResultHeader from '../../components/FirResultHeader';
import FirTimeline, { type TimelineItem } from '../../components/FirTimeline';
import RequestIdCard from '../../components/RequestIdCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firResult as t, font, ink } from '../../constants/theme';
import { ClientIdentityReplacement } from '../../features/fir/Lifecycle';
import { backOr, copyText, firHref, formatDate, shareStatus, useFirFlow } from '../../features/fir/flow';
import { goHome, isPaid, requestSubmittedAt, turnaroundLong } from '../../features/fir/client/format';
import { InlineError, LoadingState, StatePanel } from '../../features/fir/client/ui';

// C10 FIR Draft Status (design/48). The stage, its label and note come only from
// flow.stage.client — the shared C10 mapping — so client, advocate and admin agree.
// Five stages, "Stage N of 5" (flow [DECIDE]). Left out per flow C10 [REMOVE]:
// "Verified Draft", "SMS &" in the notice, the 256-bit encrypted-folio / Bar
// Council footer line, and "IPC" in the Information Review line (BNS only). The
// drawn "securely logged … institutional intake" line drops only "securely".

// Row copy as drawn on design/48 (IPC removed).
const STAGE_COPY = [
  'Your FIR Draft request and submitted incident synopsis have been received.',
  'Our legal documentation team is examining the facts, jurisdiction clauses, and applicable BNS provisions.',
  'Your FIR draft will be formulated as per police jurisdictional requirements once verification finishes.',
  'Review and approve the draft before dispatch.',
  'You will receive instant access to download, print, and file the draft at the designated police station.',
];
const IDENTITY_SUBS = new Set(['identity_replacement_required', 'identity_review_pending', 'multiple_corrections_required']);

function timeline(flow: FirFlowView): TimelineItem[] {
  const c = flow.stage.client;
  return FIR_CLIENT_STAGES.map((title, i) => {
    const n = i + 1;
    const tone = n < c.stage || (n === c.stage && c.done) ? 'done' : n === c.stage ? 'active' : 'pending';
    return {
      title,
      description: STAGE_COPY[i]!,
      tone,
      state: tone === 'done' ? 'Completed' : tone === 'active' ? 'Active' : n === FIR_CLIENT_STAGES.length ? 'Upcoming' : 'Pending',
      footnote: tone === 'active' ? c.note : null,
    };
  });
}

/** Heading and line under it for each state. Only stage 2 is drawn; the rest are §9.2. */
function headline(flow: FirFlowView): [string, string] {
  const c = flow.stage.client;
  if (flow.status === 'draft') return ['FIR Draft Request Not Submitted', 'Your request is saved as a draft. Finish the steps and complete payment to submit it.'];
  if (flow.status === 'submitted' || flow.status === 'payment_pending') return ['FIR Draft Request Awaiting Payment', 'Complete payment to send your request to our legal team.'];
  if (flow.status === 'cancelled' || flow.status === 'refunded') return ['FIR Draft Request Cancelled', flow.status === 'refunded' ? 'This request was cancelled and refunded.' : 'This request was cancelled.'];
  switch (c.stage) {
    case 3: return flow.sub_status === FIR_CLIENT_CHANGES
      ? ['Your FIR Draft Is Being Updated', 'Your advocate is updating your draft with the changes you asked for.']
      : ['Your FIR Draft Is Being Prepared', 'Your advocate is preparing your FIR draft.'];
    case 4: return ['Your FIR Draft Is Ready', 'Review your draft, then approve it or request changes.'];
    case 5: return c.done
      ? ['FIR Draft Completed', 'Your approved FIR draft is ready to download.']
      : ['FIR Draft Approved', c.note ? `You approved your draft. ${c.note}.` : 'You approved your draft.'];
    default: return ['FIR Draft Request Submitted', 'Your request has been logged and is currently under institutional intake review.'];
  }
}

/** The one thing the client can do next from here, if anything. */
function nextAction(flow: FirFlowView): { label: string; href: Href } | null {
  const id = flow.case_id, c = flow.stage.client;
  if (c.decision_due) return { label: 'Review Your Draft', href: firHref('ready', id) };
  if (flow.status === 'draft') return { label: 'Continue Your Request', href: firHref(`step${flow.intake_step ?? 1}`, id) };
  if (flow.status === 'submitted' || flow.status === 'payment_pending') return { label: 'Complete Payment', href: firHref('payment', id) };
  if (c.stage === 3 && flow.sub_status === FIR_CLIENT_CHANGES) return { label: 'View Your Change Request', href: firHref('changes-submitted', id) };
  if (c.stage === 5 && flow.events.some(e => e.type === 'fir_client_approved')) return { label: 'View Approved Draft', href: firHref('approved', id) };
  if (c.stage === 5 && flow.draft) return { label: 'View FIR Draft', href: firHref('ready', id) };
  return null;
}

export default function FirStatusScreen() {
  const { caseId } = useLocalSearchParams<{ caseId?: string }>();
  const insets = useSafeAreaInsets();
  const f = useFirFlow(caseId);
  const flow = f.flow;
  const [shareNote, setShareNote] = useState('');

  const share = async () => {
    if (!flow) return;
    setShareNote('');
    try {
      await shareStatus(flow);
    } catch {
      const c = flow.stage.client;
      const ok = await copyText(`FIR Draft request ${flow.reference}: ${c.status} (Stage ${c.stage} of 5, ${c.label}).`);
      setShareNote(ok ? 'Sharing isn’t available here, so the status was copied instead.' : 'Sharing isn’t available on this device.');
    }
  };
  const header = <FirResultHeader title="Fir Draft Status" action="share" onAction={flow ? () => void share() : undefined} onBack={() => backOr('/(tabs)/home' as Href)} />;

  if (f.loading && !flow) return <View style={styles.screen}>{header}<LoadingState /></View>;
  if (!flow)
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          <StatePanel tone="error" title="We couldn’t load your request" body={f.error || 'Something went wrong loading your request.'}
            actions={[...(caseId ? [{ label: 'Try again', onPress: f.reload, primary: true }] : []), { label: 'Go to My Requests', onPress: () => router.replace('/cases') }, { label: 'Go to Home', onPress: goHome }]} />
        </ScrollView>
      </View>
    );

  const c = flow.stage.client;
  const paid = isPaid(flow);
  const cancelled = flow.status === 'cancelled' || flow.status === 'refunded';
  const [heading, body] = headline(flow);
  const action = nextAction(flow);
  const submitted = requestSubmittedAt(flow);

  return (
    <View style={styles.screen}>
      {header}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.contentTop }]}
        showsVerticalScrollIndicator={false}
      >
        {!!f.error && <InlineError style={styles.refreshError} message={`Couldn’t refresh this request. ${f.error}`} onRetry={f.reload} />}

        <View style={styles.card}>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                {c.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.heading} {...shrinkToFit(0.75)}>
            {heading}
          </Text>
          <Text style={styles.body}>{body}</Text>

          <RequestIdCard requestId={flow.reference} style={styles.idCard} />
          {!!shareNote && <Text accessibilityLiveRegion="polite" style={styles.shareNote}>{shareNote}</Text>}
        </View>

        {action && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(action.href)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel}>{action.label}</Text>
            <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
          </Pressable>
        )}

        {paid && !!flow.sub_status && IDENTITY_SUBS.has(flow.sub_status) && (
          <View style={styles.identity}>
            <ClientIdentityReplacement caseId={flow.case_id} revision={`${flow.status}:${flow.sub_status}`} />
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              REQUEST DETAILS
            </Text>
            <ClipboardList size={t.noteIcon} color={colors.textBody} />
          </View>

          <Row label="Request Type" value="FIR Draft" first />
          {paid && !!submitted && <Row label="Submitted On" value={formatDate(submitted)} />}
          <Row label="Current Status" chip={c.status} />
          {paid && !cancelled && c.stage < 4 && (
            <Row label="Estimated Turnaround" value={turnaroundLong(flow.settings)} note="Standard legal verification window" />
          )}
        </View>

        {paid && !cancelled && (
          <View style={styles.card}>
            <View style={styles.labelRow}>
              <View style={styles.sectionText}>
                <Text style={styles.label} {...shrinkToFit(0.8)}>
                  REQUEST STATUS
                </Text>
                <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
                  What happens next?
                </Text>
              </View>
              <View style={styles.stageChip}>
                <Text style={styles.stageChipText} {...shrinkToFit(0.8)}>
                  Stage {c.stage} of 5
                </Text>
              </View>
            </View>

            <FirTimeline items={timeline(flow)} variant="status" />
          </View>
        )}

        {paid && !cancelled && c.stage < 4 && (
          <View style={styles.note}>
            <Bell size={t.noteIcon} color={colors.textBody} />
            <Text style={styles.noteText}>
              We&apos;ll notify you in the app the moment your FIR draft is compiled and ready for download.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.helpRow}>
            <View style={styles.helpIcon}>
              <Headset size={t.helpIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle} {...shrinkToFit(0.8)}>
                Need to update something?
              </Text>
              <Text style={styles.helpBody}>
                Forgot to mention a witness or critical detail? Contact Legalitt desk before
                drafting initiates.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push((`/support?caseId=${encodeURIComponent(flow.case_id)}`) as Href)}
            style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}
          >
            <Text style={styles.helpButtonLabel} {...shrinkToFit(0.8)}>
              Contact Legalitt Support
            </Text>
            <ArrowRight size={t.helpButtonIcon} color={colors.textPrimary} style={styles.helpButtonIcon} />
          </Pressable>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.footerLine} {...shrinkToFit(0.75)}>
          Drafts strictly curated under legal tech advisory protocols.
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  value,
  chip,
  note,
  first,
}: {
  label: string;
  value?: string;
  chip?: string;
  note?: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.row, first && styles.rowFirst]}>
      <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {chip ? (
          <View style={styles.rowChip}>
            <View style={styles.rowChipDot} />
            <Text style={styles.rowChipText} {...shrinkToFit(0.8)}>
              {chip}
            </Text>
          </View>
        ) : (
          <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
            {value}
          </Text>
        )}
        {note && (
          <Text style={styles.rowNote} {...shrinkToFit(0.8)}>
            {note}
          </Text>
        )}
      </View>
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
  refreshError: {
    marginTop: t.cardGap,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  identity: {
    marginTop: t.cardGap,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
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
  heading: {
    marginTop: t.pillGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  body: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  idCard: {
    marginTop: t.pillGap,
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
  sectionText: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    marginTop: t.sectionLabelGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  stageChip: {
    marginLeft: 8,
    minHeight: t.stageChipHeight,
    borderRadius: t.stageChipRadius,
    paddingHorizontal: t.stageChipPadX,
    backgroundColor: t.stageChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageChipText: {
    fontFamily: font.appBody,
    fontSize: t.stageChipSize,
    color: colors.textBody,
  },
  row: {
    marginTop: t.tableRowGap,
    paddingTop: t.tableRowGap,
    borderTopWidth: 1,
    borderTopColor: t.tableDivider,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rowFirst: {
    marginTop: t.tableLabelGap,
    borderTopWidth: 0,
    paddingTop: 0,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.tableLabelSize,
    color: colors.textBody,
  },
  rowRight: {
    marginLeft: 10,
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  rowValue: {
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.tableValueSize,
    color: colors.textPrimary,
  },
  rowNote: {
    marginTop: t.tableNoteGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.tableNoteSize,
    color: colors.textBody,
  },
  rowChip: {
    minHeight: t.statusChipHeight,
    borderRadius: t.statusChipRadius,
    paddingHorizontal: t.statusChipPadX,
    backgroundColor: t.statusChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowChipDot: {
    width: t.statusChipDot,
    height: t.statusChipDot,
    borderRadius: t.statusChipDot / 2,
    marginRight: t.statusChipDotGap,
    backgroundColor: t.pillText,
  },
  rowChipText: {
    fontFamily: font.appSemi,
    fontSize: t.statusChipSize,
    color: t.pillText,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.noteIconGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpIcon: {
    width: t.helpIcon,
    height: t.helpIcon,
    borderRadius: t.helpIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.helpIconGap,
  },
  helpTitle: {
    fontFamily: font.appHeading,
    fontSize: t.helpTitleSize,
    color: colors.textPrimary,
  },
  helpBody: {
    marginTop: t.helpBodyGap,
    fontFamily: font.appBody,
    fontSize: t.helpBodySize,
    lineHeight: t.helpBodyLineHeight,
    color: colors.textBody,
  },
  helpButton: {
    marginTop: t.helpButtonGap,
    minHeight: t.helpButtonHeight,
    borderRadius: t.helpButtonRadius,
    backgroundColor: t.helpButtonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.helpButtonSize,
    color: colors.textPrimary,
  },
  helpButtonIcon: {
    marginLeft: t.helpButtonIconGap,
  },
  button: {
    marginTop: t.cardGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  spacer: {
    flex: 1,
    minHeight: t.buttonGap,
  },
  footerLine: {
    marginTop: t.footerLineGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footerLineSize,
    color: colors.textBody,
  },
});
