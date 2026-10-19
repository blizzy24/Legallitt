import { router, type Href } from 'expo-router';
import { ArrowRight, Bell, Check, ChevronLeft, FilePenLine, FileText, Headset, Lock, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, ink, lnInfo as i } from '../../constants/theme';

const WHY_IT_MATTERS = [
  'Shows your serious intent',
  'Provides an opportunity to settle the dispute',
  'Often helps avoid time and cost of litigation',
  'Creates a written record of your communication.',
  'May be legally required in certain matters',
];

const MANDATORY_CASES = [
  'Dishonour of Cheque (Section 138, N.I. Act)',
  'Consumer Disputes',
  'Service matters/ Termination',
  'Defamation (in many cases)',
  'Certain property disputes (e.g., eviction, breach of agreement)',
  'other matters as per specific statutes or contracts',
];

const HOW_WE_HELP: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: FilePenLine, title: 'Quick Submission', description: 'Fill in your details and upload documents directly in a structured form.' },
  { icon: Headset, title: 'Assisted Service', description: 'Our Legalitt support team can help collect the required information step by step.' },
  { icon: ShieldCheck, title: 'Verified Advocates', description: 'Your request can be reviewed and handled by a verified advocate on the platform.' },
];

// Legal Notice information page (design/23). Reached from the Legal Notice tiles on
// Home and All Services; "Send a Legal Notice" starts the wizard.
export default function LegalNoticeInfoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + i.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))} style={styles.circle}>
          <ChevronLeft size={i.circleIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Legalitt</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.brandSub}>Find. Connect. Consult. Resolve.</Text>
        </View>
        <Pressable onPress={() => router.push('/notifications' as Href)} accessibilityRole="button" accessibilityLabel="Notifications" style={[styles.circle, styles.bell]}>
          <Bell size={i.circleIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={[styles.circle, styles.avatar]}>
          <Text style={styles.avatarText}>RD</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + i.cardGap }]} showsVerticalScrollIndicator={false}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>FORMAL LEGAL COMMUNICATION</Text>
        </View>
        <Text style={styles.title}>Legal Notice</Text>
        <Text style={styles.subtitle}>Take the right step before the matter goes further.</Text>

        <Card>
          <CardTitle icon={FileText} text="What is a Legal Notice?" />
          <Text style={styles.body}>
            A legal notice is a formal written communication sent to another person or organisation to explain a legal
            concern, demand action, or ask for a response before taking further legal steps.
          </Text>
        </Card>

        <Card tinted>
          <CardTitle icon={ShieldCheck} text="Why is it Important?" />
          <View style={styles.ticks}>
            {WHY_IT_MATTERS.map((t) => (
              <Tick key={t} text={t} />
            ))}
          </View>
        </Card>

        <Card tinted>
          <CardTitle icon={ShieldCheck} text="Cases Where Legal Notice is mandatory" />
          <View style={styles.ticks}>
            {MANDATORY_CASES.map((t) => (
              <Tick key={t} text={t} />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.plainTitle}>How Legalitt Can Help</Text>
          <View style={styles.subCards}>
            {HOW_WE_HELP.map((h) => {
              const Icon = h.icon;
              return (
                <View key={h.title} style={styles.subCard}>
                  <View style={styles.subCardIcon}>
                    <Icon size={i.subCardIconGlyph} color={ink.accent} />
                  </View>
                  <View style={styles.subCardText}>
                    <Text style={styles.subCardTitle}>{h.title}</Text>
                    <Text style={styles.subCardDesc}>{h.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-notice/detail')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Send a Legal Notice</Text>
          <ArrowRight size={i.buttonIcon} color={ink.onBrand} />
        </Pressable>

        <View style={styles.footer}>
          <Lock size={i.footerIcon} color={ink.accent} />
          <View style={styles.footerText}>
            <Text style={styles.footerMain}>Your information is used only to process your legal notice request.</Text>
            <Text style={styles.footerSub}>Your information is safe and confidential.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ children, tinted = false }: { children: ReactNode; tinted?: boolean }) {
  return <View style={[styles.card, tinted && styles.cardTinted]}>{children}</View>;
}

function CardTitle({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <View style={styles.cardTitleRow}>
      <View style={styles.chip}>
        <Icon size={i.chipIcon} color={ink.accent} />
      </View>
      <Text style={styles.cardTitle}>{text}</Text>
    </View>
  );
}

function Tick({ text }: { text: string }) {
  return (
    <View style={styles.tickRow}>
      <Check size={i.tickIcon} color={i.tick} strokeWidth={2.5} />
      <Text style={styles.tickText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    // minHeight, not height: the safe-area inset is added as padding on top of it.
    minHeight: i.headerHeight,
    paddingBottom: i.headerBottom,
    paddingHorizontal: i.padX,
    backgroundColor: colors.appBg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  circle: {
    width: i.circle,
    height: i.circle,
    borderRadius: i.circle / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    minWidth: 0,
    marginLeft: i.brandGap,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandName: {
    fontFamily: font.appHeading,
    fontSize: i.brandSize,
    color: colors.textPrimary,
  },
  brandDot: {
    marginLeft: i.brandDotGap,
    width: i.brandDot,
    height: i.brandDot,
    borderRadius: i.brandDot / 2,
    backgroundColor: colors.brand,
  },
  brandSub: {
    marginTop: i.brandSubGap,
    fontFamily: font.appBody,
    fontSize: i.brandSubSize,
    color: colors.textBody,
  },
  bell: {
    marginRight: i.bellGap,
  },
  avatar: {
    backgroundColor: colors.iconChipBg,
    borderColor: colors.iconChipBg,
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: i.brandSubSize + 1,
    color: ink.accent,
  },
  content: {
    paddingHorizontal: i.padX,
    paddingTop: i.pillGap,
  },
  pill: {
    alignSelf: 'flex-start',
    height: i.pillHeight,
    borderRadius: i.pillHeight / 2,
    paddingHorizontal: i.pillPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: i.pillDot,
    height: i.pillDot,
    borderRadius: i.pillDot / 2,
    backgroundColor: i.tick,
    marginRight: i.pillDotGap,
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: i.pillTextSize,
    letterSpacing: i.pillSpacing,
    color: colors.textBody,
  },
  title: {
    marginTop: i.titleGap,
    fontFamily: font.appHeading,
    fontSize: i.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: i.subtitleGap,
    fontFamily: font.appBody,
    fontSize: i.subtitleSize,
    color: colors.textBody,
  },
  card: {
    marginTop: i.cardGap,
    borderRadius: i.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: i.cardPadX,
    paddingTop: i.cardPadTop,
    paddingBottom: i.cardPadBottom,
  },
  cardTinted: {
    backgroundColor: i.cardBg,
    borderColor: i.cardBg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    width: i.chip,
    height: i.chip,
    borderRadius: i.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: i.chipGap,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: i.cardTitleSize,
    color: colors.textPrimary,
  },
  plainTitle: {
    fontFamily: font.appHeading,
    fontSize: i.cardTitleSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: i.bodyGap,
    fontFamily: font.appBody,
    fontSize: i.bodySize,
    lineHeight: i.bodyLineHeight,
    color: i.body,
  },
  ticks: {
    marginTop: i.tickGap,
    gap: i.tickRowGap,
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tickText: {
    flex: 1,
    minWidth: 0,
    marginLeft: i.tickTextGap,
    fontFamily: font.appBody,
    fontSize: i.tickTextSize,
    lineHeight: i.tickLineHeight,
    color: colors.textPrimary,
  },
  subCards: {
    marginTop: i.subCardGap,
    gap: i.subCardRowGap,
  },
  subCard: {
    borderRadius: i.subCardRadius,
    backgroundColor: i.subCardBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: i.subCardPadX,
    paddingVertical: i.subCardPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  subCardIcon: {
    width: i.subCardIcon,
    height: i.subCardIcon,
    borderRadius: i.subCardIconRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCardText: {
    flex: 1,
    minWidth: 0,
    marginLeft: i.subCardTextGap,
  },
  subCardTitle: {
    fontFamily: font.appHeading,
    fontSize: i.subCardTitleSize,
    color: colors.textPrimary,
  },
  subCardDesc: {
    marginTop: i.subCardDescGap,
    fontFamily: font.appBody,
    fontSize: i.subCardDescSize,
    lineHeight: i.subCardDescLineHeight,
    color: i.body,
  },
  button: {
    marginTop: i.buttonGap,
    height: i.buttonHeight,
    borderRadius: i.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: i.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: i.buttonTextSize,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: i.footerGap,
    borderRadius: i.footerRadius,
    backgroundColor: i.footerBg,
    paddingHorizontal: i.footerPadX,
    paddingVertical: i.footerPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: i.footerIconGap,
  },
  footerMain: {
    fontFamily: font.appBody,
    fontSize: i.footerSize,
    lineHeight: i.footerLineHeight,
    color: colors.textPrimary,
  },
  footerSub: {
    marginTop: i.footerSubGap,
    fontFamily: font.appBody,
    fontSize: i.footerSubSize,
    color: colors.textBody,
  },
});
