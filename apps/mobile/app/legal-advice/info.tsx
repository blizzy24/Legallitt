import { router } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  Lock,
  Map,
  MessageSquare,
  Scale,
  Shield,
  ShieldCheck,
  Split,
  TrendingUp,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceHeader from '../../components/ServiceHeader';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, laInfo as t } from '../../constants/theme';

// Legal Advice explainer.
//
// THE ARTWORK IS IN design/103-la-choose-consult.png, NOT design/102. The file names
// in this batch are shifted by one — see the header of data/legalAdvice.ts.
//
// REPORTED — this screen and the landing share three blocks ("Why seek legal
// advice?", "Why choose Legalitt?", the trust strip) but draw them differently: the
// landing's tick discs are GREEN and its why-choose cards are left-aligned, while
// these are BEIGE and centred, and the body copy differs. Built as each file draws
// it; worth deciding whether the two screens should converge.

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Understand Your Rights',
    body: 'Get clarity on the rights and obligations relevant to your situation.',
  },
  {
    icon: Split,
    title: 'Know Your Options',
    body: 'Understand the possible courses of action before making a decision.',
  },
  {
    icon: TrendingUp,
    title: 'Take the Right Next Step',
    body: 'Get practical guidance on what you may need to do next.',
  },
  {
    icon: Shield,
    title: 'Avoid Unnecessary Complications',
    body: 'Identify potential legal issues early and make more informed decisions.',
  },
];

const HELP = [
  {
    icon: BookOpen,
    title: 'Understand a Legal Issue',
    body: 'Discuss the facts of your matter and get professional guidance.',
  },
  {
    icon: FileText,
    title: 'Review Your Documents',
    body: 'Understand important clauses, notices, agreements or other legal documents.',
  },
  {
    icon: Map,
    title: 'Plan Your Next Step',
    body: 'Discuss possible legal options before proceeding further.',
  },
];

const WHEN = [
  'Before signing an important agreement',
  'When you receive a legal notice',
  'When you are involved in a dispute',
  'Before taking a significant legal or financial step',
];

const WHY = [
  { icon: ShieldCheck, title: 'Verified Advocates', body: 'Connect with experienced, verified legal counsel.' },
  { icon: MessageSquare, title: 'Personalised Guidance', body: 'Advice tailored specifically to your situation.' },
  { icon: Lock, title: 'Private Consultations', body: 'Your chat is visible only to you, your advocate and Legalitt’s team.' },
];

export default function LegalAdviceInfoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ServiceHeader title="Legal Advice" share={false} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <View style={styles.heroPill}>
              <Scale size={t.heroPillIcon} color={ink.onBrand} />
              <Text style={styles.heroPillText} {...shrinkToFit(0.75)}>
                LEGAL GUIDANCE
              </Text>
            </View>
            <Text style={styles.heroTitle}>Why Is Legal Advice Important?</Text>
            <Text style={styles.heroBody}>
              Understand your legal position before taking an important step.
            </Text>
          </View>
          {/* Placeholder for design/103's scales illustration, sized to its box. */}
          <Scale size={t.heroArt} color={colors.brand} style={styles.heroArt} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why seek legal advice?</Text>
          <Text style={styles.cardBody}>
            Legal matters can involve important rights, responsibilities and decisions. Speaking
            with a qualified advocate can help you understand your options and the steps that may
            be appropriate for your situation.
          </Text>

          {REASONS.map((r) => (
            <View key={r.title} style={styles.reason}>
              <View style={styles.reasonIcon}>
                <r.icon size={t.reasonIconGlyph} color={colors.brandDark} />
              </View>
              <View style={styles.reasonText}>
                <Text style={styles.reasonTitle} {...shrinkToFit(0.8)}>
                  {r.title}
                </Text>
                <Text style={styles.reasonBody}>{r.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.section}>What Can a Legal Consultation Help With?</Text>
        {HELP.map((h) => (
          <View key={h.title} style={styles.help}>
            <View style={styles.helpIcon}>
              <h.icon size={t.helpIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.reasonText}>
              <Text style={styles.helpTitle} {...shrinkToFit(0.8)}>
                {h.title}
              </Text>
              <Text style={styles.helpBody}>{h.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.section}>When Should You Seek Legal Advice?</Text>
        <View style={styles.when}>
          {WHEN.map((w) => (
            <View key={w} style={styles.tickRow}>
              <View style={styles.tickCircle}>
                <Check size={t.tickGlyph} color={t.tickColour} strokeWidth={3} />
              </View>
              <Text style={styles.tickText}>{w}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Why choose Legalitt?</Text>
        <View style={styles.whyRow}>
          {WHY.map((w) => (
            <View key={w.title} style={styles.whyCard}>
              <View style={styles.whyIcon}>
                <w.icon size={t.whyIconGlyph} color={colors.brandDark} />
              </View>
              <Text style={styles.whyTitle}>{w.title}</Text>
              <Text style={styles.whyBody}>{w.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.strip}>
          <ShieldCheck size={t.stripIcon} color={colors.brandDark} />
          <Text style={styles.stripText} {...shrinkToFit(0.75)}>
            Verified Advocates • Private Consultations
          </Text>
        </View>

        <View style={styles.close}>
          <Text style={styles.closeTitle}>Need legal guidance?</Text>
          <Text style={styles.closeBody}>
            Connect with a legal professional and discuss your matter.
          </Text>

          <Pressable
            accessibilityRole="button"
            // The brief's order: info -> choose consultation type -> your details.
            onPress={() => router.push('/legal-advice/choose')}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel}>Get Legal Advice</Text>
            <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
          </Pressable>

          <View style={styles.lock}>
            <Lock size={t.lockIcon} color={colors.textBody} />
            <Text style={styles.lockText} {...shrinkToFit(0.75)}>
              Visible only to you, your advocate and Legalitt’s team.
            </Text>
          </View>
          <Text style={styles.foot} {...shrinkToFit(0.75)}>
            VERIFIED ADVOCATES • SECURE CONSULTATION
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },

  hero: {
    marginTop: t.heroGap,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    padding: t.heroPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroText: { flex: 1, minWidth: 0 },
  heroPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.heroPillHeight,
    borderRadius: t.heroPillRadius,
    paddingHorizontal: t.heroPillPadX,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPillText: {
    marginLeft: t.heroPillIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.heroPillSize,
    letterSpacing: t.heroPillSpacing,
    color: ink.onBrand,
  },
  heroTitle: {
    marginTop: t.heroTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    lineHeight: t.heroTitleLineHeight,
    color: colors.textPrimary,
  },
  heroBody: {
    marginTop: t.heroBodyGap,
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLineHeight,
    color: colors.textBody,
  },
  heroArt: { marginLeft: t.heroArtGap },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardTitle: { fontFamily: font.appHeading, fontSize: t.cardTitleSize, color: colors.textPrimary },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },

  reason: {
    marginTop: t.reasonGap,
    borderRadius: t.reasonRadius,
    backgroundColor: t.reasonBg,
    padding: t.reasonPad,
    flexDirection: 'row',
  },
  reasonIcon: {
    width: t.reasonIcon,
    height: t.reasonIcon,
    borderRadius: t.reasonIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonText: { flex: 1, minWidth: 0, marginLeft: t.reasonIconGap },
  reasonTitle: {
    fontFamily: font.appHeading,
    fontSize: t.reasonTitleSize,
    color: colors.textPrimary,
  },
  reasonBody: {
    marginTop: t.reasonBodyGap,
    fontFamily: font.appBody,
    fontSize: t.reasonBodySize,
    lineHeight: t.reasonBodyLineHeight,
    color: colors.textBody,
  },

  section: {
    marginTop: t.sectionGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    color: colors.textPrimary,
  },

  help: {
    marginTop: t.helpGap,
    borderRadius: t.helpRadius,
    backgroundColor: colors.card,
    padding: t.helpPad,
    flexDirection: 'row',
  },
  helpIcon: {
    width: t.helpIcon,
    height: t.helpIcon,
    borderRadius: t.helpIcon / 2,
    backgroundColor: t.helpIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { fontFamily: font.appHeading, fontSize: t.helpTitleSize, color: colors.textPrimary },
  helpBody: {
    marginTop: t.helpBodyGap,
    fontFamily: font.appBody,
    fontSize: t.helpBodySize,
    lineHeight: t.helpBodyLineHeight,
    color: colors.textBody,
  },

  when: {
    marginTop: t.whenGap,
    borderRadius: t.whenRadius,
    backgroundColor: colors.card,
    padding: t.whenPad,
  },
  tickRow: { marginTop: t.tickGap, flexDirection: 'row', alignItems: 'center' },
  tickCircle: {
    width: t.tickCircle,
    height: t.tickCircle,
    borderRadius: t.tickCircle / 2,
    backgroundColor: t.tickCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.tickIconGap,
    fontFamily: font.appBody,
    fontSize: t.tickSize,
    lineHeight: t.tickLineHeight,
    color: colors.textPrimary,
  },

  whyRow: { marginTop: t.whyGap, flexDirection: 'row', gap: t.whyColGap },
  whyCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.whyRadius,
    backgroundColor: colors.card,
    padding: t.whyPad,
    alignItems: 'center',
  },
  whyIcon: {
    width: t.whyIcon,
    height: t.whyIcon,
    borderRadius: t.whyIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: {
    marginTop: t.whyTitleGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.whyTitleSize,
    lineHeight: t.whyTitleLineHeight,
    color: colors.textPrimary,
  },
  whyBody: {
    marginTop: t.whyBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.whyBodySize,
    lineHeight: t.whyBodyLineHeight,
    color: colors.textBody,
  },

  strip: {
    marginTop: t.stripGap,
    minHeight: t.stripHeight,
    borderRadius: t.stripRadius,
    backgroundColor: t.stripBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  stripText: {
    marginLeft: t.stripIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.stripSize,
    color: colors.textPrimary,
  },

  close: {
    marginTop: t.closeGap,
    borderRadius: t.closeRadius,
    backgroundColor: colors.card,
    padding: t.closePad,
    alignItems: 'center',
  },
  closeTitle: {
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.closeTitleSize,
    color: colors.textPrimary,
  },
  closeBody: {
    marginTop: t.closeBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.closeBodySize,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    alignSelf: 'stretch',
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
  lock: { marginTop: t.lockGap, flexDirection: 'row', alignItems: 'center' },
  lockText: {
    marginLeft: t.lockIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.lockSize,
    color: colors.textBody,
  },
  foot: {
    marginTop: t.footGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.footSize,
    letterSpacing: t.footSpacing,
    color: colors.brandDark,
  },
});
