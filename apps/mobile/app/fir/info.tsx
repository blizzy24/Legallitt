import { ApiError } from '@legalitt/shared';
import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight, Clock, FileText, Layers, Shield, SquarePen, Users, ZoomIn, type LucideIcon } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, firInfo as v, firLanding as l, font, ink } from '../../constants/theme';
import type { FirTurnaround } from '../../features/fir/client/format';
import { openFirDraftHref } from '../../features/fir/intake/draft';
import { InlineError } from '../../features/fir/intake/ui';
import { backend } from '../../lib/auth';

type Reason = { icon: LucideIcon; title: string; body: string };

const REASONS: Reason[] = [
  {
    icon: FileText,
    title: 'Present the Facts Clearly',
    body: 'A properly prepared draft helps organise the incident details in a clear and structured manner, making the key facts easier to understand.',
  },
  {
    icon: SquarePen,
    title: 'Capture the Important Details',
    body: 'Important information such as what happened, when and where it happened, and the people involved can be organised systematically.',
  },
  {
    icon: Layers,
    title: 'Create a Structured Account',
    body: 'A well-organised FIR draft brings the relevant information together in a logical sequence instead of leaving important details scattered or unclear.',
  },
  {
    icon: ZoomIn,
    title: 'Reduce Unnecessary Confusion',
    body: 'Clear wording and organised information can make it easier to review the incident and identify the details that require attention.',
  },
  {
    icon: Users,
    title: 'Professional Drafting Assistance',
    body: 'Legalitt helps collect the necessary information and prepares a professionally drafted FIR application based on the details provided by you.',
  },
];

const STEPS = [
  { title: 'Submit Your Request', body: 'Share the basic details of the incident with Legalitt.' },
  { title: 'Information Collection', body: 'Our legal team will contact you to collect the necessary details.' },
  { title: 'FIR Draft Preparation', body: 'The information provided is organised into a professionally drafted FIR application.' },
  { title: 'PDF Delivered', body: 'Receive the prepared FIR draft for your next step.' },
];

// C2 — Why a proper FIR draft is important (design/41). That export is 226px wide
// (0.58px per point), so its type sizes and insets could not be measured; the
// structure and copy are as drawn, sizes are carried over from the landing page.
// The turnaround comes from the FIR policy (flow [DECIDE]: one value, 24–48 h),
// not the design's 12–24. Only its turnaround is read: the police-submission
// setting is retired (ISHAAN-ANSWERS 2026-11-12 Q119/Q120), and so is the
// api-client's firSettings(). GET /fir/settings is read directly; when the API no
// longer serves it (404) or sends no turnaround, the turnaround block is left out,
// label and all (§1a), rather than showing a figure nobody set. Any other failure
// says so next to the block, with Try again.
// The header shield is decorative, not a button.
const validTurnaround = (value: unknown): value is FirTurnaround => {
  const t = (value as Partial<FirTurnaround> | null)?.turnaround;
  return !!t && Number.isFinite(t.min_hours) && Number.isFinite(t.max_hours);
};
const turnaroundText = (s: FirTurnaround) => `${s.turnaround.min_hours}–${s.turnaround.max_hours} Hours`;

export default function FirInfoScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<FirTurnaround | null>(null), [settingsError, setSettingsError] = useState(''), [loadingSettings, setLoadingSettings] = useState(true);
  const [noTurnaround, setNoTurnaround] = useState(false);
  const [opening, setOpening] = useState(false), [openError, setOpenError] = useState('');
  const loadSettings = useCallback(() => {
    let alive = true;
    setLoadingSettings(true); setSettingsError(''); setNoTurnaround(false);
    backend.request<unknown>('/fir/settings')
      .then((value) => { if (!alive) return; if (validTurnaround(value)) setSettings(value); else setNoTurnaround(true); })
      .catch((e) => { if (!alive) return; if (e instanceof ApiError && e.status === 404) setNoTurnaround(true); else setSettingsError('The turnaround time couldn’t be loaded.'); })
      .finally(() => { if (alive) setLoadingSettings(false); });
    return () => { alive = false; };
  }, []);
  useEffect(() => loadSettings(), [loadSettings]);
  const send = async () => {
    setOpening(true); setOpenError('');
    try {
      router.push(await openFirDraftHref());
    } catch (cause) {
      setOpenError(`Your request couldn’t be opened.${cause instanceof Error ? ` ${cause.message}` : ''} Check your connection and try again.`);
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + v.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/fir' as Href))}
        >
          <ArrowLeft size={l.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>FIR Draft</Text>
          <Text style={styles.headerSub}>Professional Legal Assistance</Text>
        </View>
        <View style={styles.shield} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Shield size={v.shieldIcon} color={colors.textBody} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + v.buttonGap }]} showsVerticalScrollIndicator={false}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>FIR DRAFT ASSISTANCE</Text>
        </View>

        <Text style={styles.heading}>Why Is a Proper FIR Draft Important?</Text>
        <Text style={styles.intro}>
          An FIR is an important record of a reported incident. A clear and well-structured draft helps present the
          relevant facts, circumstances, and details in an organised manner.
        </Text>

        <View style={styles.cards}>
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <View key={r.title} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Icon size={v.cardIconGlyph} color={ink.accent} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  <Text style={styles.cardBody}>{r.body}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.help}>
          <View style={styles.helpTitleRow}>
            <View style={styles.helpTitleText}>
              <Text style={styles.helpTitle}>How Legalitt Can Help</Text>
              <Text style={styles.helpSub}>Structured 4-step assisted workflow</Text>
            </View>
            <View style={styles.helpChip}>
              <Text style={styles.helpChipText}>STEP 1 TO 4</Text>
            </View>
          </View>
          <View style={styles.helpDivider} />
          <View style={styles.steps}>
            <View style={styles.stepLine} />
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.stepRow}>
                <View style={[styles.stepDisc, i === STEPS.length - 1 && styles.stepDiscLast]}>
                  <Text style={styles.stepDiscText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepBody}>{s.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {noTurnaround ? null : <View style={styles.turn}>
          <View style={styles.turnLabelRow}>
            <Clock size={v.turnLabelSize + 3} color={colors.textBody} />
            <Text style={styles.turnLabel}>ESTIMATED TURNAROUND TIME</Text>
          </View>
          {settings ? (
            <View style={styles.turnValueRow}>
              <Text style={styles.turnValue}>{turnaroundText(settings)}</Text>
              <View style={styles.turnChip}>
                <Text style={styles.turnChipText}>Standard Review</Text>
              </View>
            </View>
          ) : loadingSettings ? (
            <View style={styles.turnValueRow} accessibilityRole="progressbar" accessibilityLabel="Loading the turnaround time">
              <ActivityIndicator color={ink.accent} />
              <Text style={[styles.turnNote, styles.turnLoading]}>Loading the turnaround time…</Text>
            </View>
          ) : (
            <View>
              <InlineError text={settingsError} />
              <Pressable accessibilityRole="button" onPress={loadSettings} hitSlop={6} style={styles.retry}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.turnNote}>
            Estimated time for preparing the FIR draft after the required information has been received.
          </Text>
        </View>}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: opening, disabled: opening }}
          disabled={opening}
          onPress={() => void send()}
          style={({ pressed }) => [styles.button, (pressed || opening) && styles.pressed]}
        >
          {opening ? <ActivityIndicator color={ink.onBrand} /> : null}
          <Text style={styles.buttonText}>{opening ? 'Opening your request…' : 'Send a FIR Draft'}</Text>
          {opening ? null : <ArrowRight size={v.buttonIcon} color={ink.onBrand} />}
        </Pressable>
        <InlineError text={openError} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: l.bg,
  },
  header: {
    minHeight: v.headerHeight,
    paddingHorizontal: v.padX + 5,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: l.cardBorder,
    backgroundColor: l.bg,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  headerTitle: {
    fontFamily: font.appHeading,
    fontSize: v.titleSize,
    color: colors.textPrimary,
  },
  headerSub: {
    marginTop: v.subtitleGap,
    fontFamily: font.appBody,
    fontSize: v.subtitleSize,
    color: colors.textBody,
  },
  shield: {
    width: v.shieldButton,
    height: v.shieldButton,
    borderRadius: v.shieldButton / 2,
    borderWidth: 1,
    borderColor: l.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: v.padX,
    paddingTop: v.pillGap,
  },
  pill: {
    alignSelf: 'flex-start',
    height: v.pillHeight,
    borderRadius: v.pillHeight / 2,
    paddingHorizontal: v.pillPadX,
    backgroundColor: colors.iconChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: v.pillDot,
    height: v.pillDot,
    borderRadius: v.pillDot / 2,
    backgroundColor: ink.accent,
    marginRight: v.pillDotGap,
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: v.pillSize,
    letterSpacing: v.pillSpacing,
    color: ink.accent,
  },
  heading: {
    marginTop: v.headingGap,
    fontFamily: font.appHeading,
    fontSize: v.headingSize,
    lineHeight: v.headingLineHeight,
    color: colors.textPrimary,
  },
  intro: {
    marginTop: v.introGap,
    fontFamily: font.appBody,
    fontSize: v.introSize,
    lineHeight: v.introLineHeight,
    color: colors.textBody,
  },
  cards: {
    marginTop: v.cardsGap,
    gap: v.cardGap,
  },
  card: {
    borderRadius: v.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    padding: v.cardPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: v.cardIcon,
    height: v.cardIcon,
    borderRadius: v.cardIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: v.cardTextGap,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: font.appHeading,
    fontSize: v.cardTitleSize,
    color: colors.textPrimary,
  },
  cardBody: {
    marginTop: v.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: v.cardBodySize,
    lineHeight: v.cardBodyLineHeight,
    color: colors.textBody,
  },
  help: {
    marginTop: v.helpGap,
    borderRadius: v.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    padding: v.helpPad,
  },
  helpTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpTitleText: {
    flex: 1,
    minWidth: 0,
  },
  helpTitle: {
    fontFamily: font.appHeading,
    fontSize: v.helpTitleSize,
    color: colors.textPrimary,
  },
  helpSub: {
    marginTop: v.helpSubGap,
    fontFamily: font.appBody,
    fontSize: v.helpSubSize,
    color: colors.textBody,
  },
  helpChip: {
    marginLeft: 8,
    height: v.helpChipHeight,
    borderRadius: 6,
    paddingHorizontal: v.helpChipPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  helpChipText: {
    fontFamily: font.appSemi,
    fontSize: v.helpChipSize,
    letterSpacing: 0.4,
    color: ink.accent,
  },
  helpDivider: {
    marginTop: 14,
    height: 1,
    backgroundColor: l.cardBorder,
  },
  steps: {
    marginTop: v.stepsGap,
    gap: v.stepRowGap,
  },
  stepLine: {
    position: 'absolute',
    left: v.stepDisc / 2 - 0.5,
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: l.cardBorder,
  },
  stepDiscLast: {
    backgroundColor: '#8F7A60',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDisc: {
    width: v.stepDisc,
    height: v.stepDisc,
    borderRadius: v.stepDisc / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: v.stepGap,
  },
  stepDiscText: {
    fontFamily: font.appSemi,
    fontSize: v.stepDiscSize,
    color: ink.onBrand,
  },
  stepText: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    fontFamily: font.appHeading,
    fontSize: v.stepTitleSize,
    color: colors.textPrimary,
  },
  stepBody: {
    marginTop: v.stepBodyGap,
    fontFamily: font.appBody,
    fontSize: v.stepBodySize,
    lineHeight: v.stepBodyLineHeight,
    color: colors.textBody,
  },
  turn: {
    marginTop: v.turnGap,
    borderRadius: v.cardRadius,
    backgroundColor: v.turnBg,
    borderWidth: 1,
    borderColor: l.cardBorder,
    padding: v.turnPad,
  },
  turnLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turnLabel: {
    fontFamily: font.appSemi,
    fontSize: v.turnLabelSize,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  turnValueRow: {
    marginTop: v.turnLabelGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnValue: {
    fontFamily: font.appHeading,
    fontSize: v.turnValueSize,
    color: colors.textPrimary,
  },
  turnChip: {
    marginLeft: v.turnChipGap,
    height: v.turnChipHeight,
    borderRadius: 6,
    paddingHorizontal: v.turnChipPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    justifyContent: 'center',
  },
  turnChipText: {
    fontFamily: font.appBody,
    fontSize: v.turnChipSize,
    color: colors.textBody,
  },
  turnLoading: {
    marginTop: 0,
    marginLeft: 10,
  },
  retry: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontFamily: font.appSemi,
    fontSize: 13,
    color: ink.accent,
  },
  turnNote: {
    marginTop: v.turnNoteGap,
    fontFamily: font.appBody,
    fontSize: v.turnNoteSize,
    lineHeight: v.turnNoteLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: v.buttonGap,
    height: v.buttonHeight,
    borderRadius: v.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: v.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: v.buttonSize,
    color: ink.onBrand,
  },
});
