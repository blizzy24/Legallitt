import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { useTrackingModel } from "../../features/legal-notice/useTrackingModel";
import { previewNotice } from '../../components/PreviewNotice';
import DemoPressable from '../../components/DemoPressable';
import { useDemoWait } from '../../hooks/useDemoAdvance';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check, CircleUser, Copy, Download, Eye, FileCheck, FileText, Lock,
  MessageSquare, PenLine, Share2, ShieldCheck, Star, Target, User,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEGAL_NOTICE_ADVOCATE } from '../../data/advocates';
import SegmentedControl from '../../components/SegmentedControl';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';
import { colors, font, ink, tracking as t } from '../../constants/theme';
import { formatDate } from '../../data/cases';
import { useLegalNotice } from '../../context/legalNotice';
import { INVOICE, invoiceLines, invoiceTotal, rupees, tierFor, TRACKING, TRACKING_CURRENT, TRACKING_STEPS, type TrackingState } from '../../data/legalNotice';

const STATE_SEGMENTS: { key: TrackingState; label: string }[] = [
  { key: 'drafting', label: 'Drafting' },
  { key: 'approval', label: 'Approval' },
];

/** "19 Sep" from an ISO date. */
const shortDate = (iso: string) => formatDate(iso).replace(/ \d{4}$/, '');

const BAR_HEIGHT = t.barPadTop + t.homeHeight + t.barGap + 16 + t.barPadBottom;

// Legal Notice Tracking (design/31 "Drafting in Progress", design/32 "Awaiting Your
// Approval"). Both states live here behind a prototype-only toggle at the foot of
// the page (or ?state=approval). The decision route adds design/437 and proceeds
// through delivery; the existing Arjun profile assignment is preserved.
export type NoticeTrackingData = {
  invoice: typeof INVOICE;
  tracking: Omit<typeof TRACKING, 'advocate'> & {advocate: Omit<typeof TRACKING.advocate, 'rating'|'reviews'> & {rating: number|string; reviews: number|string}};
  steps: typeof TRACKING_STEPS;
};
export function TrackingScreenView({ decision = false, data, form, navigate, currentStep, paidAmount, onViewDraft, onApprove, onViewProfile, allowDemoAdvance = true }: {
  decision?: boolean; data: NoticeTrackingData; currentStep?: number; paidAmount?: number | null; onViewProfile?: () => void; onViewDraft?: () => void; onApprove?: () => void; allowDemoAdvance?: boolean;
  form: ReturnType<typeof useLegalNotice>['form']; navigate: typeof router;
}) {
  const { invoice: INVOICE, tracking: TRACKING, steps: TRACKING_STEPS } = data;
  const router = navigate;
  const params = useLocalSearchParams<{ state?: string }>();
  const [state, setState] = useState<TrackingState>(params.state === 'approval' ? 'approval' : 'drafting');
  const insets = useSafeAreaInsets();
  const tier = tierFor(form.tier);
  const paid = paidAmount === undefined ? invoiceTotal(invoiceLines(form.tier)) : paidAmount;
  const approval = currentStep === undefined ? state === 'approval' : currentStep === 5;
  // DEMO: Drafting in Progress waits on the advocate; it moves to Awaiting Your Approval.
  useDemoWait(allowDemoAdvance && !approval && !decision, () => setState('approval'));
  const current = currentStep ?? TRACKING_CURRENT[state];
  const statusLabel = TRACKING_STEPS[current - 1].title;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
          <ArrowLeft size={t.headerIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Legal Notice Tracking</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={() => previewNotice("Share")} accessibilityRole="button" accessibilityLabel="Share" hitSlop={10}>
            <Share2 size={t.shareIcon} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.avatar}>
            <User size={t.avatarIcon} color={ink.onBrand} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: approval ? BAR_HEIGHT + insets.bottom + t.cardGap : insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {approval && (
          <View style={styles.idChip}>
            <Text style={styles.idChipLabel}>REQUEST ID</Text>
            <Text style={styles.idChipValue}>#{INVOICE.requestId}</Text>
          </View>
        )}

        <View style={[styles.card, styles.statusCard, approval && styles.statusCardApproval]}>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{statusLabel}</Text>
            </View>
            <Text style={styles.tier}>{tier.tierLabel}</Text>
          </View>
          <Text style={styles.title}>{approval ? 'Your Legal Notice Draft is Ready' : 'Legal Notice Request Submitted'}</Text>
          <Text style={styles.desc}>
            {approval
              ? 'Your advocate has prepared the legal notice. Please review the draft carefully before approving it for dispatch.'
              : 'Your request and payment have been received. A verified advocate is preparing your legal notice.'}
          </Text>
          {!approval && (
            <View style={styles.idBox}>
              <Text style={styles.idLabel}>REQUEST ID</Text>
              <Text style={styles.idValue}>#{INVOICE.requestId}</Text>
              <View style={styles.spacer} />
              <Pressable onPress={() => previewNotice("Copy request ID")} accessibilityRole="button" accessibilityLabel="Copy request ID" style={styles.copy}>
                <Copy size={t.copyIcon} color={colors.textPrimary} />
                <Text style={styles.copyText}>Copy</Text>
              </Pressable>
            </View>
          )}
        </View>

        <SectionRow label="NOTICE DETAILS" right={`Ref: ${TRACKING.ref}`} />
        <View style={[styles.card, styles.table]}>
          <TableRow label="Notice Type">
            <Text style={styles.rowValue}>{INVOICE.service}</Text>
          </TableRow>
          <TableRow label="Service">
            <View style={styles.urgent}>
              <Text style={styles.urgentText}>{tier.label}</Text>
            </View>
            <Text style={styles.rowValue}>{tier.trackingSpeed}</Text>
          </TableRow>
          <TableRow label="Submitted On">
            <Text style={styles.rowValue}>{(TRACKING.submittedOn ? formatDate(TRACKING.submittedOn) : '')}</Text>
          </TableRow>
          <TableRow label="Current Status">
            <View style={styles.statusPill}>
              <View style={styles.pillDot} />
              <Text style={styles.statusPillText}>{decision ? "Awaiting Your Approval" : statusLabel}</Text>
            </View>
          </TableRow>
        </View>

        <SectionRow label="ASSIGNED ADVOCATE" right="Verified Advocate" icon={<BadgeCheck size={t.sectionLinkIcon} color={ink.accent} />} />
        <View style={[styles.card, styles.adv]}>
          <View style={styles.advRow}>
            <AdvocateAvatar name={TRACKING.advocate.name} style={styles.avatarLarge}><Text style={styles.avatarText}>{TRACKING.advocate.initials}</Text></AdvocateAvatar>
            <View style={styles.advText}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{TRACKING.advocate.name}</Text>
                <BadgeCheck size={t.tickSize} color={colors.brand} />
              </View>
              <Text style={styles.meta}>
                {TRACKING.advocate.experience} · {TRACKING.advocate.practice}
              </Text>
              <View style={styles.barRow}>
                <Text style={styles.bar}>Bar Reg: {TRACKING.advocate.barReg}</Text>
                <Text style={styles.barDot}>·</Text>
                <Star size={t.starSize} color={colors.brand} fill={colors.brand} />
                <Text style={styles.rating}>
                  {' '}
                  {TRACKING.advocate.rating} ({TRACKING.advocate.reviews} reviews)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.buttons}>
            <Pressable accessibilityRole="button" onPress={onViewProfile ?? (() => router.push(`/advocates/${LEGAL_NOTICE_ADVOCATE.id}`))} style={[styles.button, styles.buttonOutline]}>
              <CircleUser size={t.buttonIcon} color={colors.textPrimary} />
              <Text style={styles.buttonText}>View Profile</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push('/chat/advocate')} style={[styles.button, styles.buttonFill]}>
              <MessageSquare size={t.buttonIcon} color={ink.onBrand} />
              <Text style={[styles.buttonText, styles.buttonTextFill]}>Chat with Advocate</Text>
            </Pressable>
          </View>
        </View>

        <SectionRow label="REQUEST STATUS" right="Live Updates" />
        {approval && !decision ? (
          <View style={[styles.card, styles.draft]}>
            <View style={styles.draftRow}>
              <View style={styles.draftTile}>
                <FileText size={t.draftTileIcon} color={colors.brand} strokeWidth={1.5} />
              </View>
              <View style={styles.draftText}>
                <Text style={styles.draftTitle}>{TRACKING.draftFile}</Text>
                <Text style={styles.draftNote}>Prepared by {TRACKING.advocate.name}</Text>
                <Text style={styles.reviewDesc}>Please review the notice before approving it for dispatch.</Text>
              </View>
            </View>
            <Pressable onPress={onViewDraft ?? (() => previewNotice("Review Draft"))} accessibilityRole="button" style={styles.review}>
              <Eye size={t.reviewIcon} color={ink.onBrand} />
              <Text style={styles.reviewText}>Review Draft</Text>
              <ArrowRight size={t.reviewIcon} color={ink.onBrand} />
            </Pressable>
            <Pressable onPress={onViewDraft ?? (() => previewNotice("Download PDF"))} accessibilityRole="link" style={styles.download}>
              <Download size={t.downloadIcon} color={ink.accent} />
              <Text style={styles.downloadText}>Download PDF</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.card, styles.timeline]}>
            {TRACKING_STEPS.map((step, i) => (
              <TimelineStep key={step.title} index={i + 1} step={step} current={current} paid={paid} tracking={TRACKING} last={i === TRACKING_STEPS.length - 1} />
            ))}
          </View>
        )}

        <SectionRow label="LEGAL NOTICE DRAFT" right="PDF Document Updates" />
        <View style={[styles.card, styles.draft]}>
          <View style={styles.draftRow}>
            <View style={styles.draftTile}><FileText size={t.draftTileIcon} color={colors.brand} /></View>
            <View style={styles.draftText}>
              <Text style={styles.draftTitle}>{TRACKING.draftFile}</Text>
              <Text style={styles.draftNote}>{decision ? `Prepared by ${TRACKING.advocate.name}` : 'Being prepared by your advocate'}</Text>
              <Text style={styles.reviewDesc}>{decision ? 'Please review the notice before approving it for dispatch.' : 'Available after drafting is complete'}</Text>
            </View>
          </View>
          {decision ? <>
            <Pressable accessibilityRole="button" style={styles.review} onPress={onViewDraft ?? (() => router.push('/documents/file?name=Legal_Notice_Draft_v1.pdf'))}><Eye size={t.reviewIcon} color={ink.onBrand}/><Text style={styles.reviewText}>Review Draft →</Text></Pressable>
            <Pressable accessibilityRole="button" style={styles.download} onPress={onViewDraft ?? (() => router.push('/documents/file?name=Legal_Notice_Draft_v1.pdf'))}><Download size={t.downloadIcon} color={ink.accent}/><Text style={styles.downloadText}>Download PDF</Text></Pressable>
          </> : <View style={styles.view}><Lock size={t.viewIcon} color={t.disabledText}/><Text style={styles.viewText}>View Draft</Text></View>}
        </View>
        {decision ? <>
          <Text style={[styles.title, { marginTop: t.sectionGap }]}>Your Decision</Text>
          <Pressable accessibilityRole="button" style={styles.home} onPress={onApprove ?? (() => router.push('/legal-notice/delivery'))}><BadgeCheck size={t.homeIcon} color={ink.onBrand}/><Text style={styles.homeText}>Approve & Proceed</Text></Pressable>
          <Pressable accessibilityRole="button" style={[styles.button, { marginTop: t.cardGap, backgroundColor: colors.card }]} onPress={() => router.push('/legal-notice/request-changes')}><PenLine size={t.buttonIcon} color={ink.accent}/><Text style={styles.buttonText}>Request Changes</Text></Pressable>
        </> : approval ? <TextInput multiline placeholder="Describe what you would like to change" placeholderTextColor={t.placeholder} textAlignVertical="top" accessibilityLabel="Describe what you would like to change" style={styles.change}/> : <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')} style={styles.home}><Target size={t.homeIcon} color={ink.onBrand}/><Text style={styles.homeText}>Back To Home</Text></Pressable>}

        {/* Development only — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts. */}
        {allowDemoAdvance && DEV_PREVIEW_TOGGLES && (
        <View style={styles.toggle}>
          <Text style={styles.toggleLabel}>Preview state</Text>
          <SegmentedControl segments={STATE_SEGMENTS} value={state} onChange={setState} style={styles.toggleControl} />
        </View>
        )}
      </ScrollView>

      {approval && (
        <View style={[styles.fixedBar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
          <DemoPressable accessibilityRole="button" onPress={() => router.push('/legal-notice/request-submitted')} style={[styles.home, styles.barButton]}>
            <FileCheck size={t.homeIcon} color={ink.onBrand} />
            <Text style={styles.homeText}>Review & Approve Draft</Text>
            <ArrowRight size={t.buttonIcon} color={ink.onBrand} />
          </DemoPressable>
          <View style={styles.caption}>
            <ShieldCheck size={t.captionIcon} color={colors.textBody} />
            <Text style={styles.captionText}>Your information is secure and confidential.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function SectionRow({ label, right, icon }: { label: string; right: string; icon?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionRight}>
        {icon}
        <Text style={styles.sectionLink}>{right}</Text>
      </View>
    </View>
  );
}

function TableRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );
}

function TimelineStep({ index, step, current, paid, last, tracking: TRACKING }: { index: number; step: { title: string; description: string }; current: number; paid: number | null; last: boolean; tracking: NoticeTrackingData["tracking"] }) {
  const done = index < current;
  const active = index === current;
  const pending = index > current;
  const meta =
    index === 1 ? (TRACKING.submittedOn ? `${shortDate(TRACKING.submittedOn)}, ${TRACKING.submittedAt}` : '')
    : index === 2 ? (paid === null ? '' : `${rupees(paid)} via UPI`)
    : index === 3 ? TRACKING.advocate.name
    : pending ? 'Pending' : '';

  return (
    <View style={[styles.step, last ? null : { minHeight: active ? t.boxMin : t.tlRowMin }, active && styles.stepActive]}>
      <View style={styles.stepRail}>
        <View style={[styles.disc, done && styles.discDone, active && styles.discActive, pending && styles.discPending]}>
          {done && <Check size={t.tlIcon} color={ink.onBrand} strokeWidth={3} />}
          {active && <PenLine size={t.tlIcon} color={ink.onBrand} />}
          {pending && <Text style={styles.discNumber}>{index}</Text>}
        </View>
        {!last && <View style={[styles.line, { backgroundColor: pending ? t.linePending : t.lineDone }]} />}
      </View>
      {active ? (
        <View style={styles.box}>
          <View style={styles.stepHead}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <View style={styles.est}>
              <Text style={styles.estText}>
                EST. {(TRACKING.estimate.date ? shortDate(TRACKING.estimate.date).toUpperCase() : '')}, {TRACKING.estimate.time}
              </Text>
            </View>
          </View>
          <Text style={styles.stepDesc}>{step.description}</Text>
        </View>
      ) : (
        <View style={styles.stepBody}>
          <View style={styles.stepHead}>
            <Text style={[styles.stepTitle, pending && styles.stepTitlePending]}>{step.title}</Text>
            <Text style={styles.stepMeta}>{meta}</Text>
          </View>
          <Text style={styles.stepDesc}>{step.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingBottom: t.headerBottom,
    backgroundColor: colors.appBg,
    paddingHorizontal: t.headerPadX,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.headerTitleSize,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.shareGap,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: t.padX,
    paddingTop: t.cardGap,
  },
  idChip: {
    alignSelf: 'flex-start',
    height: t.idChipHeight,
    borderRadius: t.idChipHeight / 2,
    paddingHorizontal: t.idChipPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.idChipGapX,
    marginBottom: t.idChipGap,
  },
  idChipLabel: {
    fontFamily: font.appSemi,
    fontSize: t.idChipTextSize,
    letterSpacing: 0.5,
    color: colors.textMuted,
  },
  idChipValue: {
    fontFamily: font.appHeading,
    fontSize: t.idChipTextSize,
    color: colors.textPrimary,
  },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusCard: {
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  statusCardApproval: {
    paddingBottom: t.cardPadTop,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    height: t.pillHeight,
    borderRadius: t.pillHeight / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillDotGap,
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    backgroundColor: colors.brand,
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillTextSize,
    color: t.statusText,
  },
  tier: {
    fontFamily: font.appBody,
    fontSize: t.tierTextSize,
    color: t.statusText,
  },
  title: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  desc: {
    marginTop: t.descGap,
    fontFamily: font.appBody,
    fontSize: t.descSize,
    lineHeight: t.descLineHeight,
    color: colors.textMuted,
  },
  idBox: {
    marginTop: t.idBoxGap,
    height: t.idBoxHeight,
    borderRadius: t.idBoxRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: t.idBoxPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idLabel: {
    fontFamily: font.appSemi,
    fontSize: t.idLabelSize,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginRight: t.idLabelGap,
  },
  idValue: {
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  copy: {
    height: t.copyHeight,
    borderRadius: 8,
    paddingHorizontal: t.copyPadX,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.copyIconGap,
  },
  copyText: {
    fontFamily: font.appSemi,
    fontSize: t.copyTextSize,
    color: colors.textPrimary,
  },
  section: {
    marginTop: t.sectionGap,
    marginBottom: t.sectionCardGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionLink: {
    fontFamily: font.appBody,
    fontSize: t.sectionLinkSize,
    color: ink.accent,
  },
  table: {
    paddingHorizontal: t.cardPad,
    paddingTop: t.tablePadTop,
    paddingBottom: t.tablePadBottom,
    gap: t.rowGap,
  },
  row: {
    height: t.rowHeight,
    borderRadius: t.rowRadius,
    backgroundColor: t.rowBg,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textMuted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.urgentGap,
  },
  rowValue: {
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  urgent: {
    height: t.urgentHeight,
    borderRadius: 5,
    paddingHorizontal: t.urgentPadX,
    backgroundColor: t.urgentBg,
    justifyContent: 'center',
  },
  urgentText: {
    fontFamily: font.appSemi,
    fontSize: t.urgentTextSize,
    letterSpacing: 0.6,
    color: ink.accent,
  },
  statusPill: {
    height: t.statusPillHeight,
    borderRadius: t.statusPillHeight / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillDotGap,
  },
  statusPillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillTextSize,
    color: colors.textPrimary,
  },
  adv: {
    padding: t.advPad,
    paddingHorizontal: t.cardPad,
    paddingBottom: t.advPadBottom,
  },
  advRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: t.avatarLarge,
    height: t.avatarLarge,
    borderRadius: t.avatarLarge / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.advTextGap,
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: t.avatarTextSize,
    color: ink.accent,
  },
  advText: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.tickGap,
  },
  name: {
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: t.metaGap,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: colors.textMuted,
  },
  barRow: {
    marginTop: t.metaGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    fontFamily: font.appBody,
    fontSize: t.barSize,
    color: colors.textMuted,
  },
  barDot: {
    marginHorizontal: 6,
    fontFamily: font.appBody,
    fontSize: t.barSize,
    color: colors.textMuted,
  },
  rating: {
    fontFamily: font.appSemi,
    fontSize: t.barSize,
    color: ink.accent,
  },
  buttons: {
    marginTop: t.buttonsGap,
    flexDirection: 'row',
    gap: t.buttonGap,
  },
  button: {
    flex: 1,
    minWidth: 0,
    height: t.buttonHeight,
    borderRadius: t.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap,
    paddingHorizontal: 12,
  },
  buttonOutline: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonFill: {
    backgroundColor: colors.brand,
  },
  buttonText: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.buttonTextSize,
    color: colors.textPrimary,
  },
  buttonTextFill: {
    color: ink.onBrand,
  },
  timeline: {
    padding: t.tlPad,
    paddingHorizontal: t.cardPad,
  },
  step: {
    flexDirection: 'row',
  },
  stepActive: {
    marginBottom: t.boxAfter,
  },
  stepRail: {
    width: t.tlCircle,
    alignItems: 'center',
    marginRight: t.tlGap,
  },
  disc: {
    width: t.tlCircle,
    height: t.tlCircle,
    borderRadius: t.tlCircle / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: {
    backgroundColor: colors.brand,
  },
  discActive: {
    backgroundColor: t.currentDisc,
  },
  discPending: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: t.pendingBorder,
  },
  discNumber: {
    fontFamily: font.appSemi,
    fontSize: t.tlNumberSize,
    color: t.pendingText,
  },
  line: {
    flex: 1,
    width: 2,
    marginVertical: t.tlLineGap,
  },
  stepBody: {
    flex: 1,
    minWidth: 0,
    paddingTop: 3,
  },
  box: {
    flex: 1,
    minWidth: 0,
    minHeight: t.boxMin,
    borderRadius: t.boxRadius,
    backgroundColor: t.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.boxPad,
  },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.tlTitleSize,
    color: colors.textPrimary,
  },
  stepTitlePending: {
    color: colors.textBody,
  },
  stepMeta: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.tlMetaSize,
    color: colors.textMuted,
  },
  stepDesc: {
    marginTop: t.tlDescGap,
    fontFamily: font.appBody,
    fontSize: t.tlDescSize,
    color: colors.textMuted,
  },
  est: {
    marginLeft: 8,
    height: t.estHeight,
    borderRadius: 5,
    paddingHorizontal: t.estPadX,
    backgroundColor: t.estBg,
    justifyContent: 'center',
  },
  estText: {
    fontFamily: font.appSemi,
    fontSize: t.estTextSize,
    letterSpacing: 0.4,
    color: ink.accent,
  },
  draft: {
    padding: t.draftPad,
    paddingHorizontal: t.cardPad,
    paddingBottom: t.draftPadBottom,
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  draftTile: {
    width: t.draftTile,
    height: t.draftTile,
    borderRadius: t.draftTileRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.draftTextGap,
  },
  draftText: {
    flex: 1,
    minWidth: 0,
  },
  draftTitle: {
    marginTop: t.draftTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.draftTitleSize,
    color: colors.textPrimary,
  },
  draftChip: {
    marginTop: t.draftChipGap,
    alignSelf: 'flex-start',
    height: t.draftChipHeight,
    borderRadius: 6,
    paddingHorizontal: t.draftChipPadX,
    backgroundColor: t.draftChipBg,
    justifyContent: 'center',
  },
  draftChipText: {
    fontFamily: font.appBody,
    fontSize: t.draftChipTextSize,
    color: t.draftChipText,
  },
  draftNote: {
    marginTop: t.draftNoteGap,
    fontFamily: font.appBody,
    fontSize: t.draftNoteSize,
    color: colors.textMuted,
  },
  reviewDesc: {
    marginTop: t.reviewDescGap,
    fontFamily: font.appBody,
    fontSize: t.reviewDescSize,
    lineHeight: t.reviewDescLineHeight,
    color: colors.textBody,
  },
  view: {
    marginTop: t.viewGap,
    height: t.viewHeight,
    borderRadius: t.viewRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap,
  },
  viewText: {
    fontFamily: font.appSemi,
    fontSize: t.viewTextSize,
    color: t.disabledText,
  },
  review: {
    marginTop: t.reviewGap,
    height: t.reviewHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap,
  },
  reviewText: {
    fontFamily: font.appSemi,
    fontSize: t.reviewTextSize,
    color: ink.onBrand,
  },
  download: {
    marginTop: t.downloadGap,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadText: {
    fontFamily: font.appSemi,
    fontSize: t.downloadTextSize,
    color: ink.accent,
  },
  change: {
    marginTop: t.changeGap,
    height: t.changeHeight,
    borderRadius: t.changeRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: t.changePadX,
    paddingVertical: t.changePadY,
    fontFamily: font.appBody,
    fontSize: t.changeTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  home: {
    marginTop: t.homeGap,
    height: t.homeHeight,
    borderRadius: t.homeRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap + 2,
  },
  homeText: {
    fontFamily: font.appSemi,
    fontSize: t.homeTextSize,
    color: ink.onBrand,
  },
  barButton: {
    marginTop: 0,
  },
  fixedBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.appBg,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    paddingTop: t.barPadTop,
    paddingHorizontal: t.barPadX,
  },
  caption: {
    marginTop: t.barGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  captionText: {
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
  toggle: {
    marginTop: t.toggleGap,
    alignItems: 'center',
    gap: 8,
  },
  toggleControl: {
    alignSelf: 'stretch',
  },
  toggleLabel: {
    fontFamily: font.appBody,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textMuted,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function TrackingScreen({ decision = false }: { decision?: boolean } = {}) {
  const model = useTrackingModel();
  return <TrackingScreenView decision={decision} {...model} />;
}
