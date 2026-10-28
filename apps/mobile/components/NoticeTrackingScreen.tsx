import { router } from 'expo-router';
import {
  ArrowLeft, BadgeCheck, Check, CircleUser, Copy, Download, Eye, FileText, Lock, MessageSquare, PenLine, Star, User,
} from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdvocateAvatar } from './AdvocateAvatar';
import { colors, font, ink, tracking as t } from '../constants/theme';
import { formatDate } from '../data/cases';
import { rupees, type ServiceTier, type TrackingStep } from '../data/legalNotice';
import { useDemoWait } from '../hooks/useDemoAdvance';

// Legal Notice Tracking, design 437 (docs/CHUNK-1-TRACKING.md). One screen, four
// states: drafting, review, approved (nothing to decide yet) and dispatched (the
// drawn route to delivery). The seven-step timeline and the single draft card are
// present in every state. Tapping Request Changes shows design 438: the same
// screen reduced to the header and NOTICE DETAILS, with the textarea revealed by
// that tap and never before it. Designs 31 and 32 are superseded and not rendered.
export type NoticeTrackingStage = 'drafting' | 'review' | 'approved' | 'dispatched';
export type NoticeTrackingAdvocate = {
  id: string; name: string; initials: string; experience: string; practice: string;
  barReg: string; rating: string; reviews: string; verified: boolean;
};
export type NoticeTrackingModel = {
  stage: NoticeTrackingStage;
  requestId: string; ref: string; noticeType: string; tier: ServiceTier;
  submittedOn: string; submittedAt: string; estimate: { date: string; time: string };
  steps: TrackingStep[];
  /** Steps that have happened; the next is the active one while `stepActive`. */
  ticked: number; stepActive: boolean;
  /** Absent until the case has one — then the whole ASSIGNED ADVOCATE section is absent. */
  advocate: NoticeTrackingAdvocate | null;
  paidAmount: number | null; draftFile: string;
  allowDemoAdvance: boolean;
  onViewDraft: () => void; onApprove: () => void; onRequestChanges: (comment: string) => void;
  onViewProfile: () => void; onChat: () => void; onDelivery: () => void;
};

/** "19 Sep" from an ISO date. */
const shortDate = (iso: string) => formatDate(iso).replace(/ \d{4}$/, '');

export default function NoticeTrackingScreen({ model: m }: { model: NoticeTrackingModel }) {
  const insets = useSafeAreaInsets();
  // DEMO (fixture only): Drafting in Progress waits on the advocate, then follows the flow map.
  useDemoWait(m.allowDemoAdvance && m.stage === 'drafting');
  const ready = m.stage !== 'drafting';
  // 438: revealed by the tap, and withdrawn when the case leaves review.
  const [requesting, setRequesting] = useState(false);
  const [comment, setComment] = useState('');
  useEffect(() => { if (m.stage !== 'review') setRequesting(false); }, [m.stage]);
  const changes = requesting && m.stage === 'review';
  // The pill names the stage; the timeline below follows the events. Approved and
  // beyond print no pill: no drawn status is true of the case then.
  const pill = m.stage === 'drafting' ? 'Drafting in Progress' : m.stage === 'review' ? 'Awaiting Your Approval' : '';
  const current = m.ticked + 1;
  const adv = m.advocate;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
          <ArrowLeft size={t.headerIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Legal Notice Tracking</Text>
        <View style={styles.avatar}>
          <User size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {changes && Boolean(m.requestId) && (
          <View style={styles.idChip}>
            <Text style={styles.idChipLabel}>REQUEST ID</Text>
            <Text style={styles.idChipValue}>#{m.requestId}</Text>
          </View>
        )}
        <View style={[styles.card, styles.statusCard, (changes || !m.requestId) && styles.statusCardNoId]}>
          <View style={styles.pillRow}>
            {Boolean(pill) && (
              <View style={styles.pill}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>{pill}</Text>
              </View>
            )}
            <Text style={styles.tier}>{m.tier.tierLabel}</Text>
          </View>
          <Text style={styles.title}>{ready ? 'Your Legal Notice Draft is Ready' : 'Legal Notice Request Submitted'}</Text>
          <Text style={styles.desc}>
            {ready
              ? 'Your advocate has prepared the legal notice. Please review the draft carefully before approving it for dispatch.'
              : 'Your request and payment have been received. A verified advocate is preparing your legal notice.'}
          </Text>
          {!changes && Boolean(m.requestId) && (
            <View style={styles.idBox}>
              <Text style={styles.idLabel}>REQUEST ID</Text>
              <Text style={styles.idValue}>#{m.requestId}</Text>
              <View style={styles.spacer} />
              <Pressable
                onPress={() => { if (typeof navigator !== 'undefined') void navigator.clipboard?.writeText(m.requestId); }}
                accessibilityRole="button" accessibilityLabel="Copy request ID" style={styles.copy}
              >
                <Copy size={t.copyIcon} color={colors.textPrimary} />
                <Text style={styles.copyText}>Copy</Text>
              </Pressable>
            </View>
          )}
        </View>

        <SectionRow label="NOTICE DETAILS" right={m.ref ? `Ref: ${m.ref}` : ''} />
        <View style={[styles.card, styles.table]}>
          <TableRow label="Notice Type">
            <Text style={styles.rowValue}>{m.noticeType}</Text>
          </TableRow>
          <TableRow label="Service">
            <View style={styles.urgent}>
              <Text style={styles.urgentText}>{m.tier.label}</Text>
            </View>
            <Text style={styles.rowValue}>{m.tier.trackingSpeed}</Text>
          </TableRow>
          {Boolean(m.submittedOn) && (
            <TableRow label="Submitted On">
              <Text style={styles.rowValue}>{formatDate(m.submittedOn)}</Text>
            </TableRow>
          )}
          {Boolean(pill) && (
            <TableRow label="Current Status">
              <View style={styles.statusPill}>
                <View style={styles.pillDot} />
                <Text style={styles.statusPillText}>{pill}</Text>
              </View>
            </TableRow>
          )}
        </View>

        {changes ? (
          <>
            <Text style={[styles.title, styles.decisionTitle]}>Your Decision</Text>
            <TextInput
              value={comment} onChangeText={setComment} multiline textAlignVertical="top"
              placeholder="Describe what you would like to change" placeholderTextColor={t.placeholder}
              accessibilityLabel="Describe what you would like to change" style={styles.change}
            />
            <Pressable accessibilityRole="button" style={styles.primary} onPress={() => { if (comment.trim()) m.onRequestChanges(comment.trim()); }}>
              <PenLine size={t.homeIcon} color={ink.onBrand} />
              <Text style={styles.primaryText}>Request Changes</Text>
            </Pressable>
          </>
        ) : (
        <>
        {adv && (
          <>
            <SectionRow label="ASSIGNED ADVOCATE" right={adv.verified ? 'Verified Advocate' : ''}
              icon={adv.verified ? <BadgeCheck size={t.sectionLinkIcon} color={ink.accent} /> : undefined} />
            <View style={[styles.card, styles.adv]}>
              <View style={styles.advRow}>
                <AdvocateAvatar name={adv.name} style={styles.avatarLarge}><Text style={styles.avatarText}>{adv.initials}</Text></AdvocateAvatar>
                <View style={styles.advText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{adv.name}</Text>
                    {adv.verified && <BadgeCheck size={t.tickSize} color={colors.brand} />}
                  </View>
                  {/* Absent facts take their separators, icons and brackets with them. */}
                  {Boolean(adv.experience || adv.practice) && (
                    <Text style={styles.meta}>
                      {adv.experience}{Boolean(adv.experience && adv.practice) && ' · '}{adv.practice}
                    </Text>
                  )}
                  {Boolean(adv.barReg || adv.rating) && (
                    <View style={styles.barRow}>
                      {Boolean(adv.barReg) && <Text style={styles.bar}>Bar Reg: {adv.barReg}</Text>}
                      {Boolean(adv.barReg && adv.rating) && <Text style={styles.barDot}>·</Text>}
                      {Boolean(adv.rating) && <Star size={t.starSize} color={colors.brand} fill={colors.brand} />}
                      {Boolean(adv.rating) && (
                        <Text style={styles.rating}>
                          {' '}
                          {adv.rating}{Boolean(adv.reviews) && <> ({adv.reviews} reviews)</>}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.buttons}>
                <Pressable accessibilityRole="button" onPress={m.onViewProfile} style={[styles.button, styles.buttonOutline]}>
                  <CircleUser size={t.buttonIcon} color={colors.textPrimary} />
                  <Text style={styles.buttonText}>View Profile</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={m.onChat} style={[styles.button, styles.buttonFill]}>
                  <MessageSquare size={t.buttonIcon} color={ink.onBrand} />
                  <Text style={[styles.buttonText, styles.buttonTextFill]}>Chat with Advocate</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        <SectionRow label="REQUEST STATUS" right="Live Updates" />
        <View style={[styles.card, styles.timeline]}>
          {m.steps.map((step, i) => (
            <TimelineStep key={step.title} index={i + 1} step={step} current={current} activeStep={m.stepActive} model={m} last={i === m.steps.length - 1} />
          ))}
        </View>

        <SectionRow label="LEGAL NOTICE DRAFT" right="PDF Document Updates" />
        <View style={[styles.card, styles.draft]}>
          <View style={styles.draftRow}>
            <View style={styles.draftTile}><FileText size={t.draftTileIcon} color={colors.brand} /></View>
            <View style={styles.draftText}>
              {Boolean(m.draftFile) && <Text style={styles.draftTitle}>{m.draftFile}</Text>}
              {ready ? (
                <>
                  {adv && <Text style={styles.draftNote}>Prepared by {adv.name}</Text>}
                  <Text style={styles.reviewDesc}>Please review the notice before approving it for dispatch.</Text>
                </>
              ) : (
                <>
                  <View style={styles.draftChip}><Text style={styles.draftChipText}>Being prepared by your advocate</Text></View>
                  <Text style={styles.reviewDesc}>Available after drafting is complete</Text>
                </>
              )}
            </View>
          </View>
          {ready ? (
            <>
              <Pressable accessibilityRole="button" style={styles.review} onPress={m.onViewDraft}>
                <Eye size={t.reviewIcon} color={ink.onBrand} />
                <Text style={styles.reviewText}>Review Draft →</Text>
              </Pressable>
              <Pressable accessibilityRole="link" style={styles.download} onPress={m.onViewDraft}>
                <Download size={t.downloadIcon} color={ink.accent} />
                <Text style={styles.downloadText}>Download PDF</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.view}><Lock size={t.viewIcon} color={t.disabledText} /><Text style={styles.viewText}>View Draft</Text></View>
          )}
        </View>

        {m.stage === 'review' && (
          <>
            <Text style={[styles.title, styles.decisionTitle]}>Your Decision</Text>
            <Pressable accessibilityRole="button" style={styles.primary} onPress={m.onApprove}>
              <BadgeCheck size={t.homeIcon} color={ink.onBrand} />
              <Text style={styles.primaryText}>Approve & Proceed</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={[styles.button, styles.secondary]} onPress={() => setRequesting(true)}>
              <PenLine size={t.buttonIcon} color={ink.accent} />
              <Text style={styles.buttonText}>Request Changes</Text>
            </Pressable>
          </>
        )}
        {/* Once the notice has shipped, 437's primary button is the drawn route to delivery tracking. */}
        {m.stage === 'dispatched' && (
          <>
            <Text style={[styles.title, styles.decisionTitle]}>Your Decision</Text>
            <Pressable accessibilityRole="button" style={styles.primary} onPress={m.onDelivery}>
              <BadgeCheck size={t.homeIcon} color={ink.onBrand} />
              <Text style={styles.primaryText}>Approve & Proceed</Text>
            </Pressable>
          </>
        )}
        </>
        )}
      </ScrollView>
    </View>
  );
}

function SectionRow({ label, right, icon }: { label: string; right: string; icon?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionRight}>
        {icon}
        {Boolean(right) && <Text style={styles.sectionLink}>{right}</Text>}
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

function TimelineStep({ index, step, current, activeStep, model: m, last }: {
  index: number; step: TrackingStep; current: number; activeStep: boolean; model: NoticeTrackingModel; last: boolean;
}) {
  const done = index < current;
  const active = index === current && activeStep;
  const pending = !done && !active;
  const meta =
    index === 1 ? [m.submittedOn ? shortDate(m.submittedOn) : '', m.submittedAt].filter(Boolean).join(', ')
    : index === 2 ? (m.paidAmount === null ? '' : `${rupees(m.paidAmount)} via UPI`)
    : index === 3 ? (done ? m.advocate?.name ?? '' : '')
    : '';

  return (
    <View style={[styles.step, last ? null : { minHeight: active ? t.boxMin : t.tlRowMin }, active && styles.stepActive]}>
      <View style={styles.stepRail}>
        <View style={[styles.disc, done && styles.discDone, active && styles.discActive, pending && styles.discPending]}>
          {done && <Check size={t.tlIcon} color={ink.onBrand} strokeWidth={3} />}
          {active && <PenLine size={t.tlIcon} color={ink.onBrand} />}
          {pending && <Text style={styles.discNumber}>{index}</Text>}
        </View>
        {!last && <View style={[styles.line, { backgroundColor: done ? t.lineDone : t.linePending }]} />}
      </View>
      {active ? (
        <View style={styles.box}>
          <View style={styles.stepHead}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            {Boolean(m.estimate.date) && (
              <View style={styles.est}>
                <Text style={styles.estText}>
                  EST. {shortDate(m.estimate.date).toUpperCase()}{Boolean(m.estimate.time) && ', '}{Boolean(m.estimate.time) && m.estimate.time}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.stepDesc}>{step.description}</Text>
        </View>
      ) : (
        <View style={styles.stepBody}>
          <View style={styles.stepHead}>
            <Text style={[styles.stepTitle, pending && styles.stepTitlePending]}>{step.title}</Text>
            <Text style={styles.stepMeta}>{pending ? 'Pending' : meta}</Text>
          </View>
          <Text style={styles.stepDesc}>{step.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
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
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap },
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
  statusCardNoId: { paddingBottom: t.cardPadTop },
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
  idChipLabel: { fontFamily: font.appSemi, fontSize: t.idChipTextSize, letterSpacing: 0.5, color: colors.textMuted },
  idChipValue: { fontFamily: font.appHeading, fontSize: t.idChipTextSize, color: colors.textPrimary },
  pillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    height: t.pillHeight,
    borderRadius: t.pillHeight / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillDotGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: colors.brand },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillTextSize, color: t.statusText },
  tier: { marginLeft: 'auto', fontFamily: font.appBody, fontSize: t.tierTextSize, color: t.statusText },
  title: { marginTop: t.titleGap, fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  desc: { marginTop: t.descGap, fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: colors.textMuted },
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
  idLabel: { fontFamily: font.appSemi, fontSize: t.idLabelSize, letterSpacing: 0.8, color: colors.textMuted, marginRight: t.idLabelGap },
  idValue: { fontFamily: font.appHeading, fontSize: t.idValueSize, color: colors.textPrimary },
  spacer: { flex: 1 },
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
  copyText: { fontFamily: font.appSemi, fontSize: t.copyTextSize, color: colors.textPrimary },
  section: {
    marginTop: t.sectionGap,
    marginBottom: t.sectionCardGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { fontFamily: font.appSemi, fontSize: t.sectionSize, letterSpacing: t.sectionSpacing, color: colors.textBody },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionLink: { fontFamily: font.appBody, fontSize: t.sectionLinkSize, color: ink.accent },
  table: { paddingHorizontal: t.cardPad, paddingTop: t.tablePadTop, paddingBottom: t.tablePadBottom, gap: t.rowGap },
  row: {
    height: t.rowHeight,
    borderRadius: t.rowRadius,
    backgroundColor: t.rowBg,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textMuted },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: t.urgentGap },
  rowValue: { fontFamily: font.appHeading, fontSize: t.rowValueSize, color: colors.textPrimary },
  urgent: { height: t.urgentHeight, borderRadius: 5, paddingHorizontal: t.urgentPadX, backgroundColor: t.urgentBg, justifyContent: 'center' },
  urgentText: { fontFamily: font.appSemi, fontSize: t.urgentTextSize, letterSpacing: 0.6, color: ink.accent },
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
  statusPillText: { fontFamily: font.appSemi, fontSize: t.pillTextSize, color: colors.textPrimary },
  adv: { padding: t.advPad, paddingHorizontal: t.cardPad, paddingBottom: t.advPadBottom },
  advRow: { flexDirection: 'row', alignItems: 'center' },
  avatarLarge: {
    width: t.avatarLarge,
    height: t.avatarLarge,
    borderRadius: t.avatarLarge / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.advTextGap,
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarTextSize, color: ink.accent },
  advText: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: t.tickGap },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  meta: { marginTop: t.metaGap, fontFamily: font.appBody, fontSize: t.metaSize, color: colors.textMuted },
  barRow: { marginTop: t.metaGap, flexDirection: 'row', alignItems: 'center' },
  bar: { fontFamily: font.appBody, fontSize: t.barSize, color: colors.textMuted },
  barDot: { marginHorizontal: 6, fontFamily: font.appBody, fontSize: t.barSize, color: colors.textMuted },
  rating: { fontFamily: font.appSemi, fontSize: t.barSize, color: ink.accent },
  buttons: { marginTop: t.buttonsGap, flexDirection: 'row', gap: t.buttonGap },
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
  buttonOutline: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  buttonFill: { backgroundColor: colors.brand },
  buttonText: { flexShrink: 1, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.buttonTextSize, color: colors.textPrimary },
  buttonTextFill: { color: ink.onBrand },
  timeline: { padding: t.tlPad, paddingHorizontal: t.cardPad },
  step: { flexDirection: 'row' },
  stepActive: { marginBottom: t.boxAfter },
  stepRail: { width: t.tlCircle, alignItems: 'center', marginRight: t.tlGap },
  disc: { width: t.tlCircle, height: t.tlCircle, borderRadius: t.tlCircle / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: colors.brand },
  discActive: { backgroundColor: t.currentDisc },
  discPending: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: t.pendingBorder },
  discNumber: { fontFamily: font.appSemi, fontSize: t.tlNumberSize, color: t.pendingText },
  line: { flex: 1, width: 2, marginVertical: t.tlLineGap },
  stepBody: { flex: 1, minWidth: 0, paddingTop: 3 },
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
  stepHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.tlTitleSize, color: colors.textPrimary },
  stepTitlePending: { color: colors.textBody },
  stepMeta: { marginLeft: 8, fontFamily: font.appBody, fontSize: t.tlMetaSize, color: colors.textMuted },
  stepDesc: { marginTop: t.tlDescGap, fontFamily: font.appBody, fontSize: t.tlDescSize, color: colors.textMuted },
  est: { marginLeft: 8, height: t.estHeight, borderRadius: 5, paddingHorizontal: t.estPadX, backgroundColor: t.estBg, justifyContent: 'center' },
  estText: { fontFamily: font.appSemi, fontSize: t.estTextSize, letterSpacing: 0.4, color: ink.accent },
  draft: { padding: t.draftPad, paddingHorizontal: t.cardPad, paddingBottom: t.draftPadBottom },
  draftRow: { flexDirection: 'row', alignItems: 'flex-start' },
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
  draftText: { flex: 1, minWidth: 0 },
  draftTitle: { marginTop: t.draftTitleGap, fontFamily: font.appHeading, fontSize: t.draftTitleSize, color: colors.textPrimary },
  draftChip: {
    marginTop: t.draftChipGap,
    alignSelf: 'flex-start',
    height: t.draftChipHeight,
    borderRadius: 6,
    paddingHorizontal: t.draftChipPadX,
    backgroundColor: t.draftChipBg,
    justifyContent: 'center',
  },
  draftChipText: { fontFamily: font.appBody, fontSize: t.draftChipTextSize, color: t.draftChipText },
  draftNote: { marginTop: t.draftNoteGap, fontFamily: font.appBody, fontSize: t.draftNoteSize, color: colors.textMuted },
  reviewDesc: { marginTop: t.reviewDescGap, fontFamily: font.appBody, fontSize: t.reviewDescSize, lineHeight: t.reviewDescLineHeight, color: colors.textBody },
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
  viewText: { fontFamily: font.appSemi, fontSize: t.viewTextSize, color: t.disabledText },
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
  reviewText: { fontFamily: font.appSemi, fontSize: t.reviewTextSize, color: ink.onBrand },
  download: { marginTop: t.downloadGap, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4 },
  downloadText: { fontFamily: font.appSemi, fontSize: t.downloadTextSize, color: ink.accent },
  decisionTitle: { marginTop: t.sectionGap },
  change: {
    marginTop: t.changeGap,
    height: t.changeHeight,
    borderRadius: t.changeRadius,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.changePadX,
    paddingVertical: t.changePadY,
    fontFamily: font.appBody,
    fontSize: t.changeTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  primary: {
    marginTop: t.homeGap,
    height: t.homeHeight,
    borderRadius: t.homeRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap + 2,
  },
  primaryText: { fontFamily: font.appSemi, fontSize: t.homeTextSize, color: ink.onBrand },
  secondary: { marginTop: t.cardGap, backgroundColor: colors.card },
});
