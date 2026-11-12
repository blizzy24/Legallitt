import { router, type Href } from 'expo-router';
import { ArrowRight, ChevronLeft, CircleCheck, FileText, Info, Lock, MessageSquare, Paperclip, PenTool, PhoneCall, Shield, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, firLanding as l, font, ink } from '../../constants/theme';
import { useSession } from '../../context/session';
import { openFirDraftHref } from '../../features/fir/intake/draft';
import LandingHeroArt from '../../features/fir/intake/LandingHeroArt';
import { InlineError } from '../../features/fir/intake/ui';

type Feature = { icon: LucideIcon; title: string; body: string };
type Choice = 'quick' | 'assist';

// F0a's 2x2 grid, in the order drawn. Both cards in a row share a height.
const FEATURES: Feature[][] = [
  [
    { icon: FileText, title: 'Clear Incident Details', body: 'Organize the facts of your incident clearly.' },
    { icon: PenTool, title: 'Legal Drafting Support', body: 'Get help preparing your FIR draft.' },
  ],
  [
    { icon: Paperclip, title: 'Supporting Documents', body: 'Add relevant documents or evidence.' },
    { icon: CircleCheck, title: 'Review & Track', body: 'Track your request through Legalitt.' },
  ],
];

const SELECTED_BORDER = '#B5A187';
const RADIO_ON = '#6C5C45';
const MUTED_BG = '#F0EEEB';
const MUTED_TEXT = '#8D8780';

// C1 — FIR Draft landing (F0a-landing-v2; replaces design/40). The two option
// cards are radios: tapping a card's body only selects it. The unselected card's
// actions are drawn muted (F0a), but every action works on the first tap and
// selects its card as it goes. "Continue with Quick Submission" opens Step 1 of
// the newest unsubmitted draft (or a new one). "256-bit Encrypted" is removed
// from the footer (flow C1).
export default function FirLandingScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, openAuthenticatedRoute } = useSession();
  const [choice, setChoice] = useState<Choice>('quick');
  const [opening, setOpening] = useState(false), [openError, setOpenError] = useState('');

  const continueQuick = async () => {
    if (!isLoggedIn) { openAuthenticatedRoute('/fir/step1'); return; }
    setOpening(true); setOpenError('');
    try {
      router.push(await openFirDraftHref());
    } catch (cause) {
      setOpenError(`Your request couldn’t be opened.${cause instanceof Error ? ` ${cause.message}` : ''} Check your connection and tap Continue again.`);
    } finally {
      setOpening(false);
    }
  };
  /** An action acts on the first tap and selects its card as it goes. */
  const act = (card: Choice, action: () => void) => () => { setChoice(card); action(); };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + l.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home' as Href))}>
          <ChevronLeft size={l.backIcon + 4} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>FIR Draft Service</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Why a proper FIR draft is important" hitSlop={10} onPress={() => router.push('/fir/info')}>
          <Info size={l.infoIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle} accessibilityRole="header">Get Help With Your FIR Draft</Text>
            <Text style={styles.heroSub}>Prepare a clear FIR draft by sharing your incident details and supporting information.</Text>
          </View>
          <View style={styles.heroArt} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><LandingHeroArt width={82} height={102} /></View>
        </View>

        <Text style={styles.section}>Why Use This Service?</Text>
        <View style={styles.grid}>
          {FEATURES.map((row) => (
            <View key={row[0]!.title} style={styles.gridRow}>
              {row.map((feat) => {
                const Icon = feat.icon;
                return (
                  <View key={feat.title} style={styles.featureCard}>
                    <View style={styles.chip}><Icon size={l.chipIcon + 2} color={ink.accent} /></View>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.featureBody}>{feat.body}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/fir/info')} style={styles.learnRow} hitSlop={8}>
          <Text style={styles.learn}>Learn more</Text>
        </Pressable>

        <Text style={styles.choose}>CHOOSE HOW YOU WOULD LIKE TO PROCEED</Text>

        <OptionCard selected={choice === 'quick'} onSelect={() => setChoice('quick')} tag="DO IT YOURSELF" title="Quick Submission"
          body="Fill in your incident details step by step and submit your request.">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: opening, busy: opening }}
            disabled={opening}
            onPress={act('quick', () => void continueQuick())}
            style={styles.quickLink}
            hitSlop={6}
          >
            <Text style={[styles.quickLinkText, choice !== 'quick' && styles.mutedText]}>
              {opening ? 'Opening your request…' : 'Continue with Quick Submission'}
            </Text>
            {opening ? <ActivityIndicator size="small" color={ink.accent} /> : <ArrowRight size={16} color={choice === 'quick' ? ink.accent : MUTED_TEXT} />}
          </Pressable>
          <InlineError text={openError} />
        </OptionCard>

        <OptionCard selected={choice === 'assist'} onSelect={() => setChoice('assist')} tag="GET EXPERT HELP" title="Assistance Service"
          body="Explain your problem in your own words and our team will contact you">
          <View style={styles.assistRow}>
            <AssistButton icon={MessageSquare} label="Request Chat" live={choice === 'assist'} onPress={act('assist', () => router.push('/support-chat?service=fir_draft' as Href))} />
            <AssistButton icon={PhoneCall} label="Request Callback" live={choice === 'assist'} onPress={act('assist', () => router.push('/callback?service=fir_draft' as Href))} />
          </View>
        </OptionCard>

        <View style={styles.disclaimer}>
          <Shield size={l.disclaimerIcon + 2} color={colors.textBody} />
          <Text style={styles.disclaimerText}>
            Requirements and procedures may vary depending on the case and location. Legalitt provides legal drafting
            and advisory assistance; this does not constitute police FIR registration or guaranteed outcome.
          </Text>
        </View>

        <View style={styles.footer}>
          <Lock size={l.footerIcon} color={ink.accent} />
          <Text style={styles.footerText}>Confidential Legal Assistance</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function OptionCard({ selected, onSelect, tag, title, body, children }: {
  selected: boolean; onSelect: () => void; tag: string; title: string; body: string; children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${body}`}
      onPress={onSelect}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={styles.optionTop}>
        <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
        <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionBody}>{body}</Text>
      {children}
    </Pressable>
  );
}

function AssistButton({ icon: Icon, label, live, onPress }: { icon: LucideIcon; label: string; live: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.assistButton, live && styles.assistLive, pressed && styles.pressed]}
    >
      <Icon size={18} color={live ? ink.accent : MUTED_TEXT} />
      <Text style={[styles.assistText, live && styles.assistTextLive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: l.bg },
  header: {
    minHeight: l.headerHeight,
    paddingHorizontal: l.padX + 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: l.cardBorder,
    backgroundColor: l.bg,
  },
  headerTitle: { flex: 1, minWidth: 0, textAlign: 'center', fontFamily: font.appHeading, fontSize: l.titleSize, color: colors.textPrimary },
  content: { paddingHorizontal: l.padX + 2, paddingTop: l.heroGap },
  hero: { flexDirection: 'row', alignItems: 'flex-start' },
  heroText: { flex: 1, minWidth: 0, paddingRight: 8 },
  heroTitle: { fontFamily: font.appHeading, fontSize: 24, lineHeight: 29, color: colors.textPrimary },
  heroSub: { marginTop: l.heroSubGap + 4, fontFamily: font.appBody, fontSize: l.heroSubSize, lineHeight: l.heroSubLineHeight, color: colors.textBody },
  heroArt: { marginTop: 10, width: 90, alignItems: 'center' },
  section: { marginTop: 22, fontFamily: font.appHeading, fontSize: l.sectionSize, color: colors.textPrimary },
  grid: { marginTop: l.gridGap, gap: l.gridRowGap },
  gridRow: { flexDirection: 'row', alignItems: 'stretch', gap: l.gridColGap },
  featureCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: l.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    paddingHorizontal: l.cardPadX,
    paddingTop: l.cardPadTop,
    paddingBottom: l.cardPadBottom,
  },
  chip: { width: l.chip, height: l.chip, borderRadius: l.chipRadius, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { marginTop: l.cardTitleGap, fontFamily: font.appSemi, fontSize: l.cardTitleSize + 0.5, lineHeight: l.cardTitleLineHeight + 2, color: colors.textPrimary },
  featureBody: { marginTop: l.cardBodyGap, fontFamily: font.appBody, fontSize: l.cardBodySize, lineHeight: l.cardBodyLineHeight, color: colors.textBody },
  learnRow: { marginTop: l.learnGap, alignSelf: 'flex-end', paddingHorizontal: 8 },
  learn: { fontFamily: font.appSemi, fontSize: l.learnSize, color: ink.accent },
  choose: { marginTop: 34, fontFamily: font.appSemi, fontSize: 11.5, letterSpacing: 0.8, color: colors.textBody },
  option: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
  },
  optionSelected: { borderWidth: 2, borderColor: SELECTED_BORDER, paddingHorizontal: 15, paddingTop: 16, paddingBottom: 15 },
  optionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { height: 22, borderRadius: 11, paddingHorizontal: 9, backgroundColor: '#F2EBE3', justifyContent: 'center' },
  tagText: { fontFamily: font.appSemi, fontSize: 11, letterSpacing: 0.6, color: '#4F4740' },
  radio: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E6E3DF', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: RADIO_ON },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.card },
  optionTitle: { marginTop: 14, fontFamily: font.appHeading, fontSize: 18, color: colors.textPrimary },
  optionBody: { marginTop: 8, fontFamily: font.appBody, fontSize: 14, lineHeight: 22, color: colors.textBody },
  quickLink: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  quickLinkText: { fontFamily: font.appBody, fontSize: 14, color: ink.accent },
  mutedText: { color: MUTED_TEXT },
  assistRow: { marginTop: 18, flexDirection: 'row', gap: 8 },
  assistButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: MUTED_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  assistLive: { backgroundColor: colors.iconChipBg, borderWidth: 1, borderColor: '#E3D7C8' },
  assistText: { flexShrink: 1, textAlign: 'center', fontFamily: font.appSemi, fontSize: 14, color: MUTED_TEXT },
  assistTextLive: { color: colors.textPrimary },
  pressed: { opacity: 0.85 },
  disclaimer: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: l.disclaimerBg,
    borderWidth: 1,
    borderColor: l.cardBorder,
    padding: l.disclaimerPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  disclaimerText: { flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: l.disclaimerSize, lineHeight: l.disclaimerLineHeight, color: colors.textBody },
  footer: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: l.footerIconGap },
  footerText: { fontFamily: font.appBody, fontSize: l.footerSize, color: ink.accent },
});
